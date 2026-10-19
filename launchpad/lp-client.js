/* Launchpad client: Google sign-in that keeps the access token, API calls, small helpers. */
(function () {
  'use strict';
  var CLIENT_ID = '771578038478-ijuecu880e8a7o76n9emga64ejo7uoep.apps.googleusercontent.com';
  var KEY = 'lp_token';
  var tokenClient = null;

  function store(get, val) {
    try {
      if (get) return JSON.parse(sessionStorage.getItem(KEY) || 'null');
      if (val === null) sessionStorage.removeItem(KEY); else sessionStorage.setItem(KEY, JSON.stringify(val));
    } catch (e) { /* storage can be blocked */ }
    return null;
  }

  var memoryToken = null;
  function currentToken() {
    var t = memoryToken || store(true);
    if (t && t.exp > Date.now() + 30000) return t.token;
    return null;
  }

  function loadGis() {
    return new Promise(function (resolve, reject) {
      if (window.google && google.accounts && google.accounts.oauth2) return resolve();
      var s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('Could not load Google sign-in.')); };
      document.head.appendChild(s);
    });
  }

  function signIn() {
    return loadGis().then(function () {
      return new Promise(function (resolve, reject) {
        tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: 'openid email profile',
          callback: function (resp) {
            if (!resp || resp.error || !resp.access_token) return reject(new Error('Sign-in was cancelled.'));
            var t = { token: resp.access_token, exp: Date.now() + (Number(resp.expires_in) || 3000) * 1000 };
            memoryToken = t;
            store(false, t);
            resolve(t.token);
          },
          error_callback: function () { reject(new Error('Sign-in was cancelled.')); }
        });
        tokenClient.requestAccessToken({ prompt: '' });
      });
    });
  }

  function signOut() { memoryToken = null; store(false, null); }

  function api(method, action, opts) {
    opts = opts || {};
    var qs = 'action=' + encodeURIComponent(action);
    Object.keys(opts.query || {}).forEach(function (k) { qs += '&' + encodeURIComponent(k) + '=' + encodeURIComponent(opts.query[k]); });
    var headers = { 'Content-Type': 'application/json' };
    if (opts.auth) {
      var t = currentToken();
      if (!t) return Promise.reject(Object.assign(new Error('Please sign in.'), { status: 401 }));
      headers.Authorization = 'Bearer ' + t;
    }
    return fetch('/api/lp?' + qs, {
      method: method,
      headers: headers,
      body: method === 'GET' ? undefined : JSON.stringify(opts.body || {})
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok) {
          if (res.status === 401) signOut();
          throw Object.assign(new Error(data.error || 'Something went wrong.'), { status: res.status, fields: data.fields || null });
        }
        return data;
      });
    });
  }

  // ---- helpers ----
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function prettyDate(iso) {
    if (!iso) return '';
    var d = new Date(iso + (iso.length === 10 ? 'T00:00:00Z' : ''));
    if (isNaN(d)) return iso;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  }
  function toast(msg) {
    var el = document.createElement('div');
    el.className = 'lp-toast';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 3500);
  }
  function fetchContent() {
    return fetch('/launchpad/content.json').then(function (r) { return r.json(); });
  }
  function safeUrl(u) { return /^https?:\/\//i.test(String(u || '')) ? String(u) : ''; }

  function signInView(root, why, onDone) {
    root.innerHTML = '<div class="lp-card" style="max-width:520px"><b>' + esc(why) + '</b><p class="lp-muted" style="margin:8px 0 14px">Sign in with the Google account you want to use for Launchpad. We only read your name and email.</p><button class="lp-btn2 solid" id="lp-signin">Sign in with Google</button><p class="err lp-muted" id="lp-signin-err" style="color:#9B2C20;margin:10px 0 0"></p></div>';
    root.querySelector('#lp-signin').addEventListener('click', function () {
      signIn().then(onDone).catch(function (e) { root.querySelector('#lp-signin-err').textContent = e.message; });
    });
  }

  window.LP = {
    api: api, signIn: signIn, signOut: signOut, hasToken: function () { return !!currentToken(); },
    esc: esc, prettyDate: prettyDate, toast: toast, fetchContent: fetchContent, safeUrl: safeUrl, signInView: signInView
  };
})();
