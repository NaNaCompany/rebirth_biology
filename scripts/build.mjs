import {addMoreApps} from './more-apps.mjs';
import fs from 'node:fs/promises';import path from 'node:path';import {spawnSync} from 'node:child_process';import {createHash} from 'node:crypto';import {completeTracking} from './publisher-tracking.mjs';
import {prepareLocales} from './prepare-extra-locales.mjs';
const root=process.cwd(),base=(process.env.SITE_URL||'https://nanalab.kr/rebirth_biology').replace(/\/$/,'');
const languages=['ko','en','es','zh','ja','de','fr','pt'];
function run(file,cwd,url){const r=spawnSync(process.execPath,[file],{cwd,env:{...process.env,SITE_URL:url},stdio:'inherit'});if(r.status!==0)throw Error('Build failed: '+file);}
async function copyTree(a,b){await fs.cp(a,b,{recursive:true});}
await prepareLocales();
run('scripts/build-ko.mjs',root,base);
const docs=path.join(root,'docs');await fs.mkdir(path.join(docs,'ko'),{recursive:true});for(const name of await fs.readdir(docs)){if(languages.includes(name))continue;await copyTree(path.join(docs,name),path.join(docs,'ko',name));}
for(const lang of languages.filter(l=>l!=='ko')){const cwd=path.join(root,'locales',lang);run('scripts/build.mjs',cwd,base+'/'+lang);await copyTree(path.join(cwd,'docs'),path.join(docs,lang));}
await fs.cp('src/legacy-assets',docs,{recursive:true});await fs.writeFile(path.join(docs,'robots.txt'),'User-agent: *\nAllow: /\n\nSitemap: '+base+'/sitemap.xml\n');
const preference=await fs.readFile('src/language-preference.js','utf8'),preferenceName='language-preference.'+createHash('sha256').update(preference).digest('hex').slice(0,12)+'.js';
const widget=(await fs.readFile('src/language-widget.js','utf8')).replace('./language-preference.js','./'+preferenceName),widgetName='language-widget.'+createHash('sha256').update(widget).digest('hex').slice(0,12)+'.js';
await fs.writeFile(path.join(docs,preferenceName),preference);await fs.writeFile(path.join(docs,widgetName),widget);
const names={ko:'한국어',en:'English',es:'Español',zh:'简体中文',ja:'日本語',de:'Deutsch',fr:'Français',pt:'Português'};
const languageStyle='<style>.language-links{display:flex;justify-content:flex-end;align-items:center;gap:12px;flex-wrap:wrap;font-size:11px;color:#75836b;padding:14px 0}.language-links a[aria-current]{font-weight:700;text-decoration:underline;text-underline-offset:4px}.language-suggestion{border:1px solid #dbe1d1;background:#f9faf4;padding:12px 15px;border-radius:6px;font-size:11px;line-height:1.8;color:#627457;margin:5px 0 15px}.language-suggestion a{text-decoration:underline;margin-left:10px}.language-suggestion small{display:block;color:#8b9581;font-size:9px}</style>';
const urls=[];async function walk(folder){for(const d of await fs.readdir(folder,{withFileTypes:true})){const file=path.join(folder,d.name);if(d.isDirectory()){await walk(file);continue;}if(!d.name.endsWith('.html'))continue;
 const relative=path.relative(docs,file).replaceAll('\\','/'),match=relative.match(/^(ko|en|es|zh|ja|de|fr|pt)\//),locale=match?.[1]||'ko',route=relative.slice(match?.[0].length||0).replace(/index\.html$/,''),url=base+'/'+relative.replace(/index\.html$/,'');
 let html=await fs.readFile(file,'utf8');if(relative.startsWith('ko/'))html=html.split(base+'/').join(base+'/ko/');
 html=completeTracking(html).replace(/<nav class="language-links"[\s\S]*?<\/nav>/g,'').replace(/<link rel="alternate"[^>]+>/g,'').replace(/<link rel="canonical"[^>]+>/g,'');
 const nav='<nav class="language-links" aria-label="Language">'+languages.map(l=>'<a data-language="'+l+'" lang="'+l+'" href="'+base+'/'+l+'/'+route+'" '+(l===locale?'aria-current="page"':'')+'>'+names[l]+'</a>').join('<span>·</span>')+'</nav><div id="language-suggestion" class="language-suggestion" hidden></div>';
 const metadata='<link rel="canonical" href="'+url+'">'+languages.map(l=>'<link rel="alternate" hreflang="'+(l==='zh'?'zh-CN':l)+'" href="'+base+'/'+l+'/'+route+'">').join('')+'<link rel="alternate" hreflang="x-default" href="'+base+'/'+route+'">';
 html=html.replace('</head>',languageStyle+metadata+(!/<base\b/.test(html)?'<base href="'+base+'/'+(match?locale+'/':'')+'">':'')+'</head>');html=html.replace('<main',nav+'<main');if(!html.includes('id="language-suggestion"'))html=html.replace(/(<body[^>]*>)/,'$1'+nav);
 html=html.replace('</body>','<script type="module" src="'+base+'/'+widgetName+'" data-game="rebirth_biology" data-language="'+locale+'" data-base="'+base+'/" data-route="'+route+'"></script></body>');html=addMoreApps(html);await fs.writeFile(file,html);urls.push(url);
}}
await walk(docs);await fs.writeFile(path.join(docs,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+[...new Set(urls)].sort().map(url=>'<url><loc>'+url+'</loc></url>').join('')+'</urlset>');
console.log('Built Korean legacy routes and eight languages; sitemap URLs: '+urls.length);
