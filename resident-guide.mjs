export function koreaDay(now=new Date()){
  const parts=new Intl.DateTimeFormat('en',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  const part=name=>parts.find(p=>p.type===name).value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}
export const daysUntil=(day,today=koreaDay())=>Math.max(0,Math.round((Date.parse(day+'T00:00:00+09:00')-Date.parse(today+'T00:00:00+09:00'))/86400000));
export const upcoming=(items,today=koreaDay())=>items.filter(item=>!item.endDate||item.endDate>=today);
export function distanceMeters(a,b){
  const rad=n=>n*Math.PI/180,lat=rad(b.lat-a.lat),lon=rad(b.lon-a.lon);
  const h=Math.sin(lat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(lon/2)**2;
  return 6371000*2*Math.atan2(Math.sqrt(h),Math.sqrt(Math.max(0,1-h)));
}
export function distanceLabel(meters){
  const rounded=Math.max(50,Math.round(meters/50)*50);
  return rounded>=1000?`약 ${(rounded/1000).toFixed(1)}km`:`약 ${rounded}m`;
}
// One small native check for date boundaries, filtering, and map distance calculations.
if(typeof process!=='undefined'&&process.argv.includes('--check')){
  const {strict:assert}=await import('node:assert');
  assert.equal(koreaDay(new Date('2026-09-07T15:00:00Z')),'2026-09-08');
  assert.equal(koreaDay(new Date('2026-09-07T14:59:59Z')),'2026-09-07');
  assert.equal(daysUntil('2028-07-01','2028-06-30'),1);
  assert.equal(daysUntil('2028-07-01','2028-07-02'),0);
  assert.deepEqual(upcoming([{id:1,endDate:'2026-09-07'},{id:2,endDate:'2026-09-08'},{id:3}], '2026-09-08').map(x=>x.id),[2,3]);
  const p={lat:37.195,lon:127.097};assert.equal(distanceMeters(p,p),0);
  const meters=distanceMeters(p,{lat:37.205,lon:127.097});assert(meters>1111&&meters<1113);
  assert.equal(distanceLabel(550),'약 550m');assert.equal(distanceLabel(1112),'약 1.1km');
  console.log('Resident guide check passed');
}
