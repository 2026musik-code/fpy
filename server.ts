import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Readable } from 'stream';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Proxy API for multiple providers to solve CORS
  app.get("/api/provider/:providerId", async (req, res) => {
    try {
      const provider = req.params.providerId;
      const params = new URLSearchParams(req.query as any);
      const targetUrl = `https://www.cutad.web.id/api/public/${provider}?${params.toString()}`;
      console.log(`Proxying ${targetUrl}`);
      const proxyRes = await fetch(targetUrl);
      const data = await proxyRes.json();
      res.json(data);
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
