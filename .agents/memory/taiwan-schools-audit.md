---
name: Taiwan schools list audits
description: How to authoritatively audit/extend shared/taiwan-schools.ts against MOE open data, plus naming/dedup quirks.
---

# Auditing shared/taiwan-schools.ts

Structure: 縣市 → 行政區 → string[] of short school names. Exports `TAIWAN_SCHOOLS`,
`TAIWAN_CITIES`, `getDistricts` (filters keys ending "2" and empty), `getSchools`.

## Authoritative source
MOE 教育部統計處「國民小學名錄」open data (data.gov.tw dataset **6087**).
Latest-year JSON: `https://stats.moe.gov.tw/files/school/<學年>/e1_new.json`
(e.g. 114 = 2025-26). Fields: 學校名稱, 公/私立, 縣市名稱 (`[31]臺北市`), 地址
(`[234]新北市永和區...`). ~2600 records. This list EXCLUDES 高中附設國小部
(e.g. 慈濟、光華) since they register under 高中 — verify those manually.

## Parsing quirks
- District from address: strip leading `[zip]`, remove county prefix, then match the
  district. **Do NOT** use `/^(.+?[區鄉鎮市])/` — it truncates place names containing
  鎮/市 (平鎮→"平", 前鎮, 左鎮, 新市). Match against the file's known district list
  (longest-first startsWith) instead.
- Normalize 臺→台 for comparison; file convention uses 台 in keys (only one 臺 outlier,
  "臺中國小"). File names have NO 私立/市立/縣立/國立 prefixes — strip them when adding.
- "○○國(中)小" → render as "○○國中小". 國中小 schools DO appear in the 國小名錄.

## Dedup normalizer ordering trap
When reducing a name to a comparable "core", strip experimental/combined suffixes
BEFORE plain 國小: alternation `國民中小學|國民小學|國中小|實驗小學|實驗國小|實小|小學|國小`.
Otherwise 國小 matches inside "和平實驗國小" first, giving wrong core and false-positive
"missing" vs existing "和平實小".

## Rename / cross-district duplicate traps (verify before adding)
MOE often lists a renamed campus the file still has under its old name → would create a
dup. Confirmed renames: 達觀國小→博屋瑪國小(台中和平), 德化國小→伊達邵國小(南投魚池),
北平國小→北平華德福實驗學校(新竹新埔), 土坂國小→土坂vusam實小(台東達仁). Also misplaced
privates: 中山小學 & 寶仁 listed in wrong districts. Abbreviation dups: file 國北教大實小
=MOE 台北教大實小, 市大附小=台北市立大學附小, 南大附小=台南大學附小. To dedup these,
check the MOE roster — if the old name is ABSENT it's a rename (skip the new one).
