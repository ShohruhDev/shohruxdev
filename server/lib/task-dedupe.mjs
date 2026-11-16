// Защита от дублей задач (GitHub Issues team-task). Чат и Офис перед созданием задачи
// ищут похожую открытую: если нашли — дописывают комментарий в неё, а не создают новую.

const STOP = new Set(
  'для что как это все всё или его она они нам вам наш ваш при над под без про через сделать сделайте задача задачи нужно надо давайте делаем ещё еще также'.split(
    ' '
  )
);

/** Основы слов заголовка: нижний регистр, без коротких и служебных слов, первые 4 буквы. */
export function titleStems(title = '') {
  return new Set(
    String(title)
      .toLowerCase()
      .replace(/ё/g, 'е')
      .split(/[^a-zа-я0-9]+/i)
      .filter(w => w.length >= 4 && !STOP.has(w))
      .map(w => w.slice(0, 4))
  );
}

export function similarity(a, b) {
  const x = titleStems(a),
    y = titleStems(b);
  if (!x.size || !y.size) return 0;
  let common = 0;
  for (const w of x) if (y.has(w)) common++;
  return common / Math.min(x.size, y.size);
}

/**
 * Похожая открытая задача: ссылка «#N» на открытую задачу в заголовке («дополнение к #49»),
 * либо заголовок той же роли с совпадением основ слов ≥ 50%.
 */
export function findDuplicate(open, { title, role }) {
  const refs = [...String(title).matchAll(/#(\d+)/g)].map(m => Number(m[1]));
  const byRef = open.find(i => refs.includes(i.number));
  if (byRef) return byRef;
  let best = null,
    score = 0;
  for (const i of open) {
    if (role && i.role && i.role !== role) continue;
    const s = similarity(title, i.title);
    if (s > score) [best, score] = [i, s];
  }
  return score >= 0.5 ? best : null;
}

const roleLabel = labels =>
  (labels || [])
    .map(l => (typeof l === 'string' ? l : l.name))
    .find(n => n?.startsWith('role:'))
    ?.slice(5);

/** Открытые team-task (без PR) в виде {number, title, url, role}. */
export async function openTasks(gh) {
  const r = await gh('/issues?labels=team-task&state=open&per_page=100');
  if (!r.ok) return [];
  return r.data
    .filter(i => !i.pull_request)
    .map(i => ({ number: i.number, title: i.title, url: i.html_url, role: roleLabel(i.labels) }));
}

/** Дописывает подробности в существующую задачу вместо создания дубля. */
export async function appendToTask(gh, task, text) {
  const r = await gh(`/issues/${task.number}/comments`, {
    method: 'POST',
    body: JSON.stringify({ body: `Дополнение (вместо новой задачи):\n\n${text}`.slice(0, 6000) })
  });
  return r.ok;
}
