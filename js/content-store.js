/* ================================
   AL-WAHA CMS — API Client (MySQL backend)
   ================================ */
const API_BASE = 'http://localhost:3001/api';

const CMS = {
  _data: null,     // cached settings { key: value }
  _ready: false,

  // ─── Initialize (fetch all settings from API) ──
  async init() {
    try {
      const res = await fetch(API_BASE + '/settings');
      this._data = await res.json();
      this._ready = true;
    } catch (e) {
      console.warn('CMS: API not available, using empty cache');
      this._data = {};
      this._ready = true;
    }
  },

  // ─── Get value ────────────────────────────
  get(key, defaultVal = '') {
    return (this._data && this._data[key] !== undefined) ? this._data[key] : defaultVal;
  },

  // ─── Set value (saves to MySQL via API) ───
  async set(key, value) {
    try {
      const res = await fetch(API_BASE + '/settings/' + encodeURIComponent(key), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: String(value) })
      });
      if (res.ok) {
        if (this._data) this._data[key] = String(value);
        return true;
      }
      return false;
    } catch (e) { console.error('CMS.set failed:', e); return false; }
  },

  // ─── Get array (from settings JSON) ────────
  getArray(key, defaultArr = []) {
    const val = this.get(key, null);
    if (val === null) return defaultArr;
    try { return JSON.parse(val); }
    catch (e) { return defaultArr; }
  },

  // ─── Set array ────────────────────────────
  async setArray(key, arr) {
    return await this.set(key, JSON.stringify(arr));
  },

  // ─── Reset single field ───────────────────
  async reset(key, defaultVal = '') {
    await this.set(key, defaultVal);
  },

  // ─── Reset all content ────────────────────
  async resetAll() {
    // Not available via API — would need a dedicated endpoint
    console.warn('CMS.resetAll: use API directly');
  },

  // ─── Export all data ──────────────────────
  exportAll() {
    return this._data ? JSON.parse(JSON.stringify(this._data)) : {};
  },

  // ─── Bulk save (for content editor) ────────
  async bulkSave(settingsObj) {
    try {
      const res = await fetch(API_BASE + '/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsObj)
      });
      return res.ok;
    } catch (e) { console.error('CMS.bulkSave failed:', e); return false; }
  },

  // ─── Upload file to server ────────────────
  async uploadFile(file, onProgress) {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(API_BASE + '/upload', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      return API_BASE.replace('/api', '') + data.url;
    } catch (e) { console.error('CMS.uploadFile failed:', e); return null; }
  },

  // ─── FileToBase64 (legacy, for compatibility) ──
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  // ═══════════════════════════════════════════
  // PRODUCTS (via API)
  // ═══════════════════════════════════════════

  async _fetchProducts() {
    try {
      const res = await fetch(API_BASE + '/products');
      return await res.json();
    } catch (e) {
      console.error('Failed to fetch products:', e);
      return DEFAULT_PRODUCTS;
    }
  },

  async getAllProducts() { 
    const products = await this._fetchProducts();
    // Flatten specs for backward compatibility
    return products.map(p => {
      const specs = p.specs || {};
      return { ...p, puffs: specs.puffs || p.puffs || '', nicotine: specs.nicotine || p.nicotine || '', battery: specs.battery || p.battery || '', capacity: specs.capacity || p.capacity || '', resistance: specs.resistance || p.resistance || '', charging: specs.charging || p.charging || '' };
    });
  },

  async getProduct(id) {
    try {
      const res = await fetch(API_BASE + '/products/' + id);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) { return null; }
  },

  async addProduct(product) {
    try {
      const res = await fetch(API_BASE + '/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (!res.ok) return null;
      const data = await res.json();
      return { ...product, id: data.id };
    } catch (e) { console.error(e); return null; }
  },

  async updateProduct(id, updates) {
    try {
      const res = await fetch(API_BASE + '/products/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return res.ok;
    } catch (e) { console.error(e); return false; }
  },

  async deleteProduct(id) {
    try {
      const res = await fetch(API_BASE + '/products/' + id, { method: 'DELETE' });
      return res.ok;
    } catch (e) { console.error(e); return false; }
  },

  // ═══════════════════════════════════════════
  // NEWS (via API)
  // ═══════════════════════════════════════════

  async _fetchNews() {
    try {
      const res = await fetch(API_BASE + '/news');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } catch (e) { console.error('News fetch failed, using defaults:', e.message); return DEFAULT_NEWS; }
  },

  async getAllNews() { return await this._fetchNews(); },

  async getNewsById(id) {
    try {
      const res = await fetch(API_BASE + '/news/' + id);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } catch (e) { console.error('News fetch by id failed:', e.message); return null; }
  },

  async addNews(article) {
    try {
      const res = await fetch(API_BASE + '/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(article)
      });
      if (!res.ok) return null;
      const data = await res.json();
      return { ...article, id: data.id };
    } catch (e) { console.error(e); return null; }
  },

  async updateNews(id, updates) {
    try {
      const res = await fetch(API_BASE + '/news/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return res.ok;
    } catch (e) { console.error(e); return false; }
  },

  async deleteNews(id) {
    try {
      const res = await fetch(API_BASE + '/news/' + id, { method: 'DELETE' });
      return res.ok;
    } catch (e) { console.error(e); return false; }
  },

  // ═══════════════════════════════════════════
  // CONTACT SUBMISSIONS
  // ═══════════════════════════════════════════
  async submitContact(data) {
    try {
      const res = await fetch(API_BASE + '/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.ok;
    } catch (e) { console.error(e); return false; }
  },

  async getContactSubmissions() {
    try {
      const res = await fetch(API_BASE + '/contact');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } catch (e) { console.error(e); return []; }
  },

  async markContactRead(id) {
    try {
      const res = await fetch(API_BASE + '/contact/' + id + '/read', { method: 'PUT' });
      return res.ok;
    } catch (e) { console.error(e); return false; }
  },

  async deleteContactSubmission(id) {
    try {
      const res = await fetch(API_BASE + '/contact/' + id, { method: 'DELETE' });
      return res.ok;
    } catch (e) { console.error(e); return false; }
  },

  // ═══════════════════════════════════════════
  // CAROUSEL (via API)
  // ═══════════════════════════════════════════

  async getCarouselSlides() {
    try {
      const res = await fetch(API_BASE + '/carousel');
      const data = await res.json();
      return data.map(s => ({ ...s, id: String(s.id) }));
    } catch (e) { return []; }
  },

  getCarouselSpeed() {
    const val = this.get('home._heroSlideSpeed', '5000');
    const n = parseInt(val, 10); return isNaN(n) || n < 1000 ? 5000 : n;
  },

  async addCarouselSlide(image, title, link) {
    try {
      const res = await fetch(API_BASE + '/carousel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, title: title || '', link: link || '' })
      });
      if (!res.ok) return null;
      const data = await res.json();
      return { id: String(data.id), image, title, link };
    } catch (e) { console.error(e); return null; }
  },

  async updateCarouselSlide(id, updates) {
    try {
      const res = await fetch(API_BASE + '/carousel/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return res.ok;
    } catch (e) { console.error(e); return false; }
  },

  async deleteCarouselSlide(id) {
    try {
      const res = await fetch(API_BASE + '/carousel/' + id, { method: 'DELETE' });
      return res.ok;
    } catch (e) { console.error(e); return false; }
  },

  async moveCarouselSlide(id, direction) {
    const slides = await this.getCarouselSlides();
    const idx = slides.findIndex(s => s.id === id);
    if (idx === -1) return;
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= slides.length) return;
    [slides[idx], slides[newIdx]] = [slides[newIdx], slides[idx]];
    // Update sort_order for all
    for (let i = 0; i < slides.length; i++) {
      await this.updateCarouselSlide(slides[i].id, { sort_order: i });
    }
  },

  // ═══════════════════════════════════════════
  // FEATURED VIDEOS (via API)
  // ═══════════════════════════════════════════

  async getFeaturedVideos() {
    try {
      const res = await fetch(API_BASE + '/featured-videos');
      return await res.json();
    } catch (e) { return []; }
  },

  async createFeaturedVideo(data) {
    const res = await fetch(API_BASE + '/featured-videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async updateFeaturedVideo(id, data) {
    const res = await fetch(API_BASE + '/featured-videos/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.ok;
  },

  async deleteFeaturedVideo(id) {
    try {
      const res = await fetch(API_BASE + '/featured-videos/' + id, { method: 'DELETE' });
      return res.ok;
    } catch (e) { return false; }
  },

  // ═══════════════════════════════════════════
  // COLLAGE PHOTOS (via API)
  // ═══════════════════════════════════════════

  async getCollagePhotos() {
    try {
      const res = await fetch(API_BASE + '/collage-photos');
      return await res.json();
    } catch (e) { return []; }
  },

  async addCollagePhoto(data) {
    const res = await fetch(API_BASE + '/collage-photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async deleteCollagePhoto(id) {
    try {
      const res = await fetch(API_BASE + '/collage-photos/' + id, { method: 'DELETE' });
      return res.ok;
    } catch (e) { return false; }
  },

  async reorderCollagePhotos(ids) {
    try {
      await fetch(API_BASE + '/collage-photos/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: ids })
      });
    } catch (e) {}
  },

  // ═══════════════════════════════════════════
  // TIMELINE (via API)
  // ═══════════════════════════════════════════

  async getTimeline() {
    try {
      const res = await fetch(API_BASE + '/timeline');
      return await res.json();
    } catch (e) { return DEFAULT_TIMELINE; }
  },

  async addTimeline(item) {
    try {
      const res = await fetch(API_BASE + '/timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (!res.ok) return null;
      const data = await res.json();
      return { ...item, id: data.id };
    } catch (e) { console.error(e); return null; }
  },

  async updateTimeline(id, updates) {
    try {
      const res = await fetch(API_BASE + '/timeline/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return res.ok;
    } catch (e) { console.error(e); return false; }
  },

  async deleteTimeline(id) {
    try {
      const res = await fetch(API_BASE + '/timeline/' + id, { method: 'DELETE' });
      return res.ok;
    } catch (e) { console.error(e); return false; }
  },

  // ═══════════════════════════════════════════
  // MEDIA (via API)
  // ═══════════════════════════════════════════

  async getAllMedia(type) {
    try {
      const url = API_BASE + '/media' + (type ? '?type=' + type : '');
      const res = await fetch(url);
      return await res.json();
    } catch (e) { return []; }
  },

  async deleteMedia(id) {
    try {
      const res = await fetch(API_BASE + '/media/' + id, { method: 'DELETE' });
      return res.ok;
    } catch (e) { console.error(e); return false; }
  },

  // ═══════════════════════════════════════════
  // STATS (dashboard)
  // ═══════════════════════════════════════════

  async getStats() {
    try {
      const res = await fetch(API_BASE + '/stats');
      return await res.json();
    } catch (e) { return {}; }
  },

  // ═══════════════════════════════════════════
  // SEED DATA (insert demo data if DB is empty)
  // ═══════════════════════════════════════════

  async seedData() {
    try {
      const res = await fetch(API_BASE + '/seed', { method: 'POST' });
      return await res.json();
    } catch (e) { return null; }
  },

  // ═══════════════════════════════════════════
  // Page Apply — auto-bind data-cms attributes
  // Same logic as before, works on _data cache
  // ═══════════════════════════════════════════

  applyToPage() {
    if (!this._ready || !this._data) return;

    document.querySelectorAll('[data-cms]').forEach(el => {
      const key = el.dataset.cms;
      if (!(key in this._data)) return;
      var val = this._data[key];
      if (val === undefined || val === null) return;
      var v = String(val);

      if (el.tagName === 'IMG') { el.src = v; return; }
      if (el.tagName === 'VIDEO' || el.tagName === 'SOURCE') { el.src = v; return; }
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') { el.placeholder = v; return; }

      var hasElementChildren = false;
      for (var ci = 0; ci < el.childNodes.length; ci++) {
        if (el.childNodes[ci].nodeType === 1) { hasElementChildren = true; break; }
      }
      if (hasElementChildren) { el.innerHTML = v; }
      else { el.textContent = v; }
    });

    document.querySelectorAll('[data-cms-html]').forEach(el => {
      const key = el.dataset.cmsHtml;
      if (!(key in this._data)) return;
      var val = this._data[key];
      if (val !== undefined && val !== null && val !== false) {
        el.innerHTML = String(val).replace(/\n/g, '<br>');
      }
    });

    document.querySelectorAll('[data-cms-link]').forEach(el => {
      const key = el.dataset.cmsLink;
      if (!(key in this._data)) return;
      var val = this._data[key];
      if (val) el.setAttribute('href', String(val));
    });

    document.querySelectorAll('[data-cms-img]').forEach(el => {
      const key = el.dataset.cmsImg;
      if (!(key in this._data)) return;
      var val = this._data[key];
      if (val) {
        if (el.tagName === 'IMG') el.src = val;
        else el.style.backgroundImage = 'url(\'' + val + '\')';
      }
    });

    document.querySelectorAll('[data-cms-video]').forEach(el => {
      const key = el.dataset.cmsVideo;
      if (!(key in this._data)) return;
      var val = this._data[key];
      if (val && el.tagName === 'VIDEO') el.src = val;
    });

    document.querySelectorAll('[data-cms-auto-gradient]').forEach(function(el) {
      var text = el.textContent.trim();
      var lastSpace = text.lastIndexOf(' ');
      if (lastSpace === -1) return;
      var prefix = text.substring(0, lastSpace);
      var lastWord = text.substring(lastSpace + 1);
      el.innerHTML = prefix + ' <span class="text-gradient">' + lastWord + '</span>';
    });

    if (typeof initScrollReveal === 'function') {
      setTimeout(initScrollReveal, 100);
    }
  },

  // ─── Product image render helper ───────
  renderProductImage(product) {
    var img = product.image || '';
    if (img && (img.match(/^https?:\/\//) || img.match(/^data:/) || img.match(/^\/uploads\//))) {
      return '<img src="' + img + '" style="width:100%;height:100%;object-fit:cover;" alt="' + (product.name || '') + '" loading="lazy">';
    }
    return img || (product.name || '?').charAt(0);
  },
};

// ═══════════════════════════════════════════
// SCHEMA — unchanged (for admin content editor)
// ═══════════════════════════════════════════

const SCHEMA = {
  global: {
    siteName:        { type: 'text',  label: 'Website Name',         group: 'Branding',   default: 'AL-WAHA' },
    siteSlogan:      { type: 'text',  label: 'Website Slogan',       group: 'Branding',   default: 'Make Joy Happen' },
    logoText:        { type: 'text',  label: 'Logo Text',            group: 'Branding',   default: 'AL-WAHA' },
    footerDesc:      { type: 'textarea', label: 'Footer Description', group: 'Footer',   default: "AL-WAHA is an international vape brand devoted to accelerating the world's transition to a smoking-free place. Make Joy Happen." },
    footerCopy:      { type: 'text',  label: 'Copyright Text',       group: 'Footer',     default: '\u00a9 2026 AL-WAHA. All rights reserved.' },
  },
  home: {
    _heroTitle:      { type: 'text',  label: 'Hero Title',           group: 'Hero',       default: 'AL-WAHA' },
    _heroSubtitle:   { type: 'textarea', label: 'Hero Subtitle',     group: 'Hero',       default: 'Make Joy Happen \u2014 Premium vaping devices designed for those who demand the extraordinary.' },
    _heroCta:        { type: 'text',  label: 'CTA Button Text',      group: 'Hero',       default: 'Explore Products' },
    _heroBg:         { type: 'image', label: 'Hero Background Image',group: 'Hero',       default: '' },
    _heroVideo:      { type: 'video', label: 'Hero Background Video',group: 'Hero',       default: '' },
    _heroSlides:     { type: 'text',  label: 'Hero Carousel Images (JSON array)', group: 'Hero Carousel', default: '[]' },
    _heroSlideSpeed: { type: 'text',  label: 'Carousel Speed (ms)',  group: 'Hero Carousel', default: '5000' },
    _featuredTitle:  { type: 'text',  label: 'Section Title',        group: 'Featured Products', default: 'Featured Products' },
    _featuredDesc:   { type: 'textarea', label: 'Section Description',group: 'Featured Products', default: 'Discover our most popular devices, crafted for performance and style.' },
    _featuredIds:    { type: 'text',  label: 'Product IDs (comma-separated)', group: 'Featured Products', default: '1,2,4,6' },
    _newsTitle:      { type: 'text',  label: 'Section Title',        group: 'News', default: 'News' },
    _newsDesc:       { type: 'textarea', label: 'Section Description',group: 'News', default: 'Stay updated with the latest from AL-WAHA — product launches, events, and more.' },
    _subTitle:       { type: 'text',  label: 'Section Title',        group: 'Newsletter', default: 'Stay Connected' },
    _subDesc:        { type: 'textarea', label: 'Section Description',group: 'Newsletter', default: 'Subscribe to our newsletter for exclusive updates, new product announcements, and special offers.' },
    _subPlaceholder: { type: 'text',  label: 'Input Placeholder',    group: 'Newsletter', default: 'Your email address' },
    _subBtn:         { type: 'text',  label: 'Button Text',          group: 'Newsletter', default: 'Subscribe' },
    _makejoyTitle:   { type: 'text',  label: 'Title',                group: 'MAKE JOY HAPPEN', default: 'MAKE JOY HAPPEN' },
    _makejoyDesc:    { type: 'textarea', label: 'Description',       group: 'MAKE JOY HAPPEN', default: 'AL-WAHA is an international vape brand devoted to accelerating the world\'s transition to a smoking-free place.' },
    _makejoyBtn:     { type: 'text',  label: 'Button Text',          group: 'MAKE JOY HAPPEN', default: 'Learn More' },
    _makejoyLink:    { type: 'text',  label: 'Button Link',          group: 'MAKE JOY HAPPEN', default: 'about.html' },
  },
  products: {
    _pageTitle:      { type: 'text',  label: 'Page Title',           group: 'Hero',       default: 'Our Products' },
    _pageDesc:       { type: 'textarea', label: 'Page Description',  group: 'Hero',       default: 'Discover the full range of AL-WAHA premium vaping devices \u2014 engineered for performance, designed for life.' },
    _pageBg:         { type: 'image', label: 'Hero Background Image',group: 'Hero',       default: '' },
  },
  about: {
    _heroTitle:      { type: 'text',  label: 'Page Title',           group: 'Hero',       default: 'MAKE JOY HAPPEN' },
    _heroSubtitle:   { type: 'textarea', label: 'Page Subtitle',     group: 'Hero',       default: 'AL-WAHA was born from a simple belief: that everyone deserves a better alternative to traditional smoking.' },
    _heroBg:         { type: 'image', label: 'Hero Background Image',group: 'Hero',       default: '' },
    _heroImage:      { type: 'image', label: 'Hero Visual Image (1:1)', group: 'Hero',   default: '' },
    _heroOverlayText:{ type: 'text',  label: 'Hero Watermark Text',  group: 'Hero',       default: '' },
    _missionTitle:   { type: 'text',  label: 'Section Title',        group: 'Mission',    default: 'Our Mission' },
    _missionDesc:    { type: 'textarea', label: 'Section Description',group: 'Mission',   default: 'To provide adult smokers with premium, innovative alternatives through cutting-edge technology, rigorous quality control, and unwavering commitment to user satisfaction.' },
    _missionImage:   { type: 'image', label: 'Mission Image',        group: 'Mission',    default: '' },
    _missionBg:      { type: 'image', label: 'Mission Background',   group: 'Mission',    default: '' },
    _visionTitle:    { type: 'text',  label: 'Section Title',        group: 'Vision',     default: 'Our Vision' },
    _visionDesc:     { type: 'textarea', label: 'Section Description',group: 'Vision',    default: "To become the world's most trusted vaping brand, setting industry standards for quality, innovation, and responsible practices." },
    _visionBg:       { type: 'image', label: 'Vision Background',    group: 'Vision',     default: '' },
    _aboutVideo:     { type: 'video', label: 'Brand Video',          group: 'Media',      default: '' },
    _valuesTitle:    { type: 'text',  label: 'Section Title',        group: 'Core Values',default: 'Our Core Values' },
    _valuesBg:       { type: 'image', label: 'Values Background',    group: 'Core Values',default: '' },
    _val1Title:      { type: 'text',  label: 'Value 1 Title',        group: 'Core Values',default: 'Innovation' },
    _val1Desc:       { type: 'textarea', label: 'Value 1 Desc',      group: 'Core Values',default: 'Pushing boundaries with cutting-edge R&D to deliver the best vaping experience.' },
    _val2Title:      { type: 'text',  label: 'Value 2 Title',        group: 'Core Values',default: 'Quality' },
    _val2Desc:       { type: 'textarea', label: 'Value 2 Desc',      group: 'Core Values',default: 'Every product undergoes rigorous testing to meet the highest international standards.' },
    _val3Title:      { type: 'text',  label: 'Value 3 Title',        group: 'Core Values',default: 'Responsibility' },
    _val3Desc:       { type: 'textarea', label: 'Value 3 Desc',      group: 'Core Values',default: 'Committed to strict age verification, compliance, and promoting responsible use.' },
    _val4Title:      { type: 'text',  label: 'Value 4 Title',        group: 'Core Values',default: 'Community' },
    _val4Desc:       { type: 'textarea', label: 'Value 4 Desc',      group: 'Core Values',default: 'Building a global community of adult vapers who share our passion for excellence.' },
    _val5Title:      { type: 'text',  label: 'Value 5 Title',        group: 'Core Values',default: 'Sustainability' },
    _val5Desc:       { type: 'textarea', label: 'Value 5 Desc',      group: 'Core Values',default: 'Developing eco-friendly practices across our supply chain and product lifecycle.' },
    _val6Title:      { type: 'text',  label: 'Value 6 Title',        group: 'Core Values',default: 'Transparency' },
    _val6Desc:       { type: 'textarea', label: 'Value 6 Desc',      group: 'Core Values',default: 'Open and honest communication with our customers, partners, and stakeholders.' },
    _timelineTitle:  { type: 'text',  label: 'Section Title',        group: 'Timeline',   default: 'Our Journey' },
    _statsTitle:     { type: 'text',  label: 'Section Title',        group: 'Stats',      default: 'AL-WAHA by Numbers' },
    _stats1Num:      { type: 'text',  label: 'Stat 1 \u2014 Number',      group: 'Stats',      default: '30' },
    _stats1Suf:      { type: 'text',  label: 'Stat 1 \u2014 Suffix',      group: 'Stats',      default: '+' },
    _stats1Label:    { type: 'text',  label: 'Stat 1 \u2014 Label',       group: 'Stats',      default: 'Countries' },
    _stats2Num:      { type: 'text',  label: 'Stat 2 \u2014 Number',      group: 'Stats',      default: '6' },
    _stats2Suf:      { type: 'text',  label: 'Stat 2 \u2014 Suffix',      group: 'Stats',      default: 'M+' },
    _stats2Label:    { type: 'text',  label: 'Stat 2 \u2014 Label',       group: 'Stats',      default: 'Users Worldwide' },
    _stats3Num:      { type: 'text',  label: 'Stat 3 \u2014 Number',      group: 'Stats',      default: '50' },
    _stats3Suf:      { type: 'text',  label: 'Stat 3 \u2014 Suffix',      group: 'Stats',      default: '+' },
    _stats3Label:    { type: 'text',  label: 'Stat 3 \u2014 Label',       group: 'Stats',      default: 'Product SKUs' },
    _stats4Num:      { type: 'text',  label: 'Stat 4 — Number',      group: 'Stats',      default: '2019' },
    _stats4Suf:      { type: 'text',  label: 'Stat 4 — Suffix',      group: 'Stats',      default: '' },
    _stats4Label:    { type: 'text',  label: 'Stat 4 — Label',       group: 'Stats',      default: 'Established' },
    _meetDesc:       { type: 'textarea', label: 'Description',         group: 'Meet AL-WAHA', default: 'AL-WAHA is dedicated to providing premium vaping products for users who seek a high-quality lifestyle.' },
    _meetImg1:       { type: 'image', label: 'Scene 1 \u2014 R&D Design',  group: 'Meet AL-WAHA', default: '' },
    _meetImg2:       { type: 'image', label: 'Scene 2 \u2014 Flavor Lab',  group: 'Meet AL-WAHA', default: '' },
    _meetImg3:       { type: 'image', label: 'Scene 3 \u2014 Our Team',    group: 'Meet AL-WAHA', default: '' },
    _meetImg4:       { type: 'image', label: 'Scene 4 \u2014 Global Support', group: 'Meet AL-WAHA', default: '' },
    _meetImg5:       { type: 'image', label: 'Scene 5 \u2014 Logistics',     group: 'Meet AL-WAHA', default: '' },
    _meetImg6:       { type: 'image', label: 'Scene 6 \u2014 Community',     group: 'Meet AL-WAHA', default: '' },
    _strengthDesc:   { type: 'textarea', label: 'Description',         group: 'Our Strength', default: 'AL-WAHA, a proud ECCC member, creates premium vaping products with responsibility and quality beyond industry standards.' },
    _growthDesc:     { type: 'textarea', label: 'Description',         group: 'Growth/Ahead', default: 'AL-WAHA is at the forefront of advancing from design, technology to flavors.\nWe will always prioritize user needs and customer service\nand continue to innovate and break through.\nNow let\'s explore more possibilities on this journey with AL-WAHA.' },
    _growthBg:       { type: 'image',    label: 'Background Image',     group: 'Growth/Ahead', default: '' },
  },
  news: {
    _pageTitle:      { type: 'text',  label: 'Page Title',           group: 'Hero',       default: 'News & Media' },
    _pageDesc:       { type: 'textarea', label: 'Page Description',  group: 'Hero',       default: 'Stay informed about our latest product launches, company news, and industry insights.' },
  },
  contact: {
    _heroTitle:      { type: 'text',  label: 'Page Title',           group: 'Hero',       default: 'Get in Touch' },
    _heroDesc:       { type: 'textarea', label: 'Page Description',  group: 'Hero',       default: "Have a question? Want to become a distributor? We'd love to hear from you." },
    _infoTitle:      { type: 'text',  label: 'Section Title',        group: 'Contact Info',default: 'Get in Touch' },
    _email:          { type: 'text',  label: 'Email Address',        group: 'Contact Info',default: 'info@alwaha.com' },
    _phone:          { type: 'text',  label: 'Phone Number',         group: 'Contact Info',default: '+1 (555) 123-4567' },
    _address:        { type: 'text',  label: 'Address',              group: 'Contact Info',default: '123 Innovation Drive, Shenzhen, Guangdong, China' },
    _office1City:    { type: 'text',  label: 'Office 1 \u2014 City',      group: 'Offices',    default: 'Shenzhen' },
    _office1Addr:    { type: 'text',  label: 'Office 1 \u2014 Address',   group: 'Offices',    default: '123 Innovation Drive, Nanshan District' },
    _office1Phone:   { type: 'text',  label: 'Office 1 \u2014 Phone',     group: 'Offices',    default: '+86 755 1234 5678' },
    _office1Email:   { type: 'text',  label: 'Office 1 \u2014 Email',     group: 'Offices',    default: 'china@alwaha.com' },
    _office2City:    { type: 'text',  label: 'Office 2 \u2014 City',      group: 'Offices',    default: 'Los Angeles' },
    _office2Addr:    { type: 'text',  label: 'Office 2 \u2014 Address',   group: 'Offices',    default: '456 Sunset Blvd, Suite 200' },
    _office2Phone:   { type: 'text',  label: 'Office 2 \u2014 Phone',     group: 'Offices',    default: '+1 (310) 555 0199' },
    _office2Email:   { type: 'text',  label: 'Office 2 \u2014 Email',     group: 'Offices',    default: 'usa@alwaha.com' },
    _office3City:    { type: 'text',  label: 'Office 3 \u2014 City',      group: 'Offices',    default: 'London' },
    _office3Addr:    { type: 'text',  label: 'Office 3 \u2014 Address',   group: 'Offices',    default: '789 Oxford Street, Floor 4' },
    _office3Phone:   { type: 'text',  label: 'Office 3 \u2014 Phone',     group: 'Offices',    default: '+44 20 7946 0958' },
    _office3Email:   { type: 'text',  label: 'Office 3 \u2014 Email',     group: 'Offices',    default: 'europe@alwaha.com' },
    _formTitle:      { type: 'text',  label: 'Form Title',           group: 'Form',       default: 'Send a Message' },
  },
  _products: null,
  _news: null,
  _timeline: null,
};

// Default fallback data (used when API is down)
const DEFAULT_PRODUCTS = [
  { id: 1, name: "NEX MAX", category: "Disposable", series: "Nex", badge: "NEW", desc: "RDL & DTL dual-mode disposable vape with touch control and 20,000 puffs capacity.", puffs: "20000 Puffs", nicotine: "5% (50mg)", battery: "850mAh", capacity: "20ml", resistance: "0.6\u03a9", charging: "Type-C", gradient: "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)", flavors: ["Blue Razz Ice", "Watermelon Bubblegum", "Mango Peach Watermelon", "Strawberry Kiwi", "Cool Mint", "Grape Ice"], features: ["Touch Control", "Dual Mode RDL/DTL", "LED Display", "Mesh Coil"], image: "", detailImages: [], video: "" },
  { id: 2, name: "NEON PLUG", category: "Disposable", series: "Neon", badge: "HOT", desc: "Tiny form factor with explosive flavor. Compact design meets massive performance.", puffs: "12000 Puffs", nicotine: "5% (50mg)", battery: "600mAh", capacity: "12ml", resistance: "0.8\u03a9", charging: "Type-C", gradient: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)", flavors: ["Pineapple Coconut", "Peach Mango Watermelon", "Blueberry Sour Raspberry", "Strawberry Watermelon", "Mint Blast"], features: ["Compact Design", "Mesh Coil", "Adjustable Airflow", "LED Indicator"], image: "", detailImages: [], video: "" },
  { id: 3, name: "STAR AIR", category: "Disposable", series: "Star", badge: "", desc: "Slim, sleek, and stylish. The perfect everyday companion with smooth draw.", puffs: "8000 Puffs", nicotine: "5% (50mg)", battery: "500mAh", capacity: "8ml", resistance: "1.0\u03a9", charging: "Type-C", gradient: "linear-gradient(135deg, #10b981 0%, #fbbf24 100%)", flavors: ["Lush Ice", "Gummy Bear", "Cotton Candy", "Energy Drink", "Tobacco"], features: ["Slim Design", "Draw Activated", "Leak-Proof", "Food-Grade Material"], image: "", detailImages: [], video: "" },
  { id: 4, name: "VISTA PRO", category: "Pod System", series: "Vista", badge: "NEW", desc: "Refillable pod system with adjustable wattage and OLED screen for the discerning vaper.", puffs: "Refillable", nicotine: "Adjustable", battery: "1200mAh", capacity: "4ml Pod", resistance: "0.4-1.2\u03a9", charging: "Type-C", gradient: "linear-gradient(135deg, #f97316 0%, #ec4899 100%)", flavors: ["Use Any E-Liquid"], features: ["Adjustable Wattage", "OLED Screen", "Refillable Pod", "Replaceable Coil"], image: "", detailImages: [], video: "" },
  { id: 5, name: "DEGREE LITE", category: "Disposable", series: "Gear", badge: "", desc: "Lightweight and pocket-friendly. Designed for those always on the move.", puffs: "5000 Puffs", nicotine: "5% (50mg)", battery: "400mAh", capacity: "5ml", resistance: "1.0\u03a9", charging: "Type-C", gradient: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)", flavors: ["Mixed Berries", "Cola Ice", "Lychee Ice", "Mango Ice", "Menthol"], features: ["Ultra Light", "Pocket Size", "Draw Activated", "Mesh Coil"], image: "", detailImages: [], video: "" },
  { id: 6, name: "SABER MAX", category: "Disposable", series: "Nex", badge: "HOT", desc: "Maximum flavor, maximum satisfaction. The ultimate disposable experience.", puffs: "15000 Puffs", nicotine: "5% (50mg)", battery: "700mAh", capacity: "15ml", resistance: "0.6\u03a9", charging: "Type-C", gradient: "linear-gradient(135deg, #ef4444 0%, #f97316 100%)", flavors: ["Strawberry Mango", "Blueberry Pomegranate", "Banana Vanilla", "Caramel Tobacco", "Cucumber Mint"], features: ["Dual Mesh Coil", "Adjustable Airflow", "E-Liquid Indicator", "Fast Charging"], image: "", detailImages: [], video: "" }
];

const DEFAULT_NEWS = [
  { id: 1, title: "NEX MAX - RDL & DTL, Touch & Go", category: "Product Launch", date: "2026-07-10", excerpt: "Introducing the NEX MAX, our latest innovation featuring dual-mode RDL and DTL functionality with intuitive touch control.", icon: "\ud83d\ude80", gradient: "linear-gradient(135deg, #7c3aed, #ec4899)", image: "", video: "", content: "<p>The NEX MAX represents a significant leap forward in disposable vape technology, combining two popular vaping styles into a single, elegant device.</p><h2>Dual Mode Innovation</h2><p>For the first time in a disposable format, users can seamlessly switch between <b>RDL (Restricted Direct Lung)</b> and <b>DTL (Direct to Lung)</b> modes. This versatility allows vapers to customize their experience based on mood and preference.</p><h2>Touch Control Interface</h2><p>The intuitive touch-sensitive panel eliminates the need for physical buttons, providing a clean, modern aesthetic while maintaining precise control over your vaping experience.</p><p>With a massive 20ml e-liquid capacity and 850mAh battery, the NEX MAX delivers up to 20,000 puffs of consistent, flavorful vapor through its advanced mesh coil system.</p>" },
  { id: 2, title: "NEON PLUG - Tiny Form, Flavor Boom", category: "Product Launch", date: "2026-07-05", excerpt: "The NEON PLUG proves that great things come in small packages. Experience explosive flavor in a compact design.", icon: "\u2728", gradient: "linear-gradient(135deg, #06b6d4, #3b82f6)", image: "", video: "", content: "<p>Don't let its size fool you. The NEON PLUG packs an incredible punch in one of the most compact form factors on the market today.</p><h2>Compact Yet Powerful</h2><p>Despite its diminutive dimensions, the NEON PLUG houses a 600mAh battery and 12ml e-liquid reservoir, delivering up to 12,000 puffs of intense flavor.</p><h2>Explosive Flavor Technology</h2><p>Our proprietary mesh coil technology maximizes surface area contact with the e-liquid, producing richer, more saturated vapor that brings every flavor note to life.</p><p>The adjustable airflow system lets you dial in your perfect draw resistance, from a tight MTL hit to a more open, airy experience.</p>" },
  { id: 3, title: "AL-WAHA Verification Service Restored", category: "Notice", date: "2026-07-01", excerpt: "We're pleased to announce that our product verification service is fully operational again with enhanced security features.", icon: "\ud83d\udd12", gradient: "linear-gradient(135deg, #10b981, #fbbf24)", image: "", video: "", content: "<p>After a comprehensive security upgrade, our product verification service is now back online with enhanced protection against counterfeiting.</p><h2>What's New</h2><ul><li>Multi-layer encryption for verification codes</li><li>Real-time database synchronization</li><li>Improved mobile scanning experience</li><li>Instant verification results in under 2 seconds</li></ul><h2>How to Verify Your Product</h2><p>Simply scan the QR code on your AL-WAHA product packaging using your smartphone camera, or enter the unique verification code on our website. You will receive immediate confirmation of your product's authenticity.</p><p>We remain committed to protecting our customers from counterfeit products and ensuring you receive only genuine AL-WAHA quality.</p>" },
  { id: 4, title: "AL-WAHA Expands to Southeast Asian Markets", category: "Company News", date: "2026-06-20", excerpt: "AL-WAHA officially launches in Thailand, Vietnam, and Malaysia, bringing our premium vaping experience to more users.", icon: "\ud83c\udf0f", gradient: "linear-gradient(135deg, #f97316, #ec4899)", image: "", video: "", content: "<p>AL-WAHA is proud to announce our official expansion into three key Southeast Asian markets: Thailand, Vietnam, and Malaysia.</p><h2>Strategic Growth</h2><p>This expansion represents a significant milestone in our global growth strategy. Southeast Asia represents one of the fastest-growing vaping markets worldwide, with millions of adult smokers seeking better alternatives.</p><h2>Local Partnerships</h2><p>We have established partnerships with leading distributors in each country to ensure our products are readily available through authorized retail channels, both online and in physical stores.</p><blockquote>This expansion brings us closer to our vision of making premium vaping accessible to adult consumers across the globe.</blockquote><p>Each market will receive a curated selection of our most popular products, with local flavor preferences and regulatory requirements taken into careful consideration.</p>" },
  { id: 5, title: "New Manufacturing Facility Opens", category: "Company News", date: "2026-06-15", excerpt: "Our state-of-the-art manufacturing facility in Shenzhen is now operational, doubling our production capacity.", icon: "\ud83c\udfed", gradient: "linear-gradient(135deg, #3b82f6, #8b5cf6)", image: "", video: "", content: "<p>We are excited to announce the opening of our newest manufacturing facility in Shenzhen, China — the global hub of electronics innovation.</p><h2>World-Class Production</h2><p>The 50,000 square meter facility features:</p><ul><li>10 fully automated production lines</li><li>ISO 9001 certified quality control</li><li>Clean room environments for e-liquid filling</li><li>Advanced testing laboratory</li><li>Automated packaging systems</li></ul><h2>Doubled Capacity</h2><p>With this new facility, our monthly production capacity has doubled to over 150 million pieces, ensuring we can meet the growing global demand for AL-WAHA products without compromising on quality.</p><h2>Sustainability Focus</h2><p>The facility incorporates solar panels covering 40% of its energy needs and a comprehensive recycling program for production materials.</p>" },
  { id: 6, title: "AL-WAHA Wins Best Vape Brand 2026", category: "Awards", date: "2026-06-01", excerpt: "We're honored to receive the Best Vape Brand award at the 2026 Global Vaping Industry Awards.", icon: "\ud83c\udfc6", gradient: "linear-gradient(135deg, #fbbf24, #f97316)", image: "", video: "", content: "<p>AL-WAHA has been named <b>Best Vape Brand 2026</b> at the prestigious Global Vaping Industry Awards ceremony held in Dubai.</p><h2>Recognition of Excellence</h2><p>This award recognizes our commitment to product innovation, quality manufacturing, and responsible business practices. The judging panel highlighted our rapid growth, consistent product quality, and industry-leading verification and compliance systems.</p><h2>Award Categories</h2><p>In addition to the main award, AL-WAHA also received recognition in:</p><ul><li>Best Product Design — NEX MAX</li><li>Innovation in Vaping Technology — Touch Control System</li></ul><blockquote>This award belongs to our entire team — from R&D to customer service — who work tirelessly to deliver the best vaping experience to our customers worldwide.</blockquote>" }
];

const DEFAULT_TIMELINE = [
  { year: "2019", title: "Foundation", desc: "AL-WAHA was founded in Shenzhen with a vision to revolutionize the vaping industry." },
  { year: "2020", title: "First Product Line", desc: "Launched our first disposable vape series, quickly gaining market recognition." },
  { year: "2021", title: "International Expansion", desc: "Expanded into 15+ countries across Europe, North America, and Asia." },
  { year: "2022", title: "Pod System Launch", desc: "Introduced the VISTA series, entering the refillable pod system market." },
  { year: "2023", title: "10M Units Sold", desc: "Reached the milestone of 10 million units sold globally." },
  { year: "2024", title: "R&D Center", desc: "Opened a state-of-the-art R&D center focused on next-gen vaping technology." },
  { year: "2025", title: "NEX Series", desc: "Launched the groundbreaking NEX touch-screen disposable series." },
  { year: "2026", title: "Global Leadership", desc: "Serving 30+ countries with 6M+ users and 50+ innovative products." }
];

// Make globally available
window.CMS = CMS;
window.SCHEMA = SCHEMA;
window.DEFAULT_PRODUCTS = DEFAULT_PRODUCTS;
window.DEFAULT_NEWS = DEFAULT_NEWS;
window.DEFAULT_TIMELINE = DEFAULT_TIMELINE;
