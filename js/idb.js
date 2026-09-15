(function(root){
  'use strict';

  // The filename is retained for the existing static script order and regression
  // command. The store is intentionally memory-only: refresh/close clears it.
  const stores={patients:new Map(),approved:new Map(),sources:new Map(),meta:new Map(),audit:[]};
  let auditId=1;

  function keyFor(storeName,value){
    if(storeName==='patients'||storeName==='approved')return value.patient_id;
    if(storeName==='sources')return value.source_file;
    if(storeName==='meta')return value.key;
    return value.id;
  }
  function clone(value){
    if(value==null)return value;
    return typeof structuredClone==='function'?structuredClone(value):JSON.parse(JSON.stringify(value));
  }
  async function openDB(){return null;}
  async function put(storeName,value){
    const record=clone(value);
    if(storeName==='audit'&&!record.id)record.id=auditId++;
    if(storeName==='audit')stores.audit.push(record);
    else stores[storeName].set(keyFor(storeName,record),record);
    return clone(record);
  }
  async function get(storeName,key){
    const value=storeName==='audit'?stores.audit.find(x=>x.id===key):stores[storeName].get(key);
    return clone(value);
  }
  async function getAll(storeName){return clone(storeName==='audit'?stores.audit:[...stores[storeName].values()]);}
  async function del(storeName,key){
    if(storeName==='audit')stores.audit=stores.audit.filter(x=>x.id!==key);
    else stores[storeName].delete(key);
  }
  async function clear(storeName){
    if(storeName==='audit')stores.audit.length=0;
    else stores[storeName].clear();
  }
  async function addAudit(entry){return put('audit',{timestamp:new Date().toISOString(),...entry});}
  async function clearAll(){
    stores.patients.clear();stores.approved.clear();stores.sources.clear();stores.meta.clear();stores.audit.length=0;auditId=1;
  }
  async function exportAll(){
    return {format:'alf-review-workspace-v1',exported_at:new Date().toISOString(),patients:await getAll('patients'),approved:await getAll('approved'),sources:await getAll('sources'),meta:await getAll('meta'),audit:await getAll('audit')};
  }
  async function importAll(bundle,{replace=true}={}){
    if(!bundle||bundle.format!=='alf-review-workspace-v1')throw new Error('Not a ThunderResearch workspace export.');
    if(replace)await clearAll();
    for(const p of bundle.patients||[])await put('patients',p);
    for(const p of bundle.approved||[])await put('approved',p);
    for(const s of bundle.sources||[])await put('sources',s);
    for(const m of bundle.meta||[])await put('meta',m);
    for(const a of bundle.audit||[]){const c={...a};delete c.id;await addAudit(c);}
  }

  root.ALFDB={openDB,put,get,getAll,del,clear,addAudit,clearAll,exportAll,importAll,DB_NAME:'session-memory',DB_VERSION:1};
})(typeof globalThis!=='undefined'?globalThis:this);
