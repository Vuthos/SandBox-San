'use strict';
function setMode(next){mode=next;$('editBtn').classList.toggle('active',next==='edit');$('testBtn').classList.toggle('active',next==='test');modeLabel.textContent=next==='edit'?'EDIÇÃO':'TESTE';clearSelection();if(next==='test')startTest();else{if(raf)cancelAnimationFrame(raf);raf=null;player=null;simEnemies=[];won=false;updateStatus();draw();}}
function startTest(){if(raf)cancelAnimationFrame(raf);won=false;collectedCoins=new Set();collectedKeys=new Set();disabledTargets=new Set();buttonInside=new Set();activeCheckpoint=null;respawnPoint=cellCenter(map.spawn.c,map.spawn.r);player={x:respawnPoint.x,y:respawnPoint.y,r:10,speed:PLAYER_SPEED,portalLock:false,vx:0,vy:0,impulseX:0,impulseY:0,arrowLock:null};simEnemies=buildSimEnemies();last=performance.now();updateStatus();raf=requestAnimationFrame(loop);}
function currentFloorTile(){if(!player)return null;return floorTileAt(clamp(Math.floor(player.x/CELL),0,gridCols()-1),clamp(Math.floor(player.y/CELL),0,gridRows()-1));}
function triggerArrow(tile){
  if(!tile||!tile.type.startsWith('arrow-')){player.arrowLock=null;return;}
  if(player.arrowLock===tile.id)return;
  const dir=tile.type.slice(6),v={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[dir];if(!v)return;
  player.impulseX=v[0]*ARROW_IMPULSE;player.impulseY=v[1]*ARROW_IMPULSE;player.arrowLock=tile.id;
}
function updatePlayerMotion(dx,dy,dt){
  const tile=currentFloorTile(),type=tile?.type||'normal',ice=type==='ice',water=type==='water';
  triggerArrow(tile);
  const speed=PLAYER_SPEED*(water?WATER_SPEED_FACTOR:1);
  if(ice){
    const tx=dx*speed,ty=dy*speed,maxStep=ICE_ACCEL*dt;
    player.vx+=clamp(tx-player.vx,-maxStep,maxStep);player.vy+=clamp(ty-player.vy,-maxStep,maxStep);
    if(!dx)player.vx*=Math.exp(-ICE_DRAG*dt);if(!dy)player.vy*=Math.exp(-ICE_DRAG*dt);
    const mag=Math.hypot(player.vx,player.vy),max=PLAYER_SPEED*1.15;if(mag>max){player.vx=player.vx/mag*max;player.vy=player.vy/mag*max;}
  }else{player.vx=dx*speed;player.vy=dy*speed;}
  movePlayer((player.vx+player.impulseX)*dt,(player.vy+player.impulseY)*dt);
  const impulseDrag=ice?1.5:water?8:5,decay=Math.exp(-impulseDrag*dt);player.impulseX*=decay;player.impulseY*=decay;
  const after=currentFloorTile();if(!after||after.id!==player.arrowLock)if(!after?.type?.startsWith('arrow-'))player.arrowLock=null;
}
function update(dt){if(!player||won)return;let dx=0,dy=0;if(keys.w||keys.arrowup)dy--;if(keys.s||keys.arrowdown)dy++;if(keys.a||keys.arrowleft)dx--;if(keys.d||keys.arrowright)dx++;if(dx&&dy){dx*=.70710678;dy*=.70710678;}updatePlayerMotion(dx,dy,dt);teleport();collect();checkpoint();buttons();for(const e of simEnemies){if(!enemyActive(e.id))continue;updateEnemy(e,dt);if(circleCircle(player,e)){respawn();break;}}if(circleRect(player.x,player.y,player.r,rectCell(map.goal.c,map.goal.r))){if(collectedCoins.size>=map.coins.length){won=true;updateStatus();}else setStatus(`Chegada bloqueada: faltam ${map.coins.length-collectedCoins.size} moeda(s).`);}}
function loop(now){const dt=Math.min((now-last)/1000,.04);last=now;update(dt);draw();raf=requestAnimationFrame(loop);}
