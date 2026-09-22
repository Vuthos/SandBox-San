'use strict';

function sanitizeCommunityText(value,max=120){
  return cleanText(String(value||''),max,'');
}

function buildCommunityIssueUrl(shareUrl,alias){
  if(!isOfficialSandboxShareUrl(shareUrl))throw new Error('Somente links oficiais do SandBox podem ser publicados.');
  const levelTitle=sanitizeCommunityText(map.meta?.name||'Fase sem nome',80)||'Fase sem nome';
  const author=sanitizeCommunityText(alias,40)||'Anônimo';
  const title='[SAN LEVEL] '+levelTitle;
  const body=[
    '<!-- SAN-COMMUNITY-LEVEL -->',
    '',
    '**Fase:** '+levelTitle,
    '**Autor:** '+author,
    '**Formato:** SAN Map v7',
    '**Link:** '+shareUrl,
    '',
    '> Envio criado pelo SandBox Editor v1.2.2.'
  ].join('\n');
  const u=new URL(ONLINE_CONFIG.issuesNewUrl);
  u.searchParams.set('title',title);
  u.searchParams.set('body',body);
  return u.toString();
}

function parseCommunityIssue(issue){
  if(!issue||issue.pull_request||issue.state!=='open')return null;
  if(!String(issue.title||'').startsWith('[SAN LEVEL]'))return null;
  const body=String(issue.body||'');
  if(!body.includes('SAN-COMMUNITY-LEVEL'))return null;
  const linkMatch=body.match(/\*\*Link:\*\*\s+(https?:\/\/\S+)/i);
  if(!linkMatch)return null;
  const authorMatch=body.match(/\*\*Autor:\*\*\s+([^\n\r]+)/i);
  const levelMatch=body.match(/\*\*Fase:\*\*\s+([^\n\r]+)/i);
  let share;
  try{
    share=new URL(linkMatch[1]);
    if(!isOfficialSandboxShareUrl(share))return null;
  }catch{return null;}
  return {
    issueNumber:Number(issue.number)||0,
    title:sanitizeCommunityText(levelMatch?.[1]||String(issue.title).replace(/^\[SAN LEVEL\]\s*/,''),80)||'Fase',
    author:sanitizeCommunityText(authorMatch?.[1]||issue.user?.login||'Comunidade',40)||'Comunidade',
    shareUrl:share.toString(),
    createdAt:String(issue.created_at||''),
    issueUrl:String(issue.html_url||'')
  };
}

async function fetchCommunityLevels(limit=30){
  const u=new URL(ONLINE_CONFIG.issuesApi);
  u.searchParams.set('state','open');
  u.searchParams.set('per_page',String(clamp(Number(limit)||30,1,50)));
  u.searchParams.set('sort','created');
  u.searchParams.set('direction','desc');
  const response=await fetch(u.toString(),{headers:{'Accept':'application/vnd.github+json'}});
  if(!response.ok)throw new Error('GitHub respondeu '+response.status+'.');
  const raw=await response.json();
  if(!Array.isArray(raw))return[];
  return raw.map(parseCommunityIssue).filter(Boolean);
}
