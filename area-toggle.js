// 선택된 쪽도 다시 누르면 반대 페이지로 이동한다. 일반 링크와 새 탭 동작을 유지한다.
document.querySelectorAll('.area-nav').forEach(nav => {
  const links = [...nav.querySelectorAll('a')];
  const selected = links.find(link => link.hasAttribute('aria-current'));
  const other = links.find(link => link !== selected);
  if (links.length !== 2 || !selected || !other) return;
  const label = `현재 ${selected.textContent.trim()}. 다시 누르면 ${other.textContent.trim()}로 전환`;
  selected.href = other.href;
  selected.setAttribute('aria-label', label);
  selected.title = label;
});
