// Client-side table filtering for the index page. Vanilla, ~40 lines, no deps.
(function () {
  var search = document.getElementById("q");
  var cat = document.getElementById("cat");
  var only = document.getElementById("onlyblockers");
  var rows = Array.prototype.slice.call(document.querySelectorAll("tbody tr[data-domain]"));
  var count = document.getElementById("rowcount");
  if (!search) return;
  function apply() {
    var q = search.value.trim().toLowerCase();
    var c = cat.value;
    var b = only.checked;
    var shown = 0;
    rows.forEach(function (r) {
      var ok =
        (!q || r.getAttribute("data-domain").indexOf(q) !== -1) &&
        (!c || r.getAttribute("data-cat") === c) &&
        (!b || r.getAttribute("data-blocks") === "1");
      r.style.display = ok ? "" : "none";
      if (ok) shown++;
    });
    count.textContent = shown + " of " + rows.length + " sites";
  }
  search.addEventListener("input", apply);
  cat.addEventListener("change", apply);
  only.addEventListener("change", apply);
  apply();
})();
