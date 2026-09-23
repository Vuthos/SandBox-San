import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';

async function loadScript(file,context={}){
  const source=await readFile(new URL('../'+file,import.meta.url),'utf8');
  const sandbox={console,Math,...context};
  vm.createContext(sandbox);
  vm.runInContext(source,sandbox,{filename:file});
  return sandbox;
}

test('colisão não interrompe atualização dos inimigos seguintes',async()=>{
  const ctx=await loadScript('src/game/tick.js');
  const enemies=[{id:1,x:0},{id:2,x:0},{id:3,x:0}];
  const updated=[];
  const hit=ctx.updateEnemyFrame(
    enemies,
    1/60,
    ()=>true,
    enemy=>{enemy.x+=1;updated.push(enemy.id);},
    enemy=>enemy.id===1
  );
  assert.equal(hit,true);
  assert.deepEqual(updated,[1,2,3]);
  assert.deepEqual(enemies.map(e=>e.x),[1,1,1]);
});

test('duas patrulhas idênticas permanecem sincronizadas por milhares de frames',async()=>{
  const ctx=await loadScript('src/game/enemies.js',{
    canvas:{width:960,height:576},
    normAngle:value=>((Number(value)||0)%360+360)%360
  });
  const makeEnemy=id=>({
    id,type:'moving',mode:'patrol',x:16,y:16,r:9,speed:173,
    start:{x:16,y:16},end:{x:416,y:16},target:1
  });
  const a=makeEnemy(1),b=makeEnemy(2);
  for(let i=0;i<12000;i++){
    ctx.updateEnemy(a,1/60);
    ctx.updateEnemy(b,1/60);
  }
  assert.ok(Math.abs(a.x-b.x)<1e-9);
  assert.ok(Math.abs(a.y-b.y)<1e-9);
  assert.equal(a.target,b.target);
});

test('patrulha preserva distância com passos de tempo equivalentes',async()=>{
  const ctx=await loadScript('src/game/enemies.js',{
    canvas:{width:960,height:576},
    normAngle:value=>((Number(value)||0)%360+360)%360
  });
  const makeEnemy=()=>({
    id:1,type:'moving',mode:'patrol',x:0,y:0,r:9,speed:90,
    start:{x:0,y:0},end:{x:100,y:0},target:1
  });
  const coarse=makeEnemy(),fine=makeEnemy();
  ctx.updateEnemy(coarse,2.5);
  for(let i=0;i<150;i++)ctx.updateEnemy(fine,1/60);
  assert.ok(Math.abs(coarse.x-fine.x)<1e-8);
  assert.ok(Math.abs(coarse.y-fine.y)<1e-8);
  assert.equal(coarse.target,fine.target);
});
