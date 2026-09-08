import {PROJECT_URL,PUBLIC_KEY} from './backend.mjs?v=org-20260908';
const dialog=document.createElement('dialog');dialog.className='download-dialog';
dialog.innerHTML='<form><h2>자료 다운로드</h2><p>자료 보호를 위해 다운로드할 때마다 비밀번호를 입력해 주세요.</p><label for="document-password">비밀번호</label><input id="document-password" type="password" maxlength="128" required autocomplete="off"><p role="status" class="download-status"></p><div><button type="button" data-cancel>취소</button><button type="submit">다운로드</button></div></form>';
document.body.append(dialog);
let file=null;
document.addEventListener('click',event=>{
  const link=event.target.closest('a[data-audit-file]');if(!link)return;
  event.preventDefault();file=link.dataset.auditFile;dialog.querySelector('form').reset();dialog.querySelector('[role=status]').textContent='';dialog.showModal();dialog.querySelector('input').focus();
});
dialog.querySelector('[data-cancel]').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>dialog.querySelector('input').value='');
dialog.querySelector('form').addEventListener('submit',async event=>{
  event.preventDefault();const button=dialog.querySelector('[type=submit]'),status=dialog.querySelector('[role=status]');button.disabled=true;status.textContent='다운로드를 준비하고 있습니다…';
  try{
    const response=await fetch(PROJECT_URL+'/functions/v1/audit-download',{method:'POST',headers:{apikey:PUBLIC_KEY,Authorization:'Bearer '+PUBLIC_KEY,'Content-Type':'application/json'},body:JSON.stringify({file,password:dialog.querySelector('input').value}),signal:AbortSignal.timeout(20000)});
    const data=await response.json();if(!response.ok)throw Error(data.error||'다운로드에 실패했습니다.');
    const url=new URL(data.url);if(url.origin!==PROJECT_URL||!url.pathname.startsWith('/storage/v1/object/sign/c14-audit/'))throw Error('다운로드 주소를 확인할 수 없습니다.');
    const a=document.createElement('a');a.href=url.href+'&download='+encodeURIComponent(file);a.download=file;a.click();dialog.close();
  }catch(error){status.textContent=error.name==='TimeoutError'?'연결이 지연되고 있습니다. 다시 시도해 주세요.':error.message;}
  finally{button.disabled=false;}
});
