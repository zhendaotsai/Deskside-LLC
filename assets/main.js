// Deskside — small progressive enhancements. Site works without JS.
(function () {
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  if (header) {
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Reveal-on-scroll
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -10% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  // Hero terminal: reveal lines one at a time
  var lines = document.querySelectorAll(".desk-body .line");
  if (lines.length) {
    if (reduced) {
      lines.forEach(function (l) { l.classList.add("show"); });
    } else {
      lines.forEach(function (l, i) {
        var delay = parseInt(l.getAttribute("data-delay") || "0", 10);
        setTimeout(function () { l.classList.add("show"); }, 300 + i * 380 + delay);
      });
    }
  }

  // Contact form: open the visitor's mail client with the message pre-filled.
  var form = document.querySelector("#contact-form");
  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var d = new FormData(form);
      var to = form.getAttribute("data-to");
      var subject = "Deskside inquiry — " + (d.get("firm") || d.get("name") || "");
      var body = [
        "Name: " + (d.get("name") || ""),
        "Firm: " + (d.get("firm") || ""),
        "Email: " + (d.get("email") || ""),
        "Strategy: " + (d.get("type") || ""),
        "",
        d.get("message") || ""
      ].join("\n");
      window.location.href = "mailto:" + to +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
    });
  }
})();

// Live call demo: play transcript lines and flags in sequence when scrolled into view.
(function () {
  var box = document.querySelector(".live-call");
  if (!box || !("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  box.classList.add("js-live");
  var steps = box.querySelectorAll(".lc-say, .lc-flag");
  var io = new IntersectionObserver(function (entries) {
    if (!entries[0].isIntersecting) return;
    io.disconnect();
    steps.forEach(function (s, i) {
      var delay = 400 + i * 900 + (s.classList.contains("lc-flag") ? 250 : 0);
      setTimeout(function () { s.classList.add("on"); }, delay);
    });
  }, { threshold: 0.35 });
  io.observe(box);
})();

// Hero brief: coverage bars (one per name) and a slow cycle through the flagged items.
// scene.js draws the same data in 3D when WebGL is available; this is the flat fallback.
(function () {
  var box = document.querySelector(".coverage");
  var items = document.querySelectorAll(".mail-items .mi");
  if (!box || !items.length) return;
  // Synthetic overnight change scores for 38 names; three are flagged in the brief.
  var scores = [], flagged = [6, 17, 29], seed = 7;
  for (var n = 0; n < 38; n++) { seed = (seed * 9301 + 49297) % 233280; scores.push(0.08 + (seed / 233280) * 0.22); }
  scores[6] = 0.95; scores[17] = 0.8; scores[29] = 0.7;
  window.desksideCoverage = { scores: scores, flagged: flagged, colors: ["#8a6a1f", "#1f6f5c", "#2a62a8"] };

  var flat = box.querySelector(".coverage-flat");
  scores.forEach(function (v, k) {
    var bar = document.createElement("i");
    bar.style.height = Math.round(v * 100) + "%";
    var f = flagged.indexOf(k);
    if (f >= 0) bar.style.background = window.desksideCoverage.colors[f];
    flat.appendChild(bar);
  });

  var active = 0, timer = 0, reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function focus(i) {
    active = i;
    items.forEach(function (li, k) { li.classList.toggle("is-active", k === i); });
    window.desksideCoverage.active = i;
    window.dispatchEvent(new CustomEvent("deskside:focus", { detail: i }));
  }
  items.forEach(function (li, k) {
    li.addEventListener("pointerenter", function () { clearInterval(timer); focus(k); });
  });
  focus(0);
  if (!reduced) timer = setInterval(function () { focus((active + 1) % items.length); }, 4000);
})();
