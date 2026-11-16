// Собирает shared/team-knowledge.mjs из docs/knowledge-base.md (docs/ не входит в сборку сервера).
// Запуск после любой правки базы знаний: npm run kb. Тест проверяет, что копия не устарела.
import { readFileSync, writeFileSync } from 'node:fs';
const md = readFileSync('docs/knowledge-base.md', 'utf8');
writeFileSync(
  'shared/team-knowledge.mjs',
  `// СГЕНЕРИРОВАНО из docs/knowledge-base.md командой npm run kb — не редактировать вручную.\nexport const TEAM_KNOWLEDGE = ${JSON.stringify(md)};\n`
);
console.log(`shared/team-knowledge.mjs обновлён (${md.length} символов)`);
