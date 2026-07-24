/* =============================================
   AL-WAHA CMS — Express API Backend
   MySQL + Cloudinary image upload + JWT Auth
   ============================================= */
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'alwaha-cms-secret-2024';
const UPLOAD_DIR = path.join(__dirname, 'uploads');

// Cloudinary config
cloudinary.config({
  cloud_name: 'ijzagitk',
  api_key: '955882554561765',
  api_secret: 'EOsVjZ8uS0HGz_7IHUxGqrB_3aY'
});

// Ensure upload directory exists (for local dev fallback)
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(UPLOAD_DIR));

// Serve frontend static files (index.html, css/, js/, etc.)
const FRONTEND_DIR = path.join(__dirname, '..');
app.use(express.static(FRONTEND_DIR));

// Multer — memory storage for Cloudinary upload
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// =============================================
// JWT AUTH MIDDLEWARE
// =============================================
function authRequired(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// =============================================
// AUTH ROUTES
// =============================================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (e) {
    console.error('Login error:', e.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/auth/verify', authRequired, (req, res) => {
  res.json({ ok: true, user: req.user });
});

// ===== Seed default admin user =====
async function seedAdminUser() {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) as cnt FROM users');
    if (rows[0].cnt > 0) return; // already seeded

    const hash = await bcrypt.hash('alwaha2024', 12);
    await pool.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['admin', hash, 'admin']);
    console.log('Default admin user seeded (admin / alwaha2024)');
  } catch (e) {
    console.error('Seed admin error (may already exist):', e.message);
  }
}

// =============================================
// FILE UPLOAD → Cloudinary
// =============================================
app.post('/api/upload', authRequired, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'al-waha', resource_type: 'auto' },
        (err, result) => err ? reject(err) : resolve(result)
      );
      stream.end(req.file.buffer);
    });
    const url = result.secure_url;
    pool.execute(
      'INSERT INTO media (filename, filepath, filetype, filesize) VALUES (?, ?, ?, ?)',
      [req.file.originalname, url, req.file.mimetype.startsWith('video') ? 'video' : 'image', req.file.size]
    ).catch(() => {});
    res.json({ url, filename: req.file.originalname, size: req.file.size });
  } catch (e) {
    console.error('Cloudinary upload failed:', e.message);
    res.status(500).json({ error: 'Upload failed: ' + e.message });
  }
});

// =============================================
// SETTINGS API — CMS key-value store
// =============================================
app.get('/api/settings', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT `key`, `value` FROM settings');
    const data = {};
    rows.forEach(r => { data[r.key] = r.value; });
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/settings/:key', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT `value` FROM settings WHERE `key` = ?', [req.params.key]);
    res.json({ value: rows[0]?.value || '' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/settings/:key', authRequired, async (req, res) => {
  try {
    await pool.execute(
      'INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)',
      [req.params.key, req.body.value || '']
    );
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Bulk save settings
app.put('/api/settings', authRequired, async (req, res) => {
  try {
    const entries = Object.entries(req.body);
    for (const [key, value] of entries) {
      await pool.execute(
        'INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)',
        [key, typeof value === 'object' ? JSON.stringify(value) : String(value)]
      );
    }
    res.json({ ok: true, saved: entries.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// =============================================
// PRODUCTS API
// =============================================
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY sort_order, id DESC');
    // Parse JSON fields
    rows.forEach(p => {
      p.images = safeJson(p.images, []);
      p.specs = safeJson(p.specs, {});
      p.flavors = safeJson(p.flavors, []);
      p.features = safeJson(p.features, []);
    });
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    const p = rows[0];
    p.images = safeJson(p.images, []);
    p.specs = safeJson(p.specs, {});
    p.flavors = safeJson(p.flavors, []);
    p.features = safeJson(p.features, []);
    res.json(p);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/products', authRequired, async (req, res) => {
  try {
    const { name, series, category, description, detail_content, image, images, specs, flavors, features, video, verified, sort_order } = req.body;
    const [result] = await pool.execute(
      `INSERT INTO products (name, series, category, description, detail_content, image, images, specs, flavors, features, video, verified, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, series || '', category || 'Disposable', description || '', detail_content || '', image || '',
       JSON.stringify(images || []), JSON.stringify(specs || {}), JSON.stringify(flavors || []),
       JSON.stringify(features || []), video || '', verified || '', sort_order || 0]
    );
    res.json({ ok: true, id: result.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/products/:id', authRequired, async (req, res) => {
  try {
    const { name, series, category, description, detail_content, image, images, specs, flavors, features, video, verified, sort_order } = req.body;
    await pool.execute(
      `UPDATE products SET name=?, series=?, category=?, description=?, detail_content=?, image=?, images=?, specs=?, flavors=?, features=?, video=?, verified=?, sort_order=? WHERE id=?`,
      [name, series || '', category || 'Disposable', description || '', detail_content || '', image || '',
       JSON.stringify(images || []), JSON.stringify(specs || {}), JSON.stringify(flavors || []),
       JSON.stringify(features || []), video || '', verified || '', sort_order || 0, req.params.id]
    );
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/products/:id', authRequired, async (req, res) => {
  try {
    await pool.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// =============================================
// NEWS API
// =============================================
app.get('/api/news', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM news ORDER BY sort_order, id DESC');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/news/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM news WHERE id = ?', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/news', authRequired, async (req, res) => {
  try {
    const { title, category, summary, content, image, video, author, published, sort_order, date, icon, gradient, excerpt } = req.body;
    const [result] = await pool.execute(
      `INSERT INTO news (title, category, summary, content, image, video, author, published, sort_order, date, icon, gradient, excerpt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, category || 'Company', summary || '', content || '', image || '', video || '', author || 'AL-WAHA', published !== false ? 1 : 0, sort_order || 0, date || null, icon || '', gradient || '', excerpt || summary || '']
    );
    res.json({ ok: true, id: result.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/news/:id', authRequired, async (req, res) => {
  try {
    const { title, category, summary, content, image, video, author, published, sort_order, date, icon, gradient, excerpt } = req.body;
    await pool.execute(
      `UPDATE news SET title=?, category=?, summary=?, content=?, image=?, video=?, author=?, published=?, sort_order=?, date=?, icon=?, gradient=?, excerpt=? WHERE id=?`,
      [title, category || 'Company', summary || '', content || '', image || '', video || '', author || 'AL-WAHA', published !== false ? 1 : 0, sort_order || 0, date || null, icon || '', gradient || '', excerpt || summary || '', req.params.id]
    );
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/news/:id', authRequired, async (req, res) => {
  try {
    await pool.execute('DELETE FROM news WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// =============================================
// CONTACT SUBMISSIONS API
// =============================================
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, country, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email and message are required' });
    }
    await pool.execute(
      'INSERT INTO contact_submissions (name, email, phone, country, message) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone || '', country || '', message]
    );
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/contact', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM contact_submissions ORDER BY created_at DESC');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/contact/:id/read', authRequired, async (req, res) => {
  try {
    await pool.execute('UPDATE contact_submissions SET is_read = 1 WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/contact/:id', authRequired, async (req, res) => {
  try {
    await pool.execute('DELETE FROM contact_submissions WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// =============================================
// CAROUSEL API
// =============================================
app.get('/api/carousel', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM carousel ORDER BY sort_order, id');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/carousel', authRequired, async (req, res) => {
  try {
    const { image, title, link, sort_order } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO carousel (image, title, link, sort_order) VALUES (?, ?, ?, ?)',
      [image, title || '', link || '', sort_order || 0]
    );
    res.json({ ok: true, id: result.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/carousel/:id', authRequired, async (req, res) => {
  try {
    const { image, title, link, sort_order } = req.body;
    await pool.execute(
      'UPDATE carousel SET image=?, title=?, link=?, sort_order=? WHERE id=?',
      [image, title || '', link || '', sort_order || 0, req.params.id]
    );
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/carousel/:id', authRequired, async (req, res) => {
  try {
    await pool.execute('DELETE FROM carousel WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// =============================================
// FEATURED VIDEOS API
// =============================================
app.get('/api/featured-videos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM featured_videos ORDER BY sort_order, id');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/featured-videos', authRequired, async (req, res) => {
  try {
    const { title, description, video_url, thumbnail, sort_order } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO featured_videos (title, description, video_url, thumbnail, sort_order) VALUES (?, ?, ?, ?, ?)',
      [title, description || '', video_url, thumbnail || '', sort_order || 0]
    );
    res.json({ ok: true, id: result.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/featured-videos/:id', authRequired, async (req, res) => {
  try {
    const { title, description, video_url, thumbnail, sort_order } = req.body;
    await pool.execute(
      'UPDATE featured_videos SET title=?, description=?, video_url=?, thumbnail=?, sort_order=? WHERE id=?',
      [title, description || '', video_url, thumbnail || '', sort_order || 0, req.params.id]
    );
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/featured-videos/:id', authRequired, async (req, res) => {
  try {
    await pool.execute('DELETE FROM featured_videos WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// =============================================
// COLLAGE PHOTOS API
// =============================================
app.get('/api/collage-photos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM collage_photos ORDER BY sort_order, id');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/collage-photos', authRequired, async (req, res) => {
  try {
    const { image, sort_order } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO collage_photos (image, sort_order) VALUES (?, ?)',
      [image, sort_order || 0]
    );
    res.json({ ok: true, id: result.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/collage-photos/:id', authRequired, async (req, res) => {
  try {
    await pool.execute('DELETE FROM collage_photos WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/collage-photos/reorder', authRequired, async (req, res) => {
  try {
    const { ids } = req.body;
    for (let i = 0; i < ids.length; i++) {
      await pool.execute('UPDATE collage_photos SET sort_order = ? WHERE id = ?', [i, ids[i]]);
    }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// =============================================
// MEDIA API
// =============================================
app.get('/api/media', async (req, res) => {
  try {
    const type = req.query.type;
    let sql = 'SELECT * FROM media';
    const params = [];
    if (type) { sql += ' WHERE filetype = ?'; params.push(type); }
    sql += ' ORDER BY id DESC';
    const [rows] = await pool.execute(sql, params);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/media/:id', authRequired, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT filepath FROM media WHERE id = ?', [req.params.id]);
    if (rows[0]) {
      const fp = path.join(__dirname, rows[0].filepath);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }
    await pool.execute('DELETE FROM media WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// =============================================
// TIMELINE API
// =============================================
app.get('/api/timeline', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM timeline ORDER BY sort_order, id');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/timeline', authRequired, async (req, res) => {
  try {
    const { year, title, description, desc, image, sort_order } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO timeline (year, title, description, image, sort_order) VALUES (?, ?, ?, ?, ?)',
      [year, title, description || desc || '', image || '', sort_order || 0]
    );
    res.json({ ok: true, id: result.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/timeline/:id', authRequired, async (req, res) => {
  try {
    const allowed = ['year', 'title', 'description', 'desc', 'image', 'sort_order'];
    const sets = [];
    const vals = [];
    allowed.forEach(f => {
      if (req.body[f] !== undefined) {
        if (f === 'desc') {
          sets.push('description = ?');
          vals.push(req.body[f]);
        } else {
          sets.push(f + ' = ?');
          vals.push(req.body[f]);
        }
      }
    });
    if (sets.length === 0) return res.json({ ok: true });
    vals.push(req.params.id);
    await pool.execute('UPDATE timeline SET ' + sets.join(', ') + ' WHERE id = ?', vals);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/timeline/:id', authRequired, async (req, res) => {
  try {
    await pool.execute('DELETE FROM timeline WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// =============================================
// ORDERS API
// =============================================
app.get('/api/orders', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders ORDER BY date DESC, created_at DESC');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/orders/:id', authRequired, async (req, res) => {
  try {
    const { status } = req.body;
    await pool.execute('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// =============================================
// USERS API
// =============================================
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users ORDER BY id DESC');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// =============================================
// STATS API (dashboard)
// =============================================
app.get('/api/stats', async (req, res) => {
  try {
    const [[{productCount}]] = await pool.query('SELECT COUNT(*) as productCount FROM products');
    const [[{newsCount}]] = await pool.query('SELECT COUNT(*) as newsCount FROM news');
    const [[{orderCount}]] = await pool.query('SELECT COUNT(*) as orderCount FROM orders');
    const [[{userCount}]] = await pool.query('SELECT COUNT(*) as userCount FROM users');
    const [[{mediaCount}]] = await pool.query('SELECT COUNT(*) as mediaCount FROM media');
    const [[{carouselCount}]] = await pool.query('SELECT COUNT(*) as carouselCount FROM carousel');
    const [[{revenue}]] = await pool.query('SELECT COALESCE(SUM(total), 0) as revenue FROM orders');
    res.json({ productCount, newsCount, orderCount, userCount, mediaCount, carouselCount, revenue });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// =============================================
// SEED DATA — Insert demo data if tables are empty
// =============================================
app.post('/api/seed', authRequired, async (req, res) => {
  try {
    const results = [];

    // Demo products
    const [[{cnt:pCount}]] = await pool.query('SELECT COUNT(*) as cnt FROM products');
    if (pCount === 0) {
      await pool.execute(`INSERT INTO products (name, series, category, description, specs, flavors, features) VALUES
        ('NEX MAX','Nex','Disposable','The NEX MAX delivers unparalleled performance with 8000 puffs, mesh coil technology, and a sleek ergonomic design.','{"puffs":"8000","nicotine":"5%","battery":"650mAh","coil":"Mesh","capacity":"12ml","charging":"Type-C"}','["Mango Ice","Blue Razz","Strawberry Kiwi","Cool Mint","Grape"]','["Mesh Coil","LED Indicator","Type-C Charging","Draw-Activated"]'),
        ('NEON PLUG','Neon','Pod System','Compact yet powerful, the NEON PLUG pod system offers a customizable vaping experience with replaceable pods and adjustable airflow.','{"puffs":"6000","nicotine":"5%","battery":"500mAh","coil":"Dual Mesh","capacity":"8ml","charging":"Type-C"}','["Watermelon Ice","Peach Mango","Blueberry","Lemon Tart"]','["Dual Mesh","Adjustable Airflow","Replaceable Pod","USB-C"]'),
        ('STAR AIR','Star','Disposable','Light as air, the STAR AIR is perfect for on-the-go vaping with its ultra-slim profile and satisfying flavor delivery.','{"puffs":"4000","nicotine":"3%","battery":"450mAh","coil":"Ceramic","capacity":"6ml","charging":"Type-C"}','["Lush Ice","Banana Ice","Mixed Berry","Pineapple"]','["Ceramic Coil","Ultra-Slim","Lightweight","USB-C"]'),
        ('VISTA PRO','Vista','Disposable','Professional-grade performance in a compact form factor. The VISTA PRO features advanced temperature control and consistent flavor output.','{"puffs":"10000","nicotine":"5%","battery":"850mAh","coil":"Quad Mesh","capacity":"15ml","charging":"Type-C"}','["Tobacco","Menthol","Coffee","Vanilla Custard"]','["Quad Mesh Coil","Temp Control","Large Capacity","Premium Build"]'),
        ('DEGREE LITE','Gear','Disposable','The DEGREE LITE combines simplicity with performance. Perfect for beginners and experienced vapers alike.','{"puffs":"5000","nicotine":"3%","battery":"500mAh","coil":"Mesh","capacity":"10ml","charging":"Type-C"}','["Cola Ice","Energy Drink","Apple","Lychee"]','["Mesh Coil","Simple Design","USB-C","Draw-Activated"]'),
        ('SABER MAX','Nex','Disposable','Maximum power, maximum flavor. The SABER MAX pushes boundaries with its high-capacity battery and dual mesh coil system.','{"puffs":"12000","nicotine":"5%","battery":"1000mAh","coil":"Dual Mesh","capacity":"18ml","charging":"Type-C"}','["Dragon Fruit","Passion Fruit","Guava","Orange","Tropical Mix"]','["Dual Mesh Coil","1000mAh Battery","18ml Capacity","LCD Display"]')
      `);
      results.push('6 demo products inserted');
    }

    // Demo news
    const [[{cnt:nCount}]] = await pool.query('SELECT COUNT(*) as cnt FROM news');
    if (nCount === 0) {
      await pool.execute(`INSERT INTO news (title, category, summary, content) VALUES
        ('AL-WAHA Launches Next-Gen Vape Technology','Company','AL-WAHA unveils revolutionary mesh coil technology for superior flavor delivery.','Full content here...'),
        ('Global Expansion: AL-WAHA Enters 20 New Markets','Business','AL-WAHA announces expansion into Southeast Asia, Europe, and South America.','Full content here...'),
        ('Sustainability Initiative: Eco-Friendly Packaging','Environment','AL-WAHA commits to 100% recyclable packaging by 2027.','Full content here...')
      `);
      results.push('3 demo news inserted');
    }

    // Demo orders
    const [[{cnt:oCount}]] = await pool.query('SELECT COUNT(*) as cnt FROM orders');
    if (oCount === 0) {
      await pool.execute(`INSERT INTO orders (id, customer, email, product, quantity, total, status, date) VALUES
        ('ORD-2026-001','John Smith','john@example.com','NEX MAX',5,450,'completed','2026-06-15'),
        ('ORD-2026-002','Sarah Lee','sarah@example.com','NEON PLUG',2,180,'processing','2026-06-20'),
        ('ORD-2026-003','Mike Chen','mike@example.com','STAR AIR',10,900,'shipped','2026-07-01'),
        ('ORD-2026-004','Lisa Wang','lisa@example.com','VISTA PRO',3,360,'pending','2026-07-10'),
        ('ORD-2026-005','Ahmed Hassan','ahmed@example.com','SABER MAX',20,1800,'pending','2026-07-12')
      `);
      results.push('5 demo orders inserted');
    }

    res.json({ ok: true, results });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// =============================================
// HEALTH CHECK
// =============================================
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (e) {
    res.status(500).json({ status: 'error', db: e.message });
  }
});

// ===== Helper =====
function safeJson(val, fallback) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try { return JSON.parse(val); } catch { return fallback; }
}

// ===== Auto-init Database Schema =====
async function initDatabase() {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      const statements = schema
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));
      for (const stmt of statements) {
        await pool.query(stmt);
      }
      console.log('Database schema initialized');
    }
  } catch (e) {
    console.error('Schema init error (may already exist):', e.message);
  }
}

// ===== Start =====
initDatabase().then(() => seedAdminUser()).then(() => {
  app.listen(PORT, () => {
    console.log(`AL-WAHA CMS API running on http://localhost:${PORT}`);
    console.log(`Uploads served from ${UPLOAD_DIR}`);
  });
});
