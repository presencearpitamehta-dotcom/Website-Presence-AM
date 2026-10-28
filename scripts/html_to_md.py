#!/usr/bin/env python3
"""
Clean-Markdown extractor for arpitamehta.co, for AI/LLM readers.

Keeps: title as H1, every heading in document order, body paragraphs,
lists, tables, links.
Removes: nav, footer, cookie/consent text (none present on this site),
scripts/styles, buttons/CTAs, forms, ads (none present on this site),
decorative icons.
Does not rewrite or summarise any kept sentence — only structural HTML
(nav/footer/button/script wrappers) is removed before conversion.
"""
import os
import re
import sys
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from markdownify import MarkdownConverter

BASE = "https://arpitamehta.co/"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "llm-markdown")

PAGES = [
    ("index.html", BASE),
    ("about.html", BASE + "about.html"),
    ("services.html", BASE + "services.html"),
    ("assessment.html", BASE + "assessment.html"),
    ("faq.html", BASE + "faq.html"),
    ("resources.html", BASE + "resources.html"),
    ("blog/index.html", BASE + "blog/index.html"),
    ("blog/executive-presence-guide.html", BASE + "blog/executive-presence-guide.html"),
    ("blog/image-confidence-guide.html", BASE + "blog/image-confidence-guide.html"),
    ("blog/campus-to-corporate.html", BASE + "blog/campus-to-corporate.html"),
    ("blog/wine-etiquette-india.html", BASE + "blog/wine-etiquette-india.html"),
]

REMOVE_TAGS = ["script", "style", "noscript", "nav", "footer", "form", "button", "svg", "iframe", "template"]
REMOVE_IDS = ["pdfRoot"]  # offscreen PDF-generation template, not visible page content


def is_cta_or_button(tag):
    classes = " ".join(tag.get("class") or []).lower()
    return "cta" in classes or "btn" in classes


def resolve_urls(soup, page_url):
    for tag, attr in (("a", "href"), ("img", "src")):
        for el in soup.find_all(tag):
            val = el.get(attr)
            if val and not val.startswith(("http://", "https://", "mailto:", "data:")):
                el[attr] = urljoin(page_url, val)


def clean_and_convert(html_path, page_url):
    with open(html_path, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")

    # Animated stat counters render as "0" in raw HTML; resolve to the real
    # value the visitor actually sees (data-target), not the JS starting point.
    for tag in soup.find_all(class_="count"):
        target = tag.get("data-target")
        if target:
            tag.string = target

    # FAQ questions are <button class="faq-q"> (an accordion toggle), but the
    # text itself is the heading for each answer, not a CTA/nav control, so it
    # must survive the blanket button removal below. Swap it for a real
    # heading first, keeping only the question text (drop the icon span).
    for btn in soup.find_all("button", class_="faq-q"):
        icon = btn.find(class_="faq-icon")
        if icon:
            icon.extract()
        h = soup.new_tag("h3")
        h.string = btn.get_text(strip=True)
        btn.replace_with(h)

    for tag in soup(REMOVE_TAGS):
        tag.decompose()
    for tid in REMOVE_IDS:
        for tag in soup.find_all(id=tid):
            tag.decompose()
    for tag in soup.find_all(True):
        if tag.name and is_cta_or_button(tag):
            tag.decompose()
    for tag in soup.find_all(attrs={"aria-hidden": "true"}):
        tag.decompose()
    for c in soup.find_all(string=lambda s: s.__class__.__name__ == "Comment"):
        c.extract()

    resolve_urls(soup, page_url)

    body = soup.body or soup
    md = MarkdownConverter(heading_style="ATX", bullets="-").convert_soup(body)

    # collapse 3+ blank lines to 1, strip trailing whitespace per line
    md = re.sub(r"[ \t]+\n", "\n", md)
    md = re.sub(r"\n{3,}", "\n\n", md).strip() + "\n"
    return md


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    for rel_path, page_url in PAGES:
        src = os.path.join(ROOT, rel_path)
        if not os.path.exists(src):
            print("MISSING:", src)
            continue
        md = clean_and_convert(src, page_url)
        out_name = rel_path.replace("/", "_").replace(".html", ".md")
        out_path = os.path.join(OUT_DIR, out_name)
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(f"<!-- Source: {page_url} -->\n\n" + md)
        print("wrote", out_path, len(md), "chars")


if __name__ == "__main__":
    main()
