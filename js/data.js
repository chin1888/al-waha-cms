/* ================================
   AL-WAHA - Data Helpers & Admin Data
   Content data now lives in content-store.js (CMS)
   ================================ */

// NOTE: All product/news/timeline data is managed by content-store.js (CMS).
// Use CMS.getAllProducts(), CMS.getAllNews(), CMS.getTimeline() to get live data.

// Admin Dashboard Data
const DASHBOARD_STATS = {
  totalSales: 1284560,
  totalOrders: 8642,
  totalUsers: 24580,
  totalProducts: 6,
  monthlyGrowth: 18.5,
  orderGrowth: 12.3,
  userGrowth: 24.7,
  productGrowth: 0
};

const SALES_DATA = [
  { month: "Jan", value: 820000 },
  { month: "Feb", value: 910000 },
  { month: "Mar", value: 780000 },
  { month: "Apr", value: 1050000 },
  { month: "May", value: 1120000 },
  { month: "Jun", value: 1284000 },
  { month: "Jul", value: 1284560 }
];

const ORDERS_DATA = [
  { id: "ORD-2026-001", customer: "James Wilson", product: "NEX MAX", quantity: 50, total: 2500, status: "completed", date: "2026-07-14" },
  { id: "ORD-2026-002", customer: "Mei Lin", product: "NEON PLUG", quantity: 100, total: 3800, status: "processing", date: "2026-07-14" },
  { id: "ORD-2026-003", customer: "Carlos Rivera", product: "SABER MAX", quantity: 30, total: 2100, status: "shipped", date: "2026-07-13" },
  { id: "ORD-2026-004", customer: "Sarah Chen", product: "STAR AIR", quantity: 80, total: 1600, status: "completed", date: "2026-07-13" },
  { id: "ORD-2026-005", customer: "Ahmed Hassan", product: "VISTA PRO", quantity: 20, total: 1800, status: "pending", date: "2026-07-12" },
  { id: "ORD-2026-006", customer: "Yuki Tanaka", product: "DEGREE LITE", quantity: 120, total: 2400, status: "completed", date: "2026-07-12" },
  { id: "ORD-2026-007", customer: "Emma Brown", product: "NEX MAX", quantity: 60, total: 3000, status: "processing", date: "2026-07-11" },
  { id: "ORD-2026-008", customer: "Liu Wei", product: "NEON PLUG", quantity: 90, total: 3420, status: "shipped", date: "2026-07-11" }
];

const USERS_DATA = [
  { id: 1, name: "James Wilson", email: "james.w@email.com", role: "Distributor", country: "USA", orders: 24, status: "active", joinDate: "2025-11-15" },
  { id: 2, name: "Mei Lin", email: "mei.lin@email.com", role: "Wholesaler", country: "China", orders: 56, status: "active", joinDate: "2025-09-20" },
  { id: 3, name: "Carlos Rivera", email: "carlos.r@email.com", role: "Distributor", country: "Spain", orders: 18, status: "active", joinDate: "2026-01-10" },
  { id: 4, name: "Sarah Chen", email: "sarah.c@email.com", role: "Retailer", country: "Singapore", orders: 31, status: "active", joinDate: "2025-12-05" },
  { id: 5, name: "Ahmed Hassan", email: "ahmed.h@email.com", role: "Wholesaler", country: "UAE", orders: 12, status: "inactive", joinDate: "2026-02-18" },
  { id: 6, name: "Yuki Tanaka", email: "yuki.t@email.com", role: "Distributor", country: "Japan", orders: 42, status: "active", joinDate: "2025-08-30" },
  { id: 7, name: "Emma Brown", email: "emma.b@email.com", role: "Retailer", country: "UK", orders: 8, status: "active", joinDate: "2026-03-22" },
  { id: 8, name: "Liu Wei", email: "liu.wei@email.com", role: "Wholesaler", country: "China", orders: 67, status: "active", joinDate: "2025-07-14" }
];

// Helper functions
function formatCurrency(num) {
  return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <div class="toast-icon">✓</div>
    <div class="toast-message">${message}</div>
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Scroll reveal
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  reveals.forEach(el => observer.observe(el));
}

// ═══════════════════════════════════════════
// Hero Carousel (async — fetches from API)
// ═══════════════════════════════════════════
async function initHeroCarousel() {
  const track = document.querySelector('.hero-carousel-track');
  const dots = document.querySelector('.hero-carousel-dots');
  if (!track) return;

  const slides = await CMS.getCarouselSlides();
  const speed = CMS.getCarouselSpeed();
  let current = 0;
  let timer = null;

  if (slides.length === 0) return;

  // Build slides
  track.innerHTML = slides.map((slide, i) => {
    return `<div class="hero-carousel-slide${i === 0 ? ' active' : ''}">` +
      (slide.link ? `<a href="${slide.link}" target="_blank" style="display:block;width:100%;height:100%;">` : '') +
      `<img src="${slide.image}" alt="${slide.title || ''}" loading="eager">` +
      (slide.title ? `<div class="hero-slide-title">${slide.title}</div>` : '') +
      (slide.link ? `</a>` : '') +
      `</div>`;
  }).join('');

  // Build dots
  if (dots) {
    dots.innerHTML = slides.map((_, i) => `<button class="hero-carousel-dot${i === 0 ? ' active' : ''}" data-index="${i}"></button>`).join('');
  }

  function goTo(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    current = index;

    track.querySelectorAll('.hero-carousel-slide').forEach((el, i) => {
      el.classList.toggle('active', i === current);
    });
    if (dots) {
      dots.querySelectorAll('.hero-carousel-dot').forEach((el, i) => {
        el.classList.toggle('active', i === current);
      });
    }
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAuto() { if (timer) clearInterval(timer); timer = setInterval(next, speed); }
  function stopAuto() { if (timer) clearInterval(timer); }

  // Event listeners
  const btnPrev = document.querySelector('.hero-carousel-btn.prev');
  const btnNext = document.querySelector('.hero-carousel-btn.next');
  if (btnPrev) { btnPrev.addEventListener('click', () => { prev(); startAuto(); }); }
  if (btnNext) { btnNext.addEventListener('click', () => { next(); startAuto(); }); }
  if (dots) {
    dots.addEventListener('click', (e) => {
      if (e.target.classList.contains('hero-carousel-dot')) {
        goTo(parseInt(e.target.dataset.index, 10));
        startAuto();
      }
    });
  }

  // Pause on hover
  const carousel = document.querySelector('.hero-carousel');
  if (carousel) {
    carousel.addEventListener('mouseenter', stopAuto);
    carousel.addEventListener('mouseleave', startAuto);
  }

  startAuto();
  window._heroCarousel = { goTo, next, prev, stopAuto, startAuto };
}

// ScrollReveal & Carousel init — runs after page loads
document.addEventListener('DOMContentLoaded', async () => {
  // CMS.init() is now called by each page individually
  initScrollReveal();
  await initHeroCarousel();
});
