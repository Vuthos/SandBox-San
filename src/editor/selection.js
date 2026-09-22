'use strict';

function clearSelection(){
  selected=null; appendRouteTarget=null; routeDrag=null;
  props.classList.add('hidden'); emptySelection.classList.remove('hidden');
  wallProps.classList.add('hidden'); enemyProps.classList.add('hidden');
  staticProps.classList.add('hidden'); regularProps.classList.add('hidden'); guidedProps.classList.add('hidden');
}
function toggleModeFields(){const free=editMoveMode.value==='free';$('patrolCoords').classList.toggle('hidden',free);freeAngle.classList.toggle('hidden',!free);}
editMoveMode.addEventListener('change',toggleModeFields);
function showProperties(){
  if(!selected)return clearSelection();
  props.classList.remove('hidden');emptySelection.classList.add('hidden');
  wallProps.classList.add('hidden');enemyProps.classList.add('hidden');staticProps.classList.add('hidden');regularProps.classList.add('hidden');guidedProps.classList.add('hidden');
  if(selected.kind==='wall'){const w=map.walls.find(q=>q.id===selected.id);if(!w)return clearSelection();selectedInfo.textContent=`Parede #${w.id} • ${w.w}×${w.h}`;wallW.max=gridCols()-w.c;wallH.max=gridRows()-w.r;wallW.value=w.w;wallH.value=w.h;wallProps.classList.remove('hidden');return;}
  const e=map.enemies.find(q=>q.id===selected.id);if(!e)return clearSelection();enemyProps.classList.remove('hidden');selectedInfo.textContent=`Inimigo #${e.id} • ${e.type==='guided'?'guiado':e.type==='static'?'parado':'móvel'}`;
  if(e.type==='static')staticProps.classList.remove('hidden');
  else if(e.type==='guided'){guidedProps.classList.remove('hidden');guidedSpeed.value=e.speed;routeInfo.textContent=`Rota com ${e.route.length} ponto(s). Clique e arraste os pontos numerados para reposicioná-los.`;$('removeRouteBtn').disabled=e.route.length<=2;}
  else{regularProps.classList.remove('hidden');editEnemySpeed.value=e.speed;editMoveMode.value=e.mode||'patrol';startX.value=Math.round(e.start.x);startY.value=Math.round(e.start.y);endX.value=Math.round(e.end.x);endY.value=Math.round(e.end.y);freeAngleInput.value=Math.round(e.angle||0);toggleModeFields();}
}
function selectAt(p){const w=wallAt(p.c,p.r);if(w){selected={kind:'wall',id:w.id};showProperties();draw();return;}const e=enemyAtPoint(p.x,p.y);if(e){selected={kind:'enemy',id:e.id};showProperties();draw();return;}clearSelection();draw();}
$('applyWall').onclick=()=>{if(selected?.kind!=='wall')return;const w=map.walls.find(q=>q.id===selected.id);if(!w)return;w.w=clamp(Number(wallW.value)||1,1,gridCols()-w.c);w.h=clamp(Number(wallH.value)||1,1,gridRows()-w.r);commit();showProperties();draw();setStatus('Parede atualizada.');};
$('applyEnemy').onclick=()=>{if(selected?.kind!=='enemy')return;const e=map.enemies.find(q=>q.id===selected.id);if(!e||e.type!=='moving')return;e.speed=clamp(Number(editEnemySpeed.value)||1,1,1000);enemySpeed.value=e.speed;const requested=editMoveMode.value;if(requested==='free'&&map.walls.length){editMoveMode.value='patrol';toggleModeFields();setStatus('Modo livre bloqueado: o mapa possui paredes.');return;}e.mode=requested;if(e.mode==='patrol'){e.start=clampPointToCanvas({x:Number(startX.value)||0,y:Number(startY.value)||0});e.end=clampPointToCanvas({x:Number(endX.value)||0,y:Number(endY.value)||0});}else e.angle=normAngle(freeAngleInput.value);commit();showProperties();draw();setStatus('Inimigo atualizado.');};
$('applyGuided').onclick=()=>{if(selected?.kind!=='enemy')return;const e=map.enemies.find(q=>q.id===selected.id);if(!e||e.type!=='guided')return;e.speed=clamp(Number(guidedSpeed.value)||1,1,1000);enemySpeed.value=e.speed;commit();showProperties();setStatus('Velocidade da rota atualizada.');};
$('appendRouteBtn').onclick=()=>{if(selected?.kind!=='enemy')return;const e=map.enemies.find(q=>q.id===selected.id);if(!e||e.type!=='guided')return;appendRouteTarget=e.id;setStatus('Clique no mapa para adicionar um ponto à rota.');};
$('removeRouteBtn').onclick=()=>{if(selected?.kind!=='enemy')return;const e=map.enemies.find(q=>q.id===selected.id);if(!e||e.type!=='guided'||e.route.length<=2)return;e.route.pop();commit();showProperties();draw();setStatus('Último ponto removido.');};
$('reverseRouteBtn').onclick=()=>{if(selected?.kind!=='enemy')return;const e=map.enemies.find(q=>q.id===selected.id);if(!e||e.type!=='guided')return;e.route.reverse();commit();showProperties();draw();setStatus('Rota invertida.');};
$('deleteSelected').onclick=deleteSelected;
function deleteSelected(){if(!selected)return;const {kind,id}=selected;if(kind==='wall'){map.walls=map.walls.filter(q=>q.id!==id);map.buttons=map.buttons.filter(b=>!(b.target?.kind==='wall'&&b.target.id===id));}else{map.enemies=map.enemies.filter(q=>q.id!==id);map.buttons=map.buttons.filter(b=>!(b.target?.kind==='enemy'&&b.target.id===id));}clearSelection();commit();draw();setStatus('Objeto excluído.');}
