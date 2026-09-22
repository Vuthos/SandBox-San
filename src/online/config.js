'use strict';

const ONLINE_CONFIG = Object.freeze({
  version: '1.3.0',
  publicBaseUrl: 'https://vuthos.github.io/SandBox-San/',
  repository: 'Vuthos/SandBox-San',
  issuesApi: 'https://api.github.com/repos/Vuthos/SandBox-San/issues',
  issuesNewUrl: 'https://github.com/Vuthos/SandBox-San/issues/new',
  sharePrefix: 'san1.',
  maxShareTokenChars: 180000,
  maxSharedDecodedBytes: 2500000
});

function officialSandboxUrl(){
  return new URL(ONLINE_CONFIG.publicBaseUrl);
}

function isOfficialSandboxShareUrl(value){
  try{
    const candidate=value instanceof URL?value:new URL(String(value||''));
    const official=officialSandboxUrl();
    const cleanPath=p=>p.replace(/\/+$/,'')+'/';
    return candidate.protocol==='https:' &&
      candidate.origin===official.origin &&
      cleanPath(candidate.pathname)===cleanPath(official.pathname) &&
      candidate.hash.includes('san=');
  }catch{return false;}
}
