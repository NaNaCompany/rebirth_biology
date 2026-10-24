import fs from 'node:fs/promises';import sharp from 'sharp';import crypto from 'node:crypto';
const read=async p=>JSON.parse((await fs.readFile(p,'utf8')).replace(/^\uFEFF/,''));
const {categories}=await read('data/categories.json'),sources=await read('data/category-image-sources.json');
if(categories.length!==72||sources.length!==72||new Set(sources.map(r=>r.categoryId)).size!==72)throw Error('Category/source count mismatch');
if(Math.abs(categories.reduce((s,c)=>s+c.probability,0)-1)>1e-10)throw Error('Invalid probability partition');
const licenses={};
for(const c of categories){const r=sources.find(r=>r.categoryId===c.id);if(!r)throw Error('Missing '+c.id);const b=await fs.readFile(r.file),m=await sharp(b).metadata();if(m.width!==300||m.height!==300||m.format!=='jpeg')throw Error('Invalid image '+c.id);if(crypto.createHash('sha256').update(b).digest('hex')!==r.sha256)throw Error('Hash mismatch '+c.id);
if(r.source==='OpenAI image generation'){if(!r.generationPrompt||r.sourceUrl!==null)throw Error('Missing generation disclosure');}else if(!/^CC0|^CC BY \d|^Public domain/.test(r.license)||!r.sourceUrl||!r.originalUrl||!r.licenseUrl)throw Error('Invalid license/provenance '+c.id);
licenses[r.license]=(licenses[r.license]||0)+1;}
console.log(JSON.stringify({categories:72,images:72,dimensions:'300×300 JPEG',probabilitySum:categories.reduce((s,c)=>s+c.probability,0),licenses},null,2));
