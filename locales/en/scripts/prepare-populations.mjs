import fs from 'node:fs/promises';
const read = async p => JSON.parse((await fs.readFile(p,'utf8')).replace(/^\uFEFF/,''));
const save = (p,x) => fs.writeFile(p,JSON.stringify(x,null,2)+'\n');
const birds = await read('data/bird-populations.json');
if(birds.length !== 9700 || birds.some(b=>!Number.isFinite(b.populationEstimate)||b.populationEstimate<0)) throw Error('Invalid bird data');
const aggregates=[];
for(const rank of ['genus','family','order']){
 const groups=new Map();
 for(const bird of birds){const name=rank==='genus'?bird.scientificName.split(' ')[0]:bird[rank];const group=groups.get(name)||{name,rank,populationEstimate:0,coveredSpecies:0}; group.populationEstimate+=bird.populationEstimate;group.coveredSpecies++;groups.set(name,group);}
 for(const group of groups.values()) aggregates.push({...group,unit:'individuals',scope:'Sum of covered species in Callaghan 2021 dataset; not an independent global census',sourceUrl:'https://doi.org/10.1073/pnas.2023170118',dataUrl:'https://zenodo.org/records/4723365',publicationYear:2021,uncertainty:'Species confidence limits cannot be summed as an aggregate confidence interval',overlapSet:'birds-2021'});
}
await save('data/bird-taxonomic-aggregates.json',aggregates);
const candidates=await read('data/image-candidates.json');
const index=new Map(birds.map(b=>[b.scientificName.toLowerCase(),b]));
const matching=candidates.map(c=>{const match=index.get(c.scientificName.toLowerCase());return {id:c.id,name:c.name,scientificName:c.scientificName,group:c.group,populationStatus:match?'species-estimate':'unresolved',population:match||null};});
await save('data/candidate-population-audit.json',matching);
console.log(JSON.stringify({birdSpecies:birds.length,aggregates:aggregates.length,imageCandidates:candidates.length,exactSpeciesMatches:matching.filter(c=>c.population).length,unresolved:matching.filter(c=>!c.population).length},null,2));
