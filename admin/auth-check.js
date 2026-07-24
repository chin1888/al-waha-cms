/* ================================
   AL-WAHA CMS — Admin Auth Guard
   Include this script in every admin page.
   Redirects to login.html if no valid token.
   ================================ */
(function() {
  'use strict';

  var TOKEN_KEY = 'alwaha_token';
  var USER_KEY = 'alwaha_user';
  var LOGIN_URL = 'login.html';

  var token = localStorage.getItem(TOKEN_KEY);

  // Already on login page — skip check
  if (location.pathname.endsWith('/login.html') || location.pathname.endsWith('\\login.html')) {
    // If already logged in, redirect to index
    if (token) {
      var payload = parseJwt(token);
      if (payload && payload.exp * 1000 > Date.now()) {
        var redirect = new URLSearchParams(location.search).get('redirect') || 'index.html';
        location.href = redirect;
      }
    }
    return;
  }

  if (!token) {
    redirectToLogin();
    return;
  }

  // Verify token with server
  var API = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    ? 'http://localhost:3001/api'
    : '/api';

  fetch(API + '/auth/verify', {
    headers: { 'Authorization': 'Bearer ' + token }
  }).then(function(res) {
    if (!res.ok) { clearAndRedirect(); }
    // else: token valid, carry on
  }).catch(function() {
    // Server not reachable — allow offline use if token not expired
    var payload = parseJwt(token);
    if (!payload || payload.exp * 1000 < Date.now()) {
      clearAndRedirect();
    }
  });

  // Attach auth header to all CMS API calls
  (function patchFetch() {
    var originalFetch = window.fetch;
    window.fetch = function(url, options) {
      options = options || {};
      if (typeof url === 'string' && (url.indexOf('/api/') !== -1 || url.indexOf(API) === 0)) {
        if (!url.startsWith(API + '/auth/')) {
          var token = localStorage.getItem(TOKEN_KEY);
          if (token) {
            options.headers = options.headers || {};
            if (options.headers instanceof Headers) {
              if (!options.headers.has('Authorization')) options.headers.set('Authorization', 'Bearer ' + token);
            } else {
              if (!options.headers.Authorization) options.headers.Authorization = 'Bearer ' + token;
            }
          }
        }
      }
      return originalFetch.call(this, url, options);
    };
  })();

  // Also patch XMLHttpRequest
  (function patchXHR() {
    var OrigXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = function() {
      var xhr = new OrigXHR();
      var origOpen = xhr.open;
      xhr.open = function(method, url) {
        xhr._url = url;
        return origOpen.apply(xhr, arguments);
      };
      var origSend = xhr.send;
      xhr.send = function() {
        if (typeof xhr._url === 'string' && (xhr._url.indexOf('/api/') !== -1 || xhr._url.indexOf(API) === 0)) {
          if (!xhr._url.startsWith(API + '/auth/')) {
            var token = localStorage.getItem(TOKEN_KEY);
            if (token) xhr.setRequestHeader('Authorization', 'Bearer ' + token);
          }
        }
        return origSend.apply(xhr, arguments);
      };
      return xhr;
    };
  })();

  function redirectToLogin() {
    var currentPage = location.pathname.split('/').pop().split('\\').pop();
    location.href = LOGIN_URL + '?redirect=' + encodeURIComponent(currentPage);
  }

  function clearAndRedirect() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    redirectToLogin();
  }

  function parseJwt(token) {
    try {
      var base64 = token.split('.')[1];
      return JSON.parse(atob(base64));
    } catch (e) { return null; }
  }
})();
