import {api,rpc} from './backend.mjs';
const topics=new Set(['A-aircon','A-community','B-aircon','B-community','C-aircon','C-community','aircon-page']);
for(const box of document.querySelectorAll('[data-review-topic]')){
 const topic=box.dataset.reviewTopic;if(!topics.has(topic))continue;
 const title='[시안검토 v1] '+topic,form=box.querySelector('form'),status=box.querySelector('[data-review-status]'),list=box.querySelector('[data-review-comments]'),more=box.querySelector('[data-review-more]');
 let offset=0,busy=false,id=crypto.randomUUID();
 async function read(reset=false){
  more.disabled=true;
  try{
   const rows=await api('/rest/v1/c14_posts?select=id,nickname,body,created_at&title=eq.'+encodeURIComponent(title)+'&order=created_at.desc,id.desc&limit=11&offset='+(reset?0:offset));
   if(reset){list.replaceChildren();offset=0;}
   for(const row of rows.slice(0,10)){
    const item=document.createElement('article'),head=document.createElement('strong'),body=document.createElement('p');
    head.textContent=row.nickname+' · '+new Date(row.created_at).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'});body.textContent=row.body;body.style.whiteSpace='pre-wrap';item.append(head,body);list.append(item);
   }
   offset+=Math.min(rows.length,10);more.hidden=rows.length<=10;more.textContent='댓글 더 보기';
   if(!offset)list.textContent='첫 의견을 남겨 주세요.';
  }catch{status.textContent='댓글을 불러오지 못했습니다. 다시 시도해 주세요.';more.hidden=false;more.textContent='다시 불러오기';}
  finally{more.disabled=false;}
 }
 more.addEventListener('click',()=>read(offset===0));
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(busy)return;
  const data=new FormData(form),nickname=String(data.get('nickname')||'').trim(),body=String(data.get('body')||'').trim();
  if(!nickname||nickname.length>24||body.length<5||body.length>5000){status.textContent='닉네임과 5자 이상의 의견을 입력해 주세요.';return;}
  busy=true;const button=form.querySelector('[type="submit"]');button.disabled=true;status.textContent='등록 중…';
  try{await rpc('c14_create_post',{p_id:id,p_nickname:nickname,p_category:'의견',p_title:title,p_body:body,p_website:String(data.get('website')||'')});id=crypto.randomUUID();form.elements.body.value='';status.textContent='의견이 등록되었습니다.';await read(true);}
  catch(error){status.textContent=error.message;}
  finally{busy=false;button.disabled=false;}
 });
 read(true);
}
