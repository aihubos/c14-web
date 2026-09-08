// Private documents: fixed manifest, server password, short-lived signed URLs.
const headers={'Access-Control-Allow-Origin':'https://c14.ai-hub-os.com','Access-Control-Allow-Headers':'apikey, authorization, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json','Cache-Control':'no-store'};
const files=['01-official','02-poster','03-summary','04-timeline','05-rebuttal','06-questions','07-forum-booklet'].flatMap(id=>['pdf','pptx'].map(ext=>id+'.'+ext));
const url=Deno.env.get('SUPABASE_URL'),key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
async function api(path,body){const response=await fetch(url+path,{method:'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(8000)});if(!response.ok)throw Error('Unavailable');return response.json();}
const reply=(status,message)=>Response.json({error:message},{status,headers});
Deno.serve(async req=>{
  if(req.method==='OPTIONS')return new Response(null,{headers});
  if(req.method!=='POST')return reply(405,'다운로드 요청 방식이 올바르지 않습니다.');
  try{
    const password=Deno.env.get('C14_DOWNLOAD_PASSWORD');if(!password)return reply(503,'다운로드를 준비 중입니다.');
    const raw=await req.text();if(raw.length>1024)return reply(400,'요청을 확인해 주세요.');
    let input;try{input=JSON.parse(raw);}catch{return reply(400,'요청을 확인해 주세요.');}
    if(!input||!files.includes(input.file)||typeof input.password!=='string'||input.password.length>128)return reply(400,'파일과 비밀번호를 확인해 주세요.');
    // Supabase gateway supplies the network address; store only a salted digest.
    const ip=req.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim()||'unknown';
    const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ip+key));
    const client=Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');
    if(!await api('/rest/v1/rpc/c14_download_attempt',{p_key:client,p_failed:false}))return reply(429,'시도가 많습니다. 15분 후 다시 시도해 주세요.');
    if(input.password!==password){const allowed=await api('/rest/v1/rpc/c14_download_attempt',{p_key:client,p_failed:true});return reply(allowed?401:429,allowed?'비밀번호가 맞지 않습니다.':'시도가 많습니다. 15분 후 다시 시도해 주세요.');}
    const signed=await api('/storage/v1/object/sign/c14-audit/'+input.file,{expiresIn:60});
    if(typeof signed.signedURL!=='string'||!signed.signedURL.startsWith('/object/sign/c14-audit/'))throw Error('Invalid URL');
    return Response.json({url:url+'/storage/v1'+signed.signedURL,expiresIn:60},{headers});
  }catch{return reply(503,'다운로드 연결이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.');}
});
