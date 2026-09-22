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
