# Missing Genealogies Overview

Snapshot of scriptural genealogies and family registers not yet modeled in `genealogies-complete.json`. Use this as the research backlog; update the status column as lines are captured, vetted, or intentionally deferred.

| Line / Focus | Primary References | Notes & Research Tasks |
| --- | --- | --- |
| Descendants of Ishmael | Genesis 25:12-18 | Twelve princes; intersects with Abrahamic covenant themes and Arabian tribes. Requires mapping alternate spellings (Nebaioth/Nebaoth). |
| Esau/Edomite chiefs | Genesis 36:1-43; 1 Chronicles 1:34-54 | Includes kings “before any king ruled over Israel” and clan chiefs. Needs handling for repeated names and territorial annotations. |
| Seir the Horite families | Genesis 36:20-30 | Non-Abrahamic line inhabiting Edom; useful for contextualizing Esau’s marriages and territory. |
| Nahor’s household (brother of Abraham) | Genesis 22:20-24; 24:15; 29:5 | Links to Rebekah, Laban, and Aramean relatives; fills gaps in patriarchal network. |
| Descendants of Lot (Moab/Ammon) | Genesis 19:30-38; Deuteronomy 2:9,19 | Short lineage but important for later covenant interactions; consider integration with entity system for nations. |
| Sons of Keturah (Abraham’s later marriage) | Genesis 25:1-6; 1 Chronicles 1:32-33 | Several Arabian tribes; highlight distribution eastward and possible overlap with Midianites. |
| Levitical genealogies (priests & musicians) | Exodus 6:14-27; Numbers 3; 1 Chronicles 6:1-81; Ezra 7:1-5 | Complex branching with duty assignments (priests, singers, gatekeepers). Will stress-test schema for role metadata. |
| Tribal registers from the wilderness censuses | Numbers 1; Numbers 26 | Contains clan breakdowns for each tribe; consider whether to represent as multiple sub-trees or aggregated tables. |
| Royal house of David beyond Solomon | 2 Samuel 5:13-16; 1 Chronicles 3:1-24 | Chronicles provides a post-exilic continuation (Shealtiel to Anani) missing from Matthew/Luke trees. |
| Saul’s Benjamite line | 1 Samuel 9:1-2; 1 Chronicles 8:29-40; 9:35-44 | Illuminates transition between Saul and Davidic monarchy; includes Jonathan’s descendants. |
| Tribal genealogies in Chronicles | 1 Chronicles 4–7 | Judah, Simeon, Reuben, Gad, Asher, Issachar, Naphtali, Manasseh, Ephraim, Benjamin. Large dataset; may need phased ingestion. |
| Post-exilic returnee lists | Ezra 2; Ezra 8; Nehemiah 7; Nehemiah 11 | Mix of priestly/family registrations; cross-field validation with temple service roles required. |
| Priests and Levites under Joiakim/Nehemiah | Nehemiah 12:1-26 | Timeline-sensitive; useful for tracking high priest succession into Second Temple period. |
| Genealogical attestations for Jesus’ relatives | Luke 1:5 (Zechariah), Luke 1:36 (Mary/Elizabeth kinship), Luke 3:23-38 (already modeled) | Investigate how extended family connections can be represented without duplicating full NT genealogies. |

## Tracking Guidance

- **Status tags:** add columns or badges (e.g., `queued`, `in-progress`, `needs-review`) as work advances.
- **Source notes:** record translation issues, textual variants (Septuagint vs. Masoretic), and secondary commentaries consulted.
- **Schema pressure points:** highlight cases that require partner/multiple marriages (e.g., Esau) or clan-level nodes (Numbers 26).
- **Dependency mapping:** cross-link to entity IDs once people groups or individuals are added/verified in `src/_data/entityIds.js`.
