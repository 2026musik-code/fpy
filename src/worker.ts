import { Hono } from 'hono';

type Bindings = {
  diana: KVNamespace;
  dracin: R2Bucket;
  ASSETS: { fetch: (req: Request) => Promise<Response> };
};

const app = new Hono<{ Bindings: Bindings }>();

// In-memory data fallback for local development or when KV is not configured
let localAdminData = {
  popup: {
    image: '',
    text: 'Anda telah mencapai batas harian penonton gratis. Silahkan upgrade VIP atau hubungi Admin.'
  },
  contact: {
    wa: '6281234567890',
    telegram: 'admin_short'
  },
  users: [
    { id: '1', name: 'Guest User', type: 'Free', limit: 5, ip: '192.168.1.100', userAgent: 'Mozilla/5.0' },
    { id: '2', name: 'Premium User', type: 'VIP', limit: 9999, ip: '192.168.1.101', userAgent: 'Mozilla/5.0' }
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
  },
  adminPassword: 'admin',
  paymentApiKey: ''
};

const getAdminData = async (c: any) => {
  if (c.env?.diana) {
    const data = await c.env.diana.get('adminData', 'json');
    if (data) {
      if (!data.adminPassword) {
        data.adminPassword = localAdminData.adminPassword;
      }
      if (data.paymentApiKey === undefined) {
        data.paymentApiKey = localAdminData.paymentApiKey;
      }
      return data;
    }
  }
  return localAdminData;
};

const saveAdminData = async (c: any, data: any) => {
  if (c.env?.diana) {
    await c.env.diana.put('adminData', JSON.stringify(data));
  } else {
    localAdminData = data;
  }
};

const getOrCreateUser = async (c: any, data: any) => {
  const ipRaw = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || '127.0.0.1';
  const ip = ipRaw.split(',')[0].trim();
  const userAgent = c.req.header('user-agent') || 'Unknown Browser';
  
  let user = data.users.find((u: any) => u.ip === ip && u.userAgent === userAgent);
  if (!user) {
    user = {
      id: Date.now().toString(),
      name: 'Guest User',
      type: 'Free',
      limit: 5,
      ip: ip,
      userAgent: userAgent
    };
    data.users.push(user);
    await saveAdminData(c, data);
  }
  return user;
};

app.get('/api/admin/data', async (c) => {
  const data = await getAdminData(c);
  return c.json(data);
});

app.post('/api/admin/update-popup', async (c) => {
  const body = await c.req.json();
  const data = await getAdminData(c);
  data.popup = { ...data.popup, ...body };
  await saveAdminData(c, data);
  return c.json({ success: true, popup: data.popup });
});

app.post('/api/admin/update-contact', async (c) => {
  const body = await c.req.json();
  const data = await getAdminData(c);
  data.contact = { ...data.contact, ...body };
  await saveAdminData(c, data);
  return c.json({ success: true, contact: data.contact });
});

app.post('/api/admin/update-upgrade', async (c) => {
  const body = await c.req.json();
  const data = await getAdminData(c);
  data.upgrade = { ...data.upgrade, ...body };
  await saveAdminData(c, data);
  return c.json({ success: true, upgrade: data.upgrade });
});

app.post('/api/admin/verify-password', async (c) => {
  const body = await c.req.json();
  const data = await getAdminData(c);
  if (body.password === data.adminPassword) {
    return c.json({ success: true });
  }
  return c.json({ success: false }, 401);
});

app.post('/api/admin/change-password', async (c) => {
  const body = await c.req.json();
  const data = await getAdminData(c);
  if (body.currentPassword === data.adminPassword) {
    data.adminPassword = body.newPassword;
    await saveAdminData(c, data);
    return c.json({ success: true });
  }
  return c.json({ success: false, error: 'Incorrect current password' }, 401);
});

app.post('/api/admin/update-payment-key', async (c) => {
  const body = await c.req.json();
  const data = await getAdminData(c);
  data.paymentApiKey = body.paymentApiKey;
  await saveAdminData(c, data);
  return c.json({ success: true });
});

app.post('/api/user/checkout', async (c) => {
  const data = await getAdminData(c);
  const user = await getOrCreateUser(c, data);
  const amountStr = data.upgrade.price.replace(/[^0-9]/g, '');
  const amount = parseInt(amountStr, 10) || 50000;

  try {
    const res = await fetch('https://paymenku.com/api/v1/transaction/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${data.paymentApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reference_id: `INV-${Date.now()}-${user.id}`,
        amount: amount,
        customer_name: user.name || 'User Premium',
        customer_email: `user${user.id}@example.com`,
        channel_code: 'qris',
        return_url: `${new URL(c.req.url).origin}/profile`
      })
    });
    
    if (res.ok) {
      const responseData = await res.json();
      return c.json({ success: true, payment_url: responseData.data?.checkout_url || responseData.checkout_url || responseData.payment_url || '' });
    }
    return c.json({ success: false, error: 'Gagal membuat transaksi' }, 500);
  } catch (error) {
    return c.json({ success: false, error: 'Terjadi kesalahan sistem' }, 500);
  }
});

app.post('/api/admin/update-user-limit', async (c) => {
  const body = await c.req.json();
  const data = await getAdminData(c);
  const user = data.users.find((u: any) => u.id === body.id);
  if (user) {
    user.limit = body.limit;
    await saveAdminData(c, data);
    return c.json({ success: true });
  }
  return c.json({ error: "User not found" }, 404);
});

app.delete('/api/admin/delete-user/:id', async (c) => {
  const id = c.req.param('id');
  const data = await getAdminData(c);
  data.users = data.users.filter((u: any) => u.id !== id);
  await saveAdminData(c, data);
  return c.json({ success: true });
});

app.get('/api/profile/data', async (c) => {
  const data = await getAdminData(c);
  const user = await getOrCreateUser(c, data);
  
  return c.json({
    user,
    contacts: data.contact,
    upgrade: data.upgrade
  });
});

// Proxy API for multiple providers
app.get('/api/provider/:providerId', async (c) => {
  try {
    const providerId = c.req.param('providerId');
    const url = new URL(c.req.url);
    const params = url.searchParams;

    if (params.get('action') === 'stream') {
      const adminData = await getAdminData(c);
      const user = await getOrCreateUser(c, adminData);
      
      if (user.limit <= 0) {
        return c.json({
          limitReached: true,
          popup: adminData.popup,
          contact: adminData.contact
        }, 403);
      }
      
      user.limit -= 1;
      await saveAdminData(c, adminData);
    }

    const targetUrl = `https://www.cutad.web.id/api/public/${providerId}?${params.toString()}`;
    
    const proxyRes = await fetch(targetUrl);
    const text = await proxyRes.text();
    try {
      const data = JSON.parse(text);
      return c.json(data);
    } catch (e: any) {
      return c.json({ error: `Invalid JSON from upstream, response: ${text.slice(0, 100)}...` }, 502);
    }
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.get('/api/proxy/m3u8', async (c) => {
  try {
    const targetUrl = c.req.query('url');
    const origin = c.req.query('origin');
    if (!targetUrl) return c.text('Missing url', 400);

    const headers: any = {};
    if (origin) {
      headers['Referer'] = origin;
      headers['Origin'] = origin;
    }

    const proxyRes = await fetch(targetUrl, { headers });
    if (!proxyRes.ok) throw new Error(`HTTP ${proxyRes.status}`);
    let text = await proxyRes.text();

    text = text.replace(/URI="(.*?)"/g, (match, p1) => {
      if (p1.startsWith('data:') || p1.startsWith('/api/proxy')) return match;
      const absoluteUrl = new URL(p1, targetUrl).href;
      if (absoluteUrl.includes('.m3u')) {
        return `URI="/api/proxy/m3u8?url=${encodeURIComponent(absoluteUrl)}${origin ? '&origin='+encodeURIComponent(origin) : ''}"`;
      }
      return `URI="/api/proxy/ts?url=${encodeURIComponent(absoluteUrl)}${origin ? '&origin='+encodeURIComponent(origin) : ''}"`;
    });
    
    text = text.split('\n').map((line: string) => {
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

    c.header("Content-Type", "application/vnd.apple.mpegurl");
    c.header("Access-Control-Allow-Origin", "*");
    return c.body(text);
  } catch (err: any) {
    return c.text(err.message, 500);
  }
});

app.get('/api/proxy/ts', async (c) => {
  try {
    const targetUrl = c.req.query('url');
    const origin = c.req.query('origin');
    if (!targetUrl) return c.text('Missing url', 400);

    const headers: any = {};
    if (origin) {
      headers['Referer'] = origin;
      headers['Origin'] = origin;
    }
    const range = c.req.header('range');
    if (range) {
      headers['Range'] = range;
    }

    const proxyRes = await fetch(targetUrl, { headers, redirect: 'follow' });
    c.status(proxyRes.status as any);
    c.header("Access-Control-Allow-Origin", "*");
    
    const contentType = proxyRes.headers.get("content-type");
    if (contentType) c.header("Content-Type", contentType);

    const contentRange = proxyRes.headers.get("content-range");
    if (contentRange) c.header("Content-Range", contentRange);

    const contentLength = proxyRes.headers.get("content-length");
    if (contentLength) c.header("Content-Length", contentLength);

    const acceptRanges = proxyRes.headers.get("accept-ranges");
    if (acceptRanges) c.header("Accept-Ranges", acceptRanges);

    const body = proxyRes.body;
    return c.body(body as any);
  } catch (err: any) {
    return c.text(err.message, 500);
  }
});

app.get('/api/proxy/sub', async (c) => {
  try {
    const targetUrl = c.req.query('url');
    const origin = c.req.query('origin');
    if (!targetUrl) return c.text('Missing url', 400);

    const headers: any = {};
    if (origin) {
      headers['Referer'] = origin;
      headers['Origin'] = origin;
    }

    const proxyRes = await fetch(targetUrl, { headers });
    if (!proxyRes.ok) throw new Error(`HTTP ${proxyRes.status}`);

    let text = await proxyRes.text();

    if (targetUrl.toLowerCase().endsWith('.srt') || !text.startsWith('WEBVTT')) {
      text = "WEBVTT\n\n" + text.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');
    }

    c.header("Access-Control-Allow-Origin", "*");
    c.header("Content-Type", "text/vtt");
    return c.body(text);
  } catch (err: any) {
    return c.text(err.message, 500);
  }
});

// Since this worker will also serve frontend assets (when deployed on workers),
// you can handle SPA fallback like this:
app.get('*', async (c) => {
  if (c.env?.ASSETS) {
    const res = await c.env.ASSETS.fetch(c.req.raw);
    if (res.status === 404) {
      return c.env.ASSETS.fetch(new Request(new URL('/', c.req.url).toString(), c.req.raw));
    }
    return res;
  }
  return c.text('Not found', 404);
});

export default app;
