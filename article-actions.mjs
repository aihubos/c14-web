(() => {
  const section = document.getElementById('article-actions');
  if (!section) return;

  const text = (value) => String(value ?? '').trim();
  const safeUrl = (value) => {
    try {
      const url = new URL(text(value), document.baseURI);
      return url.protocol === 'https:' ? url.href : '';
    } catch {
      return '';
    }
  };

  const makeItem = (article, featured = false) => {
    const id = text(article.id);
    const title = text(article.title);
    const url = safeUrl(article.url);
    if (!id || !title || !url) return null;

    const item = document.createElement('article');
    item.className = 'article-action-item';
    if (featured) item.classList.add('is-featured');
    item.dataset.articleId = id;

    const meta = document.createElement('div');
    meta.className = 'article-action-meta';
    [text(article.publisher), text(article.published), text(article.platform)].filter(Boolean).forEach((value) => {
      const span = document.createElement('span');
      span.textContent = value;
      meta.append(span);
    });
    const link = document.createElement('a');
    link.className = 'article-action-link';
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', `${title} (새 창에서 열림)`);
    item.append(link);
    link.append(meta);
    const titleNode = document.createElement('h3');
    titleNode.className = 'article-action-title';
    titleNode.textContent = title;
    link.append(titleNode);

    const summary = text(article.summary);
    if (featured && summary) {
      const description = document.createElement('p');
      description.className = 'article-action-summary';
      description.textContent = summary;
      link.append(description);
    }

    if (featured) {
      const participate = document.createElement('span');
      participate.className = 'article-action-participate';
      participate.setAttribute('aria-hidden', 'true');
      participate.textContent = '댓글·공감 참여 · 클릭 ↗';
      link.append(participate);

      const metrics = document.createElement('div');
      metrics.className = 'article-action-metrics';
      metrics.dataset.articleMetrics = id;
      metrics.textContent = '댓글 확인 중 · 공감 확인 중';
      link.append(metrics);
    }
    return item;
  };

  const render = (articles) => {
    const featuredArticles = articles.filter((article) => article && article.engagement === true);
    const relatedArticles = articles.filter((article) => article && article.engagement !== true);
    const items = featuredArticles.map((article) => makeItem(article, true)).filter(Boolean);
    if (!items.length) return false;

    const header = document.createElement('header');
    header.className = 'article-actions-header';
    const headerCopy = document.createElement('div');
    headerCopy.className = 'article-actions-header-copy';
    const label = document.createElement('p');
    label.className = 'article-actions-label';
    label.textContent = '댓글 · 좋아요 참여';
    const title = document.createElement('h2');
    title.id = 'article-actions-heading';
    title.className = 'article-actions-heading';
    title.textContent = '우리 아파트 기사, 함께 알려주세요';
    const intro = document.createElement('p');
    intro.className = 'article-actions-intro';
    intro.textContent = '기사를 읽고, 댓글과 공감으로 의견을 남겨주세요.';
    headerCopy.append(label, title, intro);
    const refresh = document.createElement('button');
    refresh.type = 'button';
    refresh.className = 'article-actions-refresh';
    refresh.dataset.refreshArticleCounts = '';
    refresh.textContent = '수치 새로고침';
    header.append(headerCopy, refresh);

    const primary = document.createElement('div');
    primary.className = 'article-action-list';
    items.forEach((item) => primary.append(item));

    const content = document.createDocumentFragment();
    content.append(header, primary);
    const relatedItems = relatedArticles.map((article) => makeItem(article)).filter(Boolean);
    if (relatedItems.length) {
      const details = document.createElement('details');
      details.className = 'article-action-more';
      const summary = document.createElement('summary');
      summary.textContent = `관련 기사 더 보기 (${relatedItems.length})`;
      const rest = document.createElement('div');
      rest.className = 'article-action-list';
      relatedItems.forEach((item) => rest.append(item));
      details.append(summary, rest);
      content.append(details);
    }
    const footnote = document.createElement('p');
    footnote.className = 'article-actions-footnote';
    footnote.textContent = '댓글·공감은 기사 원문에서 참여할 수 있습니다.';
    content.append(footnote);
    section.replaceChildren(content);
    document.dispatchEvent(new CustomEvent('c14:articles-ready', { detail: { count: items.length } }));
    return true;
  };

  const addShorts = () => {
    const header = section.querySelector('.article-actions-header');
    if (!header || section.querySelector('.article-actions-lead')) return;
    const layout = document.createElement('div');
    layout.className = 'article-actions-lead';
    const news = document.createElement('div');
    news.className = 'article-actions-news';
    while (header.nextElementSibling) news.append(header.nextElementSibling);
    layout.append(news);
    layout.insertAdjacentHTML('beforeend', `
      <aside class="article-short" aria-label="동탄 C14 관련 유튜브 쇼츠">
        <div class="article-short-player"><iframe width="224" height="398" src="https://www.youtube-nocookie.com/embed/t2CRU1JVxTs?playsinline=1&amp;rel=0" title="분양도 안 받았는데 ‘6억 차익’? 동탄 C-14 공공임대 사실 바로잡기" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>
        <div class="article-short-caption"><span> YouTube Shorts · 눌러서 재생</span><h3>분양도 안 받았는데<br>‘6억 차익’?</h3><a href="https://www.youtube.com/shorts/t2CRU1JVxTs" target="_blank" rel="noopener noreferrer">YouTube에서 보기 ↗</a></div>
      </aside>`);
    section.append(layout);
  };

  fetch('news.json', { credentials: 'same-origin' })
    .then((response) => {
      if (!response.ok) throw new Error(`news.json: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      if (!Array.isArray(data)) throw new Error('news.json must be an array');
      render(data);
    })
    .catch(() => {
      // Keep the server-rendered section as the usable fallback.
    })
    .finally(addShorts);
})();
