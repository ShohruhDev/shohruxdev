<script setup lang="ts">
const { locale } = useLanguage();
const { enabled } = useMotion();
const root = ref<HTMLElement>();
let frame = 0;
const u = (r: string, z: string) => (locale.value === 'uz' ? z : r);
const cards = computed(() => [
  {
    n: '01',
    title: u('Сначала — смысл.', 'Avval — ma’no.'),
    body: u(
      'Разбираюсь в задаче, аудитории и сценариях. Определяем, что действительно нужно первой версии.',
      'Vazifa, auditoriya va ssenariylarni o‘rganaman. Birinchi versiyaga nima zarurligini aniqlaymiz.'
    ),
    word: 'THINK'
  },
  {
    n: '02',
    title: u('Затем — характер.', 'Keyin — xarakter.'),
    body: u(
      'Собираю визуальный язык и интерактивный прототип. Проверяем путь пользователя до написания кода.',
      'Vizual uslub va interaktiv prototip yarataman. Kod yozishdan oldin foydalanuvchi yo‘lini tekshiramiz.'
    ),
    word: 'SHAPE'
  },
  {
    n: '03',
    title: u('И всё работает.', 'Va barchasi ishlaydi.'),
    body: u(
      'Разрабатываю, проверяю на разных экранах и запускаю. Передаю доступы и объясняю, как всё устроено.',
      'Dasturlayman, turli ekranlarda tekshiraman va ishga tushiraman. Kirish huquqlarini topshirib, tizimni tushuntiraman.'
    ),
    word: 'BUILD'
  }
]);
function update() {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => {
    if (!root.value) return;
    const r = root.value.getBoundingClientRect();
    const distance = Math.max(1, r.height - innerHeight);
    const p = enabled.value ? Math.min(1, Math.max(0, (90 - r.top) / distance)) : 0;
    root.value.style.setProperty('--sequence', String(p));
    root.value.dataset.active = String(Math.min(2, Math.floor(p * 3)));
  });
}
onMounted(() => {
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
});
watch(enabled, update);
onBeforeUnmount(() => {
  cancelAnimationFrame(frame);
  window.removeEventListener('scroll', update);
  window.removeEventListener('resize', update);
});
</script>
<template>
  <section class="creation-sequence" ref="root" data-active="0">
    <div class="sequence-sticky">
      <div class="sequence-top">
        <span>{{ u('Листайте. Всё складывается.', 'Varaqlang. Barchasi birlashadi.') }} ↓</span>
      </div>
      <div class="sequence-deck">
        <article
          v-for="(card, i) in cards"
          :key="card.n"
          class="sequence-poster"
          :class="`poster-${i}`"
        >
          <div class="poster-meta">
            <span>{{ card.n }} / 03</span>
          </div>
          <div class="poster-word" aria-hidden="true">
            {{ card.word }}<span>{{ ['↗', '✳', '↳'][i] }}</span>
          </div>
          <div class="poster-content">
            <h2>{{ card.title }}</h2>
            <p>{{ card.body }}</p>
          </div>
        </article>
      </div>
      <div class="sequence-track" aria-hidden="true">
        <i /><span>IDEA</span><span>PRODUCT</span>
      </div>
    </div>
  </section>
</template>
