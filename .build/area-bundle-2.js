/* src/game/player.js */
'use strict';
function movePlayer(dx,dy){let ox=player.x,oy=player.y;player.x+=dx;if(playerBlocked(player.x,player.y,player.r))player.x=ox;player.y+=dy;if(playerBlocked(player.x,player.y,player.r))player.y=oy;}
function portalCircle(pos){const p=cellCenter(pos.c,pos.r);return{x:p.x,y:p.y,r:12};}function touchingPortal(o){return map.portals.some(p=>circleCircle(o,portalCircle(p.a))||circleCircle(o,portalCircle(p.b)));}function teleport(){if(player.portalLock){if(touchingPortal(player))return;player.portalLock=false;}for(const p of map.portals){const a=portalCircle(p.a),b=portalCircle(p.b);if(circleCircle(player,a)){player.x=b.x;player.y=b.y;player.portalLock=true;return;}if(circleCircle(player,b)){player.x=a.x;player.y=a.y;player.portalLock=true;return;}}}
function collect(){for(const c of map.coins){if(collectedCoins.has(c.id))continue;const p=cellCenter(c.c,c.r);if(circleCircle(player,{x:p.x,y:p.y,r:8}))collectedCoins.add(c.id);}for(const kd of map.keyDoors){if(collectedKeys.has(kd.id))continue;const p=cellCenter(kd.key.c,kd.key.r);if(circleCircle(player,{x:p.x,y:p.y,r:9}))collectedKeys.add(kd.id);}}
function checkpoint(){for(const cp of map.checkpoints)if(circleRect(player.x,player.y,player.r,rectCell(cp.c,cp.r))&&activeCheckpoint!==cp.id){activeCheckpoint=cp.id;respawnPoint=cellCenter(cp.c,cp.r);}}
function toggleTarget(t){const k=targetKey(t);if(!k)return;disabledTargets.has(k)?disabledTargets.delete(k):disabledTargets.add(k);}function buttons(){for(const b of map.buttons){const k='b:'+b.id,inside=circleRect(player.x,player.y,player.r,rectCell(b.pos.c,b.pos.r));if(inside&&!buttonInside.has(k)){buttonInside.add(k);toggleTarget(b.target);}else if(!inside)buttonInside.delete(k);}}
function respawn(){deaths++;if(map.settings.resetCollectiblesOnDeath){collectedCoins=new Set();collectedKeys=new Set();}if(map.settings.resetLogicOnDeath){disabledTargets=new Set();buttonInside=new Set();}if(map.settings.resetEnemiesOnDeath)simEnemies=buildSimEnemies();player.x=respawnPoint.x;player.y=respawnPoint.y;player.portalLock=false;}


/* src/game/runtime.js */
'use strict';
function setMode(next){mode=next;$('editBtn').classList.toggle('active',next==='edit');$('testBtn').classList.toggle('active',next==='test');modeLabel.textContent=next==='edit'?'EDIÇÃO':'TESTE';clearSelection();if(next==='test')startTest();else{if(raf)cancelAnimationFrame(raf);raf=null;player=null;simEnemies=[];won=false;updateStatus();draw();}}
function startTest(){if(raf)cancelAnimationFrame(raf);won=false;collectedCoins=new Set();collectedKeys=new Set();disabledTargets=new Set();buttonInside=new Set();activeCheckpoint=null;respawnPoint=cellCenter(map.spawn.c,map.spawn.r);player={x:respawnPoint.x,y:respawnPoint.y,r:10,speed:175,portalLock:false};simEnemies=buildSimEnemies();last=performance.now();updateStatus();raf=requestAnimationFrame(loop);}
function update(dt){if(!player||won)return;let dx=0,dy=0;if(keys.w||keys.arrowup)dy--;if(keys.s||keys.arrowdown)dy++;if(keys.a||keys.arrowleft)dx--;if(keys.d||keys.arrowright)dx++;if(dx&&dy){dx*=.70710678;dy*=.70710678;}movePlayer(dx*player.speed*dt,0);movePlayer(0,dy*player.speed*dt);teleport();collect();checkpoint();buttons();for(const e of simEnemies){if(!enemyActive(e.id))continue;updateEnemy(e,dt);if(circleCircle(player,e)){respawn();break;}}if(circleRect(player.x,player.y,player.r,rectCell(map.goal.c,map.goal.r))){if(collectedCoins.size>=map.coins.length){won=true;updateStatus();}else setStatus(`Chegada bloqueada: faltam ${map.coins.length-collectedCoins.size} moeda(s).`);}}
function loop(now){const dt=Math.min((now-last)/1000,.04);last=now;update(dt);draw();raf=requestAnimationFrame(loop);}


/* src/render/renderer.js */
'use strict';
function setStatus(s){status.textContent=s;}function updateStatus(){if(mode==='edit'){const names={select:'Selecionar / editar',wall:'Parede',spawn:'Início',goal:'Chegada',checkpoint:'Checkpoint',static:'Inimigo parado',horizontal:'Patrulha horizontal',vertical:'Patrulha vertical',directional:'Patrulha X↔Y',guided:'Inimigo guiado',portal:'Portal',keydoor:'Chave + porta',button:'Botão → objeto',coin:'Moeda',erase:'Apagar'};let tail='';if(pendingPatrol)tail=' • escolha o ponto Y';if(pendingGuide)tail=` • ${pendingGuide.length} ponto(s) na rota`;setStatus(`Ferramenta: ${names[tool]}${tail}`);}else setStatus(won?`Fase concluída • ${deaths} morte(s)`:`Teste • ${deaths} morte(s) • moedas ${collectedCoins.size}/${map.coins.length}${activeCheckpoint?' • CP '+activeCheckpoint:''}`);}
function grid(){ctx.strokeStyle='#dedede';ctx.lineWidth=1;for(let c=0;c<=gridCols();c++){ctx.beginPath();ctx.moveTo(c*CELL,0);ctx.lineTo(c*CELL,canvas.height);ctx.stroke();}for(let r=0;r<=gridRows();r++){ctx.beginPath();ctx.moveTo(0,r*CELL);ctx.lineTo(canvas.width,r*CELL);ctx.stroke();}}
function circle(x,y,r,fill,stroke='#111',lw=2){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke();}function line(points,color='#6b28a8',dash=[]){if(points.length<2)return;ctx.save();ctx.strokeStyle=color;ctx.lineWidth=2;ctx.setLineDash(dash);ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);for(let i=1;i<points.length;i++)ctx.lineTo(points[i].x,points[i].y);ctx.stroke();ctx.restore();}
function drawRouteNodes(e){if(e.type!=='guided')return;e.route.forEach((p,i)=>{circle(p.x,p.y,i===0?8:5,i===0?'#8c3fd1':'#d7b0ee','#5b207e',1);ctx.fillStyle='#45205d';ctx.font='bold 9px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(i+1),p.x,p.y);});}
function draw(){ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#f4f4f4';ctx.fillRect(0,0,canvas.width,canvas.height);grid();ctx.fillStyle='#91e57c';ctx.fillRect(map.goal.c*CELL,map.goal.r*CELL,CELL,CELL);
for(const cp of map.checkpoints){const r=rectCell(cp.c,cp.r);ctx.fillStyle=mode==='test'&&activeCheckpoint===cp.id?'#d7ed75':'#e8efaa';ctx.fillRect(r.x,r.y,r.w,r.h);}
for(const w of map.walls){if(mode==='test'&&!wallActive(w.id))continue;const r=rectWall(w);ctx.fillStyle='#9a96c9';ctx.fillRect(r.x,r.y,r.w,r.h);ctx.strokeStyle='#716d97';ctx.lineWidth=1;ctx.strokeRect(r.x+.5,r.y+.5,r.w-1,r.h-1);}
for(const kd of map.keyDoors){const kp=cellCenter(kd.key.c,kd.key.r),dr=rectCell(kd.door.c,kd.door.r);if(mode==='edit'||!collectedKeys.has(kd.id))circle(kp.x,kp.y,9,'#ffd54a','#8d6500');if(mode==='edit'||!doorOpen(kd.id)){ctx.fillStyle='#7356b8';ctx.fillRect(dr.x+3,dr.y+2,dr.w-6,dr.h-4);}}
for(const p of map.portals)for(const q of[p.a,p.b]){const z=cellCenter(q.c,q.r);circle(z.x,z.y,12,'#f39a34','#a85400',3);circle(z.x,z.y,6,'#4a2410','#ffbd66',1);}if(mode==='edit'&&pendingPortal){const z=cellCenter(pendingPortal.c,pendingPortal.r);circle(z.x,z.y,12,'#ffc078','#a85400',2);}
for(const b of map.buttons){const r=rectCell(b.pos.c,b.pos.r);ctx.fillStyle=mode==='test'&&disabledTargets.has(targetKey(b.target))?'#54777d':'#69d2dc';ctx.fillRect(r.x+5,r.y+5,r.w-10,r.h-10);}for(const c of map.coins){if(mode==='test'&&collectedCoins.has(c.id))continue;const p=cellCenter(c.c,c.r);circle(p.x,p.y,8,'#f6c945','#8d6500');}
if(mode==='edit'){for(const e of map.enemies){if(e.type==='moving'){if(e.mode==='patrol'){line([e.start,e.end],'#d34a4a',[6,4]);circle(e.start.x,e.start.y,9,'#e43d3d');circle(e.end.x,e.end.y,4,'#ffb0b0','#9b2020',1);}else circle(e.start.x,e.start.y,9,'#e43d3d');}else if(e.type==='guided'){line(e.route,'#8d3cc6',[5,4]);drawRouteNodes(e);}else circle(e.x,e.y,9,'#e43d3d');}const s=cellCenter(map.spawn.c,map.spawn.r);circle(s.x,s.y,10,'#2b63ff');if(pendingPatrol)circle(pendingPatrol.start.x,pendingPatrol.start.y,9,'#e43d3d');if(pendingGuide){line(pendingGuide,'#8d3cc6',[5,4]);pendingGuide.forEach((p,i)=>circle(p.x,p.y,i===0?8:5,i===0?'#8c3fd1':'#d7b0ee','#5b207e',1));}if(selected){if(selected.kind==='wall'){const w=map.walls.find(q=>q.id===selected.id);if(w){const r=rectWall(w);ctx.save();ctx.strokeStyle='#00a6ff';ctx.lineWidth=3;ctx.setLineDash([7,4]);ctx.strokeRect(r.x+2,r.y+2,r.w-4,r.h-4);ctx.restore();}}else{const e=map.enemies.find(q=>q.id===selected.id);if(e){const p=enemyAnchor(e);ctx.save();ctx.strokeStyle='#00a6ff';ctx.lineWidth=3;ctx.setLineDash([7,4]);ctx.strokeRect(p.x-14,p.y-14,28,28);ctx.restore();if(e.type==='guided')drawRouteNodes(e);}}}}else{for(const e of simEnemies)if(enemyActive(e.id))circle(e.x,e.y,e.r,e.type==='guided'?'#8c3fd1':'#e43d3d');if(player)circle(player.x,player.y,player.r,'#2b63ff');}
if(won){ctx.fillStyle='rgba(0,0,0,.62)';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#fff';ctx.font='bold 38px Segoe UI,Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('FASE CONCLUÍDA',canvas.width/2,canvas.height/2-10);ctx.font='18px Segoe UI,Arial';ctx.fillText(`${deaths} morte(s) • ${collectedCoins.size}/${map.coins.length} moedas`,canvas.width/2,canvas.height/2+28);}}


/* src/editor/clipboard.js */
'use strict';
function selectionKey(s){return s?`${s.kind}:${s.id}`:'';}function selectionArray(){if(selectedItems.length)return selectedItems.slice();return selected?[selected]:[];}function isSelectedItem(kind,id){return selectionArray().some(s=>s.kind===kind&&s.id===id);}function resetSelectionGroup(){selectedItems=selected?[selected]:[];}
const __oldClearSelection=clearSelection;clearSelection=function(){__oldClearSelection();selectedItems=[];selectionRect=null;selectionStart=null;};
function ensurePrimarySelection(){const arr=selectionArray();selected=arr[0]||null;if(selected)selectedItems=arr;}
function getObject(sel){if(!sel)return null;if(sel.kind==='wall')return map.walls.find(q=>q.id===sel.id)||null;if(sel.kind==='enemy')return map.enemies.find(q=>q.id===sel.id)||null;return null;}
function normalizeSelectionGroup(){const arr=selectionArray().filter(s=>!!getObject(s)),uniq=[],seen=new Set();for(const s of arr){const k=selectionKey(s);if(!seen.has(k)){seen.add(k);uniq.push(s);}}selectedItems=uniq;selected=uniq[0]||null;}
const __oldShowProperties=showProperties;showProperties=function(){normalizeSelectionGroup();const arr=selectionArray();if(arr.length<=1)return __oldShowProperties();props.classList.remove('hidden');emptySelection.classList.add('hidden');wallProps.classList.add('hidden');enemyProps.classList.add('hidden');staticProps.classList.add('hidden');regularProps.classList.add('hidden');guidedProps.classList.add('hidden');selectedInfo.textContent=`${arr.length} itens selecionados`;};
selectAt=function(p){const w=wallAt(p.c,p.r),e=enemyAtPoint(p.x,p.y),hit=w?{kind:'wall',id:w.id}:e?{kind:'enemy',id:e.id}:null;if(selectToggleMode){if(hit){const k=selectionKey(hit),idx=selectionArray().findIndex(s=>selectionKey(s)===k);if(idx>=0)selectedItems=selectionArray().filter((_,i)=>i!==idx);else{selectedItems=selectionArray().concat([hit]);selected=hit;}ensurePrimarySelection();if(selected)showProperties();else clearSelection();draw();}else draw();return;}if(hit){selected=hit;selectedItems=[hit];showProperties();draw();return;}clearSelection();draw();};
function deleteSelectionSet(arr){const wallIds=new Set(arr.filter(s=>s.kind==='wall').map(s=>s.id)),enemyIds=new Set(arr.filter(s=>s.kind==='enemy').map(s=>s.id));if(wallIds.size)map.walls=map.walls.filter(q=>!wallIds.has(q.id));if(enemyIds.size)map.enemies=map.enemies.filter(q=>!enemyIds.has(q.id));map.buttons=map.buttons.filter(b=>!((b.target?.kind==='wall'&&wallIds.has(b.target.id))||(b.target?.kind==='enemy'&&enemyIds.has(b.target.id))));}
const __oldDeleteSelected=deleteSelected;deleteSelected=function(){const arr=selectionArray();if(!arr.length)return __oldDeleteSelected();deleteSelectionSet(arr);clearSelection();commit();draw();setStatus(arr.length>1?`${arr.length} objetos excluídos.`:'Objeto excluído.');};$('deleteSelected').onclick=deleteSelected;
function cloneWall(w){return{kind:'wall',data:cloneJson(w)};}function cloneEnemy(e){return{kind:'enemy',data:cloneJson(e)};}function cloneSelection(){const out=[];for(const s of selectionArray()){const obj=getObject(s);if(!obj)continue;out.push(s.kind==='wall'?cloneWall(obj):cloneEnemy(obj));}return out;}
function shiftEnemy(enemy,dx=CELL,dy=CELL){if(enemy.type==='static'){enemy.x+=dx;enemy.y+=dy;}else if(enemy.type==='guided')enemy.route=enemy.route.map(p=>({x:p.x+dx,y:p.y+dy}));else{enemy.start={x:enemy.start.x+dx,y:enemy.start.y+dy};enemy.end={x:enemy.end.x+dx,y:enemy.end.y+dy};}}
function clampWallObj(w){w.c=clamp(w.c,0,gridCols()-1);w.r=clamp(w.r,0,gridRows()-1);w.w=clamp(w.w,1,gridCols()-w.c);w.h=clamp(w.h,1,gridRows()-w.r);}function clampEnemyObj(e){if(e.type==='static'){const p=clampPointToCanvas({x:e.x,y:e.y});e.x=p.x;e.y=p.y;}else if(e.type==='guided')e.route=(e.route||[]).map(clampPointToCanvas);else{e.start=clampPointToCanvas(e.start);e.end=clampPointToCanvas(e.end);}}
function pasteClipboard(offsetMultiplier=1){if(!clipboardItems.length){setStatus('Nada copiado.');return;}const newSel=[];for(const item of clipboardItems){if(item.kind==='wall'){if(!canAddToCollection('walls'))break;const w=cloneJson(item.data);w.id=nextId(map.walls);w.c+=offsetMultiplier;w.r+=offsetMultiplier;clampWallObj(w);map.walls.push(w);newSel.push({kind:'wall',id:w.id});}else if(item.kind==='enemy'){if(!canAddToCollection('enemies'))break;const e=cloneJson(item.data);e.id=nextId(map.enemies);shiftEnemy(e,CELL*offsetMultiplier,CELL*offsetMultiplier);clampEnemyObj(e);map.enemies.push(e);newSel.push({kind:'enemy',id:e.id});}}selectedItems=newSel;selected=newSel[0]||null;commit();showProperties();draw();setStatus(`${newSel.length} item(ns) colado(s).`);}
function copySelectionToClipboard(){clipboardItems=cloneSelection();setStatus(clipboardItems.length?`${clipboardItems.length} item(ns) copiado(s).`:'Nenhum item selecionado para copiar.');}function duplicateSelection(){clipboardItems=cloneSelection();pasteClipboard(1);}
const __baseDraw=draw;draw=function(){__baseDraw();if(mode==='edit'){const arr=selectionArray();if(arr.length>1){ctx.save();ctx.strokeStyle='#00d4ff';ctx.lineWidth=2;ctx.setLineDash([6,4]);for(const s of arr){const obj=getObject(s);if(!obj)continue;if(s.kind==='wall'){const r=rectWall(obj);ctx.strokeRect(r.x+3,r.y+3,r.w-6,r.h-6);}else if(s.kind==='enemy'){const p=enemyAnchor(obj);if(p)ctx.strokeRect(p.x-14,p.y-14,28,28);}}ctx.restore();}if(selectionRect){const x=Math.min(selectionRect.x1,selectionRect.x2),y=Math.min(selectionRect.y1,selectionRect.y2),w=Math.abs(selectionRect.x2-selectionRect.x1),h=Math.abs(selectionRect.y2-selectionRect.y1);ctx.save();ctx.fillStyle='rgba(0,170,255,.10)';ctx.strokeStyle='rgba(0,170,255,.95)';ctx.setLineDash([8,5]);ctx.lineWidth=2;ctx.fillRect(x,y,w,h);ctx.strokeRect(x,y,w,h);ctx.restore();}}};
duplicateBtn&&(duplicateBtn.onclick=duplicateSelection);copyBtn&&(copyBtn.onclick=copySelectionToClipboard);pasteBtn&&(pasteBtn.onclick=()=>pasteClipboard(1));duplicateSelectedBtn&&(duplicateSelectedBtn.onclick=duplicateSelection);copySelectedBtn&&(copySelectedBtn.onclick=copySelectionToClipboard);


/* src/editor/viewport.js */
'use strict';
function applyZoom(){
  canvas.style.width=`${Math.round(canvas.width*viewportZoom)}px`;
  canvas.style.height=`${Math.round(canvas.height*viewportZoom)}px`;
  if(zoomResetBtn)zoomResetBtn.textContent=`${Math.round(viewportZoom*100)}%`;
}
function setZoom(z){viewportZoom=clamp(z,.5,3);applyZoom();}
zoomOutBtn&&(zoomOutBtn.onclick=()=>setZoom(viewportZoom-.1));
zoomInBtn&&(zoomInBtn.onclick=()=>setZoom(viewportZoom+.1));
zoomResetBtn&&(zoomResetBtn.onclick=()=>setZoom(1));
applyZoom();

canvasWrap?.addEventListener('wheel',ev=>{
  if(!(ev.ctrlKey||ev.metaKey))return;
  ev.preventDefault();
  setZoom(viewportZoom+(ev.deltaY<0?.1:-.1));
},{passive:false});

addEventListener('keydown',ev=>{
  if(ev.code==='Space'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))spacePan=true;
});
addEventListener('keyup',ev=>{if(ev.code==='Space')spacePan=false;});

canvas.addEventListener('pointerdown',ev=>{
  selectToggleMode=!!(ev.ctrlKey||ev.metaKey||ev.shiftKey);
  if(mode!=='edit')return;
  if((ev.button===1||spacePan)&&canvasWrap){
    panState={x:ev.clientX,y:ev.clientY,sl:canvasWrap.scrollLeft,st:canvasWrap.scrollTop};
    ev.preventDefault();
    ev.stopPropagation();
  }
},true);

canvasWrap?.addEventListener('pointermove',ev=>{
  if(panState){
    canvasWrap.scrollLeft=panState.sl-(ev.clientX-panState.x);
    canvasWrap.scrollTop=panState.st-(ev.clientY-panState.y);
  }
},true);

addEventListener('pointerup',()=>{
  panState=null;
  selectToggleMode=false;
});


/* src/editor/area-selection.js */

'use strict';

// Area selection / group transform layer. Runs after the older helpers.
const moveSnapSelect = $('moveSnapSelect');
let areaGesture = null;

const __areaBaseGetObject = getObject;
getObject = function(sel){
  if(!sel) return null;
  if(sel.kind==='checkpoint') return map.checkpoints.find(q=>q.id===sel.id)||null;
  if(sel.kind==='coin') return map.coins.find(q=>q.id===sel.id)||null;
  if(sel.kind==='portal') return map.portals.find(q=>q.id===sel.id)||null;
  if(sel.kind==='keyDoor') return map.keyDoors.find(q=>q.id===sel.id)||null;
  if(sel.kind==='button') return map.buttons.find(q=>q.id===sel.id)||null;
  if(sel.kind==='spawn') return map.spawn;
  if(sel.kind==='goal') return map.goal;
  return __areaBaseGetObject(sel);
};

function selectionKindLabel(kind){
  return ({
    wall:'Parede', enemy:'Inimigo', checkpoint:'Checkpoint', coin:'Moeda',
    portal:'Portal', keyDoor:'Chave + porta', button:'Botão',
    spawn:'Início', goal:'Chegada'
  })[kind]||kind;
}

const __areaOldShowProperties = showProperties;
showProperties = function(){
  normalizeSelectionGroup();
  const arr=selectionArray();
  if(!arr.length) return clearSelection();
  if(arr.length===1 && (arr[0].kind==='wall'||arr[0].kind==='enemy')) return __areaOldShowProperties();

  props.classList.remove('hidden');
  emptySelection.classList.add('hidden');
  wallProps.classList.add('hidden');
  enemyProps.classList.add('hidden');
  staticProps.classList.add('hidden');
  regularProps.classList.add('hidden');
  guidedProps.classList.add('hidden');
  selectedInfo.textContent=arr.length===1
    ? `${selectionKindLabel(arr[0].kind)} selecionado • arraste para mover`
    : `${arr.length} itens selecionados • arraste o bloco para mover`;
};

function cellBounds(pos){
  return {x1:pos.c*CELL,y1:pos.r*CELL,x2:(pos.c+1)*CELL,y2:(pos.r+1)*CELL};
}
function unionBounds(a,b){
  if(!a) return b?{...b}:null;
  if(!b) return {...a};
  return {x1:Math.min(a.x1,b.x1),y1:Math.min(a.y1,b.y1),x2:Math.max(a.x2,b.x2),y2:Math.max(a.y2,b.y2)};
}
function enemyBounds(e){
  if(!e) return null;
  let pts=[];
  if(e.type==='static') pts=[{x:e.x,y:e.y}];
  else if(e.type==='guided') pts=e.route||[];
  else if(e.mode==='free') pts=[e.start];
  else pts=[e.start,e.end];
  if(!pts.length) return null;
  let x1=Infinity,y1=Infinity,x2=-Infinity,y2=-Infinity;
  for(const p of pts){x1=Math.min(x1,p.x);y1=Math.min(y1,p.y);x2=Math.max(x2,p.x);y2=Math.max(y2,p.y);}
  return {x1:x1-14,y1:y1-14,x2:x2+14,y2:y2+14};
}
function objectBounds(sel){
  const o=getObject(sel); if(!o) return null;
  if(sel.kind==='wall'){const r=rectWall(o);return{x1:r.x,y1:r.y,x2:r.x+r.w,y2:r.y+r.h};}
  if(sel.kind==='enemy') return enemyBounds(o);
  if(sel.kind==='checkpoint'||sel.kind==='coin'||sel.kind==='spawn'||sel.kind==='goal') return cellBounds(o);
  if(sel.kind==='button') return cellBounds(o.pos);
  if(sel.kind==='portal') return unionBounds(cellBounds(o.a),cellBounds(o.b));
  if(sel.kind==='keyDoor') return unionBounds(cellBounds(o.key),cellBounds(o.door));
  return null;
}
function selectionGroupBounds(arr=selectionArray()){
  let b=null;
  for(const s of arr) b=unionBounds(b,objectBounds(s));
  return b;
}
function rectsIntersect(a,b){return !!a&&!!b&&a.x1<b.x2&&a.x2>b.x1&&a.y1<b.y2&&a.y2>b.y1;}
function pointInBounds(p,b){return !!b&&p.x>=b.x1&&p.x<=b.x2&&p.y>=b.y1&&p.y<=b.y2;}

function allSelectableItems(){
  return [
    ...map.walls.map(o=>({kind:'wall',id:o.id})),
    ...map.enemies.map(o=>({kind:'enemy',id:o.id})),
    ...map.checkpoints.map(o=>({kind:'checkpoint',id:o.id})),
    ...map.coins.map(o=>({kind:'coin',id:o.id})),
    ...map.portals.map(o=>({kind:'portal',id:o.id})),
    ...map.keyDoors.map(o=>({kind:'keyDoor',id:o.id})),
    ...map.buttons.map(o=>({kind:'button',id:o.id})),
    {kind:'spawn',id:0},{kind:'goal',id:0}
  ];
}
function selectionIntersectsRect(sel,r){
  const o=getObject(sel); if(!o) return false;
  if(sel.kind==='portal') return rectsIntersect(cellBounds(o.a),r)||rectsIntersect(cellBounds(o.b),r);
  if(sel.kind==='keyDoor') return rectsIntersect(cellBounds(o.key),r)||rectsIntersect(cellBounds(o.door),r);
  return rectsIntersect(objectBounds(sel),r);
}
function hitSelectableAt(p){
  for(const e of map.enemies){
    if(e.type==='guided'){
      for(const q of e.route||[]) if(Math.hypot(q.x-p.x,q.y-p.y)<=12) return {kind:'enemy',id:e.id};
    }
    const a=enemyAnchor(e); if(a&&Math.hypot(a.x-p.x,a.y-p.y)<=14) return {kind:'enemy',id:e.id};
  }
  const cellTests=[
    ['coin',map.coins,o=>o],['checkpoint',map.checkpoints,o=>o],
    ['button',map.buttons,o=>o.pos],['portal',map.portals,o=>sameCell(o.a,p.c,p.r)?o.a:sameCell(o.b,p.c,p.r)?o.b:null],
    ['keyDoor',map.keyDoors,o=>sameCell(o.key,p.c,p.r)?o.key:sameCell(o.door,p.c,p.r)?o.door:null]
  ];
  for(const [kind,list,posFn] of cellTests){
    for(const o of list){const pos=posFn(o);if(pos&&sameCell(pos,p.c,p.r))return{kind,id:o.id};}
  }
  if(sameCell(map.spawn,p.c,p.r)) return {kind:'spawn',id:0};
  if(sameCell(map.goal,p.c,p.r)) return {kind:'goal',id:0};
  const w=wallAt(p.c,p.r); if(w) return {kind:'wall',id:w.id};
  return null;
}

selectAt = function(p){
  const hit=hitSelectableAt(p);
  if(hit){selected=hit;selectedItems=[hit];showProperties();}
  else clearSelection();
  draw();
};

function selectionUsesGrid(arr=selectionArray()){return arr.some(s=>s.kind!=='enemy');}
function movementStep(arr=selectionArray()){
  if(selectionUsesGrid(arr)) return CELL;
  return clamp(Number(moveSnapSelect?.value)||1,1,32);
}
function captureSelectionState(arr){
  return arr.map(sel=>({sel:{...sel},data:cloneJson(getObject(sel))})).filter(x=>x.data);
}
function restoreMovedObject(entry,dx,dy){
  const {sel,data}=entry,o=getObject(sel); if(!o) return;
  const dc=dx/CELL,dr=dy/CELL;
  if(sel.kind==='enemy'){
    if(data.type==='static'){o.x=data.x+dx;o.y=data.y+dy;}
    else if(data.type==='guided') o.route=data.route.map(p=>({x:p.x+dx,y:p.y+dy}));
    else{o.start={x:data.start.x+dx,y:data.start.y+dy};o.end={x:data.end.x+dx,y:data.end.y+dy};}
  }else if(sel.kind==='wall'){o.c=data.c+dc;o.r=data.r+dr;}
  else if(sel.kind==='checkpoint'||sel.kind==='coin'||sel.kind==='spawn'||sel.kind==='goal'){o.c=data.c+dc;o.r=data.r+dr;}
  else if(sel.kind==='button'){o.pos={c:data.pos.c+dc,r:data.pos.r+dr};}
  else if(sel.kind==='portal'){o.a={c:data.a.c+dc,r:data.a.r+dr};o.b={c:data.b.c+dc,r:data.b.r+dr};}
  else if(sel.kind==='keyDoor'){o.key={c:data.key.c+dc,r:data.key.r+dr};o.door={c:data.door.c+dc,r:data.door.r+dr};}
}
function snappedDelta(raw,min,max,step){
  const lo=Math.ceil(min/step)*step,hi=Math.floor(max/step)*step;
  if(lo>hi) return 0;
  return clamp(Math.round(raw/step)*step,lo,hi);
}
function applyGestureMove(p){
  if(!areaGesture||areaGesture.type!=='move')return;
  const step=areaGesture.step,b=areaGesture.bounds;
  const dx=snappedDelta(p.x-areaGesture.start.x,-b.x1,canvas.width-b.x2,step);
  const dy=snappedDelta(p.y-areaGesture.start.y,-b.y1,canvas.height-b.y2,step);
  for(const entry of areaGesture.snapshot) restoreMovedObject(entry,dx,dy);
  areaGesture.dx=dx;areaGesture.dy=dy;
  setStatus(`Movendo ${areaGesture.snapshot.length} item(ns) • Δ ${dx}px, ${dy}px • snap ${step}px`);
  draw();
}
function toggleSelectionItem(hit){
  const arr=selectionArray(),key=selectionKey(hit),idx=arr.findIndex(s=>selectionKey(s)===key);
  selectedItems=idx>=0?arr.filter((_,i)=>i!==idx):arr.concat([hit]);
  selected=selectedItems[0]||null;
  if(selected)showProperties();else clearSelection();
  draw();
}
function beginAreaSelection(ev,p){
  selectionStart=null;selectionRect=null;
  const additive=!!(ev.ctrlKey||ev.metaKey||ev.shiftKey);
  const hit=hitSelectableAt(p);
  const current=selectionArray();
  const groupBox=current.length>1?selectionGroupBounds(current):null;
  const insideGroup=!hit&&groupBox&&pointInBounds(p,groupBox);

  if(additive&&hit){toggleSelectionItem(hit);return true;}

  if(hit||insideGroup){
    if(hit&&!current.some(s=>selectionKey(s)===selectionKey(hit))){
      selectedItems=[hit];selected=hit;showProperties();
    }
    const arr=selectionArray();
    const bounds=selectionGroupBounds(arr);
    if(arr.length&&bounds){
      areaGesture={type:'move',start:{x:p.x,y:p.y},snapshot:captureSelectionState(arr),bounds,step:movementStep(arr),dx:0,dy:0};
      canvas.style.cursor='grabbing';
      draw();
      return true;
    }
  }

  const base=additive?selectionArray():[];
  if(!additive) clearSelection();
  areaGesture={type:'marquee',start:{x:p.x,y:p.y},base};
  selectionStart={x:p.x,y:p.y};
  selectionRect={x1:p.x,y1:p.y,x2:p.x,y2:p.y};
  canvas.style.cursor='crosshair';
  draw();
  return true;
}
function updateAreaSelection(p){
  if(!areaGesture)return;
  if(areaGesture.type==='move'){applyGestureMove(p);return;}
  selectionRect={x1:areaGesture.start.x,y1:areaGesture.start.y,x2:p.x,y2:p.y};
  draw();
}
function finishAreaSelection(){
  if(!areaGesture)return;
  const g=areaGesture;
  areaGesture=null;
  canvas.style.cursor='';
  if(g.type==='move'){
    if(g.dx||g.dy){commit();showProperties();setStatus(`Seleção movida • ${g.dx}px, ${g.dy}px`);}
    else showProperties();
    draw();return;
  }
  const r=selectionRect?{
    x1:Math.min(selectionRect.x1,selectionRect.x2),y1:Math.min(selectionRect.y1,selectionRect.y2),
    x2:Math.max(selectionRect.x1,selectionRect.x2),y2:Math.max(selectionRect.y1,selectionRect.y2)
  }:null;
  selectionStart=null;selectionRect=null;
  if(!r||Math.abs(r.x2-r.x1)<3||Math.abs(r.y2-r.y1)<3){
    selectedItems=g.base.slice();selected=selectedItems[0]||null;
    if(selected)showProperties();else clearSelection();
    draw();return;
  }
  const hits=allSelectableItems().filter(s=>selectionIntersectsRect(s,r));
  const merged=[...g.base,...hits],seen=new Set();
  selectedItems=merged.filter(s=>{const k=selectionKey(s);if(seen.has(k))return false;seen.add(k);return true;});
  selected=selectedItems[0]||null;
  if(selected)showProperties();else clearSelection();
  setStatus(`${selectedItems.length} item(ns) selecionado(s) pela área.`);
  draw();
}

canvas.addEventListener('pointerdown',ev=>{
  if(mode!=='edit'||tool!=='select'||ev.button!==0||spacePan)return;
  const p=pointerPos(ev);
  if(appendRouteTarget)return;
  const node=findRouteNode(p);
  if(node&&selectionArray().length<=1)return;
  ev.preventDefault();
  ev.stopImmediatePropagation();
  dragging=true;
  try{canvas.setPointerCapture(ev.pointerId);}catch{}
  beginAreaSelection(ev,p);
},true);
canvas.addEventListener('pointermove',ev=>{
  if(!areaGesture)return;
  ev.preventDefault();ev.stopImmediatePropagation();
  const p=pointerPos(ev);
  cursorLabel.textContent=`x: ${Math.round(p.x)} • y: ${Math.round(p.y)}`;
  updateAreaSelection(p);
},true);
function finishAreaPointer(ev){
  if(!areaGesture)return;
  ev.preventDefault();ev.stopImmediatePropagation();
  dragging=false;
  finishAreaSelection();
}
canvas.addEventListener('pointerup',finishAreaPointer,true);
canvas.addEventListener('pointercancel',finishAreaPointer,true);

function removeSelectionObjects(arr){
  const byKind=new Map();
  for(const s of arr){if(s.kind==='spawn'||s.kind==='goal')continue;if(!byKind.has(s.kind))byKind.set(s.kind,new Set());byKind.get(s.kind).add(s.id);}
  const ids=k=>byKind.get(k)||new Set();
  map.walls=map.walls.filter(o=>!ids('wall').has(o.id));
  map.enemies=map.enemies.filter(o=>!ids('enemy').has(o.id));
  map.checkpoints=map.checkpoints.filter(o=>!ids('checkpoint').has(o.id));
  map.coins=map.coins.filter(o=>!ids('coin').has(o.id));
  map.portals=map.portals.filter(o=>!ids('portal').has(o.id));
  map.keyDoors=map.keyDoors.filter(o=>!ids('keyDoor').has(o.id));
  map.buttons=map.buttons.filter(o=>!ids('button').has(o.id));
  const wallIds=ids('wall'),enemyIds=ids('enemy'),doorIds=ids('keyDoor');
  map.buttons=map.buttons.filter(b=>!((b.target?.kind==='wall'&&wallIds.has(b.target.id))||(b.target?.kind==='enemy'&&enemyIds.has(b.target.id))||(b.target?.kind==='door'&&doorIds.has(b.target.id))));
}
deleteSelected = function(){
  const arr=selectionArray();if(!arr.length)return;
  const deletable=arr.filter(s=>s.kind!=='spawn'&&s.kind!=='goal');
  if(!deletable.length){setStatus('Início e chegada não podem ser excluídos.');return;}
  removeSelectionObjects(deletable);clearSelection();commit();draw();setStatus(`${deletable.length} objeto(s) excluído(s).`);
};
$('deleteSelected').onclick=deleteSelected;

function cloneSelection(){
  const out=[];
  for(const s of selectionArray()){
    if(s.kind==='spawn'||s.kind==='goal')continue;
    const o=getObject(s);if(o)out.push({kind:s.kind,data:cloneJson(o)});
  }
  return out;
}
function shiftCell(pos,n){return{c:pos.c+n,r:pos.r+n};}
function pasteClipboard(offsetMultiplier=1){
  if(!clipboardItems.length){setStatus('Nada copiado.');return;}
  const shiftPx=CELL*offsetMultiplier,created=[],idMap={wall:new Map(),enemy:new Map(),keyDoor:new Map()};
  const buttons=[];

  for(const item of clipboardItems){
    const d=cloneJson(item.data),kind=item.kind;
    if(kind==='button'){buttons.push(d);continue;}
    if(kind==='wall'&&canAddToCollection('walls')){const old=d.id;d.id=nextId(map.walls);idMap.wall.set(old,d.id);d.c+=offsetMultiplier;d.r+=offsetMultiplier;clampWallObj(d);map.walls.push(d);created.push({kind,id:d.id});}
    else if(kind==='enemy'&&canAddToCollection('enemies')){const old=d.id;d.id=nextId(map.enemies);idMap.enemy.set(old,d.id);shiftEnemy(d,shiftPx,shiftPx);clampEnemyObj(d);map.enemies.push(d);created.push({kind,id:d.id});}
    else if(kind==='checkpoint'&&canAddToCollection('checkpoints')){d.id=nextId(map.checkpoints);Object.assign(d,shiftCell(d,offsetMultiplier));if(insideCell(d.c,d.r)){map.checkpoints.push(d);created.push({kind,id:d.id});}}
    else if(kind==='coin'&&canAddToCollection('coins')){d.id=nextId(map.coins);Object.assign(d,shiftCell(d,offsetMultiplier));if(insideCell(d.c,d.r)){map.coins.push(d);created.push({kind,id:d.id});}}
    else if(kind==='portal'&&canAddToCollection('portals')){d.id=nextId(map.portals);d.a=shiftCell(d.a,offsetMultiplier);d.b=shiftCell(d.b,offsetMultiplier);if(insideCell(d.a.c,d.a.r)&&insideCell(d.b.c,d.b.r)){map.portals.push(d);created.push({kind,id:d.id});}}
    else if(kind==='keyDoor'&&canAddToCollection('keyDoors')){const old=d.id;d.id=nextId(map.keyDoors);idMap.keyDoor.set(old,d.id);d.key=shiftCell(d.key,offsetMultiplier);d.door=shiftCell(d.door,offsetMultiplier);if(insideCell(d.key.c,d.key.r)&&insideCell(d.door.c,d.door.r)){map.keyDoors.push(d);created.push({kind,id:d.id});}}
  }

  for(const d0 of buttons){
    if(!canAddToCollection('buttons'))break;
    const d=cloneJson(d0);d.id=nextId(map.buttons);d.pos=shiftCell(d.pos,offsetMultiplier);
    if(!insideCell(d.pos.c,d.pos.r))continue;
    if(d.target?.kind==='wall'&&idMap.wall.has(d.target.id))d.target.id=idMap.wall.get(d.target.id);
    if(d.target?.kind==='enemy'&&idMap.enemy.has(d.target.id))d.target.id=idMap.enemy.get(d.target.id);
    if(d.target?.kind==='door'&&idMap.keyDoor.has(d.target.id))d.target.id=idMap.keyDoor.get(d.target.id);
    map.buttons.push(d);created.push({kind:'button',id:d.id});
  }
  selectedItems=created;selected=created[0]||null;commit();if(selected)showProperties();draw();setStatus(`${created.length} item(ns) colado(s).`);
}
copySelectionToClipboard=function(){clipboardItems=cloneSelection();setStatus(clipboardItems.length?`${clipboardItems.length} item(ns) copiado(s).`:'Nenhum item copiável selecionado.');};
duplicateSelection=function(){clipboardItems=cloneSelection();pasteClipboard(1);};
duplicateBtn&&(duplicateBtn.onclick=duplicateSelection);
copyBtn&&(copyBtn.onclick=copySelectionToClipboard);
pasteBtn&&(pasteBtn.onclick=()=>pasteClipboard(1));
duplicateSelectedBtn&&(duplicateSelectedBtn.onclick=duplicateSelection);
copySelectedBtn&&(copySelectedBtn.onclick=copySelectionToClipboard);

const __areaDrawBase=draw;
draw=function(){
  __areaDrawBase();
  if(mode!=='edit')return;
  const arr=selectionArray(),b=selectionGroupBounds(arr);
  if(arr.length&&b){
    ctx.save();
    ctx.strokeStyle='#00d4ff';ctx.fillStyle='rgba(0,212,255,.08)';ctx.lineWidth=2;ctx.setLineDash([8,5]);
    ctx.fillRect(b.x1,b.y1,b.x2-b.x1,b.y2-b.y1);
    ctx.strokeRect(b.x1,b.y1,b.x2-b.x1,b.y2-b.y1);
    ctx.setLineDash([]);ctx.font='bold 11px Segoe UI,Arial';ctx.textAlign='left';ctx.textBaseline='bottom';
    const label=`${arr.length} item(ns)`;
    const w=ctx.measureText(label).width+10,x=clamp(b.x1,0,canvas.width-w),y=Math.max(15,b.y1-4);
    ctx.fillStyle='rgba(0,50,70,.92)';ctx.fillRect(x,y-16,w,16);
    ctx.fillStyle='#bff5ff';ctx.fillText(label,x+5,y-3);
    ctx.restore();
  }
};

addEventListener('keydown',ev=>{
  const typing=['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName);
  if(typing||mode!=='edit'||tool!=='select'||!selectionArray().length)return;
  const dir={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[ev.key];
  if(!dir)return;
  ev.preventDefault();
  const arr=selectionArray(),step=movementStep(arr)*(ev.shiftKey?10:1),b=selectionGroupBounds(arr);
  let dx=dir[0]*step,dy=dir[1]*step;
  dx=snappedDelta(dx,-b.x1,canvas.width-b.x2,movementStep(arr));
  dy=snappedDelta(dy,-b.y1,canvas.height-b.y2,movementStep(arr));
  const snap=captureSelectionState(arr);
  for(const entry of snap)restoreMovedObject(entry,dx,dy);
  commit();showProperties();draw();setStatus(`Seleção movida • ${dx}px, ${dy}px`);
});


/* src/editor/validation.js */
'use strict';
function validateMap(){const errors=[],warnings=[];try{assertMapInputLimits(map);}catch(e){errors.push('Limite de segurança: '+(e?.message||'mapa inválido.'));}if(!insideCell(map.spawn.c,map.spawn.r))errors.push('O ponto de início está fora do mapa.');if(!insideCell(map.goal.c,map.goal.r))errors.push('A chegada está fora do mapa.');const blocked=(c,r)=>!!wallAt(c,r)||map.keyDoors.some(k=>sameCell(k.door,c,r));if(blocked(map.spawn.c,map.spawn.r))errors.push('O início está bloqueado por uma parede ou porta.');if(blocked(map.goal.c,map.goal.r))warnings.push('A chegada está coberta por uma parede ou porta.');for(const e of map.enemies){if(e.type==='guided'&&(!Array.isArray(e.route)||e.route.length<2))errors.push(`Inimigo guiado #${e.id} precisa de pelo menos 2 pontos.`);if(e.type==='moving'&&Math.hypot(e.start.x-e.end.x,e.start.y-e.end.y)<1)warnings.push(`Inimigo móvel #${e.id} tem rota muito curta.`);}const cols=gridCols(),rows=gridRows(),passable=(c,r)=>c>=0&&r>=0&&c<cols&&r<rows&&!blocked(c,r),queue=[[map.spawn.c,map.spawn.r]],seen=new Set([`${map.spawn.c},${map.spawn.r}`]);while(queue.length){const [c,r]=queue.shift();for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nc=c+dx,nr=r+dy,k=`${nc},${nr}`;if(passable(nc,nr)&&!seen.has(k)){seen.add(k);queue.push([nc,nr]);}}for(const p of map.portals){let target=null;if(sameCell(p.a,c,r))target=p.b;else if(sameCell(p.b,c,r))target=p.a;if(target){const k=`${target.c},${target.r}`;if(passable(target.c,target.r)&&!seen.has(k)){seen.add(k);queue.push([target.c,target.r]);}}}}if(!seen.has(`${map.goal.c},${map.goal.r}`))warnings.push('A chegada não parece alcançável a partir do início (considerando paredes, portas fechadas e portais).');for(const cp of map.checkpoints)if(!seen.has(`${cp.c},${cp.r}`))warnings.push(`Checkpoint #${cp.id} pode estar inacessível.`);for(const coin of map.coins)if(!seen.has(`${coin.c},${coin.r}`))warnings.push(`Moeda #${coin.id} pode estar inacessível.`);return{errors,warnings};}
function renderValidation(result){const total=result.errors.length+result.warnings.length;validationSummary.textContent=total===0?'Mapa validado: nenhum problema encontrado.':`Validação concluída: ${result.errors.length} erro(s), ${result.warnings.length} aviso(s).`;const lines=[];if(result.errors.length){lines.push('Erros:');result.errors.forEach(m=>lines.push(`• ${m}`));}if(result.warnings.length){if(lines.length)lines.push('');lines.push('Avisos:');result.warnings.forEach(m=>lines.push(`• ${m}`));}validationList.textContent=lines.join('\n');}
function runValidation(showStatus=true){const result=validateMap();renderValidation(result);if(showStatus)setStatus(result.errors.length?'Validação: há erros no mapa.':result.warnings.length?'Validação concluída com avisos.':'Mapa validado com sucesso.');return result;}runValidationBtn&&(runValidationBtn.onclick=()=>runValidation(true));validateBtn&&(validateBtn.onclick=()=>runValidation(true));


/* src/editor/templates.js */
'use strict';
function builtInTemplates(){const a=freshMap();a.meta.name='Arena básica';a.grid={cols:20,rows:12};a.spawn={c:1,r:5};a.goal={c:18,r:5};a.coins=[{id:1,c:10,r:5}];const c=freshMap();c.meta.name='Corredor com checkpoint';c.grid={cols:28,rows:10};c.spawn={c:1,r:4};c.goal={c:26,r:4};c.checkpoints=[{id:1,c:12,r:4}];c.walls=[{id:1,c:0,r:2,w:28,h:1},{id:2,c:0,r:7,w:28,h:1}];c.enemies=[{id:1,type:'moving',mode:'patrol',speed:90,start:{x:9*CELL,y:4.5*CELL},end:{x:18*CELL,y:4.5*CELL},angle:0}];const l=freshMap();l.meta.name='Labirinto curto';l.grid={cols:24,rows:14};l.spawn={c:1,r:1};l.goal={c:22,r:12};l.walls=[{id:1,c:3,r:0,w:1,h:10},{id:2,c:6,r:4,w:1,h:10},{id:3,c:9,r:0,w:1,h:10},{id:4,c:12,r:4,w:1,h:10},{id:5,c:15,r:0,w:1,h:10},{id:6,c:18,r:4,w:1,h:10}];return[{key:'builtin:arena',name:'Arena básica',map:a},{key:'builtin:corridor',name:'Corredor com checkpoint',map:c},{key:'builtin:maze',name:'Labirinto curto',map:l}];}
function customTemplates(){try{const raw=parseJsonWithLimit(localStorage.getItem('sanMapEditorV11Templates')||localStorage.getItem('sanMapEditorV7Templates')||'[]');if(!Array.isArray(raw))return[];const safe=[];for(const item of raw.slice(0,SECURITY.MAX_TEMPLATES)){if(!isRecord(item)||!isRecord(item.map))continue;try{assertMapInputLimits(item.map);}catch{continue;}const key=cleanText(item.key,100,''),name=cleanText(item.name,SECURITY.MAX_TEMPLATE_NAME,'Template');if(key)safe.push({key,name,map:item.map});}return safe;}catch{return[];}}
function saveCustomTemplates(list){try{localStorage.setItem('sanMapEditorV11Templates',JSON.stringify(Array.isArray(list)?list.slice(0,SECURITY.MAX_TEMPLATES):[]));return true;}catch{setStatus('Não foi possível salvar o template no armazenamento local.');return false;}}
function refreshTemplates(){templatesCache=[...builtInTemplates(),...customTemplates()];if(!templateSelect)return;templateSelect.replaceChildren();for(const item of templatesCache){const o=document.createElement('option');o.value=String(item.key);o.textContent=cleanText(item.name,SECURITY.MAX_TEMPLATE_NAME,'Template');templateSelect.appendChild(o);}}
function loadTemplateByKey(key){const item=templatesCache.find(t=>t.key===key);if(!item)return;try{normalizeMap(cloneJson(item.map));resizeCanvas();fitMapToGrid();syncDocumentControls();clearPending();clearSelection();resetHistory();setMode('edit');draw();runValidation(false);setStatus(`Template carregado: ${cleanText(item.name,SECURITY.MAX_TEMPLATE_NAME,'Template')}`);}catch(e){setStatus('Template recusado: '+(e?.message||'dados inválidos.'));}}
refreshTemplates();loadTemplateBtn&&(loadTemplateBtn.onclick=()=>{if(templateSelect.value)loadTemplateByKey(templateSelect.value);});saveTemplateBtn&&(saveTemplateBtn.onclick=()=>{if(customTemplates().length>=SECURITY.MAX_TEMPLATES){setStatus(`Limite de ${SECURITY.MAX_TEMPLATES} templates próprios atingido.`);return;}const typed=prompt('Nome do template:',map.meta?.name||'Meu template');if(typed===null)return;const name=cleanText(typed,SECURITY.MAX_TEMPLATE_NAME,'');if(!name){setStatus('O template precisa de um nome.');return;}try{assertMapInputLimits(map);}catch(e){setStatus('Template não salvo: '+e.message);return;}const list=customTemplates(),key='custom:'+Date.now();list.push({key,name,map:cloneJson(map)});if(saveCustomTemplates(list)){refreshTemplates();templateSelect.value=key;setStatus('Template salvo localmente.');}});deleteTemplateBtn&&(deleteTemplateBtn.onclick=()=>{const key=templateSelect.value;if(!key||!key.startsWith('custom:')){setStatus('Selecione um template próprio para excluir.');return;}saveCustomTemplates(customTemplates().filter(t=>t.key!==key));refreshTemplates();setStatus('Template excluído.');});


/* src/ui/actions.js */
'use strict';
$('editBtn').onclick=()=>setMode('edit');$('testBtn').onclick=()=>setMode('test');$('resetBtn').onclick=()=>{if(mode==='test')startTest();else{clearPending();clearSelection();draw();setStatus('Edição limpa de seleções temporárias.');}};$('undoBtn').onclick=undo;$('redoBtn').onclick=redo;
$('newBtn').onclick=()=>{if(confirm('Criar um mapa novo? Alterações não exportadas continuarão apenas no histórico desta sessão.')){map=freshMap();resizeCanvas();deaths=0;clearPending();clearSelection();syncDocumentControls();resetHistory();setMode('edit');draw();setStatus('Novo mapa criado.');}};
$('openBtn').onclick=()=>fileInput.click();fileInput.onchange=()=>{const f=fileInput.files?.[0];if(!f)return;if(f.size>SECURITY.MAX_IMPORT_BYTES){setStatus(`Arquivo recusado: limite de ${Math.round(SECURITY.MAX_IMPORT_BYTES/1000000*10)/10} MB.`);fileInput.value='';return;}const r=new FileReader();r.onload=()=>{try{normalizeMap(parseMapJson(String(r.result)));clearPending();clearSelection();syncDocumentControls();resetHistory();setMode('edit');draw();setStatus('Mapa carregado: '+cleanText(f.name,120,'arquivo.json'));}catch(e){setStatus('Mapa recusado: '+(e?.message||'JSON inválido.'));}fileInput.value='';};r.onerror=()=>{setStatus('Não foi possível ler o arquivo.');fileInput.value='';};r.readAsText(f,'utf-8');};
$('downloadBtn').onclick=()=>{try{assertMapInputLimits(map);}catch(e){setStatus('Não foi possível salvar: '+e.message);return;}syncLevelNameFromInput({finalize:true});const json=JSON.stringify(map,null,2);jsonArea.value=json;if(!confirm('Deseja baixar esta fase em JSON?'))return;const blob=new Blob([json],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');const safe=(map.meta.name||'mapa_san').replace(/[^\w\-áéíóúãõç ]/gi,'').trim().replace(/\s+/g,'_').slice(0,80)||'mapa_san';a.href=url;a.download=safe+'.json';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);setStatus('JSON salvo.');};
$('generateBtn').onclick=()=>{try{assertMapInputLimits(map);}catch(e){setStatus('JSON não gerado: '+e.message);return;}syncLevelNameFromInput({finalize:true});jsonArea.value=JSON.stringify(map,null,2);setStatus('Caixa JSON atualizada.');};$('loadTextBtn').onclick=()=>{try{normalizeMap(parseMapJson(jsonArea.value));clearPending();clearSelection();syncDocumentControls();resetHistory();setMode('edit');draw();setStatus('JSON carregado da caixa.');}catch(e){setStatus('JSON recusado: '+(e?.message||'conteúdo inválido.'));}};
addEventListener('keydown',ev=>{const typing=['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName);if((ev.ctrlKey||ev.metaKey)&&ev.key.toLowerCase()==='z'){ev.preventDefault();ev.shiftKey?redo():undo();return;}if((ev.ctrlKey||ev.metaKey)&&ev.key.toLowerCase()==='y'){ev.preventDefault();redo();return;}if(ev.key==='Delete'&&!typing&&mode==='edit'&&selected){deleteSelected();return;}if(mode!=='test'||typing)return;const k=ev.key.toLowerCase();keys[k]=true;if(k.startsWith('arrow'))ev.preventDefault();});addEventListener('keyup',ev=>keys[ev.key.toLowerCase()]=false);
const oldDownload=$('downloadBtn').onclick;$('downloadBtn').onclick=()=>{runValidation(false);oldDownload();};const oldTest=$('testBtn').onclick;$('testBtn').onclick=()=>{try{assertMapInputLimits(map);}catch(e){setStatus('Teste bloqueado: '+e.message);runValidation(false);return;}runValidation(false);oldTest();};
addEventListener('keydown',ev=>{const typing=['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName);if(typing)return;if((ev.ctrlKey||ev.metaKey)&&ev.key.toLowerCase()==='c'){ev.preventDefault();copySelectionToClipboard();}if((ev.ctrlKey||ev.metaKey)&&ev.key.toLowerCase()==='v'){ev.preventDefault();pasteClipboard(1);}if((ev.ctrlKey||ev.metaKey)&&ev.key.toLowerCase()==='d'){ev.preventDefault();duplicateSelection();}});


/* src/core/storage.js */
'use strict';function restoreDraft(){try{const s=localStorage.getItem('sanMapEditorV11Draft')||localStorage.getItem('sanMapEditorV7Draft')||localStorage.getItem('sanMapEditorV6Draft')||localStorage.getItem('sanMapEditorV5Draft');if(s){normalizeMap(parseMapJson(s));return true;}}catch{try{localStorage.removeItem('sanMapEditorV11Draft');}catch{}}return false;}


/* src/app.js */
'use strict';
restoreDraft();
normalizeMap(map);
syncDocumentControls();
resetHistory();
updateGuideButtons();
updateStatus();
refreshTemplates();
applyZoom();
draw();
document.querySelectorAll('.tool').forEach(btn=>btn.classList.toggle('active',btn.dataset.tool===tool));
