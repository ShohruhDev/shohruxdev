# Видео для Reels

- `raw/` — исходники с телефона владельца (в git не попадают).
- `refs/` — референсы чужих роликов для стиля (в git не попадают).
- `out/` — готовые ролики после `npm run reels` (в git не попадают).
- `style.md` — брендбук монтажа.

Быстрый старт:

```bash
npm run reels -- content/video/raw/clip.mov --transcribe --title "Сколько стоит сайт"
```

Подробности — скилл `.claude/skills/reels-montage/SKILL.md`.
