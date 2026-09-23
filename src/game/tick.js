'use strict';

function updateEnemyFrame(enemies,dt,isActive,updateFn,collidesFn){
  let hit=false;
  for(const enemy of enemies){
    if(!isActive(enemy.id))continue;
    updateFn(enemy,dt);
    if(collidesFn(enemy))hit=true;
  }
  return hit;
}
