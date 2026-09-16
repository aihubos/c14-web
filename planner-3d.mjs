const MM = 0.001;

export async function create3D(container, floor, onSelect = () => {}) {
  if (!container) throw new Error('3D container is required');
  const { Scene, PerspectiveCamera, WebGLRenderer, AmbientLight, DirectionalLight,
    Group, Mesh, MeshStandardMaterial, BoxGeometry, CylinderGeometry, PlaneGeometry,
    ShapeGeometry, LineBasicMaterial, BufferGeometry, Float32BufferAttribute, Line, Raycaster, Vector2,
    Color } = await import('./assets/planner-vendor/three.module.js');
  const { OrbitControls } = await import('./assets/planner-vendor/OrbitControls.js?v=2');
  const scene = new Scene(); scene.background = new Color('#f6f8fb');
  const camera = new PerspectiveCamera(45, 1, 0.01, 1000);
  const renderer = new WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.shadowMap.enabled = true;
  renderer.domElement.setAttribute('aria-label', '52A 3D 가구 배치 미리보기'); container.replaceChildren(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = false; controls.screenSpacePanning = true;
  const root = new Group(); scene.add(root); const itemMeshes = new Map(); const raycaster = new Raycaster(); const pointer = new Vector2(); let moved=false; let downX=0,downY=0;
  scene.add(new AmbientLight(0xffffff, 1.8)); const sun = new DirectionalLight(0xffffff, 1.2); sun.position.set(5, 10, 4); sun.castShadow = true; scene.add(sun);
  const bounds = floor.bounds || [0, 0, 11870, 8190]; let lowWalls = false; let project = { items: [] };
  const world = (x, y) => [(x - (bounds[0] + bounds[2]) / 2) * MM, 0, (y - (bounds[1] + bounds[3]) / 2) * MM];
  const mat = (color = '#dce5ef') => new MeshStandardMaterial({ color, roughness: .8, metalness: .05 });
  const clear = () => { root.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});root.clear();itemMeshes.clear(); };
  function line(a, b, y, material) { const [x1,,z1] = world(a[0], a[1]); const [x2,,z2] = world(b[0], b[1]); const g = new BufferGeometry().setFromPoints([{x:x1,y,z:z1},{x:x2,y,z:z2}].map(p => ({...p, isVector3:true}))); return new Line(g, material); }
  function rebuild() {
    clear();
    const floorMat = mat('#ffffff'); const [x0,,z0] = world(bounds[0], bounds[1]); const [x1,,z1] = world(bounds[2], bounds[3]);
    const base = new Mesh(new PlaneGeometry(Math.abs(x1-x0), Math.abs(z1-z0)), floorMat); base.rotation.x = -Math.PI/2; base.position.set((x0+x1)/2,-.03,(z0+z1)/2); base.receiveShadow = true; root.add(base);
    const wallMat = mat('#94a3b8'); (floor.walls || []).forEach(w => { const [ax,,az] = world(...w.a), [bx,,bz] = world(...w.b); const len=Math.hypot(bx-ax,bz-az), thick=(w.thickness||150)*MM, height=(lowWalls?700:(project.ceilingHeight||2300))*MM; const m=new Mesh(new BoxGeometry(len,height,thick), wallMat); m.position.set((ax+bx)/2,height/2,(az+bz)/2); m.rotation.y=-Math.atan2(bz-az,bx-ax); root.add(m); });
    (floor.fixtures || []).forEach(f => { const [x,,z]=world(f.x,f.y); const m=new Mesh(new BoxGeometry(f.w*MM,f.h*MM,f.d*MM),mat(f.color||'#d4dbe4')); m.position.set(x,(f.h||300)*MM/2,z); m.userData.fixture=true; root.add(m); });
    const glass = new MeshStandardMaterial({color:'#55b7e8', transparent:true, opacity:.7, metalness:.1});
    (floor.windows || []).forEach(w => { const [ax,,az]=world(...w.a), [bx,,bz]=world(...w.b); const len=Math.hypot(bx-ax,bz-az); const m=new Mesh(new BoxGeometry(len,120*MM,28*MM),glass); m.position.set((ax+bx)/2,900*MM,(az+bz)/2); m.rotation.y=-Math.atan2(bz-az,bx-ax); root.add(m); });
    const doorMat = new MeshStandardMaterial({color:'#d59b63'});
    (floor.doors || []).forEach(d => { const [x,,z]=world(d.x,d.y); const m=new Mesh(new BoxGeometry((d.width||900)*MM,30*MM,40*MM),doorMat); m.position.set(x,15*MM,z); m.rotation.y=-(d.angle||0)*Math.PI/180; root.add(m); });
    (floor.rooms || []).forEach(r => { const pts=(r.polygon||[]).map(p=>world(p[0],p[1])); if(pts.length>2){ const verts=[]; for(let k=1;k<pts.length-1;k++) verts.push(pts[0][0],.005,pts[0][2],pts[k][0],.005,pts[k][2],pts[k+1][0],.005,pts[k+1][2]); const g=new BufferGeometry(); g.setAttribute('position',new Float32BufferAttribute(verts,3)); const m=new Mesh(g,new MeshStandardMaterial({color:r.color||'#eef2f7',side:2})); root.add(m); } });
    (project.items || []).forEach(addItem);
    render();
  }
  function addItem(i) {
    const [x,,z]=world(i.x,i.y),group=new Group();group.position.set(x,0,z);group.rotation.y=-i.rotation*Math.PI/180;
    const w=i.w*MM,d=i.d*MM,h=i.h*MM;
    const box=(bw,bh,bd,bx,by,bz,color=i.color)=>{const m=new Mesh(new BoxGeometry(bw,bh,bd),mat(color));m.position.set(bx,by,bz);m.castShadow=true;m.userData.itemId=i.id;group.add(m);};
    if(i.type==='bed'){box(w,h*.45,d,0,h*.225,0);box(w,h*.55,.07,0,h*.725,-d/2+.035);box(w*.8,.09,d*.18,0,h*.45+.045,-d*.32,'#f7f3ec');}
    else if(i.type.includes('sofa')){box(w,h*.52,d,0,h*.26,0);box(w,h*.48,d*.18,0,h*.76,-d*.41);box(w*.09,h*.25,d,-w*.455,h*.645,0);box(w*.09,h*.25,d,w*.455,h*.645,0);if(i.type==='corner-sofa')box(w*.35,h*.2,d*.6,w*.3,h*.62,d*.1);}
    else if(['coffee','dining','desk','vanity'].includes(i.type)){box(w,h*.12,d,0,h*.94,0);for(const sx of [-1,1])for(const sz of [-1,1])box(Math.min(.07,w*.1),h*.88,Math.min(.07,d*.1),sx*w*.4,h*.44,sz*d*.4);}
    else if(i.type==='round-table'){const top=new Mesh(new CylinderGeometry(w/2,w/2,h*.12,32),mat(i.color));top.scale.z=d/w;top.position.y=h*.94;top.userData.itemId=i.id;group.add(top);box(w*.18,h*.88,d*.18,0,h*.44,0);}
    else box(w,h,d,0,h/2,0);
    root.add(group);itemMeshes.set(i.id,group);
  }
  function fit() { const cx=(bounds[0]+bounds[2])/2, cy=(bounds[1]+bounds[3])/2; const span=Math.max(bounds[2]-bounds[0],bounds[3]-bounds[1])*MM; camera.position.set(0,span*.85,span*.9); camera.lookAt(...world(cx,cy).map((v,j)=>j===1?0:v)); controls.target.set(0,0,0); controls.update(); }
  function render(){ renderer.render(scene,camera); }
  renderer.domElement.addEventListener('pointerdown', e=>{downX=e.clientX;downY=e.clientY;moved=false}); renderer.domElement.addEventListener('pointermove', e=>{if(Math.hypot(e.clientX-downX,e.clientY-downY)>6)moved=true}); renderer.domElement.addEventListener('pointerup', e=>{ if(moved)return; const r=renderer.domElement.getBoundingClientRect(); pointer.x=((e.clientX-r.left)/r.width)*2-1; pointer.y=-((e.clientY-r.top)/r.height)*2+1; raycaster.setFromCamera(pointer,camera); const hit=raycaster.intersectObjects([...itemMeshes.values()].flatMap(g=>g.children),true)[0]; if(hit?.object?.userData?.itemId) onSelect(hit.object.userData.itemId); });
  const resize=()=>{ const r=container.getBoundingClientRect(); renderer.setSize(Math.max(1,r.width),Math.max(1,r.height),false); camera.aspect=Math.max(1,r.width)/Math.max(1,r.height); camera.updateProjectionMatrix(); render(); }; const resizeObserver=new ResizeObserver(resize); resizeObserver.observe(container);
  const api={ update(next){ project=next||{items:[]}; rebuild(); }, focusRoom(room){ if(!room){fit();return;} const pts=room.polygon;const p=[(Math.min(...pts.map(p=>p[0]))+Math.max(...pts.map(p=>p[0])))/2,(Math.min(...pts.map(p=>p[1]))+Math.max(...pts.map(p=>p[1])))/2]; const [x,,z]=world(p[0],p[1]); controls.target.set(x,0,z); camera.position.set(x,Math.max(2,Math.abs(bounds[2]-bounds[0])*MM*.35),z+Math.max(2,Math.abs(bounds[3]-bounds[1])*MM*.35)); controls.update(); render(); }, setLowWalls(v){lowWalls=Boolean(v);rebuild();}, resize, async capture(){ const old=renderer.getSize(new (await import('./assets/planner-vendor/three.module.js')).Vector2()); const scale=2000/Math.max(old.x,old.y); renderer.setSize(Math.round(old.x*scale),Math.round(old.y*scale),false); render(); const blob=await new Promise(resolve=>renderer.domElement.toBlob(resolve,'image/png')); renderer.setSize(old.x,old.y,false); render(); return blob; }, dispose(){ resizeObserver.disconnect();clear();controls.dispose(); renderer.dispose(); container.replaceChildren(); } }; controls.addEventListener('change',render);api.update(project);fit();resize();return api;
}
