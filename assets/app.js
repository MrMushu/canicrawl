// Client-side behavior: watchlist stars (any page) + index table filtering.
// Vanilla JS, localStorage only — no accounts, no tracking.
(function () {
  var KEY = "canicrawl-watchlist";
  function load() {
    try { return new Set(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch (e) { return new Set(); }
  }
  function save(set) { localStorage.setItem(KEY, JSON.stringify(Array.from(set))); }
  var watched = load();
  function paint(btn) {
    var on = watched.has(btn.getAttribute("data-d"));
    btn.textContent = on ? "★" : "☆";
    btn.classList.toggle("on", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
  }
  var stars = Array.prototype.slice.call(document.querySelectorAll("button[data-d]"));
  stars.forEach(function (btn) {
    paint(btn);
    btn.addEventListener("click", function () {
      var d = btn.getAttribute("data-d");
      if (watched.has(d)) watched.delete(d); else watched.add(d);
      save(watched);
      stars.forEach(paint);
      apply();
    });
  });

  var search = document.getElementById("q");
  var cat = document.getElementById("cat");
  var only = document.getElementById("onlyblockers");
  var onlyw = document.getElementById("onlywatched");
  var onlyr = document.getElementById("onlyreadable");
  var rows = Array.prototype.slice.call(document.querySelectorAll("tbody tr[data-domain]"));
  var count = document.getElementById("rowcount");
  function apply() {
    if (!search) return;
    var q = search.value.trim().toLowerCase();
    var c = cat.value;
    var b = only.checked;
    var w = onlyw && onlyw.checked;
    var rd = onlyr && onlyr.checked;
    var shown = 0;
    rows.forEach(function (r) {
      var d = r.getAttribute("data-domain");
      var ok =
        (!q || d.indexOf(q) !== -1) &&
        (!c || r.getAttribute("data-cat") === c) &&
        (!b || r.getAttribute("data-blocks") === "1") &&
        (!w || watched.has(d)) &&
        (!rd || r.getAttribute("data-readable") === "1");
      r.style.display = ok ? "" : "none";
      if (ok) shown++;
    });
    count.textContent = shown + " of " + rows.length + " sites";
  }
  if (search) {
    search.addEventListener("input", apply);
    cat.addEventListener("change", apply);
    only.addEventListener("change", apply);
    if (onlyw) onlyw.addEventListener("change", apply);
    if (onlyr) onlyr.addEventListener("change", apply);
    apply();
  }
})();
