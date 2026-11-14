import { cases, localizeCase } from '#shared/cases.mjs';
import { services as servicesRu } from '~/data/services';
import { servicesUz } from '~/data/services.uz';
/** Кейсы на текущем языке; service — отбор по направлению. */
export function useCases(service?: () => string | undefined) {
  const { locale } = useLanguage();
  const list = computed(() =>
    cases
      .filter((c: any) => !service?.() || c.service === service())
      .map((c: any) => localizeCase(c, locale.value))
  );
  const serviceTitle = (code: string) =>
    (locale.value === 'uz' ? servicesUz : servicesRu).find(s => s.code === code)?.title || '';
  return { list, serviceTitle };
}
