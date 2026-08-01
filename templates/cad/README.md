# CAD Reference Templates (Internal Only)

Professional **DWG** samples used as drawing pattern references for AI plan generation and CAD export styling.

## Policy

- **NOT sold** on the Store
- Used only for: layer naming, proportions, title blocks, symbols, sheet structure, discipline layout (A/S/SN/E)
- Store products remain **user+AI original designs**

## Source Collections

| Folder | Contents |
|--------|----------|
| `airport-asbuilt/` | Khon Kaen Airport As-Built — Architectural, Structural, Sanitary, Electrical |
| `residential-mirror/` | Complete residential set — Plan, Site, Elevation, Section, Details, Title block |
| `civil-samples/` | Houses, warehouses, guard house, pavilion, temple, MEP details |
| `symbols/` | Signboards, standard symbols library |

## Smart A Golden Standard

`smart-a-golden/` contains the **complete professional house plan set** (Smart A TYPE E Mirror) — the platform's primary completeness reference.

| Discipline | Sheets | Status |
|------------|--------|--------|
| A Architectural | Index, Site, Plan, Elevations, Sections, Details | ✓ Present |
| A Roof Plan | A3.00 | ⚡ Auto-generated |
| S Structural | Plan, Details, Footing/Column TYPE E | ✓ Present |
| S Roof Structure + Calc | S4, S5 | ⚡ Auto-generated |
| SN Sanitary | SN-01 through SN-09 | ✓ Present |
| E Electrical | E-01, E-02, E-03–06 SLD, E-07 | ✓ Present |
| ME Mechanical | ME-00, ME-01, ME-02 | ✓ Present |
| AC HVAC | AC-01, AC-02, AC-03 | ✓ Present |

Completeness spec: `golden-standard.json`  
Runtime audit: `src/lib/plans/golden-standard.ts`

## Sync from G: Drive

If DWG files are missing locally, run from project root:

```powershell
# Copy from your source drive (edit paths if needed)
$dest = "templates\cad"
$src1 = "G:\งานโยธาสนามบิน\งานโยธาอัษฎาวุธ สนามบิน\แบบอาคารแฟลส1-2"
$src2 = "G:\งานโยธาสนามบิน\งานโยธาอัษฎาวุธ สนามบิน\แบบงานโยธา ท่าอากาศยานขอนแก่น\รวมแบบ ที่โหลดมา"
$src3 = "G:\งานโยธาสนามบิน\งานโยธาอัษฎาวุธ สนามบิน\แบบบ้าน เลค\แบบบ้านทั่งหมด\Architect(Mirror)"

Copy-Item "$src1\AsBuilt*.dwg" "$dest\airport-asbuilt\" -Force
Copy-Item "$src2\*.dwg" "$dest\civil-samples\" -Force
Copy-Item "$src3\*.dwg" "$dest\residential-mirror\" -Force

# Smart A Golden Standard
$src4 = "G:\งานโยธาสนามบิน\งานโยธาอัษฎาวุธ สนามบิน\แบบบ้าน เลค\แบบบ้านทั่งหมด\Smart A_(Mirror)\Architecture (Mirror)"
Copy-Item "$src4\*.dwg" "$dest\smart-a-golden\" -Force

node scripts/sync-cad-templates.mjs
```

## Regenerate Catalog

```bash
node scripts/sync-cad-templates.mjs
```

Updates `index.json` from files on disk (~43 patterns).

## Git Note

`.dwg` files (~285 MB) are **gitignored**. Keep them on disk locally; commit only `index.json` and this README.
