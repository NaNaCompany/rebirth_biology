export const STORAGE_KEY='rebirth-biology-fr-play-v1';
export function choose(items,random=Math.random){const total=items.reduce((s,c)=>s+c.probability,0);let cursor=random()*total;for(const c of items){cursor-=c.probability;if(cursor<0)return c;}return items.at(-1);}
export function chooseExcept(items,excludedId,random=Math.random){const eligible=items.filter(c=>c.id!==excludedId);if(!eligible.length)throw new RangeError('Aucun résultat admissible');return choose(eligible,random);}
export function percent(p){const n=p*100;return n>=1?n.toFixed(2):n>=.01?n.toFixed(4):n>=.0001?n.toFixed(6):n.toFixed(Math.min(12,Math.max(6,2-Math.floor(Math.log10(n)))));}
export function loadState(storage){try{const s=JSON.parse(storage?.getItem(STORAGE_KEY));if(s?.version===1&&typeof s.started==='boolean'&&Number.isSafeInteger(s.remaining)&&s.remaining>=0&&Number.isSafeInteger(s.round)&&s.round>=0&&Number.isSafeInteger(s.rewardedRound)&&s.rewardedRound>=-1)return s;}catch{}return {version:1,started:false,remaining:1,round:0,rewardedRound:-1,lastId:null};}
export function spendDraw(s){if(s.started&&s.remaining===0)return false;if(s.started)s.remaining--;s.started=true;s.round++;return true;}
export function rewardShare(s){if(!s.started||s.rewardedRound===s.round)return false;s.remaining+=2;s.rewardedRound=s.round;return true;}
