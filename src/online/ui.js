'use strict';

let lastShareUrl='';

function onlineEls(){
  return {
    panel:$('communityPanel'),
    alias:$('communityAlias'),
    shareUrl:$('communityShareUrl'),
    shareBtn:$('createShareBtn'),
    copyBtn:$('copyShareBtn'),
    submitBtn:$('submitCommunityBtn'),
    exploreBtn:$('openCommunityBtn'),
    closeBtn:$('closeCommunityBtn'),
    topBtn:$('communityBtn'),
    onlineState:$('communityState')
  };
}

function setCommunityState(message){
  const el=$('communityState');
  if(el)el.textContent=message;
}

function saveCommunityAlias(){
  const el=$('communityAlias');
  if(!el)return;
  const safe=sanitizeCommunityText(el.value,40);
  el.value=safe;
  try{localStorage.setItem('sanCommunityAlias',safe);}catch{}
}

async function createCurrentShareLink(){
  const el=onlineEls();
  setCommunityState('Compactando a fase...');
  try{
    lastShareUrl=await buildShareUrl({play:true});
    if(el.shareUrl)el.shareUrl.value=lastShareUrl;
    if(el.copyBtn)el.copyBtn.disabled=false;
    if(el.submitBtn)el.submitBtn.disabled=false;
    setCommunityState('Link pronto. Quem abrir recebe uma cópia desta fase e entra no teste.');
    return lastShareUrl;
  }catch(e){
    setCommunityState('Não foi possível criar o link: '+(e?.message||'erro desconhecido'));
    return '';
  }
}

function communityCatalogUrl(){
  return new URL('community/',onlineBaseUrl()).toString();
}

async function initializeOnlineFoundation(){
  const el=onlineEls();
  if(el.alias){
    try{el.alias.value=sanitizeCommunityText(localStorage.getItem('sanCommunityAlias')||'',40);}catch{}
    el.alias.addEventListener('change',saveCommunityAlias);
  }
  el.topBtn?.addEventListener('click',()=>{
    el.panel?.classList.toggle('hidden');
    if(!el.panel?.classList.contains('hidden'))el.panel?.scrollIntoView({behavior:'smooth',block:'nearest'});
  });
  el.closeBtn?.addEventListener('click',()=>el.panel?.classList.add('hidden'));
  el.shareBtn?.addEventListener('click',createCurrentShareLink);
  el.copyBtn?.addEventListener('click',async()=>{
    const value=el.shareUrl?.value||lastShareUrl;
    if(!value)return;
    const ok=await copyTextSafe(value);
    setCommunityState(ok?'Link copiado.':'Não consegui copiar automaticamente; selecione o campo e copie.');
  });
  el.submitBtn?.addEventListener('click',async()=>{
    saveCommunityAlias();
    const link=(el.shareUrl?.value||lastShareUrl)||await createCurrentShareLink();
    if(!link)return;
    const issueUrl=buildCommunityIssueUrl(link,el.alias?.value||'');
    window.open(issueUrl,'_blank','noopener,noreferrer');
    setCommunityState('Envio aberto no GitHub. Depois de enviar, a fase pode aparecer no catálogo público.');
  });
  el.exploreBtn?.addEventListener('click',()=>window.open(communityCatalogUrl(),'_blank','noopener,noreferrer'));

  try{
    const loaded=await loadSharedMapFromLocation();
    if(loaded)el.panel?.classList.remove('hidden');
  }catch(e){
    setStatus('Falha ao abrir fase compartilhada: '+(e?.message||'link inválido.'));
    setCommunityState('Este link de fase não pôde ser aberto.');
  }
}
