/* ================================
   AL-WAHA CMS Admin — Shared Scripts (i18n ready)
   ================================ */

// Global lang change callback
window._onLangChange = function(lang) {
  renderSidebar(_currentSidebarPage);
};

var _currentSidebarPage = '';

// Sidebar navigation — regenerates on lang change
function getSidebarHTML() {
  var t = I18N.t;
  return [
    '<div class="sidebar-header">',
      '<span class="brand">AL-WAHA</span>',
      '<span class="admin-badge">CMS</span>',
    '</div>',
    '<nav class="sidebar-nav">',
      '<div class="nav-section">',
        '<div class="nav-section-title">' + t('sidebar_overview') + '</div>',
        '<a href="index.html" class="nav-item" data-page="dashboard">',
          '<span class="icon">📊</span> ' + t('sidebar_dashboard'),
        '</a>',
      '</div>',
      '<div class="nav-section">',
        '<div class="nav-section-title">' + t('sidebar_content_group') + '</div>',
        '<a href="content.html" class="nav-item" data-page="content">',
          '<span class="icon">📝</span> ' + t('sidebar_page_content'),
        '</a>',
        '<a href="products.html" class="nav-item" data-page="products">',
          '<span class="icon">🏷️</span> ' + t('sidebar_products'),
        '</a>',
        '<a href="news.html" class="nav-item" data-page="news">',
          '<span class="icon">📰</span> ' + t('sidebar_news'),
        '</a>',
        '<a href="contact.html" class="nav-item" data-page="contact-msgs">',
          '<span class="icon">💬</span> 用户留言',
        '</a>',
      '</div>',
      '<div class="nav-section">',
        '<div class="nav-section-title">' + t('sidebar_media_group') + '</div>',
        '<a href="media.html" class="nav-item" data-page="media">',
          '<span class="icon">🖼️</span> ' + t('sidebar_media_library'),
        '</a>',
        '<a href="featured-videos.html" class="nav-item" data-page="featured-videos">',
          '<span class="icon">🎬</span> ' + t('sidebar_videos'),
        '</a>',
      '</div>',
      '<div class="nav-section">',
        '<div class="nav-section-title">' + t('sidebar_external') + '</div>',
        '<a href="../index.html" class="nav-item">',
          '<span class="icon">🌐</span> ' + t('sidebar_view_website'),
        '</a>',
      '</div>',
    '</nav>',
    '<div class="sidebar-footer">',
      '<div class="user-card">',
        '<div class="avatar">AD</div>',
        '<div class="user-info">',
          '<div class="name">Admin User</div>',
          '<div class="role">' + t('sidebar_role') + '</div>',
        '</div>',
      '</div>',
    '</div>'
  ].join('');
}

function renderSidebar(activePage) {
  _currentSidebarPage = activePage;
  var sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.innerHTML = getSidebarHTML();
    var activeItem = sidebar.querySelector('[data-page="' + activePage + '"]');
    if (activeItem) activeItem.classList.add('active');
  }
  // Inject lang switcher into topbar
  setTimeout(injectLangSwitcher, 100);
}

// Toast notification
function showAdminToast(message, type) {
  type = type || 'success';
  var colors = { success: '#10b981', error: '#ef4444', warning: '#fbbf24', info: '#3b82f6' };
  var icons = { success: '✓', error: '✗', warning: '⚠', info: 'ℹ' };
  var toast = document.createElement('div');
  toast.style.cssText =
    'position:fixed;bottom:24px;right:24px;background:var(--admin-elevated);border:1px solid ' + colors[type] +
    ';border-radius:8px;padding:14px 20px;display:flex;align-items:center;gap:10px;z-index:10000;box-shadow:0 8px 30px rgba(0,0,0,0.5);animation:fadeInUp 0.3s ease;';
  toast.innerHTML = '<span style="color:' + colors[type] + ';font-size:1.1rem;">' + icons[type] + '</span><span style="font-size:0.85rem;">' + message + '</span>';
  document.body.appendChild(toast);
  setTimeout(function() {
    toast.style.opacity = '0';
    toast.style.transition = 'all 0.3s';
    setTimeout(function() { toast.remove(); }, 300);
  }, 3000);
}

// Confirm dialog
function confirmDialog(message, onConfirm) {
  var t = I18N.t;
  var modal = document.createElement('div');
  modal.className = 'admin-modal';
  modal.innerHTML =
    '<div class="admin-modal-content" style="max-width:420px;">' +
    '<div class="admin-modal-header"><h3>' + t('common_confirm_title') + '</h3></div>' +
    '<p style="color:var(--admin-text-secondary);margin-bottom:8px;">' + message + '</p>' +
    '<p style="color:var(--admin-danger);font-size:0.85rem;">' + t('common_confirm_delete') + '</p>' +
    '<div class="admin-modal-footer">' +
    '<button class="admin-btn" onclick="this.closest(\'.admin-modal\').remove()">' + t('common_cancel') + '</button>' +
    '<button class="admin-btn admin-btn-danger" id="_confirmBtn">' + t('common_confirm') + '</button>' +
    '</div></div>';
  document.body.appendChild(modal);
  modal.querySelector('#_confirmBtn').addEventListener('click', function() {
    onConfirm();
    modal.remove();
  });
}

// ─── Media Upload Helper (uploads to server, returns URL) ──
function uploadMedia(accept, callback) {
  var input = document.createElement('input');
  input.type = 'file';
  input.accept = accept || 'image/*';
  input.onchange = async function(e) {
    var file = e.target.files[0];
    if (!file) return;
    var url = await CMS.uploadFile(file);
    if (url) {
      callback(url, file.name, file.type);
    } else {
      showAdminToast(I18N.t('toast_save_failed') || 'Upload failed', 'error');
    }
  };
  input.click();
}

// Upload image and update CMS key (to server, returns URL)
function uploadToCms(key) {
  uploadMedia('image/*', async function(url, name) {
    var ok = await CMS.set(key, url);
    if (!ok) {
      showAdminToast(I18N.t('toast_save_failed') || 'Save failed', 'error');
      return;
    }
    var preview = document.querySelector('[data-preview="' + key + '"]');
    if (preview) preview.innerHTML = '<img src="' + url + '" style="max-width:200px;max-height:120px;border-radius:6px;">';
    var input = document.getElementById('fld_' + key);
    if (input) input.value = url;
    showAdminToast(I18N.t('content_image_uploaded'));
  });
}

// Upload video and update CMS key
function uploadVideoToCms(key) {
  uploadMedia('video/*', async function(url, name) {
    var ok = await CMS.set(key, url);
    if (!ok) {
      showAdminToast(I18N.t('toast_save_failed') || 'Save failed', 'error');
      return;
    }
    var preview = document.querySelector('[data-preview="' + key + '"]');
    if (preview) preview.innerHTML = '<video src="' + url + '" controls style="max-width:200px;max-height:120px;border-radius:6px;"></video>';
    var input = document.getElementById('fld_' + key);
    if (input) input.value = url;
    showAdminToast(I18N.t('content_video_uploaded'));
  });
}

// Remove media from CMS key
async function removeCmsMedia(key) {
  await CMS.set(key, '');
  showAdminToast(I18N.t('content_media_removed'));
  var preview = document.querySelector('[data-preview="' + key + '"]');
  if (preview) preview.innerHTML = '<span style="color:var(--admin-text-tertiary);font-size:0.8rem;">' + I18N.t('content_no_image') + '</span>';
  var input = document.getElementById('fld_' + key);
  if (input) input.value = '';
}

// ─── Save text field to CMS ──────────────
async function saveToCms(key, inputEl) {
  var val = inputEl.value;
  var ok = await CMS.set(key, val);
  if (ok) {
    showAdminToast(I18N.t('content_saved'));
  } else {
    showAdminToast(I18N.t('toast_save_failed'), 'error');
  }
}

// ─── Save preview & reset ────────────────
function resetAllCms() {
  confirmDialog(I18N.t('common_reset_confirm'), async function() {
    await CMS.resetAll();
    showAdminToast(I18N.t('toast_content_reset'), 'warning');
    setTimeout(function() { location.reload(); }, 1500);
  });
}

// ─── Mobile menu ─────────────────────────
document.addEventListener('DOMContentLoaded', async function() {
  // Initialize CMS (fetch from API)
  await CMS.init();

  var menuToggle = document.getElementById('menuToggle');
  if (menuToggle) {
    menuToggle.style.display = window.innerWidth <= 768 ? 'flex' : 'none';
    window.addEventListener('resize', function() {
      menuToggle.style.display = window.innerWidth <= 768 ? 'flex' : 'none';
    });
  }
});
