<script setup lang="ts">
// «Офис» — вся команда агентов на одном экране: кто чем занят, что ждёт решения владельца,
// личный чат с каждым специалистом и постановка задач. Доступ — та же сессия, что у редакции.
usePageSeo('Офис команды', 'Панель управления командой', true);

type Person = {
  id: string;
  persona: string;
  title: string;
  color: string;
  look: any;
  duties: string;
  inChat: boolean;
  hasBot: boolean;
  status: 'busy' | 'free';
  tasks: { number: number; title: string; url: string; createdAt: string }[];
  lastSaid: { text: string; at: string } | null;
};

const session = ref<any>(null),
  data = ref<any>(null),
  loading = ref(false),
  error = ref(''),
  toast = ref(''),
  updatedAt = ref('');
const openId = ref<string | null>(null),
  pane = ref<'chat' | 'tasks'>('chat'),
  dm = ref<{ at: string; author: string; text: string }[]>([]),
  question = ref(''),
  asking = ref(false),
  task = reactive({ title: '', details: '' }),
  busyAction = ref('');
const chatBox = ref<HTMLElement | null>(null);

const people = computed<Person[]>(() => data.value?.people || []);
const byId = computed(() => Object.fromEntries(people.value.map(p => [p.id, p])));
const ava = (id: string) => {
  const p = byId.value[id];
  return p ? { look: p.look, color: p.color } : null;
};
const open = computed(() => (openId.value ? byId.value[openId.value] : null));
const busyCount = computed(() => people.value.filter(p => p.status === 'busy').length);
const taskCount = computed(() => people.value.reduce((n, p) => n + p.tasks.length, 0));
const inbox = computed(() => (data.value?.prs || []).filter((p: any) => !p.draft));

const tz = 'Asia/Tashkent';
const fmt = (iso: string, o: Intl.DateTimeFormatOptions) =>
  iso ? new Intl.DateTimeFormat('ru-RU', { timeZone: tz, ...o }).format(new Date(iso)) : '';
function ago(iso: string) {
  const m = Math.round((Date.now() - Date.parse(iso)) / 60000);
  if (m < 1) return 'только что';
  if (m < 60) return `${m} мин назад`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} ч назад`;
  return fmt(iso, { day: 'numeric', month: 'short' });
}
const when = (iso: string) =>
  fmt(iso, { weekday: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
const decode = (s: string) =>
  s
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
const ciLabel: Record<string, string> = {
  success: 'CI зелёный',
  pending: 'CI идёт',
  failure: 'CI упал',
  unknown: 'CI неизвестен'
};
const plural = (n: number, one: string, few: string, many: string) => {
  const a = n % 10,
    b = n % 100;
  return a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 12 || b > 14) ? few : many;
};
const usd = (n: number) => '$' + (n < 10 ? n.toFixed(2) : Math.round(n));

async function post(body: Record<string, unknown>) {
  return await $fetch<any>('/api/admin/office', { method: 'POST', body });
}
async function load(fresh = false) {
  loading.value = true;
  try {
    data.value = await $fetch('/api/admin/office', { query: fresh ? { fresh: '1' } : {} });
    updatedAt.value = new Date().toISOString();
    error.value = '';
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Не удалось загрузить офис.';
  } finally {
    loading.value = false;
  }
}
function say(text: string) {
  toast.value = text;
  setTimeout(() => toast.value === text && (toast.value = ''), 5000);
}
const fail = (e: any) => say(e?.data?.statusMessage || 'Что-то пошло не так.');

async function openPerson(id: string, to: 'chat' | 'tasks' = 'chat') {
  openId.value = id;
  pane.value = to;
  dm.value = [];
  question.value = '';
  Object.assign(task, { title: '', details: '' });
  try {
    dm.value = (await post({ action: 'history', person: id })).messages;
  } catch (e) {
    fail(e);
  }
  scrollChat();
}
function scrollChat() {
  nextTick(() => chatBox.value?.scrollTo({ top: chatBox.value.scrollHeight }));
}
async function ask() {
  const text = question.value.trim();
  if (!text || !open.value || asking.value) return;
  const id = open.value.id;
  dm.value.push({ at: new Date().toISOString(), author: 'ceo', text });
  question.value = '';
  asking.value = true;
  scrollChat();
  try {
    const r = await post({ action: 'ask', person: id, text });
    if (openId.value === id)
      dm.value.push({ at: new Date().toISOString(), author: id, text: r.answer });
  } catch (e) {
    fail(e);
    question.value = text;
    dm.value.pop();
  } finally {
    asking.value = false;
    scrollChat();
  }
}
async function assign() {
  if (!open.value || task.title.trim().length < 3)
    return say('Напишите задачу хотя бы в несколько слов.');
  busyAction.value = 'assign';
  try {
    const r = await post({ action: 'assign', person: open.value.id, ...task });
    say(
      `Задача #${r.number} поставлена — ${open.value.persona} возьмёт её в ближайший рабочий цикл.`
    );
    Object.assign(task, { title: '', details: '' });
    await load(true);
  } catch (e) {
    fail(e);
  } finally {
    busyAction.value = '';
  }
}
async function closeTask(n: number) {
  busyAction.value = 'close-' + n;
  try {
    await post({ action: 'close-task', number: n });
    say(`Задача #${n} закрыта.`);
    await load(true);
  } catch (e) {
    fail(e);
  } finally {
    busyAction.value = '';
  }
}
async function merge(n: number) {
  busyAction.value = 'merge-' + n;
  try {
    say(decode((await post({ action: 'merge', number: n })).message));
    await load(true);
  } catch (e) {
    fail(e);
  } finally {
    busyAction.value = '';
  }
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') openId.value = null;
}

let timer: ReturnType<typeof setInterval> | undefined;
onMounted(async () => {
  session.value = await $fetch('/api/admin/session').catch(() => ({ authenticated: false }));
  if (!session.value.authenticated) return;
  await load();
  timer = setInterval(
    () => document.visibilityState === 'visible' && !openId.value && load(),
    60000
  );
  window.addEventListener('keydown', onKey);
});
onBeforeUnmount(() => {
  clearInterval(timer);
  window.removeEventListener('keydown', onKey);
});
</script>

<template>
  <div class="office">
    <header class="office-top">
      <div class="office-brand">
        <span class="office-logo" aria-hidden="true"><i /><i /><i /></span>
        <div>
          <h1>Офис</h1>
          <p v-if="data">
            {{ busyCount }} из {{ people.length }} в работе · обновлено {{ ago(updatedAt) }}
          </p>
        </div>
      </div>
      <nav class="office-nav">
        <button v-if="data" class="o-btn ghost" :disabled="loading" @click="load(true)">
          {{ loading ? 'Обновляю…' : 'Обновить' }}
        </button>
        <NuxtLink to="/admin" class="o-btn ghost">Редакция</NuxtLink>
      </nav>
    </header>

    <p v-if="toast" class="office-toast" role="status">{{ toast }}</p>
    <p v-if="error" class="office-error" role="alert">{{ error }}</p>

    <div v-if="!session" class="office-empty">Открываю офис…</div>
    <div v-else-if="!session.authenticated" class="office-empty">
      <h2>Вход только для владельца</h2>
      <p>Войдите в редакцию — эта же сессия откроет офис.</p>
      <NuxtLink to="/admin" class="o-btn">Войти</NuxtLink>
    </div>

    <template v-else-if="data">
      <section class="office-stats" aria-label="Главное">
        <div>
          <span>Заявки за 7 дней</span><strong>{{ data.leads.week }}</strong
          ><small>всего {{ data.leads.total }}</small>
        </div>
        <div>
          <span>Задачи в работе</span><strong>{{ taskCount }}</strong
          ><small
            >{{ busyCount }}
            {{ plural(busyCount, 'специалист', 'специалиста', 'специалистов') }} заняты</small
          >
        </div>
        <div>
          <span>Ждут решения</span><strong>{{ inbox.length }}</strong
          ><small>PR на проверку</small>
        </div>
        <div>
          <span>ИИ за месяц</span><strong>{{ usd(data.usage.month.cost) }}</strong
          ><small
            >сегодня {{ usd(data.usage.today.cost) }} · {{ data.usage.month.calls }} запросов</small
          >
        </div>
      </section>

      <div class="office-grid">
        <section class="office-team" aria-labelledby="team-h">
          <div class="o-head">
            <h2 id="team-h">Команда</h2>
            <span>нажмите на специалиста, чтобы поговорить или дать задачу</span>
          </div>
          <ul class="people">
            <li v-for="p in people" :key="p.id">
              <button
                class="person"
                :class="{ active: openId === p.id }"
                :style="{ '--c': p.color }"
                @click="openPerson(p.id)"
              >
                <span class="person-ava">
                  <TeamAvatar :look="p.look" :color="p.color" :size="64" />
                  <i
                    class="dot"
                    :class="p.status"
                    :title="p.status === 'busy' ? 'В работе' : 'Свободен'"
                  />
                </span>
                <span class="person-name">{{ p.persona }}</span>
                <span class="person-role">{{ p.title }}</span>
                <span class="person-state" :class="p.status">
                  {{
                    p.status === 'busy'
                      ? `${p.tasks.length} ${plural(p.tasks.length, 'задача', 'задачи', 'задач')}`
                      : 'Нет задач'
                  }}
                </span>
                <span v-if="p.lastSaid" class="person-said">«{{ p.lastSaid.text }}»</span>
              </button>
            </li>
          </ul>
        </section>

        <aside class="office-side">
          <section class="o-card" aria-labelledby="inbox-h">
            <div class="o-head"><h2 id="inbox-h">Ждёт вас</h2></div>
            <p v-if="data.githubError" class="o-muted">GitHub: {{ data.githubError }}</p>
            <p v-else-if="!inbox.length" class="o-muted">Всё разобрано. Новые PR появятся здесь.</p>
            <ul class="inbox">
              <li v-for="pr in inbox" :key="pr.number">
                <a :href="pr.url" target="_blank" rel="noopener" class="inbox-title"
                  >#{{ pr.number }} {{ pr.title }}</a
                >
                <div class="inbox-meta">
                  <span class="ci" :class="pr.ci">{{ ciLabel[pr.ci] }}</span>
                  <span v-if="pr.needsReview" class="tag">нужно ваше ревью</span>
                  <span>{{ ago(pr.createdAt) }}</span>
                </div>
                <button
                  class="o-btn small"
                  :disabled="pr.ci !== 'success' || busyAction === 'merge-' + pr.number"
                  :title="pr.ci !== 'success' ? 'Смёржить можно после зелёного CI' : ''"
                  @click="merge(pr.number)"
                >
                  {{ busyAction === 'merge-' + pr.number ? 'Мёржу…' : 'Смёржить' }}
                </button>
              </li>
            </ul>
            <div v-if="data.leads.latest.length" class="leads">
              <h3>Последние заявки</h3>
              <NuxtLink v-for="l in data.leads.latest" :key="l.id" to="/admin" class="lead">
                <strong>{{ l.name || 'Без имени' }}</strong>
                <span>{{ l.direction || 'направление не указано' }} · {{ ago(l.createdAt) }}</span>
              </NuxtLink>
            </div>
          </section>

          <section class="o-card" aria-labelledby="plan-h">
            <div class="o-head"><h2 id="plan-h">Расписание</h2></div>
            <ul class="routines">
              <li v-for="r in data.routines" :key="r.id">
                <TeamAvatar v-if="ava(r.who)" v-bind="ava(r.who)!" :size="36" />
                <div>
                  <strong>{{ r.title }}</strong>
                  <span>{{ r.what }}</span>
                  <small>следующий запуск: {{ when(r.next) }}</small>
                </div>
              </li>
            </ul>
          </section>

          <section class="o-card" aria-labelledby="feed-h">
            <div class="o-head"><h2 id="feed-h">Лента</h2></div>
            <p v-if="!data.feed.length" class="o-muted">Пока тихо.</p>
            <ul class="feed">
              <li v-for="(f, i) in data.feed" :key="i">
                <TeamAvatar v-if="ava(f.who)" v-bind="ava(f.who)!" :size="28" />
                <span v-else class="me">Вы</span>
                <div>
                  <b>{{ byId[f.who]?.persona || 'Вы' }}</b>
                  <a v-if="f.url" :href="f.url" target="_blank" rel="noopener">{{ f.text }}</a>
                  <span v-else>{{
                    f.text.length > 220 ? f.text.slice(0, 220) + '…' : f.text
                  }}</span>
                  <small>{{ ago(f.at) }}</small>
                </div>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </template>

    <div v-if="open" class="drawer-shade" @click.self="openId = null">
      <aside class="drawer" role="dialog" :aria-label="open.persona" :style="{ '--c': open.color }">
        <header class="drawer-head">
          <TeamAvatar :look="open.look" :color="open.color" :size="72" :label="open.persona" />
          <div>
            <h2>{{ open.persona }}</h2>
            <p>{{ open.title }} · {{ open.duties }}</p>
            <small>{{
              open.hasBot
                ? 'Есть свой бот в Telegram-чате'
                : open.inChat
                  ? 'В Telegram-чате пишет через бота руководителя'
                  : 'Работает в облачных циклах и здесь'
            }}</small>
          </div>
          <button class="o-close" aria-label="Закрыть" @click="openId = null">×</button>
        </header>
        <div class="seg" role="tablist">
          <button
            role="tab"
            :aria-selected="pane === 'chat'"
            :class="{ on: pane === 'chat' }"
            @click="pane = 'chat'"
          >
            Спросить
          </button>
          <button
            role="tab"
            :aria-selected="pane === 'tasks'"
            :class="{ on: pane === 'tasks' }"
            @click="pane = 'tasks'"
          >
            Задачи<span v-if="open.tasks.length" class="count">{{ open.tasks.length }}</span>
          </button>
        </div>

        <div v-if="pane === 'chat'" class="chat">
          <div ref="chatBox" class="chat-log">
            <p v-if="!dm.length" class="o-muted chat-hint">
              Задайте вопрос — {{ open.persona }} ответит по своей зоне ({{ open.duties }}) с учётом
              базы знаний команды.
            </p>
            <div
              v-for="(m, i) in dm"
              :key="i"
              class="msg"
              :class="m.author === 'ceo' ? 'me' : 'them'"
            >
              {{ m.text }}
            </div>
            <div v-if="asking" class="msg them typing" aria-live="polite">
              {{ open.persona }} печатает<span>.</span><span>.</span><span>.</span>
            </div>
          </div>
          <form class="chat-form" @submit.prevent="ask">
            <textarea
              v-model="question"
              rows="2"
              placeholder="Ваш вопрос"
              maxlength="4000"
              @keydown.enter.exact.prevent="ask"
            />
            <button class="o-btn" :disabled="asking || !question.trim()">Отправить</button>
          </form>
        </div>

        <div v-else class="tasks">
          <form class="task-form" @submit.prevent="assign">
            <label
              >Новая задача<input
                v-model="task.title"
                maxlength="200"
                placeholder="Например: подготовить 3 поста про Telegram-ботов"
            /></label>
            <label
              >Подробности<textarea
                v-model="task.details"
                rows="3"
                maxlength="3000"
                placeholder="Что важно, критерий готовности, срок"
              />
            </label>
            <button class="o-btn" :disabled="busyAction === 'assign'">
              {{ busyAction === 'assign' ? 'Ставлю…' : 'Поручить задачу' }}
            </button>
            <small class="o-muted"
              >Задача попадёт в GitHub Issues; ежедневный цикл (будни, 09:00) берёт такие задачи
              первыми.</small
            >
          </form>
          <ul class="task-list">
            <li v-for="t in open.tasks" :key="t.number">
              <a :href="t.url" target="_blank" rel="noopener">#{{ t.number }} {{ t.title }}</a>
              <small>{{ ago(t.createdAt) }}</small>
              <button
                class="o-btn small ghost"
                :disabled="busyAction === 'close-' + t.number"
                @click="closeTask(t.number)"
              >
                Готово
              </button>
            </li>
          </ul>
          <p v-if="!open.tasks.length" class="o-muted">Открытых задач нет.</p>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.office {
  --ink: #16181d;
  --soft: #6b7280;
  --line: #e7e5e1;
  --bg: #f6f5f2;
  --card: #fff;
  --accent: #2457f5;
  min-height: 100vh;
  background: var(--bg);
  color: var(--ink);
  font-family: 'Montserrat', sans-serif;
  padding: 16px clamp(16px, 3vw, 32px) 48px;
}
.office-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}
.office-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}
.office-logo {
  display: grid;
  grid-template-columns: repeat(3, 8px);
  gap: 3px;
}
.office-logo i {
  height: 22px;
  border-radius: 4px;
  background: var(--accent);
}
.office-logo i:nth-child(2) {
  opacity: 0.6;
  height: 16px;
  align-self: end;
}
.office-logo i:nth-child(3) {
  opacity: 0.3;
  height: 10px;
  align-self: end;
}
h1 {
  font-size: 22px;
  margin: 0;
  font-weight: 700;
}
.office-brand p {
  margin: 2px 0 0;
  color: var(--soft);
  font-size: 13px;
}
.office-nav {
  display: flex;
  gap: 8px;
}
.o-btn {
  border: 0;
  background: var(--accent);
  color: #fff;
  border-radius: 10px;
  padding: 10px 16px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.o-btn:disabled {
  opacity: 0.45;
  cursor: default;
}
.o-btn.ghost {
  background: var(--card);
  color: var(--ink);
  border: 1px solid var(--line);
}
.o-btn.small {
  padding: 6px 12px;
  font-size: 13px;
}
.office-toast,
.office-error {
  position: fixed;
  left: 50%;
  bottom: 20px;
  transform: translateX(-50%);
  width: max-content;
  max-width: calc(100% - 32px);
  z-index: 60;
  margin: 0;
  padding: 10px 14px;
  border-radius: 10px;
  background: #16181d;
  color: #fff;
  font-size: 14px;
}
.office-error {
  background: #b42318;
}
.office-empty h2 {
  font-size: 20px;
  margin: 0 0 6px;
}
.office-empty p {
  color: var(--soft);
  margin: 0 0 16px;
}
.office-empty {
  background: var(--card);
  border-radius: 16px;
  padding: 32px;
  text-align: center;
}
.office-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
.office-stats div {
  background: var(--card);
  border-radius: 16px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.office-stats span,
.office-stats small {
  color: var(--soft);
  font-size: 12px;
}
.office-stats strong {
  font-size: 26px;
  font-weight: 700;
}
.office-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 16px;
  align-items: start;
}
.o-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
}
.o-head h2 {
  font-size: 17px;
  margin: 0;
  font-weight: 700;
}
.o-head span,
.o-muted {
  color: var(--soft);
  font-size: 13px;
}
.office-team {
  background: var(--card);
  border-radius: 20px;
  padding: 18px;
}
.people {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
}
.person {
  width: 100%;
  height: 100%;
  border: 1px solid var(--line);
  background: var(--card);
  border-radius: 16px;
  padding: 14px 10px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 2px;
  cursor: pointer;
  font: inherit;
  color: inherit;
  transition:
    border-color 0.15s,
    transform 0.15s;
}
.person:hover,
.person.active {
  border-color: var(--c);
  transform: translateY(-2px);
}
.person-ava {
  position: relative;
  margin-bottom: 6px;
}
.dot {
  position: absolute;
  right: 2px;
  bottom: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 3px solid #fff;
  background: #c4c7cc;
}
.dot.busy {
  background: #12b76a;
  animation: pulse 2s infinite;
}
@keyframes pulse {
  50% {
    box-shadow: 0 0 0 4px rgba(18, 183, 106, 0.2);
  }
}
.person-name {
  font-weight: 700;
  font-size: 15px;
}
.person-role {
  font-size: 12px;
  color: var(--soft);
}
.person-state {
  margin-top: 6px;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 99px;
  background: #f1f2f4;
  color: var(--soft);
}
.person-state.busy {
  background: #e7f8ef;
  color: #067647;
}
.person-said {
  margin-top: 6px;
  font-size: 11.5px;
  color: var(--soft);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.office-side {
  display: grid;
  gap: 16px;
}
.o-card {
  background: var(--card);
  border-radius: 20px;
  padding: 18px;
}
.inbox,
.routines,
.feed,
.task-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.inbox li {
  padding: 10px 0;
  border-top: 1px solid var(--line);
  display: grid;
  gap: 6px;
}
.inbox li:first-child {
  border-top: 0;
}
.inbox-title {
  color: var(--ink);
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
}
.inbox-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 12px;
  color: var(--soft);
  align-items: center;
}
.inbox li .o-btn {
  justify-self: start;
}
.ci,
.tag {
  padding: 2px 8px;
  border-radius: 99px;
  font-weight: 600;
}
.ci.success {
  background: #e7f8ef;
  color: #067647;
}
.ci.pending,
.ci.unknown {
  background: #fff6e0;
  color: #93600b;
}
.ci.failure {
  background: #fdecea;
  color: #b42318;
}
.tag {
  background: #eaf0ff;
  color: var(--accent);
}
.leads h3 {
  font-size: 14px;
  margin: 14px 0 6px;
}
.lead {
  display: grid;
  padding: 8px 0;
  border-top: 1px solid var(--line);
  text-decoration: none;
  color: var(--ink);
  font-size: 13px;
}
.lead span {
  color: var(--soft);
  font-size: 12px;
}
.routines li {
  display: flex;
  gap: 10px;
  padding: 8px 0;
}
.routines div,
.feed div {
  display: grid;
  gap: 2px;
  font-size: 13px;
  min-width: 0;
}
.routines span,
.routines small,
.feed small {
  color: var(--soft);
  font-size: 12px;
}
.feed {
  max-height: 420px;
  overflow: auto;
}
.feed li {
  display: flex;
  gap: 10px;
  padding: 8px 0;
  border-top: 1px solid var(--line);
}
.feed li:first-child {
  border-top: 0;
}
.feed a {
  color: var(--accent);
}
.feed span {
  overflow-wrap: anywhere;
}
.me {
  flex: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--ink);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  display: grid;
  place-items: center;
}
.drawer-shade {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: rgba(22, 24, 29, 0.35);
  display: flex;
  justify-content: flex-end;
}
.drawer {
  width: min(480px, 100%);
  height: 100%;
  background: var(--card);
  display: flex;
  flex-direction: column;
  border-left: 4px solid var(--c);
  animation: slide 0.2s ease-out;
}
@keyframes slide {
  from {
    transform: translateX(30px);
    opacity: 0;
  }
}
.drawer-head {
  display: flex;
  gap: 14px;
  padding: 18px;
  align-items: center;
  position: relative;
}
.drawer-head h2 {
  margin: 0;
  font-size: 20px;
}
.drawer-head p {
  margin: 2px 0;
  font-size: 13px;
  color: var(--soft);
}
.drawer-head small {
  font-size: 12px;
  color: var(--c);
  font-weight: 600;
}
.o-close {
  position: absolute;
  top: 10px;
  right: 12px;
  border: 0;
  background: none;
  font-size: 28px;
  cursor: pointer;
  color: var(--soft);
}
.seg {
  display: flex;
  margin: 0 18px;
  background: #f1f2f4;
  border-radius: 10px;
  padding: 3px;
}
.seg button {
  flex: 1;
  border: 0;
  background: none;
  padding: 8px;
  border-radius: 8px;
  font: inherit;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  color: var(--soft);
}
.seg button.on {
  background: #fff;
  color: var(--ink);
}
.count {
  margin-left: 6px;
  background: var(--c);
  color: #fff;
  border-radius: 99px;
  padding: 0 7px;
  font-size: 12px;
}
.chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.chat-log {
  flex: 1;
  overflow: auto;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.msg {
  max-width: 85%;
  padding: 10px 13px;
  border-radius: 14px;
  font-size: 14px;
  line-height: 1.45;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.msg.me {
  align-self: flex-end;
  background: var(--accent);
  color: #fff;
  border-bottom-right-radius: 4px;
}
.msg.them {
  align-self: flex-start;
  background: #f1f2f4;
  border-bottom-left-radius: 4px;
}
.typing span {
  animation: blink 1.2s infinite;
}
.typing span:nth-child(2) {
  animation-delay: 0.2s;
}
.typing span:nth-child(3) {
  animation-delay: 0.4s;
}
@keyframes blink {
  50% {
    opacity: 0.2;
  }
}
.chat-form {
  display: flex;
  gap: 8px;
  padding: 12px 18px 18px;
  border-top: 1px solid var(--line);
  align-items: flex-end;
}
textarea,
input {
  font: inherit;
  font-size: 14px;
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 10px 12px;
  resize: vertical;
  background: #fff;
  color: var(--ink);
}
textarea:focus,
input:focus {
  outline: 2px solid var(--c, var(--accent));
  outline-offset: -1px;
}
.tasks {
  padding: 16px 18px;
  overflow: auto;
}
.task-form {
  display: grid;
  gap: 10px;
  margin-bottom: 16px;
}
.task-form label {
  display: grid;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
}
.task-form .o-btn {
  justify-self: start;
}
.task-list li {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2px 8px;
  padding: 10px 0;
  border-top: 1px solid var(--line);
  font-size: 14px;
}
.task-list a {
  color: var(--ink);
  font-weight: 600;
}
.task-list small {
  color: var(--soft);
  font-size: 12px;
}
.task-list button {
  grid-row: 1 / 3;
  grid-column: 2;
  align-self: center;
}
@media (max-width: 960px) {
  .office-grid {
    grid-template-columns: 1fr;
  }
  .office-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 520px) {
  .people {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }
  .person {
    padding: 10px 4px;
  }
  .person-ava :deep(svg) {
    width: 50px;
    height: 50px;
  }
  .person-name {
    font-size: 13px;
  }
  .person-role,
  .person-state {
    font-size: 10.5px;
  }
  .o-head span,
  .office-brand p {
    display: none;
  }
  .o-btn.ghost {
    padding: 8px 12px;
    font-size: 13px;
  }
  .office-stats strong {
    font-size: 22px;
  }
  .person-said {
    display: none;
  }
  .office-team,
  .o-card {
    padding: 14px;
  }
}
</style>
