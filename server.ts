import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Readable } from 'stream';

// Disable TLS verification for proxy
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// In-memory data store for Admin panel mock
let adminData = {
  popup: {
    image: '',
    text: 'Anda telah mencapai batas harian penonton gratis. Silahkan upgrade VIP atau hubungi Admin.'
  },
  contact: {
    wa: '6281234567890',
    telegram: 'admin_short'
  },
  users: [
    { id: '1', name: 'Guest User', type: 'Free', limit: 5, ip: '192.168.1.100', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    { id: '2', name: 'Premium User', type: 'VIP', limit: 9999, ip: '192.168.1.101', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X)' }
  ],
  traffic: [
    { provider: 'dotdrama', views: 1245 },
    { provider: 'netshort', views: 856 },
    { provider: 'vivid', views: 432 }
  ],
  upgrade: {
    description: 'Upgrade ke VIP untuk akses tanpa batas tayangan premium',
    price: 'Rp 50.000 / Bulan',
    limit: 'Unlimited'
  }
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Admin APIs
  app.get("/api/admin/data", (req, res) => {
    res.json(adminData);
  });

  app.post("/api/admin/update-popup", (req, res) => {
    adminData.popup = { ...adminData.popup, ...req.body };
    res.json({ success: true, popup: adminData.popup });
  });

  app.post("/api/admin/update-contact", (req, res) => {
    adminData.contact = { ...adminData.contact, ...req.body };
    res.json({ success: true, contact: adminData.contact });
  });

  app.post("/api/admin/update-upgrade", (req, res) => {
    adminData.upgrade = { ...adminData.upgrade, ...req.body };
    res.json({ success: true, upgrade: adminData.upgrade });
  });

  app.get("/api/profile/data", (req, res) => {
    const user = adminData.users[0] || { name: 'Guest User', type: 'Free', limit: 5, ip: '127.0.0.1', userAgent: 'Browser' };
    res.json({
      user,
      contacts: adminData.contact,
      upgrade: adminData.upgrade
    });
  });

  app.post("/api/admin/update-user-limit", (req, res) => {
    const { id, limit } = req.body;
    const user = adminData.users.find(u => u.id === id);
    if (user) {
      user.limit = limit;
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  app.delete("/api/admin/delete-user/:id", (req, res) => {
    const { id } = req.params;
    adminData.users = adminData.users.filter(u => u.id !== id);
    res.json({ success: true });
  });

  // Proxy API for multiple providers to solve CORS
  app.get("/api/provider/:providerId", async (req, res) => {
    try {
      const provider = req.params.providerId;
      const params = new URLSearchParams(req.query as any);
      const targetUrl = `https://www.cutad.web.id/api/public/${provider}?${params.toString()}`;
      console.log(`Proxying ${targetUrl}`);
      const proxyRes = await fetch(targetUrl);
      const text = await proxyRes.text();
      try {
        const data = JSON.parse(text);
        res.json(data);
      } catch (e: any) {
        throw new Error(`Invalid JSON from upstream, response: ${text.slice(0, 100)}...`);
      }
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/proxy/m3u8", async (req, res) => {
    try {
      const targetUrl = req.query.url as string;
      const origin = req.query.origin as string;
      if (!targetUrl) return res.status(400).send("Missing url");

      const headers: any = {};
      if (origin) {
         headers["Referer"] = origin;
         headers["Origin"] = origin;
      }

      const proxyRes = await fetch(targetUrl, { headers });
      if (!proxyRes.ok) throw new Error(`HTTP ${proxyRes.status}`);
      let text = await proxyRes.text();

      // Rewrite URLs to point to our proxy
      // 1. Rewrite all URI="..." attributes
      text = text.replace(/URI="(.*?)"/g, (match, p1) => {
        if (p1.startsWith('data:') || p1.startsWith('/api/proxy')) return match;
        const absoluteUrl = new URL(p1, targetUrl).href;
        if (absoluteUrl.includes('.m3u')) {
          return `URI="/api/proxy/m3u8?url=${encodeURIComponent(absoluteUrl)}${origin ? '&origin='+encodeURIComponent(origin) : ''}"`;
        }
        return `URI="/api/proxy/ts?url=${encodeURIComponent(absoluteUrl)}${origin ? '&origin='+encodeURIComponent(origin) : ''}"`;
      });
      
      // 2. Rewrite standalone segments (lines not starting with # and not empty)
      text = text.split('\n').map(line => {
        if (line.trim() && !line.startsWith('#')) {
           if (line.startsWith('/api/proxy')) return line;
           const absoluteUrl = new URL(line.trim(), targetUrl).href;
           if (absoluteUrl.includes('.m3u')) {
             return `/api/proxy/m3u8?url=${encodeURIComponent(absoluteUrl)}${origin ? '&origin='+encodeURIComponent(origin) : ''}`;
           }
           return `/api/proxy/ts?url=${encodeURIComponent(absoluteUrl)}${origin ? '&origin='+encodeURIComponent(origin) : ''}`;
        }
        return line;
      }).join('\n');

      res.set("Content-Type", "application/vnd.apple.mpegurl");
      res.set("Access-Control-Allow-Origin", "*");
      res.send(text);
    } catch (err: any) {
      console.error("m3u8 proxy error:", err);
      res.status(500).send(err.message);
    }
  });

  app.get("/api/proxy/ts", async (req, res) => {
    try {
      const targetUrl = req.query.url as string;
      const origin = req.query.origin as string;
      if (!targetUrl) return res.status(400).send("Missing url");

      const headers: any = {};
      if (origin) {
         headers["Referer"] = origin;
         headers["Origin"] = origin;
      }
      if (req.headers.range) {
         headers["Range"] = req.headers.range;
      }

      const proxyRes = await fetch(targetUrl, { headers, redirect: 'follow' });
      
      res.status(proxyRes.status);
      res.set("Access-Control-Allow-Origin", "*");
      
      const contentType = proxyRes.headers.get("content-type");
      if (contentType) res.set("Content-Type", contentType);

      const contentRange = proxyRes.headers.get("content-range");
      if (contentRange) res.set("Content-Range", contentRange);

      const contentLength = proxyRes.headers.get("content-length");
      if (contentLength) res.set("Content-Length", contentLength);

      const acceptRanges = proxyRes.headers.get("accept-ranges");
      if (acceptRanges) res.set("Accept-Ranges", acceptRanges);

      if (proxyRes.body) {
        // @ts-ignore
        const nodeStream = Readable.fromWeb(proxyRes.body);
        nodeStream.pipe(res);
      } else {
        const arrayBuffer = await proxyRes.arrayBuffer();
        res.send(Buffer.from(arrayBuffer));
      }
    } catch (err: any) {
      console.error("ts proxy error:", err);
      res.status(500).send(err.message);
    }
  });

  app.get("/api/proxy/sub", async (req, res) => {
    try {
      const targetUrl = req.query.url as string;
      const origin = req.query.origin as string;
      if (!targetUrl) return res.status(400).send("Missing url");

      const headers: any = {};
      if (origin) {
         headers["Referer"] = origin;
         headers["Origin"] = origin;
      }

      const proxyRes = await fetch(targetUrl, { headers });
      if (!proxyRes.ok) throw new Error(`HTTP ${proxyRes.status}`);

      let text = await proxyRes.text();

      if (targetUrl.toLowerCase().endsWith('.srt') || !text.startsWith('WEBVTT')) {
        text = "WEBVTT\n\n" + text.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');
      }

      res.set("Access-Control-Allow-Origin", "*");
      res.set("Content-Type", "text/vtt");
      res.send(text);
    } catch (err: any) {
      console.error("sub proxy error:", err);
      res.status(500).send(err.message);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve the built files
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
