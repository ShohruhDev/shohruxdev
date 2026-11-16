<script setup lang="ts">
// Вкладка «Клиенты» в /office: найденные компании, черновики на одобрение, касания и итоги.
const props = defineProps<{ people: Record<string, any> }>();
const emit = defineEmits<{ toast: [text: string] }>();

const data = ref<any>(null),
  loading = ref(false),
  busy = ref(''),
  showAdd = ref(false);
const hunt = reactive({ segment: '', district: '' });
const add = reactive({ name: '', website: '', phone: '', segment: '' });
const drafts = reactive<Record<string, string>>({});

const by = (s: string[]) => (data.value?.prospects || []).filter((p: any) => s.includes(p.status));
const ready = computed(() => by(['ready']));
const waiting = computed(() =>
  by(['sent']).sort((a: any, b: any) => (a.nextTouchAt || '').localeCompare(b.nextTouchAt || ''))
);
const talking = computed(() => by(['replied', 'meeting']));
const queued = computed(() => by(['new']));
const done = computed(() => by(['won', 'lost', 'skipped']).slice(0, 30));
const c = (k: string) => data.value?.counts?.[k] || 0;
const segName = (id: string) => data.value?.segments.find((s: any) => s.id === id)?.query || '';
const fmt = (iso: string) =>
  iso
    ? new Intl.DateTimeFormat('ru-RU', {
        timeZone: 'Asia/Tashkent',
        day: 'numeric',
        month: 'short'
      }).format(new Date(iso))
    : '';
const statusLabel: Record<string, string> = {
  replied: 'Ответили',
  meeting: 'Созвон',
  won: 'Сделка',
  lost: 'Отказ',
  skipped: 'Пропущена'
};
const digits = (phone: string) => phone.replace(/\D/g, '');

async function load() {
  loading.value = true;
  try {
    data.value = await $fetch('/api/admin/prospects');
    for (const p of data.value.prospects)
      if (p.status === 'ready' && drafts[p.id] === undefined) drafts[p.id] = p.draft;
  } catch (e: any) {
    emit('toast', e?.data?.statusMessage || 'Не удалось загрузить клиентов.');
  } finally {
    loading.value = false;
  }
}
async function act(key: string, body: Record<string, unknown>, ok?: string) {
  busy.value = key;
  try {
    const r = await $fetch<any>('/api/admin/prospects', { method: 'POST', body });
    if (ok) emit('toast', ok);
    return r;
  } catch (e: any) {
    emit('toast', e?.data?.statusMessage || 'Что-то пошло не так.');
  } finally {
    busy.value = '';
  }
}
async function runHunt() {
  const r = await act('hunt', { action: 'hunt', ...hunt });
  if (r)
    emit(
      'toast',
      r.errors?.length
        ? `Готово с ошибками: ${r.errors[0]}`
        : `Найдено ${r.found}, проверено ${r.audited}, черновиков ${r.drafted + r.followups}.`
    );
  await load();
}
async function addCompany() {
  if (add.name.trim().length < 2) return emit('toast', 'Укажите название компании.');
  if (await act('add', { action: 'add', ...add }, 'Компания добавлена — запускаю проверку…')) {
    Object.assign(add, { name: '', website: '', phone: '', segment: '' });
    showAdd.value = false;
    await runHunt();
  }
}
async function copy(p: any) {
  try {
    await navigator.clipboard.writeText(drafts[p.id] || '');
    emit('toast', 'Текст скопирован.');
  } catch {
    emit('toast', 'Не удалось скопировать — выделите текст вручную.');
  }
}
async function saveDraft(p: any) {
  if (drafts[p.id] !== p.draft)
    await act('save-' + p.id, { action: 'save-draft', id: p.id, draft: drafts[p.id] });
}
async function redraft(p: any, lang: 'ru' | 'uz') {
  const r = await act('redraft-' + p.id, { action: 'redraft', id: p.id, lang });
  if (r?.draft) drafts[p.id] = r.draft;
}
async function sent(p: any) {
  if (
    await act(
      'sent-' + p.id,
      { action: 'sent', id: p.id, text: drafts[p.id] },
      `Касание ${p.touch} отмечено. Жасур напомнит о следующем.`
    )
  ) {
    delete drafts[p.id];
    await load();
  }
}
async function status(p: any, s: string) {
  if (
    await act(
      'status-' + p.id,
      { action: 'status', id: p.id, status: s },
      `${p.name}: ${statusLabel[s]}`
    )
  )
    await load();
}
const author = (p: any) => props.people[p.touch > 1 ? 'sales' : 'copywriter'];
onMounted(load);
defineExpose({ load });
</script>

<template>
  <div class="clients">
    <div v-if="!data" class="o-card o-muted">Загружаю клиентов…</div>
    <template v-else>
      <section class="o-card hunt-bar">
        <div class="hunt-who">
          <TeamAvatar
            v-if="people.sales"
            :look="people.sales.look"
            :color="people.sales.color"
            :size="44"
          />
          <div>
            <strong>Жасур ищет клиентов</strong>
            <span
              >{{
                data.config.places
                  ? 'Google Карты подключены'
                  : 'Google Карты не подключены — добавляйте компании вручную'
              }}
              ·
              {{ data.config.enabled ? `авто: ${data.config.daily} в день, 10:00` : 'авто выключен'
              }}{{
                data.config.lastQuery ? ` · последний поиск: ${data.config.lastQuery}` : ''
              }}</span
            >
          </div>
        </div>
        <form class="hunt-form" @submit.prevent="runHunt">
          <select v-model="hunt.segment" aria-label="Отрасль">
            <option value="">Следующая по плану</option>
            <option v-for="s in data.segments" :key="s.id" :value="s.id">{{ s.query }}</option>
          </select>
          <select v-model="hunt.district" :disabled="!hunt.segment" aria-label="Район">
            <option value="">Весь Ташкент</option>
            <option v-for="d in data.districts" :key="d" :value="d">{{ d }}</option>
          </select>
          <button class="o-btn" :disabled="busy === 'hunt'">
            {{ busy === 'hunt' ? 'Ищу и пишу…' : 'Найти сейчас' }}
          </button>
          <button type="button" class="o-btn ghost" @click="showAdd = !showAdd">+ Компания</button>
        </form>
        <form v-if="showAdd" class="add-form" @submit.prevent="addCompany">
          <input v-model="add.name" placeholder="Название" maxlength="200" required />
          <input v-model="add.website" placeholder="Сайт (если есть)" maxlength="300" />
          <input v-model="add.phone" placeholder="Телефон / WhatsApp" maxlength="40" />
          <select v-model="add.segment" aria-label="Отрасль">
            <option value="">Отрасль</option>
            <option v-for="s in data.segments" :key="s.id" :value="s.id">{{ s.query }}</option>
          </select>
          <button class="o-btn" :disabled="busy === 'add'">Добавить</button>
        </form>
        <div class="funnel">
          <span
            >Найдено <b>{{ c('new') }}</b></span
          ><span
            >На одобрение <b>{{ c('ready') }}</b></span
          ><span
            >Ждём ответа <b>{{ c('sent') }}</b></span
          ><span
            >Ответили <b>{{ c('replied') + c('meeting') }}</b></span
          ><span
            >Сделки <b>{{ c('won') }}</b></span
          ><span
            >Отказ / пропуск <b>{{ c('lost') + c('skipped') }}</b></span
          >
        </div>
      </section>

      <section class="o-card">
        <div class="o-head">
          <h2>На одобрение</h2>
          <span>проверьте текст, отправьте сами и нажмите «Отправил»</span>
        </div>
        <p v-if="!ready.length" class="o-muted">
          Новых сообщений нет.{{
            queued.length
              ? ` ${queued.length} компаний ждут проверки — нажмите «Найти сейчас».`
              : ''
          }}
        </p>
        <article v-for="p in ready" :key="p.id" class="lead-card">
          <header>
            <div>
              <h3>{{ p.name }}</h3>
              <p class="o-muted">
                {{ segName(p.segment) }}<template v-if="p.address"> · {{ p.address }}</template
                ><template v-if="p.rating"> · ★ {{ p.rating }} ({{ p.reviews || 0 }})</template>
              </p>
            </div>
            <span class="touch">касание {{ p.touch }} из 4</span>
          </header>
          <ul class="issues">
            <li v-for="i in p.audit?.issues || []" :key="i">{{ i }}</li>
          </ul>
          <div class="links">
            <a v-if="p.website" :href="p.website" target="_blank" rel="noopener">сайт ↗</a>
            <a v-if="p.mapsUrl" :href="p.mapsUrl" target="_blank" rel="noopener">на карте ↗</a>
            <span v-if="p.phone">{{ p.phone }}</span>
          </div>
          <div class="draft">
            <TeamAvatar
              v-if="author(p)"
              :look="author(p).look"
              :color="author(p).color"
              :size="32"
            />
            <div>
              <small>{{ author(p)?.persona }} написал{{ p.touch > 1 ? '' : 'а' }}:</small>
              <textarea v-model="drafts[p.id]" rows="6" maxlength="1500" @blur="saveDraft(p)" />
            </div>
          </div>
          <div class="actions">
            <a
              v-if="p.phone"
              class="o-btn small"
              :href="`https://wa.me/${digits(p.phone)}?text=${encodeURIComponent(drafts[p.id] || '')}`"
              target="_blank"
              rel="noopener"
              >WhatsApp</a
            >
            <a
              v-if="p.audit?.telegram"
              class="o-btn small ghost"
              :href="p.audit.telegram"
              target="_blank"
              rel="noopener"
              @click="copy(p)"
              >Telegram</a
            >
            <a v-if="p.phone" class="o-btn small ghost" :href="`tel:${p.phone.replace(/\s/g, '')}`"
              >Позвонить</a
            >
            <button class="o-btn small ghost" @click="copy(p)">Скопировать</button>
            <button
              class="o-btn small ghost"
              :disabled="busy === 'redraft-' + p.id"
              @click="redraft(p, 'uz')"
            >
              На узбекском
            </button>
            <button
              class="o-btn small ghost"
              :disabled="busy === 'redraft-' + p.id"
              @click="redraft(p, 'ru')"
            >
              {{ busy === 'redraft-' + p.id ? 'Пишу…' : 'Переписать' }}
            </button>
          </div>
          <div class="actions">
            <button class="o-btn small done" :disabled="busy === 'sent-' + p.id" @click="sent(p)">
              Отправил
            </button>
            <button class="o-btn small ghost" @click="status(p, 'skipped')">Пропустить</button>
          </div>
        </article>
      </section>

      <div class="cols">
        <section class="o-card">
          <div class="o-head"><h2>Ждём ответа</h2></div>
          <p v-if="!waiting.length" class="o-muted">Пока никого.</p>
          <div v-for="p in waiting" :key="p.id" class="row">
            <div>
              <b>{{ p.name }}</b>
              <small>касание {{ p.touch }} · следующее {{ fmt(p.nextTouchAt) }}</small>
            </div>
            <div class="row-actions">
              <button class="o-btn small" @click="status(p, 'replied')">Ответили</button>
              <button class="o-btn small ghost" @click="status(p, 'lost')">Отказ</button>
            </div>
          </div>
        </section>
        <section class="o-card">
          <div class="o-head"><h2>Разговор</h2></div>
          <p v-if="!talking.length" class="o-muted">Когда компания ответит, она появится здесь.</p>
          <div v-for="p in talking" :key="p.id" class="row">
            <div>
              <b>{{ p.name }}</b>
              <small
                >{{ statusLabel[p.status]
                }}<template v-if="p.phone"> · {{ p.phone }}</template></small
              >
            </div>
            <div class="row-actions">
              <button
                v-if="p.status === 'replied'"
                class="o-btn small ghost"
                @click="status(p, 'meeting')"
              >
                Созвон
              </button>
              <button class="o-btn small" @click="status(p, 'won')">Сделка</button>
              <button class="o-btn small ghost" @click="status(p, 'lost')">Отказ</button>
            </div>
          </div>
        </section>
      </div>

      <section v-if="done.length" class="o-card">
        <div class="o-head">
          <h2>Итоги</h2>
          <span>отказы и пропуски удаляются через 180 дней</span>
        </div>
        <div v-for="p in done" :key="p.id" class="row">
          <div>
            <b>{{ p.name }}</b><small
              >{{ statusLabel[p.status] }}<template v-if="p.note"> · {{ p.note }}</template></small
            >
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.clients {
  display: grid;
  gap: 16px;
}
.hunt-bar {
  display: grid;
  gap: 14px;
}
.hunt-who {
  display: flex;
  gap: 12px;
  align-items: center;
}
.hunt-who div {
  display: grid;
  gap: 2px;
}
.hunt-who span {
  font-size: 12.5px;
  color: var(--soft);
}
.hunt-form,
.add-form {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.add-form input,
.hunt-form select,
.add-form select {
  flex: 1 1 160px;
  width: auto;
}
select {
  font: inherit;
  font-size: 14px;
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 9px 10px;
  background: #fff;
  color: var(--ink);
}
.funnel {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.funnel span {
  background: #f1f2f4;
  border-radius: 99px;
  padding: 4px 10px;
  font-size: 12.5px;
  color: var(--soft);
}
.funnel b {
  color: var(--ink);
}
.lead-card {
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 14px;
  margin-top: 12px;
  display: grid;
  gap: 10px;
}
.lead-card header {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: flex-start;
}
.lead-card h3 {
  margin: 0;
  font-size: 16px;
}
.lead-card header p {
  margin: 2px 0 0;
}
.touch {
  flex: none;
  font-size: 12px;
  font-weight: 600;
  background: #eaf0ff;
  color: var(--accent);
  border-radius: 99px;
  padding: 3px 10px;
}
.issues {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  padding: 0;
}
.issues li {
  font-size: 12px;
  background: #fff4e5;
  color: #93600b;
  border-radius: 99px;
  padding: 3px 10px;
}
.links {
  display: flex;
  gap: 12px;
  font-size: 13px;
  flex-wrap: wrap;
}
.links a {
  color: var(--accent);
}
.draft {
  display: flex;
  gap: 10px;
}
.draft > div {
  flex: 1;
  display: grid;
  gap: 4px;
}
.draft small {
  font-size: 12px;
  color: var(--soft);
}
.actions,
.row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.o-btn.done {
  background: #12b76a;
}
.cols {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-top: 1px solid var(--line);
}
.row > div:first-child {
  display: grid;
  gap: 2px;
  min-width: 0;
}
.row small {
  font-size: 12px;
  color: var(--soft);
}
@media (max-width: 760px) {
  .cols {
    grid-template-columns: 1fr;
  }
  .row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
