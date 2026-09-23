import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const indexPath=path.join(root,'index.html');
const cssPath=path.join(root,'styles','main.css');
const modules=[
  'src/core/config.js',
  'src/core/security.js',
  'src/core/dom.js',
  'src/core/model.js',
  'src/core/state.js',
  'src/core/history.js',
  'src/editor/selection.js',
  'src/editor/tools.js',
  'src/ui/inspector.js',
  'src/game/collision.js',
  'src/game/enemies.js',
  'src/game/player.js',
  'src/game/tick.js',
  'src/game/runtime.js',
  'src/render/renderer.js',
  'src/editor/clipboard.js',
  'src/editor/viewport.js',
  'src/editor/area-selection.js',
  'src/editor/validation.js',
  'src/editor/templates.js',
  'src/ui/actions.js',
  'src/core/storage.js',
  'src/online/config.js',
  'src/online/share.js',
  'src/online/community.js',
  'src/online/ui.js',
  'src/app.js'
];

const normalize=value=>String(value).replace(/\r\n/g,'\n').trim();

async function loadSources(){
  const css=normalize(await readFile(cssPath,'utf8'));
  const sources=new Map();
  for(const modulePath of modules)sources.set(modulePath,normalize(await readFile(path.join(root,modulePath),'utf8')));
  return {css,sources};
}

function standaloneScript(sources){
  return modules.map(modulePath=>`/* ${modulePath} */\n${sources.get(modulePath)}`).join('\n\n');
}

async function build(){
  const original=await readFile(indexPath,'utf8');
  const {css,sources}=await loadSources();
  let next=original.replace(/<style>[\s\S]*?<\/style>/,`<style>\n${css}\n</style>`);
  next=next.replace(/<script>[\s\S]*?<\/script>/,`<script>\n${standaloneScript(sources)}\n</script>`);
  return {original,next,css,sources};
}

function verifyEmbedded(original,css,sources){
  const problems=[];
  const styleMatch=original.match(/<style>([\s\S]*?)<\/style>/);
  if(!styleMatch||normalize(styleMatch[1])!==css)problems.push('styles/main.css');
  for(let i=0;i<modules.length;i++){
    const modulePath=modules[i],marker=`/* ${modulePath} */`;
    const start=original.indexOf(marker);
    if(start<0){problems.push(modulePath+' (marker ausente)');continue;}
    const after=start+marker.length;
    const nextMarker=i+1<modules.length?`/* ${modules[i+1]} */`:'</script>';
    const end=original.indexOf(nextMarker,after);
    if(end<0){problems.push(modulePath+' (fim ausente)');continue;}
    if(normalize(original.slice(after,end))!==sources.get(modulePath))problems.push(modulePath);
  }
  return problems;
}

const {original,next,css,sources}=await build();
if(process.argv.includes('--check')){
  const problems=verifyEmbedded(original,css,sources);
  if(problems.length){
    console.error('Standalone fora de sincronia:');
    for(const item of problems)console.error('- '+item);
    console.error('Execute: npm run build');
    process.exit(1);
  }
  console.log('Standalone sincronizado.');
}else{
  await writeFile(indexPath,next,'utf8');
  console.log('index.html gerado a partir de styles/ e src/.');
}
