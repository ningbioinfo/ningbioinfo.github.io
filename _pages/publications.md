---
layout: page
permalink: /publications/
title: publications
description: Peer-reviewed articles and preprints. <sup>&dagger;</sup> co-first author &middot; <sup>&Dagger;</sup> co-corresponding author. Citation data from Google Scholar.
nav: true
nav_order: 2
---

<!-- _pages/publications.md -->

{% assign cit = site.data.citations.metadata %}
<div class="pub-stats">
  <div class="stat">
    <span class="num" id="pub-count">—</span>
    <span class="lbl">Publications</span>
  </div>
  <a class="stat" href="https://scholar.google.com/citations?user={{ site.data.socials.scholar_userid }}&hl=en" style="text-decoration:none">
    <span class="num">{{ cit.total_citations | default: 460 }}</span>
    <span class="lbl">Citations</span>
  </a>
  <div class="stat">
    <span class="num">{{ cit.hindex | default: 10 }}</span>
    <span class="lbl">h-index</span>
  </div>
  <div class="stat">
    <span class="num">{{ cit.i10index | default: 11 }}</span>
    <span class="lbl">i10-index</span>
  </div>
</div>

<div class="pub-sort">
  <span class="lbl">// sort by</span>
  <button id="sort-year" class="active" onclick="sortPubs('year')">YEAR</button>
  <button id="sort-cite" onclick="sortPubs('cite')">CITATIONS</button>
</div>

<!-- Bibsearch Feature -->
{% include bib_search.liquid %}

<div class="publications">

{% bibliography %}

</div>

<!-- citation map: google_scholar_id -> count (from _data/citations.yml) -->
<script>
  window.SCHOLAR_CITES = {
  {%- for p in site.data.citations.papers -%}
    {%- assign parts = p[0] | split: ':' -%}
    "{{ parts[1] }}": {{ p[1].citations | default: 0 }}{%- unless forloop.last -%},{%- endunless -%}
  {%- endfor -%}
  };
</script>
<script src="{{ '/assets/js/pubsort.js' | relative_url }}"></script>
