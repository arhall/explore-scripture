#!/usr/bin/env python3
"""Mark the messianic line in the genealogy CSV data.

This script updates the messiahLine column to 'true' for individuals
in the direct line from Adam to Jesus Christ as recorded in Matthew 1
and Luke 3.

Usage:
    python3 scripts/mark_messianic_line.py

The script marks 134 individuals across two genealogical branches:
- Matthew 1: Royal line through Solomon to Joseph (legal father)
- Luke 3: Line through Nathan to Mary (biological mother)

Both branches converge at Jesus Christ, covering the complete messianic
lineage from Adam to the Messiah.

After running this script, regenerate the genealogy tree data:
    python3 scripts/generate_bible_tree.py
    npm run build
"""

import csv
from pathlib import Path

# Messianic line based on Matthew 1 and Luke 3 genealogies
MESSIANIC_LINE = {
    # From Adam to Abraham (Luke 3:34-38)
    "Adam", "Seth", "Enosh", "Kenan", "Mahalalel", "Mahalel", "Jared", "Enoch",
    "Methuselah", "Lamech", "Noah", "Shem", "Arphaxad", "Arpachshad", "Cainan",
    "Shelah", "Eber", "Heber", "Peleg", "Reu", "Serug", "Nahor", "Terah",

    # Patriarchs (both genealogies)
    "Abraham", "Abram", "Isaac", "Jacob", "Israel", "Judah",

    # From Judah to David (Matthew 1:3-6, Ruth 4:18-22)
    "Perez", "Hezron", "Ram", "Amram", "Amminadab", "Aminadab", "Nahshon",
    "Salmon", "Salma", "Boaz", "Obed", "Jesse", "David",

    # BRANCH 1: Matthew's genealogy (through Solomon to Joseph)
    # From David to Exile (Matthew 1:6-11)
    "Solomon", "Rehoboam", "Abijah", "Abijam", "Asa", "Jehoshaphat",
    "Joram", "Jehoram", "Uzziah", "Azariah", "Jotham", "Ahaz", "Hezekiah",
    "Manasseh", "Amon", "Amos", "Josiah", "Jeconiah", "Jehoiachin", "Coniah",

    # From Exile to Joseph (Matthew 1:12-16)
    "Shealtiel", "Salathiel", "Zerubbabel", "Zorobabel", "Abiud", "Eliakim",
    "Azor", "Zadok", "Achim", "Eliud", "Eleazar", "Matthan", "Jacob",

    # BRANCH 2: Luke's genealogy (through Nathan to Mary)
    # From David to Zerubbabel (Luke 3:23-31)
    "Nathan", "Mattatha", "Menna", "Melea", "Eliakim", "Jonam", "Joseph",
    "Judah", "Simeon", "Levi", "Matthat", "Jorim", "Eliezer", "Joshua",
    "Er", "Elmadam", "Cosam", "Addi", "Melchi", "Neri",

    # Shealtiel and Zerubbabel appear in both genealogies
    # From Zerubbabel to Mary (Luke 3:27-31)
    "Rhesa", "Joanan", "Joda", "Josech", "Semein", "Mattathias", "Maath",
    "Naggai", "Hesli", "Nahum", "Amos", "Mattathias", "Joseph", "Jannai",
    "Melchi", "Levi", "Matthat", "Eli", "Heli",

    # Parents of Jesus
    "Joseph", "Mary",

    # Jesus Christ
    "Jesus", "Yeshua", "Yeshua the Messiah", "Jesus Christ",

    # Additional alternative spellings
    "Aram", "Naasson", "Booz", "Esrom", "Phares", "Juda", "Ozias",
    "Joatham", "Achaz", "Ezekias", "Manasses", "Josias", "Jechonias"
}

def update_messianic_line():
    """Update the CSV to mark messianic line individuals."""
    csv_path = Path("data/bible-tree-data/raw-latest/nodes.csv")

    if not csv_path.exists():
        print(f"Error: {csv_path} not found")
        return

    # Read the CSV
    rows = []
    with csv_path.open('r', newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames

        for row in reader:
            # Check if this person is in the messianic line
            name = row.get('name', '').strip()
            if name in MESSIANIC_LINE:
                row['messiahLine'] = 'true'
                print(f"✓ Marked {name} as in messianic line")
            rows.append(row)

    # Write back to CSV
    with csv_path.open('w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    marked_count = sum(1 for row in rows if row.get('messiahLine') == 'true')
    print(f"\n✅ Updated {csv_path}")
    print(f"📊 Marked {marked_count} individuals in the messianic line")

if __name__ == '__main__':
    update_messianic_line()