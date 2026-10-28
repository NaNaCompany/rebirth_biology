import fs from 'node:fs/promises';
const extra=['ja','de','fr','pt'];
export async function prepareLocales(){
 const translations=JSON.parse(await fs.readFile('scripts/extra-translations.json','utf8'));
 for(const lang of extra){
  const t=translations[lang],dir='locales/'+lang;
  if(!t||t.names.length!==72||!t.method)throw Error('Incomplete translations: '+lang);
  for(const d of ['src','data','scripts'])await fs.mkdir(dir+'/'+d,{recursive:true});
  for(const file of ['style.css','favicon.svg'])await fs.copyFile('locales/en/src/'+file,dir+'/src/'+file);
  await fs.writeFile(dir+'/src/engine.js',(await fs.readFile('locales/en/src/engine.js','utf8')).replace('rebirth-biology-en-play-v1','rebirth-biology-'+lang+'-play-v1'));
  for(const file of ['publisher-head.html','publisher-body.html','publisher-foot.html'])await fs.writeFile(dir+'/src/'+file,'');
  await fs.cp('src/images',dir+'/src/images',{recursive:true});await fs.cp('src/licenses',dir+'/src/licenses',{recursive:true});
  await fs.copyFile('data/category-image-sources.json',dir+'/data/category-image-sources.json');
  const data=JSON.parse(await fs.readFile('locales/en/data/categories.json','utf8'));data.categories.forEach((c,i)=>c.name=t.names[i]);await fs.writeFile(dir+'/data/categories.json',JSON.stringify(data,null,2)+'\n');
  const credits={ja:['著作者不明','原典のクレジットを参照','OpenAI image generation で生成'],de:['Urheber unbekannt','Urheberangabe in der Originalquelle beachten','Mit OpenAI image generation erstellt'],fr:['Auteur inconnu','Voir les crédits de la source originale','Créé avec OpenAI image generation'],pt:['Autor desconhecido','Consulte os créditos da fonte original','Gerado com OpenAI image generation']}[lang];
  const creditHelper='function creditArtist(s){const a=s.artist||s.source;const labels='+JSON.stringify({'저작자 미상':credits[0],'Unknown author':credits[0],'\\nUnknown artistUnknown artist':credits[0],'원본 출처 표기 참고':credits[1],'Generated with OpenAI image generation':credits[2]})+';return labels[a]||(a.trim()==="Unknown artistUnknown artist"?labels["Unknown author"]:a);}\n';
  const pairs=[...t.replace].sort((a,b)=>b[0].length-a[0].length),map=new Map(pairs),re=new RegExp(pairs.map(([s])=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g');
  function translate(source){let s=source.replace(re,m=>map.get(m));for(const [key,value]of Object.entries(t.groups||{}))s=s.replaceAll(key+":'"+key+"'",key+":'"+value+"'");return s.replaceAll('lang="en"','lang="'+lang+'"').replaceAll('content="en_US"','content="'+({ja:'ja_JP',de:'de_DE',fr:'fr_FR',pt:'pt_BR'}[lang])+'"');}
  await fs.writeFile(dir+'/src/engine.js',translate(await fs.readFile(dir+'/src/engine.js','utf8')));
  for(const file of ['app.js','index.html']){let content=translate(await fs.readFile('locales/en/src/'+file,'utf8'));if(file==='app.js'){const at=content.indexOf('\n')+1;content=content.slice(0,at)+creditHelper+content.slice(at);content=content.replaceAll('s.artist||s.source','creditArtist(s)');content=content.replace('const a=creditArtist(s);','const a=s.artist||s.source;');}await fs.writeFile(dir+'/src/'+file,content);}
  let builder=creditHelper+translate(await fs.readFile('locales/en/scripts/build.mjs','utf8'));builder=builder.replaceAll('s.artist||s.source','creditArtist(s)').replaceAll('$'+'{s.artist}','$'+'{creditArtist(s)}').replace('const a=creditArtist(s);','const a=s.artist||s.source;');
  if(t.modification)builder=builder.replace('esc(s.modification)','esc(('+JSON.stringify(t.modification)+')[s.modification]||s.modification)');
  await fs.writeFile(dir+'/scripts/build.mjs',builder);await fs.writeFile(dir+'/BIOMASS_METHOD.md',t.method.trimEnd()+'\n');
 }
}
