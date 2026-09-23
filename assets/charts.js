// Deskside — illustrative analysis charts. All data is synthetic.
(function () {
  var NS = "http://www.w3.org/2000/svg";
  var C = {
    ink: "#0f1720", ink2: "#33404d", muted: "#6b7682", grid: "#e6e2d8", surface: "#fbfaf7",
    s1: "#2a78d6", s2: "#eb6834", s3: "#1baf7a", other: "#c9ccd1", reported: "#5b636b",
    ramp: ["#86b6ef", "#5598e7", "#2a78d6", "#1c5cab", "#0d366b"]
  };

  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function text(parent, x, y, str, attrs) {
    var t = el("text", Object.assign({ x: x, y: y, fill: C.muted, "font-size": 11 }, attrs || {}), parent);
    t.textContent = str;
    return t;
  }
  function scale(d0, d1, r0, r1) {
    return function (v) { return r0 + ((v - d0) / (d1 - d0)) * (r1 - r0); };
  }
  function pathFrom(pts) {
    return pts.map(function (p, i) { return (i ? "L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1); }).join("");
  }

  // Shared tooltip per figure
  function tooltip(fig) {
    var tip = fig.querySelector(".viz-tip");
    if (!tip) { tip = document.createElement("div"); tip.className = "viz-tip"; tip.hidden = true; fig.querySelector(".viz-plot").appendChild(tip); }
    return {
      show: function (html, x, y, plotW) {
        tip.innerHTML = html; tip.hidden = false;
        var w = tip.offsetWidth;
        var left = x + 14 + w > plotW ? x - 14 - w : x + 14;
        tip.style.left = Math.max(4, left) + "px";
        tip.style.top = Math.max(4, y - 10) + "px";
      },
      hide: function () { tip.hidden = true; }
    };
  }
  function row(color, label, value, kind) {
    var sw = kind === "dash"
      ? '<span class="tt-sw tt-dash" style="border-color:' + color + '"></span>'
      : kind === "hollow"
      ? '<span class="tt-sw tt-hollow" style="border-color:' + color + '"></span>'
      : '<span class="tt-sw" style="background:' + color + '"></span>';
    return '<div class="tt-row">' + sw + '<span class="tt-l">' + label + '</span><span class="tt-v">' + value + "</span></div>";
  }

  function frame(fig, m) {
    var plot = fig.querySelector(".viz-plot");
    plot.querySelectorAll("svg").forEach(function (s) { s.remove(); });
    var W = plot.clientWidth, H = plot.clientHeight;
    var svg = el("svg", { width: W, height: H, viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": fig.getAttribute("data-label") || "" });
    plot.insertBefore(svg, plot.firstChild);
    return { svg: svg, W: W, H: H, x0: m.l, x1: W - m.r, y0: H - m.b, y1: m.t };
  }

  function yAxis(g, f, y, ticks, fmt) {
    ticks.forEach(function (v) {
      var yy = y(v);
      el("line", { x1: f.x0, x2: f.x1, y1: yy, y2: yy, stroke: C.grid, "stroke-width": 1 }, g);
      text(g, f.x0 - 8, yy + 4, fmt(v), { "text-anchor": "end" });
    });
  }

  /* ---------- 1. Cohort retention curves ---------- */
  var cohorts = ["Q1 '25", "Q2 '25", "Q3 '25", "Q4 '25", "Q1 '26"];
  var cohortData = cohorts.map(function (name, i) {
    var floor = 0.30 + i * 0.022, tau = 2.6 + i * 0.25, months = 15 - i * 3;
    var pts = [];
    for (var m = 0; m <= months; m++) {
      var r = floor + (1 - floor) * Math.exp(-m / tau);
      pts.push([m, Math.round(r * 1000) / 10]);
    }
    return { name: name, color: C.ramp[i], pts: pts };
  });

  function drawCohort(fig) {
    var small = fig.clientWidth < 520;
    var f = frame(fig, { l: 40, r: small ? 16 : 70, t: 14, b: 34 });
    var x = scale(0, 15, f.x0, f.x1), y = scale(0, 100, f.y0, f.y1);
    var g = el("g", {}, f.svg);
    yAxis(g, f, y, [0, 25, 50, 75, 100], function (v) { return v + "%"; });
    [0, 3, 6, 9, 12, 15].forEach(function (m) { text(g, x(m), f.y0 + 18, m, { "text-anchor": "middle" }); });
    text(g, (f.x0 + f.x1) / 2, f.H - 4, "Months since first purchase", { "text-anchor": "middle" });
    cohortData.forEach(function (c, i) {
      el("path", { d: pathFrom(c.pts.map(function (p) { return [x(p[0]), y(p[1])]; })), fill: "none", stroke: c.color, "stroke-width": i === 4 ? 2.5 : 2, "stroke-linejoin": "round", "stroke-linecap": "round" }, g);
      var last = c.pts[c.pts.length - 1];
      el("circle", { cx: x(last[0]), cy: y(last[1]), r: 4, fill: c.color, stroke: C.surface, "stroke-width": 2 }, g);
      if (!small && (i === 0 || i === 4)) text(g, x(last[0]) + 8, y(last[1]) + 4, c.name, { fill: C.ink2, "font-weight": 500 });
    });
    // crosshair
    var tt = tooltip(fig);
    var guide = el("line", { y1: f.y1, y2: f.y0, stroke: C.muted, "stroke-width": 1, opacity: 0 }, g);
    var hit = el("rect", { x: f.x0, y: f.y1, width: f.x1 - f.x0, height: f.y0 - f.y1, fill: "transparent" }, f.svg);
    function move(ev) {
      var r = f.svg.getBoundingClientRect();
      var px = (ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left;
      var m = Math.max(0, Math.min(15, Math.round((px - f.x0) / (f.x1 - f.x0) * 15)));
      guide.setAttribute("x1", x(m)); guide.setAttribute("x2", x(m)); guide.setAttribute("opacity", 0.5);
      var html = '<div class="tt-h">Month ' + m + "</div>";
      for (var i = cohortData.length - 1; i >= 0; i--) {
        var p = cohortData[i].pts[m];
        if (p) html += row(cohortData[i].color, cohortData[i].name + " cohort", p[1].toFixed(1) + "%");
      }
      tt.show(html, x(m), f.y1 + 10, f.W);
    }
    hit.addEventListener("pointermove", move);
    hit.addEventListener("pointerleave", function () { tt.hide(); guide.setAttribute("opacity", 0); });
  }

  /* ---------- 2. Market share after a new entrant ---------- */
  var months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D", "J", "F", "M", "A", "M", "J"];
  var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var LAUNCH = 6; // July, year 1
  var shareData = months.map(function (_, i) {
    var e = i < LAUNCH ? 0 : Math.round((11.5 * (1 - Math.exp(-(i - LAUNCH + 1) / 4.2))) * 10) / 10;
    var a = 52 - e * 0.35 + Math.sin(i * 0.9) * 0.4;
    var b = 36 - e * 0.55 + Math.cos(i * 0.7) * 0.4;
    var o = 100 - a - b - e;
    return { label: monthNames[i % 12] + " '" + (i < 12 ? "25" : "26"), a: +a.toFixed(1), b: +b.toFixed(1), e: e, o: +o.toFixed(1) };
  });
  var SHARE_KEYS = [
    { k: "a", name: "Incumbent A", color: C.s1 },
    { k: "b", name: "Incumbent B", color: C.s3 },
    { k: "e", name: "New entrant", color: C.s2 },
    { k: "o", name: "Other", color: C.other }
  ];

  function drawShare(fig) {
    var small = fig.clientWidth < 520;
    var f = frame(fig, { l: 40, r: small ? 12 : 92, t: 26, b: 34 });
    var n = shareData.length, band = (f.x1 - f.x0) / n, bw = Math.max(6, band - (small ? 3 : 6));
    var y = scale(0, 100, f.y0, f.y1);
    var g = el("g", {}, f.svg);
    yAxis(g, f, y, [0, 25, 50, 75, 100], function (v) { return v + "%"; });
    var tt = tooltip(fig);
    shareData.forEach(function (d, i) {
      var cx = f.x0 + band * i + (band - bw) / 2, acc = 0;
      SHARE_KEYS.forEach(function (s) {
        var v = d[s.k]; if (!v) return;
        var top = y(acc + v), bot = y(acc);
        el("rect", { x: cx, y: top + 1, width: bw, height: Math.max(0, bot - top - 2), fill: s.color, rx: 1.5 }, g);
        acc += v;
      });
      if (i % 3 === 0) text(g, cx + bw / 2, f.y0 + 18, d.label, { "text-anchor": "middle" });
      var hit = el("rect", { x: f.x0 + band * i, y: f.y1, width: band, height: f.y0 - f.y1, fill: "transparent" }, f.svg);
      hit.addEventListener("pointermove", function () {
        var html = '<div class="tt-h">' + d.label + "</div>";
        SHARE_KEYS.slice().reverse().forEach(function (s) { html += row(s.color, s.name, d[s.k].toFixed(1) + "%"); });
        tt.show(html, cx + bw / 2, f.y1 + 10, f.W);
      });
      hit.addEventListener("pointerleave", function () { tt.hide(); });
    });
    // launch annotation
    var lx = f.x0 + band * LAUNCH + band / 2;
    text(g, lx, f.y1 - 10, "▾ Entrant launches", { "text-anchor": "start", fill: C.ink2, "font-weight": 500, dx: -6 });
    // direct labels on the last column
    if (!small) {
      var last = shareData[n - 1], acc2 = 0, lx2 = f.x1 + 8;
      SHARE_KEYS.forEach(function (s) {
        var v = last[s.k], mid = y(acc2 + v / 2); acc2 += v;
        text(g, lx2, mid + 4, s.name.replace("Incumbent ", "Inc. ") + " " + Math.round(v) + "%", { fill: C.ink2 });
      });
    }
  }

  /* ---------- 3. Quarterly forecast ---------- */
  var quarters = ["Q1 '24", "Q2 '24", "Q3 '24", "Q4 '24", "Q1 '25", "Q2 '25", "Q3 '25", "Q4 '25", "Q1 '26", "Q2 '26", "Q3 '26"];
  var reported = [9.8, 10.4, 11.2, 10.1, 9.5, 8.9, 9.6, 10.8, 11.5, 12.1];
  var consensus = [9.1, 10.9, 10.3, 10.6, 9.9, 9.6, 9.0, 9.9, 10.9, 11.2, 11.4];
  var ours = [9.6, 10.6, 11.0, 10.4, 9.3, 9.1, 9.4, 10.5, 11.8, 11.9, 12.6];
  var methods = [{ name: "Run-rate (QTD)", v: 13.3 }, { name: "Cohort build", v: 12.6 }, { name: "Seasonal shape", v: 12.0 }];
  var guidance = [10.5, 11.9];

  function mae(a) { var s = 0; for (var i = 0; i < reported.length; i++) s += Math.abs(a[i] - reported[i]); return s / reported.length; }

  function drawForecast(fig) {
    var small = fig.clientWidth < 520;
    var f = frame(fig, { l: 40, r: small ? 28 : 118, t: 14, b: 34 });
    var n = quarters.length, x = scale(0, n - 1, f.x0 + 10, f.x1 - 10), y = scale(8, 14, f.y0, f.y1);
    var g = el("g", {}, f.svg);
    yAxis(g, f, y, [8, 10, 12, 14], function (v) { return v + "%"; });
    quarters.forEach(function (q, i) { if (i % 2 === 0 || i === n - 1) text(g, x(i), f.y0 + 18, q, { "text-anchor": "middle", fill: i === n - 1 ? C.ink2 : C.muted }); });
    // in-progress quarter band + guidance range
    var cur = n - 1, half = (x(1) - x(0)) / 2;
    el("rect", { x: x(cur) - half, y: f.y1, width: half * 2, height: f.y0 - f.y1, fill: "#efece4" }, g);
    el("rect", { x: x(cur) - 5, y: y(guidance[1]), width: 10, height: y(guidance[0]) - y(guidance[1]), fill: "#d8d3c7", rx: 2 }, g);
    // lines
    var rp = reported.map(function (v, i) { return [x(i), y(v)]; });
    el("path", { d: pathFrom(rp), fill: "none", stroke: C.reported, "stroke-width": 2, "stroke-linejoin": "round" }, g);
    el("path", { d: pathFrom(consensus.map(function (v, i) { return [x(i), y(v)]; })), fill: "none", stroke: C.s2, "stroke-width": 2, "stroke-dasharray": "5 4" }, g);
    el("path", { d: pathFrom(ours.map(function (v, i) { return [x(i), y(v)]; })), fill: "none", stroke: C.s1, "stroke-width": 2, "stroke-linejoin": "round" }, g);
    // method markers
    var mx = x(cur) + 14;
    methods.forEach(function (mm) {
      el("line", { x1: x(cur), x2: mx, y1: y(ours[cur]), y2: y(mm.v), stroke: C.grid, "stroke-width": 1 }, g);
      el("circle", { cx: mx, cy: y(mm.v), r: 4.5, fill: C.surface, stroke: C.ink2, "stroke-width": 1.5 }, g);
      if (!small) text(g, mx + 10, y(mm.v) + 4, mm.name, { fill: C.ink2 });
    });
    el("circle", { cx: x(cur), cy: y(consensus[cur]), r: 5, fill: C.s2, stroke: C.surface, "stroke-width": 2 }, g);
    el("circle", { cx: x(cur), cy: y(ours[cur]), r: 6, fill: C.s1, stroke: C.surface, "stroke-width": 2 }, g);
    if (!small) {
      text(g, mx + 10, y(consensus[cur]) + 4, "Consensus", { fill: C.ink2 });
      text(g, mx + 10, y(guidance[0]) + 4, "Guidance range", { fill: C.muted });
    }
    // tooltips per quarter
    var tt = tooltip(fig);
    quarters.forEach(function (q, i) {
      var hit = el("rect", { x: x(i) - half, y: f.y1, width: half * 2, height: f.y0 - f.y1, fill: "transparent" }, f.svg);
      hit.addEventListener("pointermove", function () {
        var html = '<div class="tt-h">' + q + (i === cur ? " · in progress" : "") + "</div>";
        if (i < reported.length) html += row(C.reported, "Reported", reported[i].toFixed(1) + "%");
        html += row(C.s1, i === cur ? "Blended estimate" : "Our estimate", ours[i].toFixed(1) + "%");
        html += row(C.s2, "Consensus", consensus[i].toFixed(1) + "%", "dash");
        if (i === cur) {
          methods.forEach(function (mm) { html += row(C.ink2, mm.name, mm.v.toFixed(1) + "%", "hollow"); });
          html += row("#d8d3c7", "Guidance", guidance[0] + "–" + guidance[1] + "%");
        }
        tt.show(html, x(i), f.y1 + 10, f.W);
      });
      hit.addEventListener("pointerleave", function () { tt.hide(); });
    });
  }

  function fillStats() {
    var o = document.querySelector("[data-stat='mae-ours']"), c = document.querySelector("[data-stat='mae-cons']");
    if (o) o.textContent = mae(ours).toFixed(1) + "pp";
    if (c) c.textContent = mae(consensus).toFixed(1) + "pp";
  }

  function table(fig, head, rows) {
    var box = fig.querySelector(".viz-table");
    if (!box || box.dataset.built) return;
    var h = "<table><thead><tr>" + head.map(function (c) { return '<th scope="col">' + c + "</th>"; }).join("") + "</tr></thead><tbody>";
    rows.forEach(function (r) { h += "<tr>" + r.map(function (c, i) { return i ? "<td>" + c + "</td>" : '<th scope="row">' + c + "</th>"; }).join("") + "</tr>"; });
    box.innerHTML = h + "</tbody></table>";
    box.dataset.built = "1";
  }
  function buildTables() {
    var f1 = document.querySelector("[data-chart='cohort']");
    if (f1) {
      var rows = [];
      for (var m = 0; m <= 15; m += 3) rows.push([m].concat(cohortData.map(function (c) { return c.pts[m] ? c.pts[m][1].toFixed(1) + "%" : "–"; })));
      table(f1, ["Month"].concat(cohorts), rows);
    }
    var f2 = document.querySelector("[data-chart='share']");
    if (f2) table(f2, ["Month"].concat(SHARE_KEYS.map(function (k) { return k.name; })), shareData.map(function (d) { return [d.label, d.a.toFixed(1) + "%", d.b.toFixed(1) + "%", d.e.toFixed(1) + "%", d.o.toFixed(1) + "%"]; }));
    var f3 = document.querySelector("[data-chart='forecast']");
    if (f3) table(f3, ["Quarter", "Reported", "Our estimate", "Consensus"], quarters.map(function (q, i) { return [q, i < reported.length ? reported[i].toFixed(1) + "%" : "in progress", ours[i].toFixed(1) + "%", consensus[i].toFixed(1) + "%"]; }));
  }

  var charts = { cohort: drawCohort, share: drawShare, forecast: drawForecast };
  function renderAll() {
    document.querySelectorAll("[data-chart]").forEach(function (fig) {
      var fn = charts[fig.getAttribute("data-chart")];
      if (fn) fn(fig);
    });
  }
  fillStats();
  buildTables();
  renderAll();
  var t;
  window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(renderAll, 120); });
})();
