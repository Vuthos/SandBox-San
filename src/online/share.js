'use strict';

function bytesToBase64Url(bytes){
  let binary='';
  const CHUNK=0x8000;
  for(let i=0;i<bytes.length;i+=CHUNK){
    const slice=bytes.subarray(i,Math.min(bytes.length,i+CHUNK));
    binary+=String.fromCharCode(...slice);
  }
  return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}

function base64UrlToBytes(value){
  const normalized=value.replace(/-/g,'+').replace(/_/g,'/');
  const padded=normalized+'='.repeat((4-normalized.length%4)%4);
  const binary=atob(padded);
  const out=new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++)out[i]=binary.charCodeAt(i);
  return out;
}

async function readStreamWithLimit(stream,maxBytes){
  const reader=stream.getReader(),chunks=[];
  let total=0;
  try{
    while(true){
      const {done,value}=await reader.read();
      if(done)break;
      if(!(value instanceof Uint8Array))throw new Error('Fluxo compactado inválido.');
      total+=value.byteLength;
      if(total>maxBytes){
        await reader.cancel();
        throw new Error('Fase compartilhada excede o limite após descompactação.');
      }
      chunks.push(value);
    }
  }finally{
    try{reader.releaseLock();}catch{}
  }
  const out=new Uint8Array(total);
  let offset=0;
  for(const chunk of chunks){out.set(chunk,offset);offset+=chunk.byteLength;}
  return out;
}

async function gzipBytes(bytes){
  if(typeof CompressionStream!=='function')return null;
  const stream=new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function gunzipBytes(bytes){
  if(typeof DecompressionStream!=='function')throw new Error('Este navegador não suporta links compactados.');
  const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  return readStreamWithLimit(stream,ONLINE_CONFIG.maxSharedDecodedBytes);
}

async function encodeSharedMap(mapValue){
  assertMapInputLimits(mapValue);
  const json=JSON.stringify({kind:'san-map',fileFormat:7,map:mapValue});
  const raw=new TextEncoder().encode(json);
  if(raw.byteLength>ONLINE_CONFIG.maxSharedDecodedBytes)throw new Error('Esta fase excede o limite seguro para compartilhamento.');
  const gz=await gzipBytes(raw);
  const packed=gz&&gz.length<raw.length?('g'+bytesToBase64Url(gz)):('r'+bytesToBase64Url(raw));
  const token=ONLINE_CONFIG.sharePrefix+packed;
  if(token.length>ONLINE_CONFIG.maxShareTokenChars){
    throw new Error('Esta fase ficou grande demais para um link. Exporte o JSON até o catálogo com backend estar ativo.');
  }
  return token;
}

async function decodeSharedMap(token){
  if(typeof token!=='string'||!token.startsWith(ONLINE_CONFIG.sharePrefix))throw new Error('Link SAN inválido.');
  const body=token.slice(ONLINE_CONFIG.sharePrefix.length);
  if(body.length>ONLINE_CONFIG.maxShareTokenChars)throw new Error('Link SAN excede o limite permitido.');
  const mode=body.charAt(0),payload=body.slice(1);
  if(!payload)throw new Error('Link SAN vazio.');
  let bytes=base64UrlToBytes(payload);
  if(mode==='g')bytes=await gunzipBytes(bytes);
  else if(mode==='r'){
    if(bytes.byteLength>ONLINE_CONFIG.maxSharedDecodedBytes)throw new Error('Fase compartilhada excede o limite permitido.');
  }else throw new Error('Formato de link SAN desconhecido.');
  const text=new TextDecoder().decode(bytes);
  if(text.length>SECURITY.MAX_JSON_CHARS)throw new Error('Fase compartilhada excede o limite de JSON.');
  const parsed=parseJsonWithLimit(text);
  if(!isRecord(parsed)||parsed.kind!=='san-map'||!isRecord(parsed.map))throw new Error('Conteúdo compartilhado inválido.');
  assertMapInputLimits(parsed.map);
  return parsed.map;
}

function onlineBaseUrl(){
  return ONLINE_CONFIG.publicBaseUrl;
}

async function buildShareUrl(options){
  options=options||{};
  const token=await encodeSharedMap(cloneJson(map));
  const u=new URL(onlineBaseUrl());
  u.searchParams.set('shared','1');
  if(options.play!==false)u.searchParams.set('play','1');
  u.hash='san='+token;
  return u.toString();
}

function sharedTokenFromLocation(){
  const hash=location.hash.startsWith('#')?location.hash.slice(1):location.hash;
  const params=new URLSearchParams(hash);
  return params.get('san')||'';
}

async function loadSharedMapFromLocation(){
  const token=sharedTokenFromLocation();
  if(!token)return false;
  const incoming=await decodeSharedMap(token);
  normalizeMap(incoming);
  clearPending();
  clearSelection();
  syncDocumentControls();
  resetHistory();
  resizeCanvas();
  applyZoom();
  draw();
  runValidation(false);
  if(new URLSearchParams(location.search).get('play')==='1')setMode('test');
  setStatus('Fase compartilhada carregada.');
  return true;
}

async function copyTextSafe(value){
  try{
    await navigator.clipboard.writeText(value);
    return true;
  }catch{
    const ta=document.createElement('textarea');
    ta.value=value;
    ta.setAttribute('readonly','');
    ta.style.position='fixed';
    ta.style.opacity='0';
    document.body.appendChild(ta);
    ta.select();
    const ok=document.execCommand('copy');
    ta.remove();
    return ok;
  }
}
