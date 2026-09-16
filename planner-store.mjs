import {validateProject} from './planner-model.mjs';
import {createClient} from './assets/planner-vendor/supabase.mjs';
import {PROJECT_URL,PUBLIC_KEY} from './backend.mjs';
export const auth=createClient(PROJECT_URL,PUBLIC_KEY,{auth:{storageKey:'c14-planner-auth',detectSessionInUrl:false,persistSession:true,autoRefreshToken:true}});
const check=({data,error})=>{if(error)throw error;return data;};
export async function session(){return check(await auth.auth.getSession()).session;}
export async function requestCode(email){return check(await auth.auth.signInWithOtp({email,options:{shouldCreateUser:true}}));}
export async function verifyCode(email,token){return check(await auth.auth.verifyOtp({email,token,type:'email'}));}
export async function listPlans(){return check(await auth.from('c14_plans').select('id,data,revision,updated_at').order('updated_at',{ascending:false}));}
export async function savePlan(project){return check(await auth.rpc('c14_save_plan',{p_id:project.id,p_data:project,p_revision:project.revision||0}));}
export async function deletePlan(id){return check(await auth.from('c14_plans').delete().eq('id',id));}
export async function sharePlan(id,details){return check(await auth.rpc('c14_share_plan',{p_id:id,p_details:details}));}
export async function getShare(id){return check(await auth.rpc('c14_read_plan_share',{p_id:id}));}
export async function ownShare(id){return check(await auth.from('c14_plan_shares').select('id').eq('plan_id',id).maybeSingle());}
export async function stopShare(id){return check(await auth.from('c14_plan_shares').delete().eq('plan_id',id));}
export const draftKey=user=>`c14-planner-drafts:${user?.id||'guest'}`;
export function drafts(user){try{const list=JSON.parse(localStorage.getItem(draftKey(user))||'[]');return Array.isArray(list)?list.filter(p=>{try{validateProject(p);return true;}catch{return false;}}):[];}catch{return [];}}
export function saveDraft(user,project){const list=drafts(user).filter(p=>p.id!==project.id);list.unshift({...project,localUpdatedAt:new Date().toISOString()});if(list.length>20)throw Error('이 기기의 배치안이 20개입니다. 내 배치에서 정리해 주세요.');localStorage.setItem(draftKey(user),JSON.stringify(list));}
export function removeDraft(user,id){localStorage.setItem(draftKey(user),JSON.stringify(drafts(user).filter(p=>p.id!==id)));}
