<script setup lang="ts">
usePageSeo('Редакция', 'Управление журналом', true);
const session = ref<any>(null),
  state = ref<any>(null),
  password = ref(''),
  busy = ref(false),
  message = ref(''),
  error = ref('');
const tab = ref('Материалы'),
  tabs = ['Материалы', 'Темы', 'Календарь', 'Каналы и заявки', 'Автоматизация'];
const savedEditor = ref('');
const editor = ref<any>(null),
  isNew = ref(false),
  preview = ref(false),
  schedule = ref(''),
  checks = reactive({ facts: false, sources: false, originality: false, translation: false });
const topic = reactive({ slug: '', title: '', brief: '', service: 'websites' });
const link = reactive({
  path: '/journal',
  source: 'telegram',
  medium: 'social',
  campaign: 'journal'
});
const shareUrl = computed(() => {
  const u = new URL(
    link.path.startsWith('/') ? link.path : '/journal',
    state.value?.config.siteUrl || 'http://127.0.0.1:3000'
  );
  u.searchParams.set('utm_source', link.source);
  u.searchParams.set('utm_medium', link.medium);
  u.searchParams.set('utm_campaign', link.campaign);
  return u.href;
});
const labels: Record<string, string> = {
  draft: 'Черновик',
  approved: 'В календаре',
  published: 'Опубликовано',
  queued: 'В очереди',
  paused: 'Пауза',
  generating: 'Готовится',
  drafted: 'Черновик готов',
  failed: 'Ошибка',
  running: 'Выполняется',
  complete: 'Готово'
};
const channelLabels: Record<string, string> = {
  ai: 'ИИ-поиск',
  search: 'Поисковики',
  social: 'Соцсети',
  paid: 'Реклама',
  referral: 'Другие сайты',
  direct: 'Прямые / неизвестно'
};
const dirty = computed(() => editor.value && JSON.stringify(editor.value) !== savedEditor.value);
const planned = computed(() =>
  (state.value?.posts || [])
    .filter((p: any) => p.status === 'approved')
    .sort((a: any, b: any) => a.scheduledAt.localeCompare(b.scheduledAt))
);
const counts = computed(() =>
  Object.entries(channelLabels).map(([key, label]) => ({
    key,
    label,
    count: (state.value?.leads || []).filter(
      (l: any) => (l.attribution?.channel || 'direct') === key
    ).length
  }))
);
const date = (v: string) =>
  v
    ? new Intl.DateTimeFormat('ru', {
        timeZone: 'Asia/Tashkent',
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(new Date(v))
    : '—';
async function load() {
  session.value = await $fetch('/api/admin/session');
  if (session.value.authenticated) state.value = await $fetch('/api/admin/state');
}
onMounted(() =>
  load().catch(() => (error.value = 'Не удалось загрузить редакцию. Обновите страницу.'))
);
async function login(local = false) {
  busy.value = true;
  error.value = '';
  try {
    await $fetch('/api/admin/session', {
      method: 'POST',
      body: { password: password.value, local }
    });
    password.value = '';
    await load();
  } catch (e: any) {
    error.value = e.data?.statusMessage || 'Не удалось войти.';
  } finally {
    busy.value = false;
  }
}
async function logout() {
  await $fetch('/api/admin/session', { method: 'POST', body: { logout: true } });
  state.value = null;
  editor.value = null;
  await load();
}
function confirmDelete(l: any) {
  if (confirm(`Удалить заявку «${l.name}»? Восстановить её будет нельзя.`))
    act({ action: 'delete-lead', id: l.id }, 'Заявка удалена.');
}
async function act(body: any, success = 'Сохранено.') {
  busy.value = true;
  error.value = '';
  message.value = '';
  try {
    const r: any = await $fetch('/api/admin/action', { method: 'POST', body });
    await load();
    message.value =
      r.result?.status === 'failed'
        ? r.result.error
        : r.result?.status === 'skipped'
          ? 'Запуск пропущен: нет тем, уже был запуск сегодня или достигнут месячный лимит.'
          : success;
    return true;
  } catch (e: any) {
    error.value = e.data?.statusMessage || 'Не удалось выполнить действие.';
    return false;
  } finally {
    busy.value = false;
  }
}
function openPost(p?: any) {
  editor.value = p
    ? JSON.parse(JSON.stringify(p))
    : {
        slug: '',
        title: '',
        description: '',
        category: 'Выбор решения',
        service: 'websites',
        author: 'Burxonov Shohrux',
        answer: '',
        content: [{ heading: '', body: '' }],
        sources: [],
        faq: []
      };
  editor.value.faq ||= [];
  editor.value.answer ||= '';
  editor.value.author ||= 'Burxonov Shohrux';
  savedEditor.value = JSON.stringify(editor.value);
  isNew.value = !p;
  preview.value = false;
  schedule.value = '';
  Object.assign(checks, { facts: false, sources: false, originality: false, translation: false });
  message.value = '';
  error.value = '';
}
async function save() {
  if (
    await act(
      {
        action: isNew.value ? 'create' : 'save',
        post: editor.value,
        revision: editor.value.revision
      },
      'Черновик сохранён.'
    )
  ) {
    isNew.value = false;
    editor.value = JSON.parse(
      JSON.stringify(state.value.posts.find((p: any) => p.slug === editor.value.slug))
    );
    savedEditor.value = JSON.stringify(editor.value);
    Object.assign(checks, { facts: false, sources: false, originality: false, translation: false });
  }
}
async function plan() {
  if (dirty.value) {
    error.value = 'Сначала сохраните изменения.';
    return;
  }
  if (!schedule.value) {
    error.value = 'Выберите дату и время.';
    return;
  }
  if (
    await act(
      {
        action: 'schedule',
        slug: editor.value.slug,
        time: schedule.value + ':00+05:00',
        checks,
        revision: editor.value.revision
      },
      'Статья поставлена в календарь.'
    )
  )
    editor.value = null;
}
async function addTopic() {
  if (await act({ action: 'add-topic', topic }, 'Тема добавлена.'))
    Object.assign(topic, { slug: '', title: '', brief: '', service: 'websites' });
}
</script>
<template>
  <section class="editorial wrap">
    <div class="editorial-heading">
      <div>
        <span class="eyebrow">WEB / MOBILE · ДЛЯ АВТОРА</span>
        <h1>Редакция</h1>
        <p>Из полезного ответа — в разговор о проекте.</p>
      </div>
      <div class="editorial-actions">
        <NuxtLink to="/journal" class="text-link">Открыть журнал ↗</NuxtLink
        ><button
          v-if="session?.authenticated"
          class="quiet-button"
          :disabled="busy"
          @click="logout"
        >
          Выйти
        </button>
      </div>
    </div>
    <p v-if="error" class="form-error editor-alert" role="alert">{{ error }}</p>
    <p v-if="message" class="editor-alert" role="status">{{ message }}</p>
    <div v-if="!session" class="editor-panel">Загружаем редакцию…</div>
    <div v-else-if="!session.authenticated" class="editor-panel login-panel form-panel">
      <h2>Вход для автора</h2>
      <p>Черновики, расписание и обращения доступны только владельцу.</p>
      <button v-if="session.local" class="button" :disabled="busy" @click="login(true)">
        Открыть локальную редакцию <AppIcon />
      </button>
      <form v-else-if="session.configured" @submit.prevent="login()">
        <label
          >Пароль<input
            v-model="password"
            type="password"
            autocomplete="current-password"
            required /></label
        ><button class="button" :disabled="busy">Войти</button>
      </form>
      <p v-else class="preview-note">
        Вход пока не настроен. На сервере нужны ADMIN_PASSWORD и ADMIN_SESSION_SECRET. Инструкция
        находится в README проекта.
      </p>
      <p v-if="session.local" class="preview-note">
        Локальный режим на этом компьютере. Для публичного сайта потребуется пароль.
      </p>
    </div>
    <template v-else-if="state"
      ><fieldset class="editor-workspace" :disabled="busy">
        <div class="editor-stats">
          <div>
            <span>Материалы</span><strong>{{ state.posts.length }}</strong
            ><small>в вашей редакции</small>
          </div>
          <div>
            <span>В календаре</span><strong>{{ planned.length }}</strong
            ><small>проверены и запланированы</small>
          </div>
          <div>
            <span>Темы</span
            ><strong>{{ state.topics.filter((t: any) => t.status === 'queued').length }}</strong
            ><small>ждут подготовки</small>
          </div>
          <div>
            <span>Заявки</span><strong>{{ state.leads.length }}</strong
            ><small>с сохранённым источником</small>
          </div>
        </div>
        <div class="editor-status">
          <span class="status-dot" :class="{ on: state.config.enabled }" />
          <strong>{{
            state.config.enabled ? 'Расписание включено' : 'Расписание выключено'
          }}</strong><span>08:00 — подготовка · время публикации — в календаре · Ташкент</span>
        </div>
        <nav class="editor-tabs" aria-label="Разделы редакции">
          <button
            v-for="item in tabs"
            :key="item"
            :class="{ active: tab === item }"
            @click="
              tab = item;
              editor = null;
            "
          >
            {{ item }}
          </button>
        </nav>
        <template v-if="tab === 'Материалы'">
          <div v-if="!editor">
            <div class="editor-section-title">
              <div>
                <h2>Ваши статьи</h2>
                <p>Здесь хранятся материалы, которые выйдут на /journal.</p>
              </div>
              <button class="button button-small" @click="openPost()">Написать статью +</button>
            </div>
            <div v-if="!state.posts.length" class="editor-empty">
              <span class="eyebrow">ПЕРВЫЙ МАТЕРИАЛ</span>
              <h3>Начните с вопроса клиента.</h3>
              <p>
                Добавьте тему для ИИ или напишите материал сами. Примеры из предпросмотра журнала не
                являются вашими публикациями.
              </p>
              <button class="text-link" @click="tab = 'Темы'">Перейти к темам →</button>
            </div>
            <div v-for="p in state.posts" :key="p.slug" class="editor-row">
              <div>
                <span class="editor-badge">{{ labels[p.status] }}</span>
                <h3>{{ p.title }}</h3>
                <p>
                  /journal/{{ p.slug }}
                  <span v-if="p.scheduledAt">· {{ date(p.scheduledAt) }}</span>
                </p>
              </div>
              <button class="quiet-button" @click="openPost(p)">Открыть →</button>
            </div>
          </div>
          <div v-else class="editor-panel form-panel">
            <div class="editor-section-title">
              <h2>{{ isNew ? 'Новая статья' : 'Редактор статьи' }}</h2>
              <button class="quiet-button" @click="editor = null">Закрыть</button>
            </div>
            <div v-if="editor.status === 'published'" class="preview-note">
              Материал опубликован. Для изменений сначала снимите его с публикации.<br /><NuxtLink
                :to="`/journal/${editor.slug}`"
                class="text-link"
                >Открыть статью ↗</NuxtLink
              ><button
                class="quiet-button"
                :disabled="busy"
                @click="
                  act(
                    { action: 'unpublish', slug: editor.slug },
                    'Материал снят с публикации.'
                  ).then(ok => {
                    if (ok) editor = null;
                  })
                "
              >
                Снять с публикации
              </button>
            </div>
            <template v-else
              ><div class="form-row">
                <label>Название<input v-model="editor.title" maxlength="350" /></label
                ><label
                  >URL статьи<input
                    v-model="editor.slug"
                    :disabled="!isNew"
                    placeholder="website-brief"
                    maxlength="100"
                  /><small>/journal/{{ editor.slug || 'url-stati' }}</small></label
                >
              </div>
              <label
                >Описание для поиска<textarea
                  v-model="editor.description"
                  rows="2"
                  maxlength="350"
                />
              </label>
              <div class="form-row">
                <label>Автор<input v-model="editor.author" maxlength="150" /></label
                ><label>Рубрика<input v-model="editor.category" maxlength="100" /></label>
              </div>
              <label
                >Связанная услуга<select v-model="editor.service">
                  <option value="websites">Сайты для бизнеса</option>
                  <option value="web-apps">Веб-сервисы</option>
                  <option value="mobile-apps">Мобильные приложения</option>
                </select></label
              ><label
                >Короткий ответ на вопрос клиента<textarea
                  v-model="editor.answer"
                  rows="3"
                  maxlength="2000"
                />
              </label>
              <div class="editor-section-title">
                <h3>Содержание</h3>
                <button class="quiet-button" @click="preview = !preview">
                  {{ preview ? 'Редактировать' : 'Предпросмотр' }}
                </button>
              </div>
              <div v-if="preview" class="article-body editor-preview">
                <h2>{{ editor.title }}</h2>
                <p>{{ editor.answer }}</p>
                <section v-for="(s, i) in editor.content" :key="i">
                  <h3>{{ s.heading }}</h3>
                  <p>{{ s.body }}</p>
                </section>
              </div>
              <template v-else
                ><div v-for="(s, i) in editor.content" :key="i" class="editor-block">
                  <label
                    >Раздел {{ Number(i) + 1
                    }}<input v-model="s.heading" maxlength="200" placeholder="Заголовок" /></label
                  ><label>Текст<textarea v-model="s.body" rows="7" maxlength="10000" /></label
                  ><button
                    class="quiet-button"
                    :disabled="editor.content.length === 1"
                    @click="editor.content.splice(i, 1)"
                  >
                    Удалить раздел
                  </button>
                </div>
                <button
                  class="quiet-button"
                  :disabled="editor.content.length >= 40"
                  @click="editor.content.push({ heading: '', body: '' })"
                >
                  + Добавить раздел
                </button></template
              >
              <h3 class="editor-subtitle">Источники</h3>
              <p>Откройте каждую ссылку и проверьте, подтверждает ли она утверждение в статье.</p>
              <div v-for="(s, i) in editor.sources" :key="i" class="editor-block">
                <div class="form-row">
                  <label>Название<input v-model="s.title" maxlength="300" /></label
                  ><label>HTTPS-ссылка<input v-model="s.url" type="url" maxlength="2000" /></label>
                </div>
                <a
                  v-if="s.url.startsWith('https://')"
                  :href="s.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-link"
                  >Проверить источник ↗</a
                >
                <button class="quiet-button" @click="editor.sources.splice(i, 1)">Удалить</button>
              </div>
              <button
                class="quiet-button"
                :disabled="editor.sources.length >= 30"
                @click="editor.sources.push({ title: '', url: '' })"
              >
                + Добавить источник
              </button>
              <h3 class="editor-subtitle">Вопросы заказчика</h3>
              <div v-for="(q, i) in editor.faq" :key="i" class="editor-block">
                <label>Вопрос<input v-model="q.question" maxlength="300" /></label
                ><label>Ответ<textarea v-model="q.answer" rows="2" maxlength="2000" /></label
                ><button class="quiet-button" @click="editor.faq.splice(i, 1)">
                  Удалить вопрос
                </button>
              </div>
              <button
                class="quiet-button"
                :disabled="editor.faq.length >= 12"
                @click="editor.faq.push({ question: '', answer: '' })"
              >
                + Добавить вопрос
              </button>
              <ArticleTranslation v-model="editor.translations" />
              <div class="editor-save">
                <button class="button" :disabled="busy" @click="save">Сохранить черновик</button>
                <p>Сохранение изменений отменяет прежнее расписание.</p>
              </div>
              <div v-if="!isNew" class="editor-schedule">
                <h3>Проверка и публикация</h3>
                <ul v-if="editor.issues?.length" class="quality-list">
                  <li v-for="issue in editor.issues" :key="issue">{{ issue }}</li>
                </ul>
                <p>Перед планированием сохраните правки. В календарь попадёт сохранённая версия.</p>
                <label class="consent"
                  ><input v-model="checks.facts" type="checkbox" /><span
                    >Факты и выводы проверены, вымышленных кейсов и обещаний нет.</span
                  ></label
                ><label class="consent"
                  ><input v-model="checks.sources" type="checkbox" /><span
                    >Источники открыты и подтверждают материал.</span
                  ></label
                ><label class="consent"
                  ><input v-model="checks.originality" type="checkbox" /><span
                    >Материал помогает заказчику и содержит полезные критерии или примеры.</span
                  ></label
                ><label v-if="editor.translations?.uz" class="consent"
                  ><input v-model="checks.translation" type="checkbox" /><span
                    >Узбекский перевод проверен: смысл, факты, ссылки и язык.</span
                  ></label
                ><label
                  >Дата и время · Ташкент (UTC+5)<input v-model="schedule" type="datetime-local"
                /></label>
                <p v-if="!state.config.enabled" class="preview-note">
                  Автоматический выпуск выключен. Расписание сохранится, но для выпуска нужно
                  включить worker на сервере или нажать «Выпустить готовые».
                </p>
                <button
                  class="button"
                  :disabled="
                    busy ||
                    !checks.facts ||
                    !checks.sources ||
                    !checks.originality ||
                    (editor.translations?.uz && !checks.translation) ||
                    dirty
                  "
                  @click="plan"
                >
                  Запланировать
                </button>
              </div>
            </template>
          </div>
        </template>
        <template v-if="tab === 'Темы'"
          ><div class="editor-section-title">
            <div>
              <h2>Вопросы будущих клиентов</h2>
              <p>Один запрос — одна полезная статья и связанная услуга.</p>
            </div>
            <button
              class="quiet-button"
              :disabled="busy"
              @click="act({ action: 'seed' }, 'Темы добавлены.')"
            >
              Добавить стандартные темы
            </button>
          </div>
          <div class="editor-panel form-panel">
            <h3>Добавить тему</h3>
            <div class="form-row">
              <label
                >Вопрос клиента<input
                  v-model="topic.title"
                  maxlength="200"
                  placeholder="Как выбрать…" /></label
              ><label
                >Будущий URL<input v-model="topic.slug" maxlength="100" placeholder="how-to-choose"
              /></label>
            </div>
            <label
              >Задача материала<textarea
                v-model="topic.brief"
                rows="3"
                maxlength="3000"
                placeholder="Кому поможет статья и какое решение нужно принять?"
              ></textarea></label
            ><label
              >Услуга<select v-model="topic.service">
                <option value="websites">Сайты для бизнеса</option>
                <option value="web-apps">Веб-сервисы</option>
                <option value="mobile-apps">Мобильные приложения</option>
              </select></label
            ><button class="button button-small" :disabled="busy" @click="addTopic">
              В очередь
            </button>
          </div>
          <div v-for="t in state.topics" :key="t.slug" class="editor-row">
            <div>
              <span class="editor-badge">{{ labels[t.status] }}</span>
              <h3>{{ t.title }}</h3>
              <p>{{ t.brief }}</p>
            </div>
            <button
              v-if="['queued', 'paused', 'failed'].includes(t.status)"
              class="quiet-button"
              :disabled="busy"
              @click="
                act({
                  action: 'topic-status',
                  slug: t.slug,
                  status: t.status === 'queued' ? 'paused' : 'queued'
                })
              "
            >
              {{ t.status === 'queued' ? 'Пауза' : 'В очередь' }}
            </button>
          </div></template
        >
        <template v-if="tab === 'Календарь'"
          ><div class="editor-section-title">
            <div>
              <h2>Публикации по расписанию</h2>
              <p>Проверенные статьи появятся на сайте в выбранное время.</p>
            </div>
            <button
              class="quiet-button"
              :disabled="busy"
              @click="
                act(
                  { action: 'publish-due' },
                  'Выпуск завершён. Опубликованы статьи, время которых наступило.'
                )
              "
            >
              Выпустить готовые
            </button>
          </div>
          <p v-if="!planned.length" class="editor-empty">
            В календаре пока пусто. Проверьте статью в редакторе и выберите время.
          </p>
          <div v-for="p in planned" :key="p.slug" class="editor-row">
            <div>
              <span class="eyebrow">{{ date(p.scheduledAt) }} · ТАШКЕНТ</span>
              <h3>{{ p.title }}</h3>
            </div>
            <button
              class="quiet-button"
              @click="
                tab = 'Материалы';
                openPost(p);
              "
            >
              Открыть →
            </button>
          </div></template
        >
        <template v-if="tab === 'Каналы и заявки'"
          ><div class="editor-section-title">
            <div>
              <h2>Откуда приходят клиенты</h2>
              <p>Источники сохранённых заявок. Это не число посетителей или упоминаний сайта.</p>
            </div>
          </div>
          <div class="channel-grid">
            <div v-for="c in counts" :key="c.key" class="editor-panel">
              <span>{{ c.label }}</span><strong>{{ c.count }}</strong>
            </div>
          </div>
          <div class="editor-panel form-panel">
            <h3>Ссылка для публикации</h3>
            <p>Разместите её в своём Telegram, профиле или статье на другой площадке.</p>
            <div class="form-row">
              <label
                >Страница<input v-model="link.path" placeholder="/journal/article-slug" /></label
              ><label>Канал<input v-model="link.source" /></label
              ><label>Тип перехода<input v-model="link.medium" /></label
              ><label>Кампания<input v-model="link.campaign" /></label>
            </div>
            <label
              >Готовая ссылка<input
                :value="shareUrl"
                readonly
                @focus="($event.target as HTMLInputElement).select()"
            /></label>
          </div>
          <div v-for="l in state.leads" :key="l.id" class="editor-row">
            <div>
              <span class="eyebrow"
                >{{ date(l.createdAt) }} ·
                {{ channelLabels[l.attribution?.channel || 'direct'] }}</span
              >
              <h3>{{ l.name }}</h3>
              <p>{{ l.contact }} · {{ l.message }}</p>
              <p>
                {{ l.attribution?.landing || 'Источник ранее не сохранялся' }}
                <span v-if="l.attribution?.campaign">· {{ l.attribution.campaign }}</span>
              </p>
            </div>
            <button class="quiet-button" :disabled="busy" @click="confirmDelete(l)">Удалить</button>
          </div></template
        >
        <template v-if="tab === 'Автоматизация'"
          ><div class="editor-section-title">
            <div>
              <h2>От темы до публикации</h2>
              <p>Поиск источников → черновик → ваша проверка → календарь → журнал.</p>
            </div>
          </div>
          <div class="editor-panel">
            <dl class="automation-details">
              <div>
                <dt>Подготовка через ИИ</dt>
                <dd>{{ state.config.ready ? 'Настроена' : 'Не подключена' }}</dd>
              </div>
              <div>
                <dt>Модель</dt>
                <dd>{{ state.config.model || 'Не выбрана' }}</dd>
              </div>
              <div>
                <dt>Лимит</dt>
                <dd>1 запуск в день · {{ state.config.monthlyLimit }} в месяц</dd>
              </div>
              <div>
                <dt>Последний сигнал worker</dt>
                <dd>{{ date(state.heartbeat) }}</dd>
              </div>
              <div>
                <dt>Индексация</dt>
                <dd>{{ state.config.indexable ? 'Разрешена' : 'Закрыта для предпросмотра' }}</dd>
              </div>
              <div>
                <dt>Автор</dt>
                <dd>{{ state.config.author }}</dd>
              </div>
            </dl>
            <p class="preview-note" v-if="!state.config.ready">
              Для подготовки нужны OPENAI_API_KEY и CONTENT_MODEL в серверном .env. Бюджет задаётся
              в проекте провайдера; число запусков ограничено отдельно. Ключ не вводится в браузер и
              не отправляется посетителям.
            </p>
            <button
              class="button"
              :disabled="busy || !state.config.ready"
              @click="
                act({ action: 'generate' }, 'Черновик подготовлен. Откройте его в материалах.')
              "
            >
              {{ busy ? 'Подготовка…' : 'Подготовить следующую статью' }}
            </button>
            <p class="editor-help">
              Запуск включает веб-поиск и написание. Непроверенный материал остаётся черновиком.
              Ошибка тоже учитывается в лимите дня, чтобы исключить повторные списания.
            </p>
          </div>
          <h3 class="editor-subtitle">История запусков</h3>
          <p v-if="!state.runs.length" class="editor-empty">
            Запусков пока не было. Здесь появятся результаты и причины ошибок.
          </p>
          <div v-for="r in state.runs" :key="r.id" class="editor-row">
            <div>
              <span class="editor-badge">{{ labels[r.status] }}</span>
              <h3>{{ r.topic }}</h3>
              <p>
                {{ date(r.started_at) }} <span v-if="r.error">· {{ r.error }}</span>
              </p>
              <p v-if="r.usage">Расход токенов: {{ r.usage }}</p>
            </div>
          </div></template
        >
      </fieldset></template
    >
  </section>
</template>
