// Fixed upstream counters; only complete snapshots update the daily baseline.
const headers = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'apikey, authorization, content-type','Content-Type':'application/json','Cache-Control':'no-store'};
const commentUrl = 'https://n.news.naver.com/article/template/COMMENT_COUNT?oid=001&aid=0016294017&ticket=news&gnos=news001%2C0016294017';
const reactionUrl = 'https://route-like.naver.com/v1/search/contents?q=NEWS%5Bne_001_0016294017%5D&isDuplication=false&cssIds=MULTI_MOBILE%2CNEWS_MOBILE&pool=news';
let cached = null;
const validCount = value => Number.isSafeInteger(value) && value >= 0;
async function read(url) {
  const response = await fetch(url, {signal:AbortSignal.timeout(8000)});
  if (!response.ok) throw Error('Upstream unavailable');
  return response.json();
}
Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response(null,{headers});
  if (req.method !== 'GET') return new Response(null,{status:405,headers});
  if (cached && Date.now() - cached.time < 60000 && Math.floor((Date.now()+32400000)/86400000) === Math.floor((cached.time+32400000)/86400000)) return Response.json(cached.data,{headers});
  const [comments,reactions] = await Promise.allSettled([read(commentUrl),read(reactionUrl)]);
  const c = comments.status === 'fulfilled' ? comments.value.component?.COMMENT_COUNT?.value : null;
  const r = reactions.status === 'fulfilled' ? reactions.value.contents?.find(item => item.contentsId === 'ne_001_0016294017') : null;
  const commentCount = c?.objectId === 'news001,0016294017' && validCount(c.count) ? c.count : null;
  const reactionCount = r?.isDisplay === true && Array.isArray(r.reactions) && r.reactions.length > 0 && r.reactions.every(item => validCount(item.count))
    ? r.reactions.reduce((sum,item) => sum + item.count,0) : null;
  const checkedAt = new Date().toISOString();
  let deltas = {commentDelta:null,reactionDelta:null,baselineCheckedAt:null,historyAvailable:false};
  try {
    const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const response=await fetch(Deno.env.get('SUPABASE_URL')+'/rest/v1/rpc/c14_article_snapshot',{
      method:'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},
      body:JSON.stringify({p_id:'yonhap-newhome-20260907',p_comments:commentCount,p_reactions:reactionCount,p_checked_at:checkedAt}),signal:AbortSignal.timeout(4000)
    });
    if(response.ok)deltas={...await response.json(),historyAvailable:true};
  } catch {}
  const data = {articles:[{id:'yonhap-newhome-20260907',commentCount,reactionCount,checkedAt,...deltas,platform:'네이버',reactionLabel:'공감·추천'}]};
  if (commentCount !== null && reactionCount !== null) cached = {time:Date.now(),data};
  return Response.json(data,{headers});
});
