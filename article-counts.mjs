import {PROJECT_URL,PUBLIC_KEY} from './backend.mjs?v=org-20260908';
let loading=false,lastAttempt=0;
const countText = value => Number.isSafeInteger(value) && value >= 0 ? value.toLocaleString('ko-KR') : '확인 불가';
async function refreshCounts() {
  if(loading)return;
  const targets=[...document.querySelectorAll('[data-article-metrics]')];
  if(!targets.length)return;
  loading=true;lastAttempt=Date.now();
  const button=document.querySelector('[data-refresh-article-counts]');
  if(button){button.disabled=true;button.textContent='확인 중…';}
  try{
    const response=await fetch(PROJECT_URL+'/functions/v1/article-counts',{headers:{apikey:PUBLIC_KEY,Authorization:'Bearer '+PUBLIC_KEY},signal:AbortSignal.timeout(18000),cache:'no-store'});
    if(!response.ok)throw Error('Counts unavailable');
    const data=await response.json();
    if(!Array.isArray(data.articles))throw Error('Invalid counts');
    for(const target of document.querySelectorAll('[data-article-metrics]')){
      const item=data.articles.find(article=>article.id===target.dataset.articleMetrics);
      if(!item)throw Error('Missing counts');
      const numbers=document.createElement('span');numbers.className='article-count-values';
      for(const [label,value,delta] of [['댓글',item.commentCount,item.commentDelta],['공감·추천',item.reactionCount,item.reactionDelta]]){
        const part=document.createElement('span');part.append(label+' ');
        const strong=document.createElement('b');strong.textContent=countText(value);part.append(strong);
        const change=document.createElement('small');change.className='article-count-delta';
        change.textContent=value===null?'확인 불가':item.historyAvailable===false?'비교 확인 지연':Number.isSafeInteger(delta)?delta===0?'변동 없음':`전일 대비 ${delta>0?'+':'−'}${Math.abs(delta).toLocaleString('ko-KR')}`:'집계 시작';
        part.append(change);numbers.append(part);
      }
      const note=document.createElement('small');
      const date=new Date(item.checkedAt);
      const time=Number.isNaN(date.getTime())?'시각 확인 불가':new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}).format(date);
      note.textContent='네이버 · '+time+' 확인';
      target.replaceChildren(numbers,note);
      target.title=(item.baselineCheckedAt?'전일 마지막 집계: '+new Date(item.baselineCheckedAt).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'})+'. ':'전일 비교 기록이 아직 없습니다. ')+'공감·추천은 네이버 기사 반응의 합계입니다. 수치는 조회 시점에 따라 달라질 수 있습니다.';
    }
  }catch{
    document.querySelectorAll('[data-article-metrics]').forEach(target=>{target.textContent='수치 확인 지연 · 기사 원문에서 확인해 주세요.';});
  }finally{
    loading=false;if(button){button.disabled=false;button.textContent='수치 새로고침';}
  }
}
document.addEventListener('c14:articles-ready',refreshCounts);
document.addEventListener('click',e=>{if(e.target.closest('[data-refresh-article-counts]'))refreshCounts();});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&Date.now()-lastAttempt>60000)refreshCounts();});
refreshCounts();
