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

async function build(){
  const original=await readFile(indexPath,'utf8');
  const css=(await readFile(cssPath,'utf8')).trim();
  const chunks=[];
  for(const modulePath of modules){
    const source=(await readFile(path.join(root,modulePath),'utf8')).trim();
    chunks.push(`/* ${modulePath} */\n${source}`);
  }
  let next=original.replace(/<style>[\s\S]*?<\/style>/,`<style>\n${css}\n</style>`);
  next=next.replace(/<script>[\s\S]*?<\/script>/,`<script>\n${chunks.join('\n\n')}\n</script>`);
  return {original,next};
}

const {original,next}=await build();
if(process.argv.includes('--check')){
  if(original!==next){
    console.error('index.html está fora de sincronia. Execute: npm run build');
    process.exit(1);
  }
  console.log('Standalone sincronizado.');
}else{
  await writeFile(indexPath,next,'utf8');
  console.log('index.html gerado a partir de styles/ e src/.');
}
