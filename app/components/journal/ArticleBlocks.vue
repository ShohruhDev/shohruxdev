<script setup lang="ts">
// Текст раздела хранится простым текстом: абзацы разделены пустой строкой.
// Строки «1. …», «- …» и «> …» превращаются в списки и врезку. Вывод идёт через
// интерполяцию Vue, поэтому HTML из текста не исполняется.
type Block =
  | { kind: 'p'; text: string }
  | { kind: 'ol'; start: number; items: string[] }
  | { kind: 'ul'; items: string[] }
  | { kind: 'quote'; text: string };
const props = defineProps<{ body: string }>();
const ordered = /^(\d{1,3})[.)]\s+(.*)$/,
  bullet = /^[-•*–]\s+(.*)$/,
  quote = /^>\s?(.*)$/;
const blocks = computed<Block[]>(() => {
  const out: Block[] = [];
  for (const chunk of String(props.body || '').split(/\n\s*\n/)) {
    // Блоки внутри одного фрагмента: соседние строки одного вида собираются вместе.
    const local: Block[] = [];
    let text: string[] = [];
    const flush = () => {
      if (text.length) local.push({ kind: 'p', text: text.join('\n') });
      text = [];
    };
    for (const raw of chunk.split('\n')) {
      const line = raw.trim();
      if (!line) continue;
      const o = line.match(ordered),
        u = !o && line.match(bullet),
        q = !o && !u && line.match(quote);
      if (!o && !u && !q) {
        text.push(line);
        continue;
      }
      flush();
      const last = local.at(-1);
      if (o) {
        if (last?.kind === 'ol') last.items.push(o[2]!);
        else local.push({ kind: 'ol', start: Number(o[1]), items: [o[2]!] });
      } else if (u) {
        if (last?.kind === 'ul') last.items.push(u[1]!);
        else local.push({ kind: 'ul', items: [u[1]!] });
      } else if (q) {
        if (last?.kind === 'quote') last.text += '\n' + q[1];
        else local.push({ kind: 'quote', text: q[1]! });
      }
    }
    flush();
    out.push(...local);
  }
  return out;
});
</script>
<template>
  <template v-for="(b, i) in blocks" :key="i">
    <p v-if="b.kind === 'p'" class="post-p">{{ b.text }}</p>
    <ol
      v-else-if="b.kind === 'ol'"
      class="post-ol"
      :start="b.start"
      :style="{ counterReset: `post-ol ${b.start - 1}` }"
    >
      <li v-for="(item, j) in b.items" :key="j">{{ item }}</li>
    </ol>
    <ul v-else-if="b.kind === 'ul'" class="post-ul">
      <li v-for="(item, j) in b.items" :key="j">{{ item }}</li>
    </ul>
    <blockquote v-else class="post-quote">
      <p>{{ b.text }}</p>
    </blockquote>
  </template>
</template>
<style scoped>
.post-p,
.post-ol li,
.post-ul li,
.post-quote p {
  font-size: 18px;
  line-height: 1.7;
  color: var(--body);
}
.post-p {
  margin: 0 0 24px;
  white-space: pre-line;
}
.post-ol,
.post-ul {
  margin: 0 0 28px;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 14px;
}
.post-ol {
  counter-reset: post-ol;
}
.post-ol li,
.post-ul li {
  position: relative;
  margin: 0;
}
.post-ol li {
  counter-increment: post-ol;
  padding-left: 48px;
  min-height: 32px;
}
.post-ol li::before {
  content: counter(post-ol);
  position: absolute;
  left: 0;
  top: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  line-height: 32px;
  text-align: center;
}
.post-ul li {
  padding-left: 26px;
}
.post-ul li::before {
  content: '';
  position: absolute;
  left: 4px;
  top: 0.72em;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
}
.post-quote {
  margin: 0 0 28px;
  padding: 24px 28px;
  border-radius: var(--radius);
  background: var(--surface);
}
.post-quote p {
  margin: 0;
  white-space: pre-line;
  color: var(--text);
}
@media (max-width: 900px) {
  .post-p,
  .post-ol li,
  .post-ul li,
  .post-quote p {
    font-size: 16px;
  }
  .post-ol li {
    padding-left: 44px;
  }
  .post-ol li::before {
    width: 28px;
    height: 28px;
    line-height: 28px;
    font-size: 14px;
  }
  .post-quote {
    padding: 20px;
  }
}
</style>
