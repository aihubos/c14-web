import {api,rpc} from './backend.mjs?v=org-20260908';
const board=document.querySelector('#resident-board');
const list=board.querySelector('[data-board-state="list"]'),empty=board.querySelector('[data-board-state="empty"]');
const writeButton=board.querySelector('[data-board-action="write"]'),adminButton=board.querySelector('[data-board-action="admin"]');
const status=document.createElement('p');status.className='board-status';status.setAttribute('role','status');board.append(status);
const pager=document.createElement('div');pager.className='board-pager';board.append(pager);
const dialog=document.createElement('dialog');dialog.className='board-dialog';dialog.setAttribute('aria-labelledby','board-dialog-title');document.body.append(dialog);
const PAGE_SIZE=10,ADMIN_EMAIL='jeremylee0213@gmail.com';
let page=0,isAdmin=false,accessToken='',busy=false;
try{accessToken=sessionStorage.getItem('c14-admin-token')||'';}catch{}
// ponytail: 이 탭에만 인증 보관. 장기 로그인 필요 시 공식 Auth SDK의 갱신 기능으로 이전.
const hash=new URLSearchParams(location.hash.slice(1));
if(hash.has('access_token')||hash.has('error_description')){
  accessToken=hash.get('access_token')||'';history.replaceState(null,'',location.pathname+location.search+'#board');
  try{if(accessToken)sessionStorage.setItem('c14-admin-token',accessToken);}catch{}
  if(hash.has('error_description'))status.textContent='로그인 링크가 만료되었습니다. 새 로그인 이메일을 받아 주세요.';
}
const node=(tag,text,className)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n;};
const date=iso=>new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(iso));
const message=error=>error.name==='TimeoutError'?'연결 시간이 초과되었습니다. 다시 시도해 주세요.':error.message;
function closeDialog(){if(!busy)dialog.close();}
function showDialog(title,html=''){
  dialog.replaceChildren();
  const close=node('button','닫기','dialog-close');close.type='button';close.addEventListener('click',closeDialog);
  const heading=node('h2',title);heading.id='board-dialog-title';dialog.append(close,heading);
  if(html){const content=document.createElement('div');content.innerHTML=html;dialog.append(content);}
  dialog.showModal();
}
dialog.addEventListener('cancel',e=>{if(busy)e.preventDefault();});
dialog.addEventListener('click',e=>{if(e.target===dialog)closeDialog();});
async function loadPosts(){
  status.textContent='게시글을 불러오는 중입니다.';
  try{
    const posts=await api('/rest/v1/c14_posts?select=id,nickname,category,title,body,created_at&order=created_at.desc,id.desc&limit='+(PAGE_SIZE+1)+'&offset='+(page*PAGE_SIZE));
    if(!posts.length&&page>0){page--;return loadPosts();}
    list.replaceChildren();list.hidden=!posts.length;empty.hidden=!!posts.length;
    empty.replaceChildren(node('strong','게시글이 아직 없습니다.'),node('p','첫 번째 의견을 남겨 주세요.'));
    posts.slice(0,PAGE_SIZE).forEach(post=>{
      const row=node('article',undefined,'board-row'),open=node('button',undefined,'board-post');open.type='button';
      open.append(node('span',post.category,'board-category'),node('strong',post.title),node('small',post.nickname+' · '+date(post.created_at)));
      open.addEventListener('click',()=>readPost(post));row.append(open);list.append(row);
    });
    pager.replaceChildren();const prev=node('button','이전'),next=node('button','다음');prev.type=next.type='button';prev.disabled=page===0;next.disabled=posts.length<=PAGE_SIZE;
    prev.addEventListener('click',()=>{page--;loadPosts();});next.addEventListener('click',()=>{page++;loadPosts();});pager.append(prev,node('span',(page+1)+' 페이지'),next);
    status.textContent=isAdmin?'관리자로 로그인했습니다. 게시글을 열면 삭제할 수 있습니다.':'누구나 글을 읽고 쓸 수 있습니다. 게시글 내용은 공개됩니다.';
  }catch(e){
    list.hidden=true;empty.hidden=false;empty.replaceChildren(node('strong','게시글을 불러오지 못했습니다.'));
    const retry=node('button','다시 불러오기');retry.type='button';retry.addEventListener('click',loadPosts);empty.append(retry);status.textContent=message(e);
  }
}
function readPost(post){
  showDialog(post.title);dialog.append(node('p',post.category+' · '+post.nickname+' · '+date(post.created_at),'board-meta'),node('div',post.body,'board-body'));
  if(isAdmin){
    const remove=node('button','게시글 삭제','board-delete');remove.type='button';dialog.append(remove);
    remove.addEventListener('click',()=>{
      remove.hidden=true;const box=node('div',undefined,'board-confirm'),yes=node('button','삭제 확정','board-delete'),no=node('button','취소');yes.type=no.type='button';
      box.append(node('p','이 게시글을 삭제할까요? 삭제한 글은 되돌릴 수 없습니다.'),no,yes);dialog.append(box);
      no.addEventListener('click',()=>{box.remove();remove.hidden=false;});
      yes.addEventListener('click',async()=>{
        busy=true;yes.disabled=no.disabled=true;
        try{await rpc('c14_delete_post',{p_id:post.id},accessToken);busy=false;dialog.close();await loadPosts();}
        catch(e){busy=false;yes.disabled=no.disabled=false;box.append(node('p',message(e),'form-message'));if(e.status===401)logout();}
      });
    });
  }
}
writeButton.addEventListener('click',()=>{
  showDialog('입주민 글쓰기',`<form id="post-form">
    <label>별명<input name="nickname" required maxlength="24" autocomplete="nickname"></label>
    <label>분류<select name="category"><option>질문</option><option>의견</option><option>정보공유</option></select></label>
    <label>제목<input name="title" required minlength="2" maxlength="100"></label>
    <label>내용<textarea name="body" rows="8" required minlength="5" maxlength="5000"></textarea></label>
    <label class="board-honeypot" aria-hidden="true">웹사이트<input name="website" tabindex="-1" autocomplete="off"></label>
    <p class="board-meta">동·호수, 연락처, 계좌번호 등 개인정보를 적지 마세요. 공개 게시판이며 삭제는 관리자에게 요청할 수 있습니다.</p>
    <button type="submit" class="board-submit">게시글 등록</button><p class="form-message" role="status"></p></form>`);
  const form=dialog.querySelector('form'),feedback=form.querySelector('.form-message'),submit=form.querySelector('[type="submit"]');
  const id=crypto.randomUUID();
  form.addEventListener('submit',async e=>{
    e.preventDefault();if(busy||!form.reportValidity())return;busy=true;submit.disabled=true;feedback.textContent='저장 중입니다.';
    const values=Object.fromEntries(new FormData(form));
    try{await rpc('c14_create_post',{p_id:id,p_nickname:values.nickname.trim(),p_category:values.category,p_title:values.title.trim(),p_body:values.body.trim(),p_website:values.website});busy=false;dialog.close();page=0;await loadPosts();}
    catch(error){busy=false;submit.disabled=false;feedback.textContent=message(error)+' 입력한 내용은 유지됩니다.';}
  });
});
function logout(){accessToken='';isAdmin=false;adminButton.textContent='관리자 로그인';try{sessionStorage.removeItem('c14-admin-token');}catch{}}
async function checkAdmin(){
  if(!accessToken)return;try{isAdmin=await rpc('c14_is_admin',{},accessToken);if(!isAdmin)logout();}catch{logout();}
  adminButton.textContent=isAdmin?'관리자 로그아웃':'관리자 로그인';
  if(isAdmin)status.textContent='관리자로 로그인했습니다. 게시글을 열면 삭제할 수 있습니다.';
}
adminButton.addEventListener('click',async()=>{
  if(isAdmin){logout();status.textContent='로그아웃했습니다.';return;}
  showDialog('관리자 로그인',`<form id="admin-form"><label>관리자 이메일<input type="email" value="${ADMIN_EMAIL}" readonly></label>
    <p>이메일로 받은 로그인 링크를 누르면 게시글을 삭제할 수 있습니다.</p>
    <button class="board-submit" type="submit">로그인 이메일 받기</button><p class="form-message" role="status"></p></form>`);
  const form=dialog.querySelector('form'),submit=form.querySelector('button'),feedback=form.querySelector('.form-message');
  form.addEventListener('submit',async e=>{
    e.preventDefault();if(busy)return;busy=true;submit.disabled=true;feedback.textContent='로그인 이메일을 요청하고 있습니다.';
    try{await api('/auth/v1/otp?redirect_to='+encodeURIComponent('https://c14.ai-hub-os.com/residents.html'),{method:'POST',body:{email:ADMIN_EMAIL,create_user:true}});feedback.textContent='로그인 이메일을 보냈습니다. 메일의 링크를 눌러 주세요.';}
    catch(error){feedback.textContent=message(error);submit.disabled=false;}finally{busy=false;}
  });
});
checkAdmin();loadPosts();
