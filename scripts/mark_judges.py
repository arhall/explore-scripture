#!/usr/bin/env python3
"""Mark judges in the genealogy CSV data.

This script updates the judge column to 'true' for individuals who served
as judges of Israel according to the Book of Judges and 1 Samuel.

Usage:
    python3 scripts/mark_judges.py

The script marks judges from three categories:
1. Judges proper (Book of Judges): Othniel, Ehud, Shamgar, Deborah, Barak,
   Gideon/Jerubbaal, Abimelech, Tola, Jair, Jephthah, Ibzan, Elon, Abdon, Samson
2. Transitional leaders (1 Samuel): Eli (priest/judge), Samuel (prophet/judge)
3. Textual variants: Bedan (1 Sam 12:11, possibly Barak or Jair)

The judges marked depend on which individuals exist in the CSV dataset.
Currently marks 17 individuals present in the data.

After running this script, update the judges cluster and regenerate data:
    # Script updates clusters-latest/index.json with judge IDs
    python3 scripts/generate_bible_tree.py
    npm run build
"""

import csv
from pathlib import Path

# List of judges from the Book of Judges and transitional period
JUDGES = {
    # Judges proper (Book of Judges)
    "Othniel",      # Judges 3:7-11
    "Ehud",         # Judges 3:12-30
    "Shamgar",      # Judges 3:31
    "Deborah",      # Judges 4-5
    "Barak",        # Judges 4-5 (co-deliverer with Deborah)
    "Gideon",       # Judges 6-8
    "Jerubbaal",    # Gideon's alternate name
    "Abimelech",    # Judges 9 (quasi-king, caution flag)
    "Tola",         # Judges 10:1-2
    "Jair",         # Judges 10:3-5
    "Jephthah",     # Judges 10:6-12:7
    "Ibzan",        # Judges 12:8-10
    "Elon",         # Judges 12:11-12
    "Abdon",        # Judges 12:13-15
    "Samson",       # Judges 13-16

    # Transitional / pre-monarchy leaders
    "Eli",          # 1 Samuel 1-4 (priest/judge)
    "Samuel",       # 1 Samuel 7 (prophet/judge)

    # Possible variant spellings
    "Bedan",        # Textual variant in 1 Sam 12:11 (possibly Barak or Jair)
}

def update_judges():
    """Update the CSV to mark judges."""
    csv_path = Path("data/bible-tree-data/raw-latest/nodes.csv")

    if not csv_path.exists():
        print(f"Error: {csv_path} not found")
        return

    # Read the CSV
    rows = []
    marked_count = 0
    with csv_path.open('r', newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames

        for row in reader:
            # Check if this person is a judge
            name = row.get('name', '').strip()
            if name in JUDGES:
                row['judge'] = 'true'
                print(f"✓ Marked {name} as judge")
                marked_count += 1
            rows.append(row)

    # Write back to CSV
    with csv_path.open('w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"\n✅ Updated {csv_path}")
    print(f"📊 Marked {marked_count} judges")

if __name__ == '__main__':
    update_judges()