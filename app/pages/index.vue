<script setup lang="ts">
import { services as servicesRu, steps as stepsRu } from '~/data/services';
import { servicesUz, stepsUz } from '~/data/services.uz';
import { projectTypes } from '#shared/pricing.mjs';
import { fromMln, termText } from '~/data/pricing-labels';
const { t, localPath, locale } = useLanguage();
const u = (r: string, z: string) => (locale.value === 'uz' ? z : r);
const services = computed(() => (locale.value === 'uz' ? servicesUz : servicesRu));
const steps = computed(() => (locale.value === 'uz' ? stepsUz : stepsRu));
const { list: cases } = useCases();
const heading = computed(() =>
  locale.value === 'uz'
    ? ['Toshkentda biznes uchun', 'sayt va mobil ilova yaratish']
    : ['Разработка сайтов и мобильных приложений', 'для бизнеса в Ташкенте']
);
usePageSeo(
  'Разработка и создание сайтов и приложений в Ташкенте',
  'Разработка сайтов, веб-сервисов и мобильных приложений для бизнеса в Ташкенте и по всему Узбекистану. Прямое общение с разработчиком, от задачи до запуска.'
);
const { data: posts } = await useFetch<any[]>('/api/posts', { query: { lang: locale } });
const landing = projectTypes.find(p => p.id === 'landing')!;
const serviceFrom = (code: string) =>
  fromMln(
    Math.min(...projectTypes.filter(p => p.service === code).map(p => p.price[0] ?? 0)),
    locale.value
  );
</script>
<template>
  <div class="home">
    <section class="home-hero wrap">
      <div class="home-hero-copy" data-reveal>
        <h1>
          {{ heading[0] }} <span class="accent-text">{{ heading[1] }}</span>
        </h1>
        <p class="lede">
          {{
            u(
              'Сайты, веб-сервисы, Telegram-боты и приложения под ключ. Работаем по договору: цена фиксируется до старта, вы общаетесь напрямую с разработчиком.',
              'Saytlar, veb-xizmatlar, Telegram-botlar va ilovalar. Shartnoma asosida ishlaymiz: narx ish boshlanishidan oldin belgilanadi, siz dasturchi bilan bevosita muloqot qilasiz.'
            )
          }}
        </p>
        <div class="home-hero-actions">
          <NuxtLink class="button" :to="localPath('/contact')">{{ t('Обсудить проект') }}</NuxtLink>
          <a class="button button-secondary" href="#calculator">{{
            u('Рассчитать стоимость', 'Narxni hisoblash')
          }}</a>
        </div>
      </div>
      <div class="home-hero-art" aria-hidden="true">
        <picture
          ><source
            type="image/avif"
            srcset="
              /images/cursor-sculpture-640.avif   640w,
              /images/cursor-sculpture-1160.avif 1160w
            "
            sizes="(max-width:760px) 80vw, 520px" />
          <img
            src="/images/cursor-sculpture-1160.webp"
            srcset="
              /images/cursor-sculpture-640.webp   640w,
              /images/cursor-sculpture-1160.webp 1160w
            "
            sizes="(max-width:760px) 80vw, 520px"
            alt=""
            width="1254"
            height="1254"
            fetchpriority="high"
        /></picture>
      </div>
    </section>

    <section class="home-band">
      <div class="wrap bento">
        <article class="bento-card bento-main" data-reveal>
          <h2>{{ u('Полный цикл разработки', 'To‘liq ishlab chiqish sikli') }}</h2>
          <p>
            {{
              u(
                'От разбора задачи и дизайна до запуска и поддержки. Одна команда отвечает за результат целиком.',
                'Vazifani tahlil qilish va dizayndan ishga tushirish va qo‘llab-quvvatlashgacha. Natija uchun bitta jamoa javob beradi.'
              )
            }}
          </p>
          <dl class="bento-stats">
            <div>
              <dt>{{ fromMln(landing.price[0], locale) }}</dt>
              <dd>{{ u('стоимость лендинга', 'lending narxi') }}</dd>
            </div>
            <div>
              <dt>{{ termText(landing.weeks, locale, t) }}</dt>
              <dd>{{ u('срок лендинга', 'lending muddati') }}</dd>
            </div>
            <div>
              <dt>RU + UZ</dt>
              <dd>{{ u('сайты на двух языках', 'ikki tilli saytlar') }}</dd>
            </div>
          </dl>
        </article>
        <article class="bento-card" data-reveal>
          <h3>{{ u('Работаем по договору', 'Shartnoma asosida') }}</h3>
          <p>
            {{
              u(
                'Сначала согласуем состав работ, затем фиксируем цену — до начала разработки.',
                'Avval ishlar tarkibini kelishamiz, so‘ng narxni ish boshlanishidan oldin belgilaymiz.'
              )
            }}
          </p>
        </article>
        <article class="bento-card" data-reveal>
          <h3>{{ u('Прямое общение', 'Bevosita muloqot') }}</h3>
          <p>
            {{
              u(
                'С вами работает разработчик, без менеджеров-посредников.',
                'Siz bilan vositachi menejerlarsiz dasturchi ishlaydi.'
              )
            }}
          </p>
        </article>
        <article class="bento-card bento-accent" data-reveal>
          <h3>{{ t('Круглосуточно, без выходных') }}</h3>
          <p><PhoneLink place="home-bento" class="bento-phone" /></p>
          <TelegramLink place="home-bento" class="bento-link" />
        </article>
        <article class="bento-card" data-reveal>
          <h3>{{ u('Онлайн-калькулятор', 'Onlayn kalkulyator') }}</h3>
          <p>
            {{
              u(
                'Ориентировочная цена и срок за минуту — без звонков.',
                'Taxminiy narx va muddat bir daqiqada — qo‘ng‘iroqsiz.'
              )
            }}
          </p>
          <a class="text-link" href="#calculator"
            >{{ u('Рассчитать', 'Hisoblash') }} <AppIcon :size="18"
          /></a>
        </article>
      </div>
    </section>

    <section id="projects" class="home-section wrap">
      <div class="section-head">
        <h2>{{ u('Проекты', 'Loyihalar') }}</h2>
      </div>
      <ProjectTiles />
    </section>

    <section id="services" class="home-section wrap">
      <div class="section-head">
        <h2>{{ t('Услуги') }}</h2>
        <NuxtLink class="text-link" :to="localPath('/prices')"
          >{{ t('Все цены') }} <AppIcon :size="18"
        /></NuxtLink>
      </div>
      <div class="service-cards">
        <NuxtLink
          v-for="s in services"
          :key="s.slug"
          :to="localPath(`/services/${s.slug}`)"
          class="service-card"
          data-reveal
        >
          <span class="service-card-number">{{ s.number }}</span>
          <h3>{{ s.title }}</h3>
          <p>{{ s.short }}</p>
          <span class="service-card-price">{{ serviceFrom(s.code) }}</span>
          <span class="text-link">{{ u('Подробнее', 'Batafsil') }} <AppIcon :size="18" /></span>
        </NuxtLink>
      </div>
    </section>

    <section v-if="cases.length" class="home-section wrap">
      <div class="section-head">
        <h2>{{ t('Кейсы') }}</h2>
        <NuxtLink class="text-link" :to="localPath('/cases')"
          >{{ t('Все кейсы') }} <AppIcon :size="18"
        /></NuxtLink>
      </div>
      <CaseCards :items="cases.slice(0, 3)" />
    </section>

    <section class="home-band">
      <div class="wrap home-section">
        <div class="section-head">
          <h2>{{ u('Как мы работаем', 'Qanday ishlaymiz') }}</h2>
          <NuxtLink class="text-link" :to="localPath('/process')"
            >{{ u('Подробнее о процессе', 'Jarayon haqida batafsil') }} <AppIcon :size="18"
          /></NuxtLink>
        </div>
        <ol class="step-cards">
          <li v-for="step in steps" :key="step.n" class="step-card" data-reveal>
            <span class="step-card-number">{{ step.n }}</span>
            <h3>{{ step.title }}</h3>
            <p>{{ step.body }}</p>
          </li>
        </ol>
      </div>
    </section>

    <section id="calculator" class="home-section home-calc-section">
      <div class="wrap section-head">
        <div>
          <h2>{{ u('Сколько стоит проект', 'Loyiha narxi qancha') }}</h2>
          <p class="lede">
            {{
              u(
                'Выберите тип проекта и функции — сразу увидите ориентировочную цену и срок.',
                'Loyiha turi va funksiyalarni tanlang — taxminiy narx va muddatni darhol ko‘rasiz.'
              )
            }}
          </p>
        </div>
      </div>
      <CostCalculator />
    </section>

    <section v-if="posts?.length" class="home-section wrap">
      <div class="section-head">
        <h2>{{ t('Журнал') }}</h2>
        <NuxtLink class="text-link" :to="localPath('/journal')"
          >{{ u('Все материалы', 'Barcha maqolalar') }} <AppIcon :size="18"
        /></NuxtLink>
      </div>
      <JournalCards :posts="posts.slice(0, 3)" />
    </section>

    <ProjectCta />
  </div>
</template>
