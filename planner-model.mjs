export const floor = {
 version:'52a-v1',name:'52A 확장형',bounds:[0,0,12000,8800],ceilingHeight:2300,
 source:'도면 제공: 입주민 재재님 · 제공 DWG · A04-002 · 단위세대 평면도(확장형)',
 rooms:[
 {id:'living',name:'거실',polygon:[[3450,4290],[7660,4290],[7660,8525],[3450,8525]],color:'#f1e5d3'},
 {id:'bed2',name:'침실2',polygon:[[180,5390],[3300,5390],[3300,8525],[180,8525]],color:'#e5edf1'},
 {id:'bed1',name:'침실1',polygon:[[7910,4470],[11700,4470],[11700,7940],[7910,7940]],color:'#e5edf1'},
 {id:'kitchen',name:'주방·식당',polygon:[[4480,250],[7790,250],[7790,4040],[3450,4040],[3450,2600],[4480,2600]],color:'#eee6da'},
 {id:'entry',name:'현관',polygon:[[1800,2600],[3300,2600],[3300,5200],[1800,5200]],color:'#e7e8e5'},
 {id:'pantry',name:'팬트리',polygon:[[3350,2700],[4450,2700],[4450,4040],[3350,4040]],color:'#efebe5'},
 {id:'bath2',name:'욕실2',polygon:[[180,3170],[1700,3170],[1700,5390],[180,5390]],color:'#dce8e9'},
 {id:'bath1',name:'욕실1',polygon:[[8090,2175],[9610,2175],[9610,4400],[8090,4400]],color:'#dce8e9'},
 {id:'dress',name:'드레스룸',polygon:[[9800,1930],[11700,1930],[11700,4320],[9800,4320]],color:'#e9e0d7'},
 {id:'balcony',name:'발코니',polygon:[[8050,250],[9780,250],[9780,1700],[8050,1700]],color:'#e2e9e6'},
 {id:'outdoor',name:'실외기실',polygon:[[9950,250],[11700,250],[11700,1700],[9950,1700]],color:'#e2e9e6'}],
 walls:[],doors:[{x:1850,y:2600,width:950,angle:0},{x:3150,y:5350,width:800,angle:180},{x:7900,y:4650,width:850,angle:90},{x:1650,y:4700,width:700,angle:180},{x:9000,y:4370,width:700,angle:180},{x:9800,y:2000,width:730,angle:0}],
 windows:[{a:[900,8645],b:[2670,8645]},{a:[4050,8645],b:[7050,8645]},{a:[8440,8070],b:[10540,8070]},{a:[5500,120],b:[6990,120]}],
 fixtures:[{id:'sink',name:'주방 고정 가구',x:6200,y:650,w:2750,d:650,h:850,color:'#c5c2b9'},{id:'sink-side',name:'주방 고정 가구',x:4800,y:1350,w:600,d:1700,h:850,color:'#c5c2b9'},{id:'bath-a',name:'욕실 고정 설비',x:880,y:3770,w:1100,d:750,h:600,color:'#c3d5d7'},{id:'bath-b',name:'욕실 고정 설비',x:8840,y:2700,w:1100,d:750,h:600,color:'#c3d5d7'},{id:'out-unit',name:'실외기 공간',x:10800,y:850,w:1000,d:600,h:1000,color:'#bcc9c6'}]
};
// Primary wall centerlines traced from the provided A04-002 CAD; openings are separate.
const wall=(a,b,thickness=150)=>floor.walls.push({a,b,thickness});
[[[0,2460],[2300,2460]],[[3350,2460],[4280,2460]],[[4280,2460],[4280,0]],[[4280,0],[5500,0]],[[6990,0],[8250,0]],[[8550,0],[10200,0]],[[11200,0],[12000,0]],[[12000,0],[12000,8190]],[[12000,8190],[10540,8190]],[[8440,8190],[7900,8190]],[[7900,8190],[7900,8800]],[[7900,8800],[7050,8800]],[[4050,8800],[2670,8800]],[[900,8800],[0,8800]],[[0,8800],[0,2460]]].forEach(([a,b])=>wall(a,b,250));
[[[1800,3090],[0,3090]],[[1800,3090],[1800,4700]],[[1800,5400],[0,5400]],[[3300,5400],[3300,8800]],[[3450,4190],[5300,4190]],[[3450,2600],[3450,4190]],[[7800,2050],[7800,4500]],[[7800,5500],[7800,8190]],[[8050,4400],[9000,4400]],[[9700,4400],[12000,4400]],[[9700,4400],[9700,1850]],[[8050,1850],[9800,1850]],[[10530,1850],[12000,1850]],[[9800,0],[9800,1850]]].forEach(([a,b])=>wall(a,b));
export const catalog=[
 ['sofa','일자 소파','거실',2200,900,850,'#6c8a9d'],['corner-sofa','코너 소파','거실',2800,1700,850,'#658292'],['tv','TV장','거실',1800,400,500,'#b8926d'],['coffee','거실 테이블','거실',1000,600,400,'#b8926d'],
 ['bed','침대','침실',1600,2100,950,'#b9a0a0'],['nightstand','협탁','침실',450,400,500,'#b8926d'],['wardrobe','옷장','침실',1600,600,2100,'#c0b6a6'],['drawers','서랍장','침실',800,450,1000,'#b8926d'],['vanity','화장대','침실',900,450,750,'#c6ab92'],
 ['dining','직사각 식탁','주방',1400,800,750,'#b8926d'],['round-table','원형 식탁','주방',1000,1000,750,'#b8926d'],['chair','의자','주방',450,500,850,'#9ca99c'],['fridge','냉장고','주방',900,850,1800,'#becbd0'],
 ['desk','책상','서재·생활',1200,600,750,'#b8926d'],['bookshelf','책장','서재·생활',800,300,1800,'#b8926d'],['washer','세탁기','서재·생활',700,750,1000,'#becbd0'],['dryer','건조기','서재·생활',700,750,1000,'#becbd0'],['custom','직접 만든 가구','직접 입력',1000,600,800,'#8b9bb1']
].map(([type,name,category,w,d,h,color])=>({type,name,category,w,d,h,color}));
export const uid=()=>crypto.randomUUID();
export function item(type,x=5600,y=6000){const c=catalog.find(c=>c.type===type);return {...c,id:uid(),x,y,rotation:0,note:'',url:'',locked:false};}
export function newProject(kind='empty'){const p={id:uid(),schemaVersion:1,title:'나의 52A 배치',floorVersion:floor.version,ceilingHeight:2300,items:[],revision:0};if(kind!=='empty'){p.title=kind==='work'?'재택근무형':'기본 생활형';p.items=[item('sofa',5900,4900),item('tv',5800,8150),item('bed',10200,6100),item('dining',6600,2950),item(kind==='work'?'desk':'bed',1600,6900)];}return p;}
export function validateProject(p){
 if(!p||p.schemaVersion!==1||p.floorVersion!==floor.version)throw Error('지원하지 않는 배치 파일 또는 도면 버전입니다.');
 if(typeof p.title!=='string'||!p.title.trim()||p.title.length>80||!Array.isArray(p.items)||p.items.length>100)throw Error('배치 이름 또는 가구 수를 확인해 주세요.');
 if(!Number.isFinite(p.ceilingHeight)||p.ceilingHeight<2000||p.ceilingHeight>4000)throw Error('천장 높이는 200~400cm로 입력해 주세요.');
 const ids=new Set();for(const i of p.items){if(typeof i.id!=='string'||! /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(i.id)||ids.has(i.id)||!catalog.some(c=>c.type===i.type))throw Error('가구 정보가 올바르지 않습니다.');ids.add(i.id);
 for(const k of ['x','y','w','d','h','rotation'])if(!Number.isFinite(i[k]))throw Error('가구 치수와 위치는 숫자여야 합니다.');
 if(i.w<10||i.d<10||i.h<10||i.w>10000||i.d>10000||i.h>4000||Math.abs(i.x)>20000||Math.abs(i.y)>20000||Math.abs(i.rotation)>360)throw Error('가구 치수·위치 범위를 확인해 주세요.');
 if(typeof i.name!=='string'||!i.name.trim()||i.name.length>80||typeof i.note!=='string'||i.note.length>1000||typeof i.url!=='string'||i.url.length>2000||typeof i.locked!=='boolean'||!/^#[0-9a-f]{6}$/i.test(i.color))throw Error('가구 이름·메모·색상을 확인해 주세요.');
 if(i.url){let u;try{u=new URL(i.url);}catch{throw Error('제품 링크 주소를 확인해 주세요.');}if(!['https:','http:'].includes(u.protocol))throw Error('제품 링크는 http 또는 https만 가능합니다.');}}
 return p;
}
export function corners(i){const r=i.rotation*Math.PI/180,c=Math.cos(r),s=Math.sin(r);return [[-i.w/2,-i.d/2],[i.w/2,-i.d/2],[i.w/2,i.d/2],[-i.w/2,i.d/2]].map(([x,y])=>[i.x+x*c-y*s,i.y+x*s+y*c]);}
export function overlaps(a,b){for(const poly of [a,b])for(let n=0;n<poly.length;n++){const p=poly[n],q=poly[(n+1)%poly.length],axis=[q[1]-p[1],p[0]-q[0]],pa=a.map(v=>v[0]*axis[0]+v[1]*axis[1]),pb=b.map(v=>v[0]*axis[0]+v[1]*axis[1]);if(Math.max(...pa)<=Math.min(...pb)||Math.max(...pb)<=Math.min(...pa))return false;}return true;}
export function wallBox(w){const dx=w.b[0]-w.a[0],dy=w.b[1]-w.a[1];return corners({x:(w.a[0]+w.b[0])/2,y:(w.a[1]+w.b[1])/2,w:Math.hypot(dx,dy),d:w.thickness,rotation:Math.atan2(dy,dx)*180/Math.PI});}
export function issues(i,items){const p=corners(i),out=[];if(p.some(([x,y])=>x<0||y<0||x>12000||y>8800))out.push('집 경계 밖');if(floor.walls.some(w=>overlaps(p,wallBox(w))))out.push('벽과 겹침');if(floor.fixtures.some(f=>overlaps(p,corners({...f,rotation:0}))))out.push('고정 시설과 겹침');if(items.some(o=>o.id!==i.id&&overlaps(p,corners(o))))out.push('다른 가구와 겹침');if(floor.doors.some(d=>{const r=d.angle*Math.PI/180;const sector=[[d.x,d.y],...Array.from({length:13},(_,k)=>[d.x+Math.cos(r+k*Math.PI/24)*d.width,d.y+Math.sin(r+k*Math.PI/24)*d.width])];return overlaps(p,sector);}))out.push('문 열림 영역 확인');return out;}
