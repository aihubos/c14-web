// 페이지 본문 위치 대신 공통 헤더의 화면 위치만 이어받는다.
const positionKey = 'c14-navigation-position';
const header = document.querySelector('.site-header');
try {
  const saved = JSON.parse(sessionStorage.getItem(positionKey) || 'null');
  sessionStorage.removeItem(positionKey);
  if (header && saved?.path === location.pathname && !location.hash
      && Number.isFinite(saved.top) && saved.top >= 0
      && Date.now() - saved.at >= 0 && Date.now() - saved.at < 10000) {
    window.scrollTo({top: Math.max(0, header.getBoundingClientRect().top + scrollY - saved.top), behavior: 'instant'});
  }
} catch { /* 저장소를 사용할 수 없으면 기본 링크 이동을 유지한다. */ }

document.querySelectorAll('.area-nav').forEach(nav => {
  const links = [...nav.querySelectorAll('a')];
  const selected = links.find(link => link.hasAttribute('aria-current'));
  const other = links.find(link => link !== selected);
  if (links.length !== 2 || !selected || !other) return;
  const label = `현재 ${selected.textContent.trim()}. 다시 누르면 ${other.textContent.trim()}로 전환`;
  selected.href = other.href;
  selected.setAttribute('aria-label', label);
  selected.title = label;
  for (const link of links) link.addEventListener('click', event => {
    if (!header || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey
        || event.shiftKey || event.altKey || link.target === '_blank') return;
    try {
      sessionStorage.setItem(positionKey, JSON.stringify({
        path: new URL(link.href).pathname, top: Math.max(0, header.getBoundingClientRect().top), at: Date.now()
      }));
    } catch { /* 기본 링크는 저장소 없이도 동작한다. */ }
  });
});
