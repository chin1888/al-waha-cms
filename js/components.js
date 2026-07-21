/* ================================
   AL-WAHA - Shared Components Layer
   All frontend pages share these.
   ================================ */

(function() {
  'use strict';

  const page = document.body.dataset.page || 'home';

  // ===== AGE VERIFICATION MODAL =====
  function renderAgeModal() {
    const container = document.getElementById('age-modal-container');
    if (!container) return;
    container.innerHTML = `
      <div class="age-modal" id="ageModal">
        <div class="age-modal-content">
          <h2>Are you over 21?</h2>
          <p>This website contains products with nicotine. By entering, you confirm that you are of legal age in your jurisdiction.</p>
          <div class="age-modal-actions">
            <button class="btn btn-primary" id="ageConfirmBtn">I am 21 or older</button>
            <button class="btn btn-ghost" id="ageRejectBtn">Exit</button>
          </div>
        </div>
      </div>
    `;
  }

  // ===== NAVBAR =====
  function renderNavbar() {
    const container = document.getElementById('navbar-container');
    if (!container) return;

    const navLinks = [
      { href: 'index.html',   label: 'Home',     page: 'home' },
      { href: 'products.html', label: 'Products', page: 'products', mega: true },
      { href: 'about.html',   label: 'About',    page: 'about' },
      { href: 'news.html',    label: 'News',     page: 'news' },
      { href: 'contact.html', label: 'Contact',  page: 'contact' }
    ];

    const linksHTML = navLinks.map(link => {
      const isActive = (page === link.page) || (page === 'product-detail' && link.page === 'products');
      if (link.mega) {
        return `<div class="nav-item nav-mega">
          <a href="${link.href}"${isActive ? ' class="active"' : ''}>${link.label} <span class="nav-arrow">&#9662;</span></a>
          <div class="nav-mega-panel">
            <div class="nav-mega-inner">
              <div class="nav-mega-left">
                <h3 class="nav-mega-title">Product Categories</h3>
                <div class="nav-mega-grid" id="navMegaGrid"></div>
              </div>
              <div class="nav-mega-right">
                <div class="nav-mega-featured">
                  <div class="nav-mega-feat-img" id="navMegaFeatImg"></div>
                  <div class="nav-mega-feat-info">
                    <span class="nav-mega-feat-label">Featured</span>
                    <h4 id="navMegaFeatName"></h4>
                    <p id="navMegaFeatDesc"></p>
                    <a id="navMegaFeatLink" href="#" class="btn btn-sm btn-primary">Learn More</a>
                  </div>
                </div>
              </div>
            </div>
            <div class="nav-mega-footer">
              <a href="products.html" class="btn btn-primary btn-sm">View All Products &rarr;</a>
            </div>
          </div>
        </div>`;
      }
      return `<a href="${link.href}"${isActive ? ' class="active"' : ''}>${link.label}</a>`;
    }).join('');

    container.innerHTML = `
      <nav class="navbar">
        <div class="nav-content">
          <a href="index.html" class="nav-logo">
            <span data-cms="global.logoText">AL-WAHA</span>
          </a>
          <div class="nav-links">
            ${linksHTML}
          </div>
          <div class="nav-actions">
          </div>
          <div class="nav-toggle">
            <span></span><span></span><span></span>
          </div>
        </div>
      </nav>
    `;
  }

  // ===== FOOTER =====
  function renderFooter() {
    const container = document.getElementById('footer-container');
    if (!container) return;

    container.innerHTML = `
      <footer class="footer">
        <div class="container">
          <div class="footer-content">
            <div class="footer-brand">
            <a href="index.html" class="nav-logo" style="margin-bottom: 16px;">
              <span data-cms="global.logoText">AL-WAHA</span>
            </a>
              <p data-cms="global.footerDesc">AL-WAHA is an international vape brand devoted to accelerating the world's transition to a smoking-free place. Make Joy Happen.</p>
              <div class="footer-social">
                <a href="#" title="Instagram">📷</a>
                <a href="#" title="Twitter">🐦</a>
                <a href="#" title="Facebook">📘</a>
                <a href="#" title="YouTube">▶️</a>
              </div>
            </div>
            <div class="footer-col">
              <h4>Products</h4>
              <ul>
                <li><a href="products.html">All Products</a></li>
                <li><a href="products.html">Disposables</a></li>
                <li><a href="products.html">Pod Systems</a></li>
                <li><a href="products.html">Accessories</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4>Company</h4>
              <ul>
                <li><a href="about.html">About Us</a></li>
                <li><a href="news.html">News</a></li>
                <li><a href="contact.html">Contact</a></li>
                <li><a href="#">Careers</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4>Support</h4>
              <ul>
                <li><a href="#">Verification</a></li>
                <li><a href="#">Warranty</a></li>
                <li><a href="#">FAQ</a></li>
                <li><a href="#">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div class="footer-bottom">
            <p data-cms="global.footerCopy">&copy; 2026 AL-WAHA. All rights reserved.</p>
            <div class="legal-links">
              <a href="#">Terms of Service</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    `;
  }

  // ===== INITIALIZE ALL COMPONENTS =====
  renderAgeModal();
  renderNavbar();
  renderFooter();

  // ===== BINDING: run after DOM settled =====
  function bindEvents() {
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      window.addEventListener('scroll', function() {
        if (window.scrollY > 20) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      });
    }

    // Mobile nav toggle
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    if (toggle && links) {
      toggle.addEventListener('click', function() {
        links.classList.toggle('open');
      });
    }

    // Mega Menu: load products and populate dropdown
    async function initMegaMenu() {
      var megaItem = document.querySelector('.nav-mega');
      var panel = document.querySelector('.nav-mega-panel');
      var grid = document.getElementById('navMegaGrid');
      if (!megaItem || !panel || !grid) return;

      try {
        var res = await fetch('http://localhost:3001/api/products');
        if (!res.ok) return;
        var products = await res.json();

        // Group by category (100K, 200K, 250K…)
        var catMap = {};
        products.forEach(function(p) {
          var c = p.category || 'Other';
          if (!catMap[c]) catMap[c] = [];
          // Keep only first 4 per category
          if (catMap[c].length < 4) catMap[c].push(p);
        });

        var catNames = Object.keys(catMap).sort(function(a, b) {
          var na = parseInt(a), nb = parseInt(b);
          if (!isNaN(na) && !isNaN(nb)) return na - nb;
          return a.localeCompare(b);
        });

        // Fill featured area with first product
        if (products.length > 0) {
          var feat = products[0];
          var featImg = document.getElementById('navMegaFeatImg');
          var featName = document.getElementById('navMegaFeatName');
          var featDesc = document.getElementById('navMegaFeatDesc');
          var featLink = document.getElementById('navMegaFeatLink');
          if (featImg && feat.image) {
            featImg.innerHTML = '<img src="' + feat.image + '" alt="' + feat.name + '" loading="lazy">';
          }
          if (featName) featName.textContent = feat.name;
          if (featDesc && feat.category) featDesc.textContent = feat.category + ' Category';
          if (featLink) featLink.href = 'product-detail.html?id=' + feat.id;
        }

        // Build grid — one column per category
        var gridHTML = '';
        catNames.forEach(function(cat) {
          var items = catMap[cat];
          gridHTML += '<div class="nav-mega-col">';
          gridHTML += '<h4 class="nav-mega-col-title">' + cat + '</h4>';
          items.forEach(function(p) {
            gridHTML += '<a href="product-detail.html?id=' + p.id + '" class="nav-mega-card">';
            gridHTML += '<div class="nav-mega-card-img">';
            if (p.image && (p.image.match(/^https?:\/\//) || p.image.match(/^\/uploads\//))) {
              gridHTML += '<img src="' + p.image + '" alt="' + p.name + '" loading="lazy">';
            } else {
              gridHTML += '<div class="nav-mega-card-placeholder">' + (p.name ? p.name.charAt(0) : 'P') + '</div>';
            }
            gridHTML += '</div>';
            gridHTML += '<span class="nav-mega-card-name">' + p.name + '</span>';
            gridHTML += '</a>';
          });
          gridHTML += '<a href="products.html" class="nav-mega-col-all">View All &rarr;</a>';
          gridHTML += '</div>';
        });
        grid.innerHTML = gridHTML;
      } catch (err) {
        // silent fail — mega menu falls back gracefully
      }

      // Hover behavior for desktop
      var hideTimer = null;
      megaItem.addEventListener('mouseenter', function() {
        if (window.innerWidth < 1024) return;
        clearTimeout(hideTimer);
        panel.classList.add('open');
      });
      megaItem.addEventListener('mouseleave', function() {
        if (window.innerWidth < 1024) return;
        hideTimer = setTimeout(function() {
          panel.classList.remove('open');
        }, 200);
      });
      panel.addEventListener('mouseenter', function() {
        if (window.innerWidth < 1024) return;
        clearTimeout(hideTimer);
      });
      panel.addEventListener('mouseleave', function() {
        if (window.innerWidth < 1024) return;
        panel.classList.remove('open');
      });

      // Click toggle for mobile / touch
      var megaLink = megaItem.querySelector('a');
      if (megaLink && window.innerWidth < 1024) {
        megaLink.addEventListener('click', function(e) {
          e.preventDefault();
          panel.classList.toggle('open');
        });
      }
    }

    // Retry mega menu after CMS init completes
    // The DOMContentLoaded callback in each page will call this
    window._initMegaMenu = initMegaMenu;
    initMegaMenu();
    const modal = document.getElementById('ageModal');
    if (modal) {
      if (sessionStorage.getItem('ageVerified') === 'true') {
        modal.classList.add('hidden');
      }
      const confirmBtn = document.getElementById('ageConfirmBtn');
      const rejectBtn = document.getElementById('ageRejectBtn');
      if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
          sessionStorage.setItem('ageVerified', 'true');
          modal.classList.add('hidden');
        });
      }
      if (rejectBtn) {
        rejectBtn.addEventListener('click', function() {
          window.location.href = 'https://www.google.com';
        });
      }
    }
  }

  // Bind when DOM is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindEvents);
  } else {
    bindEvents();
  }

})();
