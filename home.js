import {koreaDay,daysUntil,upcoming,distanceMeters,distanceLabel} from './resident-guide.mjs';
const $=selector=>document.querySelector(selector);
const all=selector=>[...document.querySelectorAll(selector)];
const node=(tag,text,className)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;};
const external=(url,text,className)=>{const a=node('a',text,className);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;};
async function readData(file){const response=await fetch(file,{signal:AbortSignal.timeout(15000)});if(!response.ok)throw new Error(file);return response.json();}
// Keep previously shared policy anchors working; authentication fragments stay on this page.
if(['#issue','#timeline','#calculator','#quote','#downloads','#sources'].includes(location.hash))location.replace('index.html'+location.hash);
const today=koreaDay();
const days=daysUntil('2028-07-01',today);$('[data-countdown]').textContent=days?'D−'+days.toLocaleString('ko-KR'):'입주 예정월';

const tabs=all('[data-plan]');
function selectPlan(tab){tabs.forEach(t=>{t.setAttribute('aria-selected',String(t===tab));t.tabIndex=t===tab?0:-1;});all('.plan-panel').forEach(panel=>{panel.hidden=panel.id!==tab.getAttribute('aria-controls');});}
tabs.forEach((tab,i)=>{
  tab.addEventListener('click',()=>selectPlan(tab));
  tab.addEventListener('keydown',e=>{const positions={ArrowRight:(i+1)%tabs.length,ArrowLeft:(i+tabs.length-1)%tabs.length,Home:0,End:tabs.length-1};if(e.key in positions){e.preventDefault();const next=tabs[positions[e.key]];selectPlan(next);next.focus();}});
});
const imageDialog=$('#image-dialog');
all('.plan-zoom').forEach(button=>button.addEventListener('click',()=>{
  const img=button.querySelector('img');imageDialog.querySelector('img').src=button.dataset.full;imageDialog.querySelector('img').alt=img.alt;
  imageDialog.querySelector('p').textContent=img.alt;imageDialog.querySelector('.image-original').href=button.dataset.full;imageDialog.showModal();
}));
imageDialog.querySelector('.dialog-close').addEventListener('click',()=>imageDialog.close());
imageDialog.addEventListener('click',e=>{if(e.target===imageDialog)imageDialog.close();});

readData('news.json').then(items=>{
  if(!Array.isArray(items))throw Error('news');
  const list=$('[data-news-list]');list.replaceChildren();
  items.sort((a,b)=>b.published.localeCompare(a.published)).forEach(item=>{
    const a=external(item.url,undefined,'news-card');a.append(node('small',item.publisher+' · '+item.published),node('h3',item.title),node('p',item.summary),node('span','기사 원문 읽기 ↗','news-more'));list.append(a);
  });
}).catch(()=>{$('[data-news-list]').textContent='기사를 불러오지 못했습니다. 잠시 후 새로고침해 주세요.';});

readData('resident-timeline.json').then(items=>{
  if(!Array.isArray(items))throw Error('timeline');
  const list=$('.resident-timeline-list'),future=upcoming(items,today),next=future[0];
  const banner=$('[data-next-event]');
  if(next?.id!=='aircon'){
    banner.href=next?'#step-'+next.id:'#resident-timeline';
    banner.querySelector('.event-date small').textContent='입주 준비';banner.querySelector('.event-date strong').textContent='예정';
    banner.querySelector('.event-info strong').textContent=next?.title||'전체 일정 확인';
    banner.querySelector('.event-info>span').textContent='새로운 공식 안내를 확인해 주세요';
  }else if(next.startDate<=today){banner.querySelector('.eyebrow').textContent='진행 중인 일정';}
  function renderSchedule(filter){
    all('[data-schedule-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.scheduleFilter===filter)));
    list.replaceChildren();const shown=filter==='all'?items:future;
    if(!shown.length){list.append(node('p','현재 공고된 예정 일정이 없습니다. 전체 일정과 공식 공지를 확인하세요.'));return;}
    shown.forEach(item=>{
      const article=node('article',undefined,'resident-step'+(item===next?' upcoming':''));article.id='step-'+item.id;article.tabIndex=-1;
      const past=item.endDate&&item.endDate<today;
      const meta=node('div',undefined,'step-meta');meta.append(node('span',item.date,'step-date'),node('span',past?'지난 일정':item.status==='confirmed'?'공고된 일정':'추후 안내','step-badge status-'+item.status));
      const content=node('div',undefined,'step-content');content.append(node('h3',item.title),node('p',item.body));
      const details=node('details');details.append(node('summary','준비물 · 유의사항 보기'));
      const columns=node('div',undefined,'step-details');
      [['준비할 것',item.prepare],['유의할 점',item.cautions]].forEach(([label,values])=>{const col=node('div');col.append(node('h4',label));const ul=node('ul');values.forEach(value=>ul.append(node('li',value)));col.append(ul);columns.append(col);});
      details.append(columns);content.append(details,external(item.sourceUrl,item.sourceLabel+' · '+item.sourcePage+' ↗','step-source'));article.append(meta,content);list.append(article);
    });
  }
  function revealHash(){
    const id=location.hash.slice(1);if(!id.startsWith('step-')||!items.some(item=>'step-'+item.id===id))return;
    if(!document.getElementById(id))renderSchedule('all');
    const article=document.getElementById(id);article.querySelector('details').open=true;article.scrollIntoView({block:'start'});article.focus({preventScroll:true});
  }
  all('[data-schedule-filter]').forEach(b=>b.addEventListener('click',()=>renderSchedule(b.dataset.scheduleFilter)));
  banner.addEventListener('click',()=>{const target=banner.hash.slice(1);if(!document.getElementById(target))renderSchedule('all');const step=document.getElementById(target);if(step?.querySelector('details'))step.querySelector('details').open=true;});
  renderSchedule('upcoming');revealHash();addEventListener('hashchange',revealHash);
}).catch(()=>{$('.resident-timeline-list').textContent='일정을 불러오지 못했습니다. 아래 자료실의 공식 공고문을 확인해 주세요.';});

readData('neighborhood.json').then(data=>{
  if(!Array.isArray(data.places)||!Number.isFinite(data.origin?.lat)||!Number.isFinite(data.origin?.lon))throw Error('places');
  const places=data.places.map((p,i)=>({...p,number:i+1,distance:distanceMeters(data.origin,p)}));
  const list=$('[data-place-list]'),detail=$('[data-place-detail]'),mapBox=$('#neighborhood-map');
  let filter='all',selected=places[0].id,map=null,markerLayer=null,line=null,ready=false;
  const markers=new Map(),cards=new Map(),shown=()=>places.filter(p=>filter==='all'||p.category===filter);
  const point=p=>[p.lat,p.lon];
  function icon(place,active=false){return L.divIcon({className:'c14-map-marker'+(active?' selected':''),html:`<span>${place.number}</span>`,iconSize:[30,30],iconAnchor:[15,15]});}
  function selectPlace(id,fromMap=false){
    const place=places.find(p=>p.id===id);if(!place)return;selected=id;
    cards.forEach((card,key)=>card.setAttribute('aria-pressed',String(key===id)));
    if(fromMap){const card=cards.get(id);if(card)list.scrollTop=card.offsetTop-list.offsetTop-12;}
    const info=node('div');info.append(node('div',place.label+' · C14 기준 '+distanceLabel(place.distance)+' 직선거리','detail-label'),node('h3',place.name),node('p',place.address),node('p',place.description));
    if(place.assignment)info.append(node('p',place.assignment,'assignment'));
    const links=node('div',undefined,'detail-links');links.append(external(place.officialUrl,'공식 안내 보기 ↗'),external('https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(place.address+' '+place.name),'지도에서 위치 확인 ↗'));
    detail.replaceChildren(info,links);
    if(map){
      markers.forEach((marker,key)=>marker.setIcon(icon(places.find(p=>p.id===key),key===id)));
      if(line)map.removeLayer(line);line=L.polyline([point(data.origin),point(place)],{color:'#1762d1',weight:2,dashArray:'5 7',opacity:.75,interactive:false}).addTo(map);
      if(!fromMap)map.fitBounds([point(data.origin),point(place)],{padding:[65,65],maxZoom:16,animate:false});
      const popup=node('div');popup.append(node('div',place.name,'map-popup-title'),node('div','C14 기준 '+distanceLabel(place.distance)+' · 직선거리'));
      markers.get(id)?.bindPopup(popup,{autoPanPadding:[16,16]}).openPopup();
    }
  }
  function renderPlaces(fit=true){
    list.replaceChildren();cards.clear();
    shown().forEach(p=>{const button=node('button',undefined,'place-card');button.type='button';button.setAttribute('aria-pressed',String(p.id===selected));const content=node('span',undefined,'place-card-content');content.append(node('strong',p.name),node('small',p.label+(p.category==='elementary'&&p.number===1?' · 공고상 배치 계획':'')));button.append(node('span',String(p.number),'place-number'),content,node('span',distanceLabel(p.distance),'place-distance'));button.addEventListener('click',()=>selectPlace(p.id));list.append(button);cards.set(p.id,button);});
    list.scrollTop=0;
    if(map){markerLayer.clearLayers();markers.clear();shown().forEach(p=>{const marker=L.marker(point(p),{icon:icon(p,p.id===selected),title:p.name,alt:p.name,keyboard:true}).addTo(markerLayer);marker.on('click',()=>selectPlace(p.id,true));markers.set(p.id,marker);});if(fit)map.fitBounds([point(data.origin),...shown().map(point)],{padding:[45,45],maxZoom:16,animate:false});}
  }
  all('[data-map-filter]').forEach(button=>button.addEventListener('click',()=>{
    filter=button.dataset.mapFilter;all('[data-map-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    if(!shown().some(p=>p.id===selected))selected=shown()[0]?.id;
    renderPlaces();selectPlace(selected,true);
  }));
  $('[data-map-reset]').addEventListener('click',()=>{filter='all';all('[data-map-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mapFilter==='all')));renderPlaces();if(line){map.removeLayer(line);line=null;}markers.forEach(m=>m.closePopup());});
  renderPlaces();selectPlace(selected);
  function initMap(){
    if(ready)return;ready=true;
    if(!globalThis.L){mapBox.replaceChildren(node('p','지도를 불러오지 못했습니다. 장소별 지도 링크를 이용해 주세요.','map-loading'));$('[data-map-error]').hidden=false;return;}
    mapBox.replaceChildren();map=L.map(mapBox,{scrollWheelZoom:false,zoomControl:true,attributionControl:true});
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'}).on('tileerror',()=>{$('[data-map-error]').hidden=false;}).addTo(map);
    [500,1000].forEach(radius=>L.circle(point(data.origin),{radius,color:'#4d79a6',weight:1,fillColor:'#679fda',fillOpacity:.04,interactive:false}).addTo(map));
    L.marker(point(data.origin),{icon:L.divIcon({className:'c14-map-marker c14-origin',html:'<span>C14</span>',iconSize:[50,34],iconAnchor:[25,17]}),title:'화성동탄2 C14 기준점',alt:'C14 단지 기준점',zIndexOffset:1000}).addTo(map).bindPopup(node('div','C14 · 공사 부지 근사 중심점'));
    markerLayer=L.layerGroup().addTo(map);renderPlaces();selectPlace(selected,true);
    new ResizeObserver(()=>map.invalidateSize({pan:false})).observe(mapBox);
  }
  const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){initMap();observer.disconnect();}},{rootMargin:'200px'});observer.observe(mapBox);
}).catch(()=>{$('[data-place-list]').textContent='주변 정보를 불러오지 못했습니다. 아래 공식 위치 안내도를 확인하세요.';$('#neighborhood-map').replaceChildren(node('p','공식 위치 안내도에서 단지 주변을 확인할 수 있습니다.','map-loading'));});
