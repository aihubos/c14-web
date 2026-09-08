import {prices,shiftAmount} from './calculator.mjs';
const money=n=>new Intl.NumberFormat('ko-KR',{maximumFractionDigits:2,minimumFractionDigits:2}).format(n)+'억';
for(const card of document.querySelectorAll('[data-calculator]')){
  const form=card.querySelector('form'),fields=['entry','later','loan'].map(name=>form.elements[name]);
  function update(){
    const values=fields.map(field=>field.value.trim()===''?NaN:Number(field.value));
    const error=card.querySelector('.calc-error');
    let result;
    try{result=prices(...values);error.textContent='';}
    catch{error.textContent='0 이상인 숫자를 모두 입력해 주세요.';}
    card.querySelectorAll('[data-result]').forEach(el=>el.textContent=result?money(result[el.dataset.result]):'—');
    const bar=card.querySelector('.calc-bar');bar.hidden=!result||result.rise<=0;
    const copy=card.querySelector('.calc-copy');
    if(!result){copy.textContent='입력값을 확인하면 계산 결과가 표시됩니다.';return;}
    const {rise,conversionRise,gap}=result;
    bar.children[0].style.flex=String(Math.max(0,conversionRise));bar.children[1].style.flex=String(Math.max(0,gap));
    copy.textContent=rise>0?`감정가 ${money(rise)} 상승 → 전환가 ${money(conversionRise)} 상승 + 감정가와 전환가 차이 ${money(gap)}`:rise<0?`감정가 하락 시 낮은 분양시 감정가를 적용합니다. 전환가 ${money(Math.abs(conversionRise))} 하락.`:'두 감정가가 같으면 해당 감정가를 적용합니다.';
  }
  function shift(field,delta){try{field.value=shiftAmount(field.value,delta);}catch{}update();}
  form.addEventListener('submit',e=>e.preventDefault());
  form.addEventListener('input',update);
  form.addEventListener('keydown',e=>{if(e.target.matches('input')&&['ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();shift(e.target,e.key==='ArrowUp'?1:-1);}});
  card.querySelectorAll('[data-delta]').forEach(button=>button.addEventListener('click',()=>shift(form.elements[button.dataset.field],Number(button.dataset.delta))));
  card.querySelector('[data-reset]').addEventListener('click',()=>{fields[0].value=card.dataset.official;fields[1].value=String(Math.round((Number(card.dataset.official)+6)*1e8)/1e8);fields[2].value=5;update();});
  update();
}
