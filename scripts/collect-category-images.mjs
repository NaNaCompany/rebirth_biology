import fs from 'node:fs/promises';import crypto from 'node:crypto';import sharp from 'sharp';
const read=async p=>JSON.parse((await fs.readFile(p,'utf8')).replace(/^\uFEFF/,''));
const categories=(await read('data/categories.json')).categories,pool=await read('data/image-candidates.json');
await fs.mkdir('.cache/category-images',{recursive:true});await fs.mkdir('src/images/categories',{recursive:true});
const delay=ms=>new Promise(r=>setTimeout(r,ms));let last=0;
async function json(url){const elapsed=Date.now()-last;if(elapsed<1300)await delay(1300-elapsed);last=Date.now();for(let attempt=0;attempt<3;attempt++){try{const r=await fetch(url,{headers:{'User-Agent':'RebirthBiology/1.0 public-domain asset research'},signal:AbortSignal.timeout(20000)});if(r.ok)return await r.json();if(r.status===429){await delay(Math.min(60000,Number(r.headers.get('retry-after')||15)*1000));continue;}throw Error('HTTP '+r.status);}catch(e){if(attempt===2)throw e;await delay(2000);}}throw Error('Rate limit');}
const aliases={'Macropus rufus':'Osphranter rufus','Macropus robustus':'Osphranter robustus','Macropus antilopinus':'Osphranter antilopinus','Pecari tajacu':'Dicotyles tajacu'};
async function inat(c){const found=pool.find(x=>x.scientificName===c.representativeTaxon);if(found)return {...found.image,depictedTaxon:found.scientificName,source:'iNaturalist'};
 const query=aliases[c.representativeTaxon]||c.representativeTaxon;
 const data=await json('https://api.inaturalist.org/v1/taxa/autocomplete?'+new URLSearchParams({q:query,per_page:'10'}));
 const taxon=data.results?.find(x=>x.name.toLowerCase()===query.toLowerCase());if(!taxon)return null;
 const records=await json('https://api.inaturalist.org/v1/observations?'+new URLSearchParams({taxon_id:String(taxon.id),photo_license:'cc0',quality_grade:'research',per_page:'8'}));
 for(const r of records.results||[]){const p=r.photos?.find(p=>p.license_code==='cc0');if(p)return {source:'iNaturalist',depictedTaxon:taxon.name,photoId:p.id,sourceUrl:r.uri,originalUrl:p.url.replace('/square.','/original.'),downloadUrl:p.url.replace('/square.','/large.'),license:'CC0-1.0',licenseUrl:'https://creativecommons.org/publicdomain/zero/1.0/',artist:p.attribution,checkedAt:'2026-10-24'};}
 return null;}
const plain=s=>String(s||'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&#\d+;/g,'').trim();
async function commons(c){const q=c.imageSearch||c.representativeTaxon;const url='https://commons.wikimedia.org/w/api.php?'+new URLSearchParams({action:'query',generator:'search',gsrsearch:q+' filetype:bitmap',gsrnamespace:'6',gsrlimit:'20',prop:'imageinfo',iiprop:'url|extmetadata|size',iiurlwidth:'700',format:'json'});const data=await json(url);
 for(const p of Object.values(data.query?.pages||{}).sort((a,b)=>a.index-b.index)){const i=p.imageinfo?.[0],m=i?.extmetadata;if(!m||!i||Math.min(i.width,i.height)<250)continue;const license=plain(m.LicenseShortName?.value);if(!/^(CC0|Public domain)/i.test(license))continue;if(/(map|logo|stamp|coin|distribution|flag|graph|chart|table|journal|PDB|protein|structure|gene|culture|experiment)/i.test(p.title))continue;return {source:'Wikimedia Commons',depictedTaxon:c.representativeTaxon,title:p.title,sourceUrl:i.descriptionurl,originalUrl:i.url,downloadUrl:i.thumburl||i.url,license,licenseUrl:plain(m.LicenseUrl?.value)||'https://commons.wikimedia.org/wiki/Commons:Public_domain',artist:plain(m.Artist?.value),description:plain(m.ImageDescription?.value).slice(0,500),checkedAt:'2026-10-24'};}return null;}
const records=[],missing=[];
for(const [n,c]of categories.entries()){
 const cache='.cache/category-images/'+c.id+'.json';let image;try{image=await read(cache);}catch{}
 try{if(!image){image=await inat(c);if(!image)image=await commons(c);if(image)await fs.writeFile(cache,JSON.stringify(image,null,2));}
 if(!image){missing.push(c);console.log('MISSING '+c.id+' '+c.name);continue;}
 const target='src/images/categories/'+c.id+'.jpg';let buffer;
 try{buffer=await fs.readFile('.cache/category-images/'+c.id+'.original');}catch{const r=await fetch(image.downloadUrl,{signal:AbortSignal.timeout(30000),headers:{'User-Agent':'RebirthBiology/1.0'}});if(!r.ok)throw Error('Image HTTP '+r.status);buffer=Buffer.from(await r.arrayBuffer());await fs.writeFile('.cache/category-images/'+c.id+'.original',buffer);}
 await sharp(buffer,{limitInputPixels:100000000}).rotate().resize(300,300,{fit:'cover',position:sharp.strategy.attention}).flatten({background:'#f4f2e9'}).jpeg({quality:91,mozjpeg:true}).toFile(target);
 records.push({categoryId:c.id,categoryName:c.name,imageRole:c.imageRole,...image,file:target,width:300,height:300,modification:'300×300 attention crop, EXIF rotation, JPEG conversion',sha256:crypto.createHash('sha256').update(await fs.readFile(target)).digest('hex')});console.log(`${n+1}/72 ${c.name}: ${image.source} ${image.license}`);
 }catch(e){missing.push({...c,error:e.message});console.log('ERROR '+c.id+' '+e.message);}
 await fs.writeFile('data/category-image-sources.json',JSON.stringify(records,null,2)+'\n');await fs.writeFile('data/category-images-missing.json',JSON.stringify(missing,null,2)+'\n');
}
console.log(`Ready ${records.length}/72; missing ${missing.length}`);
