import {rpc} from './backend.mjs?v=org-20260908';
async function visitors(){
  let id=null;
  if(location.hostname==='c14.ai-hub-os.com'){
    try{id=localStorage.getItem('c14-visitor');if(!/^[0-9a-f-]{36}$/i.test(id||'')){id=crypto.randomUUID();localStorage.setItem('c14-visitor',id);}}catch{}
  }
  try{const counts=await rpc('c14_visit',{p_id:id});['today','total'].forEach(name=>{const target=document.querySelector('[data-stat="'+name+'"]');if(target)target.textContent=Number(counts[name]).toLocaleString('ko-KR');});
    for(const name of ['today','total']){
      const el=document.querySelector('[data-stat-delta="'+name+'"]');if(!el)continue;
      const n=counts[name+'Delta'];
      el.textContent=!Number.isSafeInteger(n)?'집계 시작':n===0?'전일 대비 변동 없음':`전일 대비 ${n>0?'+':'−'}${Math.abs(n).toLocaleString('ko-KR')}명`;
      el.title=name==='today'?'오늘 중복 제외 방문자와 어제 하루 방문자를 비교합니다.':'어제까지 누적 방문자 대비 오늘 처음 방문한 사람 수입니다.';
    }
  }
  catch{document.querySelectorAll('[data-stat]').forEach(el=>{el.textContent='집계 지연';});document.querySelectorAll('[data-stat-delta]').forEach(el=>el.textContent='비교 확인 지연');}
}
visitors();
