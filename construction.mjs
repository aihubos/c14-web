import {koreaDay,daysUntil} from './resident-guide.mjs';
export function constructionState(now=new Date()){
 const day=koreaDay(now),hour=Number(new Intl.DateTimeFormat('en',{timeZone:'Asia/Seoul',hour:'2-digit',hourCycle:'h23'}).format(now));
 const progress=Math.min(1,Math.max(0,(Date.parse(day)-Date.parse('2025-08-01'))/(Date.parse('2028-07-01')-Date.parse('2025-08-01'))));
 return {days:daysUntil('2028-07-01',day),night:hour<6||hour>=18,progress,floors:Math.max(1,Math.round(progress*24))};
}
export const constructionMotion=ms=>({build:Math.min(1,(Math.max(0,ms)%18000)/6500),travel:Math.sin(ms/3800),phase:ms/4500});
if(typeof document!=='undefined')for(const host of document.querySelectorAll('[data-construction]')){
 host.innerHTML=`<div class="build-copy"><p class="eyebrow">동탄역 어반원 · 함께 기다리는 우리 집</p><h2>우리의 내일이<br>차곡차곡 올라갑니다.</h2><p>입주 예정 <strong>2028년 7월</strong></p><a href="residents.html#resident-timeline">입주 준비 일정 보기 ↗</a></div><div class="build-card"><div class="build-heading"><span>입주 예정월까지</span><strong data-build-day></strong><span data-build-sky></span></div><div class="build-scene" role="img" aria-label="일정에 따라 골조가 자라는 아파트 3D 모형"><span class="build-fallback">우리 집을 짓는 중</span></div><div class="build-caption"><span>골조부터, 차곡차곡 · 18초 모션</span><button type="button" data-build-pause aria-pressed="false">모션 일시정지</button></div><p class="build-disclaimer">일정 기반의 상징적 모형으로 실제 공정률·동 배치와 다릅니다.<br>D-day는 2028.07.01 기준 · 정확한 입주일은 추후 안내</p></div>`;
 let state,sceneUpdate=()=>{};
 function update(){state=constructionState();host.classList.toggle('is-night',state.night);host.querySelector('[data-build-day]').textContent=state.days?'D−'+state.days.toLocaleString('ko-KR'):'입주 예정월';host.querySelector('[data-build-sky]').textContent=state.night?'☾ 밤':'☀ 낮';sceneUpdate(state);}
 update();let timer=setInterval(update,60000);window.addEventListener('pagehide',()=>clearInterval(timer));window.addEventListener('pageshow',()=>{clearInterval(timer);update();timer=setInterval(update,60000);});
 const container=host.querySelector('.build-scene');
 try{
 const T=await import('./assets/planner-vendor/three.module.js');
 const scene=new T.Scene(),camera=new T.OrthographicCamera(-10,10,8,-8,.1,100);camera.position.set(14,12,17);camera.lookAt(0,3,0);
 const renderer=new T.WebGLRenderer({alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;container.replaceChildren(renderer.domElement);
 const sky=new T.HemisphereLight(0xe8f3ff,0x9b9581,2.5);scene.add(sky);const sun=new T.DirectionalLight(0xfff0d6,3);sun.position.set(-8,17,9);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-12,right:12,top:14,bottom:-12});scene.add(sun);
 const cement=new T.MeshStandardMaterial({color:0xf2e7d4,roughness:.9}),side=new T.MeshStandardMaterial({color:0xb9c6d0,roughness:1}),earth=new T.MeshStandardMaterial({color:0xc6cfb7,roughness:1}),glass=new T.MeshStandardMaterial({color:0x66879d,metalness:.35,roughness:.25});
 const solids=[];function box(w,h,d,x,y,z,mat=cement,parent=scene){const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),mat);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);solids.push(mesh);return mesh;}
 box(12,.4,9,0,-.3,0,side);box(11.6,.08,8.6,0,-.05,0,earth);
 const green=new T.MeshStandardMaterial({color:0x86b8a4,roughness:1}),gold=new T.MeshStandardMaterial({color:0xf0bc61,roughness:.8});
 const decorations=[];function ball(radius,x,y,z,material){const m=new T.Mesh(new T.SphereGeometry(radius,12,10),material);m.position.set(x,y,z);m.castShadow=true;scene.add(m);decorations.push(m);return m;}
 for(const [x,z]of [[-5,-3],[-5,2],[5,-3],[5,2]]){box(.16,.7,.16,x,.3,z,side);ball(.6,x,.95,z,green);ball(.42,x+.2,1.3,z,green);}
 box(.12,5,.12,-4.6,2.5,-2,gold);const boom=new T.Group();boom.position.set(-4.6,5,-2);scene.add(boom);box(4,.12,.15,1.1,0,0,gold,boom);box(.45,.3,.45,-.7,-.12,0,side,boom);const rope=box(.025,1.1,.025,3,-.55,0,side,boom),hook=box(.22,.16,.22,3,-1.15,0,gold,boom);
 const truck=new T.Group();scene.add(truck);box(1.35,.35,.72,-.25,.46,0,gold,truck);box(.58,.65,.72,.7,.6,0,cement,truck);box(.025,.28,.5,1,.71,0,glass,truck);box(.75,.3,.55,-.25,.77,0,side,truck);
 const tires=new T.MeshStandardMaterial({color:0x43556b,roughness:1});for(const x of [-.55,.65])for(const z of [-.39,.39]){const wheel=new T.Mesh(new T.CylinderGeometry(.19,.19,.1,12),tires);wheel.rotation.x=Math.PI/2;wheel.position.set(x,.23,z);truck.add(wheel);}
 const workers=[];for(let i=0;i<3;i++){const person=new T.Group();scene.add(person);box(.2,.3,.17,0,.42,0,i===1?green:gold,person);const head=new T.Mesh(new T.SphereGeometry(.12,12,8),cement);head.position.y=.7;person.add(head);const helmet=new T.Mesh(new T.SphereGeometry(.145,12,8),gold);helmet.scale.y=.55;helmet.position.y=.78;person.add(helmet);const legs=[box(.065,.23,.07,-.065,.15,0,tires,person),box(.065,.23,.07,.065,.15,0,tires,person)];workers.push({person,legs});}
 const levels=[];for(const [x,z,total]of [[-2.7,1,24],[2.3,-1.8,22]])for(let n=0;n<total;n++){
 const group=new T.Group();group.position.set(x,n*.42,z);scene.add(group);box(2.9,.07,2.5,0,.06,0,cement,group);
 for(const a of [-1.25,0,1.25])for(const b of [-1.05,1.05])box(.13,.42,.13,a,.26,b,side,group);
 const facade=box(2.5,.32,.045,0,.26,1.11,glass,group);levels.push({group,facade,n,total});}
 for(let i=0;i<7;i++)box(.48,.3,.48,-4.7+i*1.45,.13,3.5,cement);
 // Symbolic construction sequence; never represents observed site completion.
 let paused=matchMedia('(prefers-reduced-motion: reduce)').matches,visible=true,frame,lastTick=null,motionTime=paused?7000:0;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');const pauseButton=host.querySelector('[data-build-pause]');
 function syncButton(){pauseButton.textContent=paused?'모션 재생':'모션 일시정지';pauseButton.setAttribute('aria-pressed',String(paused));}syncButton();
 function render(t=performance.now()){cancelAnimationFrame(frame);if(lastTick!==null&&visible&&!paused&&!document.hidden)motionTime+=Math.max(0,t-lastTick);lastTick=t;const motion=constructionMotion(motionTime),elapsed=motion.build;for(const l of levels){const target=Math.max(1,Math.round(state.progress*l.total));const amount=Math.max(0,Math.min(1,elapsed*target-l.n));l.group.visible=amount>0;l.group.scale.y=Math.max(.001,amount);l.facade.visible=state.progress>.65&&l.n<target-3;}
 {const phase=motion.phase;boom.rotation.y=Math.sin(phase)*.28;const length=1.1+Math.sin(phase*1.4)*.12;rope.scale.y=length/1.1;rope.position.y=-length/2;hook.position.y=-length-.05;truck.position.set(motion.travel*3.8,0,3);truck.rotation.y=Math.cos(motionTime/3800)>=0?0:Math.PI;workers.forEach(({person,legs},i)=>{const phase=motionTime/2400+i*2;person.position.set(Math.sin(phase)*4.5,0,i===2?-3.5:4);person.rotation.y=Math.cos(phase)>=0?Math.PI/2:-Math.PI/2;legs.forEach((leg,j)=>leg.rotation.x=Math.sin(motionTime/150+j*Math.PI+i)*.3);});}renderer.render(scene,camera);if(visible&&!paused&&!document.hidden)frame=requestAnimationFrame(render);}
 sceneUpdate=s=>{sky.intensity=s.night?1.1:2.5;sun.intensity=s.night?1.2:3;sun.color.set(s.night?0xb5caff:0xfff0d6);glass.emissive.set(s.night?0x796332:0x000000);render();};sceneUpdate(state);
 pauseButton.onclick=()=>{paused=!paused;lastTick=null;syncButton();render();};reduced.addEventListener('change',e=>{paused=e.matches;syncButton();render();});
 const observer=new ResizeObserver(()=>{const r=container.getBoundingClientRect();renderer.setSize(r.width,r.height,false);const aspect=r.width/r.height;const halfHeight=Math.max(6.5,8.5/aspect);camera.top=halfHeight;camera.bottom=-halfHeight;camera.left=-halfHeight*aspect;camera.right=halfHeight*aspect;camera.updateProjectionMatrix();render();});observer.observe(container);
 new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;lastTick=null;if(visible)render();else cancelAnimationFrame(frame);}).observe(container);
 document.addEventListener('visibilitychange',()=>{lastTick=null;if(document.hidden)cancelAnimationFrame(frame);else render();});window.addEventListener('pagehide',()=>cancelAnimationFrame(frame));window.addEventListener('pageshow',()=>render());
 }catch{container.innerHTML='<span class="build-fallback">🏗️<br>입주를 함께 기다립니다</span>';host.querySelector('[data-build-pause]').hidden=true;}
}
if(typeof process!=='undefined'&&process.argv.includes('--check')){const {strict:a}=await import('node:assert');a.equal(constructionState(new Date('2026-09-22T09:00:00Z')).night,true);a.equal(constructionState(new Date('2026-09-22T00:00:00Z')).night,false);a.equal(constructionState(new Date('2028-06-30T15:00:00Z')).days,0);a.equal(constructionState(new Date('2030-01-01')).progress,1);a.equal(constructionState(new Date('2020-01-01')).progress,0);a.equal(constructionMotion(0).build,0);a.equal(constructionMotion(6500).build,1);a.equal(constructionMotion(18000).build,0);a.ok(Math.abs(constructionMotion(10000).travel)<=1);console.log('PASS: KST dates, growth cycle and traffic bounds');}
