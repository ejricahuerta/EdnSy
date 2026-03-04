#!/usr/bin/env python3
"""
Create a demo CRM CSV from SMBs Discovery export:
- Exclude rows with Status "no fit"
- Take top 10 rows per industry (Category; first term used for grouping)
- Replace all emails with test@ednsy.com
"""

import csv
from pathlib import Path
from collections import defaultdict

# Paths
SCRIPT_DIR = Path(__file__).resolve().parent
MARKETING_APP = SCRIPT_DIR.parent
SOURCE_CSV = Path(
    r"c:\Users\edmel\Documents\ExportBlock-cca935e7-4cdc-48f2-8491-e6bed44f7f95-Part-1"
    r"\SMBs Discovery 22894cc9908280b686cbcbc25dc874f2_all.csv"
)
OUTPUT_CSV = SCRIPT_DIR / "demo-crm.csv"
DEMO_EMAIL = "test@ednsy.com"
TOP_N_PER_INDUSTRY = 10


def normalize_industry(category: str) -> str:
    """Use first term of Category as industry (e.g. 'dentist, health, ...' -> 'dentist')."""
    if not category or not category.strip():
        return "(uncategorized)"
    first = category.split(",")[0].strip().lower()
    # Strip leading/trailing brackets/quotes from malformed CSV values
    for c in "[]'\"":
        first = first.strip(c)
    return first or "(uncategorized)"


def main() -> None:
    if not SOURCE_CSV.exists():
        raise FileNotFoundError(f"Source CSV not found: {SOURCE_CSV}")

    rows_by_industry: dict[str, list[dict[str, str]]] = defaultdict(list)

    with open(SOURCE_CSV, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        if not fieldnames:
            raise ValueError("CSV has no header row")

        for row in reader:
            status = (row.get("Status") or "").strip().lower()
            if status == "no fit":
                continue

            industry = normalize_industry(row.get("Category") or "")
            if len(rows_by_industry[industry]) < TOP_N_PER_INDUSTRY:
                row["Email"] = DEMO_EMAIL
                rows_by_industry[industry].append(row)

    # Flatten and write (order: by industry name for reproducibility)
    out_rows = []
    for industry in sorted(rows_by_industry.keys()):
        out_rows.extend(rows_by_industry[industry])

    with open(OUTPUT_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(out_rows)

    total = len(out_rows)
    industries = len(rows_by_industry)
    print(f"Wrote {OUTPUT_CSV}")
    print(f"Total rows: {total} (top {TOP_N_PER_INDUSTRY} per industry, {industries} industries)")
    for ind in sorted(rows_by_industry.keys()):
        print(f"  - {ind}: {len(rows_by_industry[ind])} rows")


if __name__ == "__main__":
    main()
