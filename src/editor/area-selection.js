
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
