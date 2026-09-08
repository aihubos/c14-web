// Preserve previously shared resident links and administrator email callbacks.
export function isResidentEntry(hash) {
  const anchor = hash.slice(1);
  const auth = new URLSearchParams(anchor);
  return ['resident-timeline','complex','layout','plans','neighborhood','library','news','board'].includes(anchor)
    || anchor.startsWith('step-') || auth.has('access_token') || auth.has('error_description');
}
if (typeof window !== 'undefined' && isResidentEntry(location.hash)) {
  location.replace('residents.html' + location.search + location.hash);
}
if (typeof process !== 'undefined' && process.argv.includes('--check')) {
  const {default:assert} = await import('node:assert/strict');
  for (const hash of ['#board','#resident-timeline','#step-aircon','#access_token=example&expires_in=3600','#error_description=expired']) assert(isResidentEntry(hash), hash);
  for (const hash of ['','#top','#issue','#timeline','#calculator','#sources','#not_access_token=example']) assert(!isResidentEntry(hash), hash);
  console.log('Entry routes passed');
}
