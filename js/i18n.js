/* ================================
   AL-WAHA CMS — Internationalization (i18n)
   ================================ */

var I18N = (function() {
  var currentLang = 'zh';
  var translations = {};

  // ─── Translations ────────────────────

  translations.zh = {
    // Sidebar
    sidebar_overview: '概览',
    sidebar_dashboard: '仪表盘',
    sidebar_content_group: '内容管理',
    sidebar_page_content: '页面内容',
    sidebar_products: '产品管理',
    sidebar_news: '新闻管理',
    sidebar_videos: '视频管理',
    sidebar_media_group: '媒体',
    sidebar_media_library: '媒体库',
    sidebar_external: '外部',
    sidebar_view_website: '查看网站',
    sidebar_role: '内容管理员',

    // Dashboard
    dash_title: '仪表盘',
    dash_products: '产品',
    dash_news_articles: '新闻文章',
    dash_timeline: '大事记',
    dash_fields_edited: '已编辑字段',
    dash_quick_actions: '快捷操作',
    dash_edit_content: '编辑页面内容',
    dash_manage_products: '管理产品',
    dash_manage_news: '管理新闻',
    dash_media_library: '媒体库',
    dash_content_summary: '内容概览',
    dash_fields: '个字段',
    dash_reset_all: '重置所有内容',
    dash_home_page: '首页',
    dash_products_page: '产品页面',
    dash_about_page: '关于页面',
    dash_news_page: '新闻页面',
    dash_contact_page: '联系页面',
    dash_global_settings: '全局设置',
    dash_reset_confirm: '确定要重置所有内容为默认值吗？这将清除所有修改。',
    dash_reset_done: '所有内容已重置为默认值。请刷新页面。',

    // Content Editor
    content_title: '页面内容编辑器',
    content_preview: '预览网站',
    content_page_home: '首页',
    content_page_products: '产品页面',
    content_page_about: '关于我们',
    content_page_news: '新闻页面',
    content_page_contact: '联系我们',
    content_page_global: '全局设置',
    content_page_timeline: '大事记',
    content_no_fields: '该页面暂无可编辑字段。',
    content_saved: '已保存!',
    content_url_saved: 'URL已保存',
    content_image_uploaded: '图片已上传',
    content_upload_failed: '上传失败：存储空间不足，请压缩图片后重试',
    content_video_uploaded: '视频已上传到 ',
    content_media_removed: '已移除媒体文件 ',
    content_no_image: '暂无图片',
    content_no_video: '暂无视频',
    content_upload: '上传',
    content_remove: '移除',
    content_or_paste_url: '或粘贴URL...',
    content_timeline_events: '大事记',
    content_add_event: '+ 添加事件',
    content_timeline_updated: '大事记已更新',
    content_event_added: '事件已添加',
    content_event_removed: '事件已移除',
    content_save: '保存',

    // Products
    prod_title: '产品管理',
    prod_new: '+ 新建产品',
    prod_view_page: '查看产品页面',
    prod_count: '产品',
    prod_search: '搜索产品...',
    prod_table_product: '产品',
    prod_table_category: '分类',
    prod_table_badge: '标签',
    prod_table_puffs: '口数',
    prod_table_image: '图片',
    prod_table_video: '视频',
    prod_table_actions: '操作',
    prod_edit_title: '编辑产品',
    prod_new_title: '新建产品',
    prod_name: '产品名称',
    prod_name_required: '产品名称 *',
    prod_series: '系列',
    prod_category_required: '分类 *',
    prod_badge: '标签',
    prod_badge_none: '无',
    prod_desc: '描述',
    prod_detail_content: '产品详情内容',
    prod_puffs: '口数',
    prod_nicotine: '尼古丁',
    prod_battery: '电池',
    prod_capacity: '烟油容量',
    prod_resistance: '电阻',
    prod_perfume_capacity: '香水容量',
    prod_charging: '充电口',
    prod_gradient: '渐变色 CSS',
    prod_flavors: '口味（逗号分隔）',
    prod_features: '特性（逗号分隔）',
    prod_image: '产品图片',
    prod_detail_images: '详情图片',
    prod_add_image: '+ 添加图片',
    prod_video: '产品视频',
    prod_cancel: '取消',
    prod_save: '保存产品',
    prod_updated: '产品已更新!',
    prod_created: '产品已创建!',
    prod_deleted: '产品已删除',
    prod_delete_confirm: '确定要删除此产品吗？它将从前端页面中移除。',
    prod_has_image: '有图片',
    prod_has_video: '有视频',
    prod_no_image: '暂无图片',
    prod_save_failed: '保存失败，请检查输入并重试',

    // News
    news_title: '新闻管理',
    news_new: '+ 新建文章',
    news_view_page: '查看新闻页面',
    news_count: '文章',
    news_filter_all: '全部',
    news_filter_launch: '产品发布',
    news_filter_company: '公司新闻',
    news_filter_notice: '公告',
    news_filter_awards: '获奖',
    news_table_article: '文章',
    news_table_category: '分类',
    news_table_date: '日期',
    news_table_image: '图片',
    news_table_video: '视频',
    news_table_actions: '操作',
    news_edit_title: '编辑文章',
    news_new_title: '新建文章',
    news_title_label: '标题',
    news_title_required: '标题 *',
    news_category_required: '分类 *',
    news_date_label: '日期',
    news_icon: '图标 (emoji)',
    news_gradient: '渐变色 CSS',
    news_excerpt: '摘要',
    news_image: '图片',
    news_video: '视频',
    news_cancel: '取消',
    news_save: '保存文章',
    news_updated: '文章已更新!',
    news_created: '文章已创建!',
    news_deleted: '文章已删除',
    news_delete_confirm: '确定要删除此文章吗？',
    news_has_image: '有图片',
    news_has_video: '有视频',
    news_no_image: '暂无图片',

    // Media
    media_title: '媒体库',
    media_upload: '+ 上传媒体',
    media_filter_all: '全部',
    media_filter_images: '图片',
    media_filter_videos: '视频',
    media_stats_images: '图片',
    media_stats_videos: '视频',
    media_stats_total: '总文件数',
    media_empty_title: '暂无媒体文件',
    media_empty_desc: '上传图片和视频，即可在网站各处使用。',
    media_uploaded: '已上传!',
    media_deleted: '媒体已删除',
    media_delete_confirm: '确定要删除此媒体文件吗？',
    media_copy: '复制',
    media_copy_done: '已复制到剪贴板！粘贴到任意图片/视频字段即可。',
    media_copy_fallback: '复制此URL:',

    // Carousel
    carousel_title: '首页轮播图',
    carousel_desc: '上传图片以在首页 Hero 区域展示轮播图。支持自动切换、手动导航和跳转链接。',
    carousel_add: '添加轮播图片',
    carousel_speed: '切换速度 (毫秒)',
    carousel_speed_saved: '切换速度已保存',
    carousel_empty: '暂无轮播图片',
    carousel_empty_desc: '点击上方按钮上传图片，即可在首页展示轮播。',
    carousel_title_label: '标题（可选）',
    carousel_link_label: '链接（可选）',
    carousel_up: '上移',
    carousel_down: '下移',
    carousel_delete: '删除',
    carousel_image_uploaded: '图片已添加到轮播',
    carousel_removed: '图片已移除',
    carousel_updated: '轮播已更新',
    carousel_page: '轮播图',

    // Featured Videos
    fv_title: '视频管理',
    fv_new: '+ 新建视频',
    fv_view_page: '查看首页 ↗',
    fv_count: '视频',
    fv_table_name: '名称',
    fv_table_video: '视频',
    fv_table_actions: '操作',
    fv_edit_title: '编辑视频',
    fv_new_title: '新建视频',
    fv_name_label: '名称',
    fv_name_required: '名称 *',
    fv_video_label: '视频文件',
    fv_video_required: '视频文件 *',
    fv_upload: '上传',
    fv_upload_hint: '支持: MP4, WebM, MOV (最大50MB)',
    fv_uploaded: '✓ 已上传',
    fv_no_videos: '暂无视频，点击"+ 新建视频"添加。',
    fv_delete_confirm: '确定要删除该视频吗？',
    fv_delete_title: '确认删除',
    fv_saved: '视频已保存',
    fv_deleted: '视频已删除',

    // Common
    common_cms: 'AL-WAHA CMS',
    common_confirm: '确认',
    common_cancel: '取消',
    common_confirm_title: '确认操作',
    common_confirm_delete: '此操作不可撤销。',
    common_reset_confirm: '确定要重置所有内容为默认值吗？这将清除所有修改。',

    // Toast
    toast_saved: '已保存',
    toast_save_failed: '保存失败：存储空间不足，请压缩图片后重试',
    toast_image_uploaded: '图片已上传到 ',
    toast_video_uploaded: '视频已上传到 ',
    toast_video_too_large: '视频文件过大！建议不超过 5MB。',
    toast_media_removed: '媒体已从 ',
    toast_removed: ' 移除',
    toast_content_reset: '所有内容已重置为默认值。请刷新页面。',
    toast_image: '图片',
    toast_video: '视频',
  };

  translations.en = {
    sidebar_overview: 'Overview',
    sidebar_dashboard: 'Dashboard',
    sidebar_content_group: 'Content',
    sidebar_page_content: 'Page Content',
    sidebar_products: 'Products',
    sidebar_news: 'News',
    sidebar_videos: 'Videos',
    sidebar_media_group: 'Media',
    sidebar_media_library: 'Media Library',
    sidebar_external: 'External',
    sidebar_view_website: 'View Website',
    sidebar_role: 'Content Manager',

    dash_title: 'Dashboard',
    dash_products: 'Products',
    dash_news_articles: 'News Articles',
    dash_timeline: 'Timeline Events',
    dash_fields_edited: 'Fields Edited',
    dash_quick_actions: 'Quick Actions',
    dash_edit_content: 'Edit Page Content',
    dash_manage_products: 'Manage Products',
    dash_manage_news: 'Manage News',
    dash_media_library: 'Media Library',
    dash_content_summary: 'Content Summary',
    dash_fields: ' fields',
    dash_reset_all: 'Reset All Content',
    dash_home_page: 'Home',
    dash_products_page: 'Products Page',
    dash_about_page: 'About Page',
    dash_news_page: 'News Page',
    dash_contact_page: 'Contact Page',
    dash_global_settings: 'Global Settings',
    dash_reset_confirm: 'Reset ALL content to defaults? This will erase all your changes.',
    dash_reset_done: 'All content reset to defaults. Please reload pages.',

    content_title: 'Page Content Editor',
    content_preview: 'Preview Site',
    content_page_home: 'Home',
    content_page_products: 'Products Page',
    content_page_about: 'About',
    content_page_news: 'News Page',
    content_page_contact: 'Contact',
    content_page_global: 'Global',
    content_page_timeline: 'Timeline',
    content_no_fields: 'No editable content for this page.',
    content_saved: 'Saved!',
    content_url_saved: 'URL saved',
    content_image_uploaded: 'Image uploaded',
    content_upload_failed: 'Upload failed: storage full, please compress image',
    content_video_uploaded: 'Video uploaded to ',
    content_media_removed: 'Media removed from ',
    content_no_image: 'No image',
    content_no_video: 'No video',
    content_upload: 'Upload',
    content_remove: 'Remove',
    content_or_paste_url: 'Or paste URL...',
    content_timeline_events: 'Timeline Events',
    content_add_event: '+ Add Event',
    content_timeline_updated: 'Timeline updated',
    content_event_added: 'Event added',
    content_event_removed: 'Event removed',
    content_save: 'Save',

    prod_title: 'Product Management',
    prod_new: '+ New Product',
    prod_view_page: 'View Products Page',
    prod_count: 'Products',
    prod_search: 'Search products...',
    prod_table_product: 'Product',
    prod_table_category: 'Category',
    prod_table_badge: 'Badge',
    prod_table_puffs: 'Puffs',
    prod_table_image: 'Image',
    prod_table_video: 'Video',
    prod_table_actions: 'Actions',
    prod_edit_title: 'Edit Product',
    prod_new_title: 'New Product',
    prod_name: 'Product Name',
    prod_name_required: 'Product Name *',
    prod_series: 'Series',
    prod_category_required: 'Category *',
    prod_badge: 'Badge',
    prod_badge_none: 'None',
    prod_desc: 'Description',
    prod_detail_content: 'Product Detail Content',
    prod_puffs: 'Puffs',
    prod_nicotine: 'Nicotine',
    prod_battery: 'Battery',
    prod_capacity: 'E-Liquid Capacity',
    prod_resistance: 'Resistance',
    prod_perfume_capacity: 'Perfume Capacity',
    prod_charging: 'Charging',
    prod_gradient: 'Gradient CSS',
    prod_flavors: 'Flavors (comma separated)',
    prod_features: 'Features (comma separated)',
    prod_image: 'Product Image',
    prod_detail_images: 'Detail Images',
    prod_add_image: '+ Add Image',
    prod_video: 'Product Video',
    prod_cancel: 'Cancel',
    prod_save: 'Save Product',
    prod_updated: 'Product updated!',
    prod_created: 'Product created!',
    prod_deleted: 'Product deleted',
    prod_delete_confirm: 'Delete this product? It will be removed from the frontend.',
    prod_has_image: 'Has image',
    prod_has_video: 'Has video',
    prod_no_image: 'No image',
    prod_save_failed: 'Save failed, please check input and retry',

    news_title: 'News Management',
    news_new: '+ New Article',
    news_view_page: 'View News Page',
    news_count: 'Articles',
    news_filter_all: 'All',
    news_filter_launch: 'Product Launch',
    news_filter_company: 'Company News',
    news_filter_notice: 'Notice',
    news_filter_awards: 'Awards',
    news_table_article: 'Article',
    news_table_category: 'Category',
    news_table_date: 'Date',
    news_table_image: 'Image',
    news_table_video: 'Video',
    news_table_actions: 'Actions',
    news_edit_title: 'Edit Article',
    news_new_title: 'New Article',
    news_title_label: 'Title',
    news_title_required: 'Title *',
    news_category_required: 'Category *',
    news_date_label: 'Date',
    news_icon: 'Icon (emoji)',
    news_gradient: 'Gradient CSS',
    news_excerpt: 'Excerpt',
    news_image: 'Image',
    news_video: 'Video',
    news_cancel: 'Cancel',
    news_save: 'Save Article',
    news_updated: 'Article updated!',
    news_created: 'Article created!',
    news_deleted: 'Article deleted',
    news_delete_confirm: 'Delete this article?',
    news_has_image: 'Has image',
    news_has_video: 'Has video',
    news_no_image: 'No image',

    media_title: 'Media Library',
    media_upload: '+ Upload Media',
    media_filter_all: 'All',
    media_filter_images: 'Images',
    media_filter_videos: 'Videos',
    media_stats_images: 'Images',
    media_stats_videos: 'Videos',
    media_stats_total: 'Total Files',
    media_empty_title: 'No media uploaded yet',
    media_empty_desc: 'Upload images and videos to use across your website.',
    media_uploaded: 'uploaded!',
    media_deleted: 'Media deleted',
    media_delete_confirm: 'Delete this media file?',
    media_copy: 'Copy',
    media_copy_done: 'Copied! Paste into any image/video field.',
    media_copy_fallback: 'Copy this URL:',

    // Carousel
    carousel_title: 'Home Carousel',
    carousel_desc: 'Upload images to display in the homepage Hero area carousel. Supports auto-switch, manual navigation, and click links.',
    carousel_add: 'Add Carousel Image',
    carousel_speed: 'Switch Speed (ms)',
    carousel_speed_saved: 'Switch speed saved',
    carousel_empty: 'No carousel images yet',
    carousel_empty_desc: 'Upload images above to display them in the homepage carousel.',
    carousel_title_label: 'Title (optional)',
    carousel_link_label: 'Link (optional)',
    carousel_up: 'Move Up',
    carousel_down: 'Move Down',
    carousel_delete: 'Delete',
    carousel_image_uploaded: 'Image added to carousel',
    carousel_removed: 'Image removed',
    carousel_updated: 'Carousel updated',
    carousel_page: 'Carousel',

    // Featured Videos
    fv_title: 'Featured Videos',
    fv_new: '+ Add Video',
    fv_view_page: 'View Homepage ↗',
    fv_count: 'Videos',
    fv_table_name: 'Name',
    fv_table_video: 'Video',
    fv_table_actions: 'Actions',
    fv_edit_title: 'Edit Video',
    fv_new_title: 'Add Video',
    fv_name_label: 'Name',
    fv_name_required: 'Name *',
    fv_video_label: 'Video File',
    fv_video_required: 'Video File *',
    fv_upload: 'Upload',
    fv_upload_hint: 'Supported: MP4, WebM, MOV (max 50MB)',
    fv_uploaded: '✓ Uploaded',
    fv_no_videos: 'No videos yet. Click "+ Add Video" to create one.',
    fv_delete_confirm: 'Are you sure you want to delete this video?',
    fv_delete_title: 'Confirm Delete',
    fv_saved: 'Video saved',
    fv_deleted: 'Video deleted',

    common_cms: 'AL-WAHA CMS',
    common_confirm: 'Confirm',
    common_cancel: 'Cancel',
    common_confirm_title: 'Confirm',
    common_confirm_delete: 'This action cannot be undone.',
    common_reset_confirm: 'Reset ALL content to defaults? This will erase all your changes.',

    toast_saved: 'Saved',
    toast_save_failed: 'Save failed: storage full, please compress image',
    toast_image_uploaded: 'Image uploaded to ',
    toast_video_uploaded: 'Video uploaded to ',
    toast_video_too_large: 'Video too large! Max 5MB recommended.',
    toast_media_removed: 'Media removed from ',
    toast_removed: '',
    toast_content_reset: 'All content reset to defaults. Please reload pages.',
    toast_image: 'Image',
    toast_video: 'Video',
  };

  // ─── Public API ──────────────────────

  function init() {
    var saved = localStorage.getItem('vazo_admin_lang');
    if (saved && (saved === 'zh' || saved === 'en')) {
      currentLang = saved;
    }
    applyToDOM();
  }

  function t(key) {
    var dict = translations[currentLang];
    return dict[key] || translations.en[key] || key;
  }

  function getLang() {
    return currentLang;
  }

  function setLang(lang, noReload) {
    if (lang !== 'zh' && lang !== 'en') return;
    currentLang = lang;
    localStorage.setItem('vazo_admin_lang', lang);
    applyToDOM();
    if (!noReload && typeof window._onLangChange === 'function') {
      window._onLangChange(lang);
    }
  }

  function toggleLang() {
    setLang(currentLang === 'zh' ? 'en' : 'zh');
  }

  // Apply translations to all [data-i18n] elements
  function applyToDOM() {
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      var key = el.getAttribute('data-i18n');
      if (el.tagName === 'INPUT' && el.type === 'text') {
        el.setAttribute('placeholder', t(key));
      } else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        // skip value-based inputs
      } else {
        el.textContent = t(key);
      }
    });

    // Update [data-i18n-title]
    document.querySelectorAll('[data-i18n-title]').forEach(function(el) {
      el.setAttribute('title', t(el.getAttribute('data-i18n-title')));
    });

    // Update [data-i18n-placeholder]
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
    });

    // Update language switcher button
    updateLangSwitcher();
  }

  function updateLangSwitcher() {
    var btn = document.getElementById('langSwitch');
    if (btn) {
      btn.innerHTML = currentLang === 'zh' ? '🌐 EN' : '🌐 中文';
      btn.title = currentLang === 'zh' ? 'Switch to English' : '切换到中文';
    }
  }

  // Initialize on script load
  document.addEventListener('DOMContentLoaded', init);

  return {
    init: init,
    t: t,
    getLang: getLang,
    setLang: setLang,
    toggleLang: toggleLang,
    applyToDOM: applyToDOM,
  };
})();

// Make globally available
window._I18N = I18N;

// Helper: inject language switcher button into topbar
function injectLangSwitcher() {
  var topbarRight = document.querySelector('.topbar-right');
  if (!topbarRight) return;
  var btn = document.getElementById('langSwitch');
  if (btn) return; // already exists

  btn = document.createElement('button');
  btn.id = 'langSwitch';
  btn.className = 'lang-switch-btn';
  btn.title = I18N.getLang() === 'zh' ? 'Switch to English' : '切换到中文';
  btn.innerHTML = I18N.getLang() === 'zh' ? '🌐 EN' : '🌐 中文';
  btn.onclick = function() { I18N.toggleLang(); };

  // Insert before the first child
  if (topbarRight.firstChild) {
    topbarRight.insertBefore(btn, topbarRight.firstChild);
  } else {
    topbarRight.appendChild(btn);
  }
}
