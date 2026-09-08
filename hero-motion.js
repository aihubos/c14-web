const reduced = matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('[data-motion]').forEach(frame => {
  const video = frame.querySelector('video'), button = frame.querySelector('button');
  let started = false;
  function control(label, playing = false) {
    button.setAttribute('aria-label', label);
    button.title = label;
    button.innerHTML = playing
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zm6 0h4v14h-4z"/></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7z"/></svg>';
  }
  control('10초 영상 재생');
  async function play() {
    started = true;
    if (!video.getAttribute('src')) video.src = video.dataset.src;
    if (video.ended) video.currentTime = 0;
    try { await video.play(); }
    catch { control('10초 영상 재생'); }
  }
  button.addEventListener('click', () => video.paused ? play() : video.pause());
  video.addEventListener('play', () => { control('일시정지', true); });
  video.addEventListener('pause', () => { control(video.ended ? '다시 재생' : '이어서 재생'); });
  video.addEventListener('ended', () => { control('다시 재생'); });
  video.addEventListener('error', () => {
    video.removeAttribute('src'); video.load();
    control('영상 다시 불러오기');
  });
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) video.pause();
    else if (!started && entry.intersectionRatio >= .35 && !reduced.matches && !navigator.connection?.saveData && !document.hidden) play();
  }, {threshold:[0,.35]});
  observer.observe(video);
  document.addEventListener('visibilitychange', () => { if (document.hidden) video.pause(); });
  reduced.addEventListener('change', () => { if (reduced.matches) video.pause(); });
});
