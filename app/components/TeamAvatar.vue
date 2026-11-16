<script setup lang="ts">
// Плоский SVG-персонаж специалиста команды (панель «Офис»). Внешность — из shared/team-people.mjs.
const props = withDefaults(
  defineProps<{
    look: { skin: number; hair: string; hairColor: string; extra: string };
    color: string;
    size?: number;
    label?: string;
  }>(),
  { size: 56, label: '' }
);
const skin = computed(() => ['#f6d3b3', '#e8b48c', '#c68a5e'][props.look.skin] || '#e8b48c');
const uid = useId();
const back: Record<string, string> = {
  long: 'M30 46C28 22 42 17 50 17C60 17 72 23 70 46L73 78L60 74L62 42C56 34 44 34 38 42L40 74L27 78Z',
  bob: 'M31 50C29 24 42 19 50 19C60 19 71 24 69 50L69 62L60 60L62 42C56 34 44 34 38 42L40 60L31 62Z',
  ponytail: 'M62 30C74 32 78 48 74 66C72 56 68 46 64 40Z'
};
const front: Record<string, string> = {
  short: 'M33 42C33 26 42 21 50 21C60 21 67 27 67 42C64 34 58 31 50 31C42 31 36 34 33 42Z',
  side: 'M33 45C31 26 44 19 54 21C64 23 69 32 67 45C63 33 51 30 41 34C37 36 35 41 33 45Z',
  messy: 'M32 43C30 24 40 18 50 19C62 18 72 26 68 43L64 33L58 35L54 28L48 34L42 29L38 36Z',
  long: 'M33 44C33 28 42 23 50 23C58 23 67 28 67 44C62 36 56 32 50 32C44 32 38 36 33 44Z',
  bob: 'M33 44C33 28 42 23 50 23C58 23 67 28 67 44C61 37 54 33 46 34C40 35 36 39 33 44Z',
  bun: 'M34 42C34 27 42 23 50 23C58 23 66 27 66 42C62 35 57 32 50 32C43 32 38 35 34 42Z',
  ponytail: 'M33 43C33 27 42 22 50 22C59 22 67 27 67 43C62 35 57 31 50 31C43 31 38 35 33 43Z',
  bald: 'M33 46C33 40 34 37 35 36L36 46ZM67 46C67 40 66 37 65 36L64 46Z'
};
</script>
<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 100 100"
    :role="label ? 'img' : undefined"
    :aria-label="label || undefined"
    :aria-hidden="label ? undefined : 'true'"
    class="team-avatar"
  >
    <defs>
      <clipPath :id="uid"><circle cx="50" cy="50" r="50" /></clipPath>
    </defs>
    <g :clip-path="`url(#${uid})`">
      <circle cx="50" cy="50" r="50" :fill="color" fill-opacity="0.14" />
      <path v-if="back[look.hair]" :d="back[look.hair]" :fill="look.hairColor" />
      <path
        d="M16 100C16 77 31 67 50 67C69 67 84 77 84 100Z"
        :fill="look.extra === 'hoodie' ? '#3b3f46' : color"
      />
      <path
        v-if="look.extra === 'hoodie'"
        d="M36 70C40 78 60 78 64 70L60 68C56 72 44 72 40 68Z"
        fill="#2b2e33"
      />
      <g v-if="look.extra === 'hoodie'" stroke="#e9ecef" stroke-width="1.6" stroke-linecap="round">
        <path d="M45 76V86" />
        <path d="M55 76V86" />
      </g>
      <rect x="44" y="56" width="12" height="13" rx="5" :fill="skin" />
      <path v-if="look.extra === 'tie'" d="M42 67L50 75L58 67Z" fill="#fff" fill-opacity="0.9" />
      <path v-if="look.extra === 'tie'" d="M48 74L52 74L54 90L50 94L46 90Z" fill="#1f2937" />
      <circle cx="33" cy="46" r="4" :fill="skin" />
      <circle cx="67" cy="46" r="4" :fill="skin" />
      <ellipse cx="50" cy="44" rx="17" ry="19" :fill="skin" />
      <path
        v-if="look.extra === 'beard'"
        d="M34 48C36 62 44 64 50 64C56 64 64 62 66 48C62 56 56 57 50 57C44 57 38 56 34 48Z"
        :fill="look.hairColor"
      />
      <circle v-if="look.hair === 'bun'" cx="50" cy="18" r="8" :fill="look.hairColor" />
      <path v-if="front[look.hair]" :d="front[look.hair]" :fill="look.hairColor" />
      <circle cx="43.5" cy="46" r="2.1" fill="#1f2328" />
      <circle cx="56.5" cy="46" r="2.1" fill="#1f2328" />
      <path
        d="M45 53.5Q50 57.5 55 53.5"
        fill="none"
        stroke="#7a3b2e"
        stroke-width="1.8"
        stroke-linecap="round"
      />
      <g v-if="look.extra === 'glasses'" fill="none" stroke="#1f2328" stroke-width="1.6">
        <circle cx="43.5" cy="46" r="5" />
        <circle cx="56.5" cy="46" r="5" />
        <path d="M48.5 46H51.5" />
      </g>
      <g
        v-if="look.extra === 'headset'"
        fill="none"
        stroke="#2b2e33"
        stroke-width="3"
        stroke-linecap="round"
      >
        <path d="M31 46C31 28 40 22 50 22C60 22 69 28 69 46" />
        <path d="M67 52C66 58 60 60 55 60" stroke-width="2" />
      </g>
      <g v-if="look.extra === 'headset'" fill="#2b2e33">
        <rect x="27" y="41" width="7" height="12" rx="3" />
        <rect x="66" y="41" width="7" height="12" rx="3" />
      </g>
      <g v-if="look.extra === 'cap'">
        <path d="M32 38C32 24 41 19 50 19C59 19 68 24 68 38Z" :fill="color" />
        <path d="M50 36H80C78 40 74 41 68 41H50Z" :fill="color" />
        <path d="M32 38H68" stroke="#000" stroke-opacity="0.2" stroke-width="1.5" />
      </g>
      <ellipse
        v-if="look.extra === 'beret'"
        cx="47"
        cy="24"
        rx="19"
        ry="7"
        transform="rotate(-10 47 24)"
        :fill="color"
      />
      <rect
        v-if="look.extra === 'phone'"
        x="64"
        y="80"
        width="10"
        height="17"
        rx="2"
        fill="#1f2328"
      />
    </g>
  </svg>
</template>
