export function prices(e, l, loan) {
  if (![e, l, loan].every(n => Number.isFinite(n) && n >= 0)) throw new RangeError('0 이상 유한한 숫자를 입력해 주세요.');
  const f = Math.min(e / 2 + l / 2, l);
  return { f, rise: l-e, conversionRise: f-e, gap: l-f, equity: Math.max(0, f-loan) };
}
export function shiftAmount(value, delta) {
  const n = Number(value);
  if (!Number.isFinite(n) || ![-1, 1].includes(delta)) throw new RangeError('금액을 확인해 주세요.');
  return Math.max(0, Math.round((n + delta) * 1e8) / 1e8);
}
// 직접 실행: node calculator.mjs — 화면이 사용하는 같은 산식의 상승·하락·입력 경계 확인.
if (typeof process !== 'undefined' && process.argv[1]?.endsWith('calculator.mjs')) {
  const { deepStrictEqual, throws, strictEqual } = await import('node:assert');
  deepStrictEqual(prices(9,15,5), {f:12,rise:6,conversionRise:3,gap:3,equity:7});
  deepStrictEqual(prices(9,7,5), {f:7,rise:-2,conversionRise:-2,gap:0,equity:2});
  strictEqual(prices(9,15,8).f, 12);
  throws(() => prices(-1,15,5), RangeError);
  throws(() => prices(NaN,15,5), RangeError);
  strictEqual(shiftAmount('9.06894155', 1), 10.06894155);
  strictEqual(shiftAmount('9.06894155', -1), 8.06894155);
  strictEqual(shiftAmount('.5', -1), 0);
  throws(() => shiftAmount('NaN', 1), RangeError);
  console.log('가격 산식 확인 완료');
}
