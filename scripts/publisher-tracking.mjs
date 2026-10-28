import {completeTracking as guardedTracking,publisherHead,PUBLISHER_IDS} from './publisher-core.mjs';
export {publisherHead,PUBLISHER_IDS};
export const publisherCode=publisherHead().match(/<script[^>]*>([\s\S]*?)<\/script>/)[1];
export function completeTracking(source){
 if(!/<html\b/i.test(source))return source;
 if(!/<body\b/i.test(source)){
  const opening=/<html\b[^>]*>/i.exec(source),match=/<(?:a|h1|main|header|div|p)\b/i.exec(source.slice(opening.index+opening[0].length));
  if(!match)throw Error('Cannot locate implicit body');
  const at=opening.index+opening[0].length+match.index;
  source=source.slice(0,at)+'</head><body>'+source.slice(at);
  source=source.replace(/<html\b[^>]*>/i,m=>m+'<head>').replace(/<\/html\s*>/i,'</body></html>');
 }
 return guardedTracking(source);
}
