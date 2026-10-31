// Опора v17 — «живой» слой: время суток, плавные переходы, отклик на выполнение задач.
(() => {
  const root = document.getElementById('app');
  if (!root) return;
  const h = new Date().getHours();
  const part = h < 5 ? 'night' : h < 11 ? 'morning' : h < 17 ? 'day' : h < 22 ? 'evening' : 'night';
  document.documentElement.dataset.daypart = part;
  const hello = { morning: 'Доброе утро. Начнём с главного.', day: 'Добрый день. Что сейчас важнее всего?', evening: 'Добрый вечер. Подведём итог дня?', night: 'Пора отдыхать. Остальное подождёт.' };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let lastPage = '', justDone = null;

  const enhance = () => {
    obs.disconnect();
    try {
      const page = root.querySelector('.nav-item.active')?.dataset.page || (root.querySelector('.focus-screen') ? 'focus' : '');
      const content = root.querySelector('.content');
      if (page !== lastPage) {
        if (page === 'focus') window.scrollTo(0, 0);
        if (content && !reduce.matches) {
          content.classList.add('enter');
          content.querySelectorAll(':scope > :not(.day-grid), .day-main > *, .day-aside > *').forEach((el, i) => el.style.setProperty('--i', Math.min(i, 10)));
        }
        lastPage = page;
      }
      const h1 = root.querySelector('.page-heading h1');
      if (page === 'day' && h1 && /^Начнём с главного/.test(h1.textContent)) h1.textContent = hello[part];
      if (justDone) {
        const row = [...root.querySelectorAll('.task-row.done')].find(r => r.querySelector('.task-text')?.textContent.trim().startsWith(justDone));
        row?.classList.add('just-done');
        justDone = null;
      }
    } finally {
      obs.observe(root, { childList: true });
      obs.takeRecords();
    }
  };

  const obs = new MutationObserver(enhance);
  document.addEventListener('click', e => {
    const check = e.target.closest?.('.task-check');
    if (!check || check.classList.contains('checked')) return;
    justDone = check.closest('.task-row')?.querySelector('.task-text > span')?.textContent.trim() || null;
    navigator.vibrate?.(14);
  }, true);
  enhance();
})();
