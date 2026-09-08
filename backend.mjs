export const PROJECT_URL = 'https://gledekahwxiofzpfybdg.supabase.co';
// 브라우저 공개용 키. 관리자 권한은 DB에서 검증하며 비밀 키를 사용하지 않습니다.
export const PUBLIC_KEY = 'sb_publishable_Ax3jGUOpRvTDwTGJrkpEhQ_nhXFpx2F';
export async function api(path, {method='GET', body, token, headers={}}={}) {
  const response = await fetch(PROJECT_URL + path, {
    method, headers:{apikey:PUBLIC_KEY, ...(token ? {Authorization:'Bearer '+token}:{}),
      ...(body!==undefined ? {'Content-Type':'application/json'}:{}), ...headers},
    ...(body!==undefined ? {body:JSON.stringify(body)}:{}), signal:AbortSignal.timeout(15000)
  });
  const text = await response.text();
  let data; try { data = text ? JSON.parse(text) : null; } catch { throw Error('서버 응답을 확인하지 못했습니다. 다시 시도해 주세요.'); }
  if (!response.ok) {
    const error = Error(response.status===401 ? '로그인 시간이 만료되었습니다. 다시 로그인해 주세요.' :
      response.status===429 ? '요청이 많습니다. 잠시 후 다시 시도해 주세요.' :
      data?.message || data?.msg || '요청을 처리하지 못했습니다. 다시 시도해 주세요.');
    error.status = response.status; throw error;
  }
  return data;
}
export const rpc = (name, body={}, token) => api('/rest/v1/rpc/'+name,{method:'POST',body,token});
