// Publications: per-paper citation labels + Year/Citation sorting.
// Works against al-folio bibliography DOM:
//   <h2 class="bibliography">YEAR</h2> followed by <ol class="bibliography"><li>...</li></ol>
(function () {
  "use strict";

  function getScholarId(li) {
    // The Google Scholar badge anchor URL ends with ...:<articleId>
    var a = li.querySelector('a[href*="citation_for_view"]');
    if (a) {
      var m = a.getAttribute("href").match(/citation_for_view=[^:]+:([^&]+)/);
      if (m) return m[1];
    }
    return null;
  }

  function citeCount(li) {
    var id = getScholarId(li);
    if (id && window.SCHOLAR_CITES && window.SCHOLAR_CITES[id] != null) {
      return window.SCHOLAR_CITES[id];
    }
    return null;
  }

  function collect() {
    // Build a flat list of {li, year, cites} preserving original order.
    var container = document.querySelector(".publications");
    if (!container) return [];
    var items = [];
    var headers = container.querySelectorAll("h2.bibliography");
    headers.forEach(function (h) {
      var year = parseInt(h.textContent.trim(), 10) || 0;
      var ol = h.nextElementSibling;
      while (ol && ol.tagName !== "OL") ol = ol.nextElementSibling;
      if (!ol) return;
      ol.querySelectorAll(":scope > li").forEach(function (li, i) {
        items.push({ li: li, year: year, order: items.length, cites: citeCount(li) });
      });
    });
    return items;
  }

  function annotate(items) {
    // Append a "★ N citations" label to the title of each paper that has a count.
    items.forEach(function (it) {
      if (it.cites == null) return;
      var title = it.li.querySelector(".title");
      if (title && !title.querySelector(".pub-cite")) {
        var span = document.createElement("span");
        span.className = "pub-cite";
        span.textContent = it.cites + (it.cites === 1 ? " citation" : " citations");
        title.appendChild(span);
      }
    });
    // Update total publication count stat.
    var pc = document.getElementById("pub-count");
    if (pc) pc.textContent = items.length;
  }

  var ITEMS = [];

  function ensureFlatContainer() {
    // Create a single <ol> we control for the "by citations" flat view.
    var container = document.querySelector(".publications");
    var flat = document.getElementById("pub-flat");
    if (!flat) {
      flat = document.createElement("ol");
      flat.id = "pub-flat";
      flat.className = "bibliography";
      flat.style.display = "none";
      container.appendChild(flat);
    }
    return flat;
  }

  window.sortPubs = function (mode) {
    var container = document.querySelector(".publications");
    if (!container) return;
    var byYear = container.querySelectorAll("h2.bibliography, ol.bibliography:not(#pub-flat)");
    var flat = ensureFlatContainer();
    var bY = document.getElementById("sort-year");
    var bC = document.getElementById("sort-cite");

    if (mode === "cite") {
      // hide year-grouped view, show flat sorted-by-citations list
      byYear.forEach(function (el) { el.style.display = "none"; });
      flat.innerHTML = "";
      ITEMS.slice().sort(function (a, b) {
        var ca = a.cites == null ? -1 : a.cites;
        var cb = b.cites == null ? -1 : b.cites;
        if (cb !== ca) return cb - ca;
        return a.year && b.year ? b.year - a.year : 0;
      }).forEach(function (it) {
        flat.appendChild(it.li.cloneNode(true));
      });
      flat.style.display = "";
      bC.classList.add("active");
      bY.classList.remove("active");
    } else {
      flat.style.display = "none";
      byYear.forEach(function (el) { el.style.display = ""; });
      bY.classList.add("active");
      bC.classList.remove("active");
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    ITEMS = collect();
    annotate(ITEMS);
  });
})();
