export const LANGUAGES=['ko','en','zh','es'];
const spanish=new Set(['ES','MX','AR','BO','CL','CO','CR','CU','DO','EC','SV','GQ','GT','HN','NI','PA','PY','PE','PR','UY','VE']);
export function browserLanguage(languages=[]){for(const item of languages){const lang=String(item).toLowerCase().split('-')[0];if(LANGUAGES.includes(lang))return lang;}return 'en';}
export function recommendLanguage(country,languages=[]){const code=String(country||'').toUpperCase();if(code==='KR')return 'ko';if(['CN','TW','HK','MO'].includes(code))return 'zh';if(spanish.has(code))return 'es';if(/^[A-Z]{2}$/.test(code))return 'en';return browserLanguage(languages);}
