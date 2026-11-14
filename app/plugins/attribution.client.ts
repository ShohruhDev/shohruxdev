export default defineNuxtPlugin(() => {
  const attribution = useState('attribution', () => ({}));
  try {
    const existing = sessionStorage.getItem('arrival');
    if (existing) {
      attribution.value = JSON.parse(existing);
      return;
    }
    if (location.pathname.startsWith('/admin')) return;
    const q = new URLSearchParams(location.search);
    const data = {
      source: q.get('utm_source') || '',
      medium: q.get('utm_medium') || '',
      campaign: q.get('utm_campaign') || '',
      landing: location.pathname,
      referrer: document.referrer ? new URL(document.referrer).origin : ''
    };
    attribution.value = data;
    sessionStorage.setItem('arrival', JSON.stringify(data));
  } catch {}
});
