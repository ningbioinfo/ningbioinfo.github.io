#!/usr/bin/env python3
"""
Update _data/citations.yml from Google Scholar — run LOCALLY.

Google Scholar blocks GitHub Actions' datacenter IPs, so the scheduled CI
scrape (update-citations.yml) times out and never updates the data. Running
this from your own machine (residential IP) works reliably.

Usage:
    python3 bin/update_citations_local.py
    git add _data/citations.yml && git commit -m "Update citations" && git push

Requires: pip install scholarly pyyaml
"""

import json
import sys
import datetime
import yaml

SCHOLAR_USER_ID = "EiG5GBEAAAAJ"
OUTPUT_FILE = "_data/citations.yml"


def main():
    try:
        from scholarly import scholarly
    except ImportError:
        sys.exit("Missing dependency. Run: pip install scholarly pyyaml")

    print(f"Fetching Google Scholar profile {SCHOLAR_USER_ID} ...")
    author = scholarly.search_author_id(SCHOLAR_USER_ID)
    author = scholarly.fill(author, sections=["basics", "indices", "publications"])

    papers = {}
    for pub in author.get("publications", []):
        author_pub_id = pub.get("author_pub_id", "")
        gsid = author_pub_id.split(":")[-1] if ":" in author_pub_id else ""
        if not gsid:
            continue
        bib = pub.get("bib", {})
        papers[f"{SCHOLAR_USER_ID}:{gsid}"] = {
            "citations": pub.get("num_citations", 0),
            "title": bib.get("title", ""),
            "year": str(bib.get("pub_year")) if bib.get("pub_year") else "Unknown",
        }

    data = {
        "metadata": {
            "last_updated": datetime.date.today().isoformat(),
            "total_citations": author.get("citedby", 0),
            "hindex": author.get("hindex", 0),
            "i10index": author.get("i10index", 0),
        },
        "papers": papers,
    }

    with open(OUTPUT_FILE, "w") as f:
        yaml.safe_dump(data, f, allow_unicode=True, sort_keys=False)

    print(
        f"Wrote {OUTPUT_FILE}: {data['metadata']['total_citations']} citations, "
        f"h-index {data['metadata']['hindex']}, {len(papers)} papers "
        f"(updated {data['metadata']['last_updated']})."
    )
    print("Next: git add _data/citations.yml && git commit -m 'Update citations' && git push")


if __name__ == "__main__":
    main()
