/* aiKisaan site behaviour: page routing, accessibility helpers and the
   Join / Contact / Complaint forms. Talks to the backend at /api, or at the
   server named in <meta name="aik-api"> when the pages are hosted elsewhere. */
(function () {
  'use strict';
  var ROUTES = window.SITE_ROUTES;
  var isHttp = location.protocol === 'http:' || location.protocol === 'https:';
  var siteConfig = null;
  var apiMeta = document.querySelector('meta[name="aik-api"]');
  var API_BASE = apiMeta ? apiMeta.getAttribute('content').replace(/\/+$/, '') : '';
  // Cross-site (GitHub Pages -> server): no cookies, the token goes in a header.
  var CREDENTIALS = API_BASE ? 'omit' : 'same-origin';

  // ---------- Routing ----------
  function show(path, hash) {
    var route = ROUTES[path] || ROUTES['/'];
    document.querySelectorAll('.page').forEach(function (p) { p.classList.toggle('active', p.id === route.id); });
    document.querySelectorAll('.nav-links a').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === path);
    });
    document.querySelectorAll('.nav-links').forEach(function (n) { n.classList.remove('open'); });
    document.querySelectorAll('.nav-toggle').forEach(function (t) { t.setAttribute('aria-expanded', 'false'); });
    document.title = route.title;
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', route.description);
    var target = hash && document.getElementById(hash);
    if (target && document.getElementById(route.id).contains(target)) {
      target.scrollIntoView();
    } else {
      window.scrollTo(0, 0);
    }
  }

  // Called by the inline onclick handlers on links: nav('/about', event)
  window.nav = function (path, e) {
    if (e && (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1)) return true; // open in new tab
    var parts = String(path).split('#');
    var p = parts[0] || '/';
    show(p, parts[1]);
    if (isHttp && location.pathname + location.hash !== path) history.pushState({ path: path }, '', path);
    return false;
  };
  window.addEventListener('popstate', function () { show(location.pathname, location.hash.slice(1)); });

  window.toggleNav = function () {
    var open = false;
    document.querySelectorAll('.nav-links').forEach(function (n) { open = n.classList.toggle('open'); });
    document.querySelectorAll('.nav-toggle').forEach(function (t) { t.setAttribute('aria-expanded', String(open)); });
  };
  window.toggleAcc = function (head) {
    var open = head.parentElement.classList.toggle('open');
    head.setAttribute('aria-expanded', String(open));
  };

  // Keyboard support for clickable non-button elements.
  function makeButton(el) {
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); }
    });
  }
  document.querySelectorAll('.nav-toggle').forEach(function (t) { makeButton(t); t.setAttribute('aria-expanded', 'false'); });
  document.querySelectorAll('.acc-head').forEach(function (h) { makeButton(h); h.setAttribute('aria-expanded', 'false'); });
  document.querySelectorAll('.nav-brand, .breadcrumb, .card[onclick]').forEach(makeButton);

  if (isHttp && ROUTES[location.pathname]) show(location.pathname, location.hash.slice(1));
  else show('/');

  // ---------- Config + demo marker ----------
  function loadConfig() {
    return fetch(API_BASE + '/api/config', { credentials: CREDENTIALS, cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('config ' + r.status); return r.json(); })
      .then(function (c) { siteConfig = c; return c; });
  }
  var configReady = isHttp
    ? loadConfig().then(function (c) { applyConfig(c); return c; }).catch(function () { return null; })
    : Promise.resolve(null);

  function applyConfig(c) {
    if (c.demo) {
      var b = document.createElement('div');
      b.className = 'demo-badge';
      b.setAttribute('role', 'note');
      b.innerHTML = 'Demo<span class="demo-badge-note">' + (c.emailsSent ? 'Test site' : 'Emails are not sent') + '</span>';
      document.body.appendChild(b);
    }
    if (Array.isArray(c.products) && c.products.length) {
      document.querySelectorAll('select[name="product"]').forEach(function (sel) {
        var want = sel.getAttribute('data-default');
        sel.innerHTML = '';
        var ph = document.createElement('option');
        ph.value = ''; ph.textContent = 'Select a product';
        sel.appendChild(ph);
        c.products.forEach(function (p) {
          var o = document.createElement('option');
          o.value = p; o.textContent = p;
          if (p === want) o.selected = true;
          sel.appendChild(o);
        });
      });
    }
  }

  // ---------- Forms ----------
  var EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/;
  var PHONE_RE = /^\+?\d{10,15}$/;
  var FALLBACK = 'We could not send your form right now. Please try again in a few minutes, or email us at info@aiKisaan.com.';

  function groupOf(field) { return field.closest('.form-group') || field.parentElement; }

  function setError(form, name, message) {
    var field = form.querySelector('[name="' + name + '"]');
    if (!field) return false;
    var group = groupOf(field);
    var err = group.querySelector('.field-error');
    if (!err) {
      err = document.createElement('small');
      err.className = 'field-error';
      err.id = (field.id || name) + '-error';
      group.appendChild(err);
    }
    err.textContent = message;
    group.classList.add('has-error');
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', err.id);
    return true;
  }

  function clearErrors(form) {
    form.querySelectorAll('.field-error').forEach(function (e) { e.remove(); });
    form.querySelectorAll('.has-error').forEach(function (g) { g.classList.remove('has-error'); });
    form.querySelectorAll('[aria-invalid]').forEach(function (f) { f.removeAttribute('aria-invalid'); f.removeAttribute('aria-describedby'); });
  }

  function status(form, kind, text) {
    var s = form.querySelector('.form-status');
    s.hidden = false;
    s.className = 'form-status ' + kind;
    s.textContent = text;
  }

  function collect(form) {
    var data = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name || el.disabled) return;
      if (el.type === 'checkbox') data[el.name] = el.checked;
      else data[el.name] = el.value.trim();
    });
    return data;
  }

  function validate(form, data) {
    var errors = {};
    form.querySelectorAll('[required]').forEach(function (el) {
      if (el.type === 'checkbox' ? !el.checked : !el.value.trim()) {
        errors[el.name] = el.getAttribute('data-required-msg') || 'This field is required.';
      }
    });
    if (data.email && !EMAIL_RE.test(data.email)) errors.email = 'Please enter a valid email address, for example name@example.com.';
    var phone = (data.phone || '').replace(/[\s\-().]/g, '');
    if (phone && !PHONE_RE.test(phone)) errors.phone = 'Please enter a valid mobile number (10 to 15 digits, optional + country code).';
    if (data.aadhaar && !/^\d{12}$/.test(data.aadhaar.replace(/\s/g, ''))) errors.aadhaar = 'Aadhaar number must be 12 digits.';
    var nameField = data.full_name !== undefined ? 'full_name' : 'name';
    if (data[nameField] && data[nameField].length < 2) errors[nameField] = 'Please enter your full name.';
    if (data.complaint_text !== undefined && data.complaint_text && data.complaint_text.length < 10) {
      errors.complaint_text = 'Please give a little more detail (at least 10 characters).';
    }
    return errors;
  }

  function showErrors(form, errors) {
    var first = null;
    Object.keys(errors).forEach(function (name) {
      if (setError(form, name, errors[name]) && !first) first = form.querySelector('[name="' + name + '"]');
    });
    if (first) first.focus();
  }

  document.querySelectorAll('form[data-endpoint]').forEach(function (form) {
    form.addEventListener('input', function (e) {
      var g = e.target.closest && e.target.closest('.has-error');
      if (g) { g.classList.remove('has-error'); var er = g.querySelector('.field-error'); if (er) er.remove(); e.target.removeAttribute('aria-invalid'); }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors(form);
      var data = collect(form);
      var errors = validate(form, data);
      if (Object.keys(errors).length) {
        status(form, 'err', 'Please correct the highlighted fields.');
        showErrors(form, errors);
        return;
      }
      var btn = form.querySelector('button[type="submit"]');
      var label = btn.textContent;
      btn.disabled = true; btn.textContent = 'Sending…';

      function send(token) {
        return fetch(API_BASE + form.getAttribute('data-endpoint'), {
          method: 'POST',
          credentials: CREDENTIALS,
          headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': token },
          body: JSON.stringify(data)
        }).then(function (r) {
          return r.json().catch(function () { return {}; }).then(function (body) { return { status: r.status, body: body }; });
        });
      }

      configReady.then(function (c) {
        if (!c || !c.csrfToken) throw new Error('no config');
        return send(siteConfig.csrfToken).then(function (res) {
          // Security token expired or replaced (e.g. very old tab): refresh it and retry once.
          if (res.status !== 403) return res;
          return loadConfig().then(function (fresh) { return send(fresh.csrfToken); });
        });
      }).then(function (res) {
        if (res.status === 201) {
          form.reset();
          form.querySelectorAll('select[name="product"]').forEach(function (s) {
            var want = s.getAttribute('data-default');
            if (want) s.value = want;
          });
          status(form, 'ok', res.body.message || 'Thank you. Your submission has been received.');
          form.querySelector('.form-status').scrollIntoView({ block: 'nearest' });
        } else if (res.status === 422 && res.body.errors) {
          status(form, 'err', res.body.error || 'Please correct the highlighted fields.');
          showErrors(form, res.body.errors);
        } else {
          status(form, 'err', res.body.error || FALLBACK);
        }
      }).catch(function () {
        status(form, 'err', FALLBACK);
      }).then(function () {
        btn.disabled = false; btn.textContent = label;
      });
    });
  });
})();
