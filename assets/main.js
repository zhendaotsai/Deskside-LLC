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
        "Firm type: " + (d.get("type") || ""),
        "",
        d.get("message") || ""
      ].join("\n");
      window.location.href = "mailto:" + to +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
    });
  }
})();
