(function(root){
  'use strict';
  const DB_NAME='ALFReviewDB';
  const DB_VERSION=1;
  let dbPromise=null;

  function openDB(){
    if(dbPromise) return dbPromise;
    dbPromise=new Promise((resolve,reject)=>{
      const req=indexedDB.open(DB_NAME,DB_VERSION);
      req.onupgradeneeded=()=>{
        const db=req.result;
        if(!db.objectStoreNames.contains('patients')) db.createObjectStore('patients',{keyPath:'patient_id'});
        if(!db.objectStoreNames.contains('approved')) db.createObjectStore('approved',{keyPath:'patient_id'});
        if(!db.objectStoreNames.contains('sources')) db.createObjectStore('sources',{keyPath:'source_file'});
        if(!db.objectStoreNames.contains('meta')) db.createObjectStore('meta',{keyPath:'key'});
        if(!db.objectStoreNames.contains('audit')){
          const s=db.createObjectStore('audit',{keyPath:'id',autoIncrement:true});
          s.createIndex('patient_id','patient_id',{unique:false});
          s.createIndex('timestamp','timestamp',{unique:false});
        }
      };
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error);
      req.onblocked=()=>reject(new Error('IndexedDB upgrade blocked by another open tab. Close other copies of the app and retry.'));
    });
    return dbPromise;
  }

  async function withStore(name,mode,fn){
    const db=await openDB();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction(name,mode); const store=tx.objectStore(name);
      let value;
      try{value=fn(store,tx);}catch(e){reject(e);return;}
      tx.oncomplete=()=>resolve(value);
      tx.onerror=()=>reject(tx.error);
      tx.onabort=()=>reject(tx.error||new Error('IndexedDB transaction aborted'));
    });
  }
  function request(req){return new Promise((resolve,reject)=>{req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}

  async function put(storeName,value){const db=await openDB(); const tx=db.transaction(storeName,'readwrite'); const req=tx.objectStore(storeName).put(value); await request(req); await new Promise((res,rej)=>{tx.oncomplete=res;tx.onerror=()=>rej(tx.error);tx.onabort=()=>rej(tx.error);}); return value;}
  async function get(storeName,key){const db=await openDB(); return request(db.transaction(storeName,'readonly').objectStore(storeName).get(key));}
  async function getAll(storeName){const db=await openDB(); return request(db.transaction(storeName,'readonly').objectStore(storeName).getAll());}
  async function del(storeName,key){const db=await openDB(); const tx=db.transaction(storeName,'readwrite'); await request(tx.objectStore(storeName).delete(key)); await new Promise((res,rej)=>{tx.oncomplete=res;tx.onerror=()=>rej(tx.error);});}
  async function clear(storeName){const db=await openDB(); const tx=db.transaction(storeName,'readwrite'); await request(tx.objectStore(storeName).clear()); await new Promise((res,rej)=>{tx.oncomplete=res;tx.onerror=()=>rej(tx.error);});}
  async function addAudit(entry){return put('audit',{timestamp:new Date().toISOString(),...entry});}
  async function clearAll(){
    const db=await openDB();
    const names=['patients','approved','sources','meta','audit'];
    const tx=db.transaction(names,'readwrite');
    names.forEach(n=>tx.objectStore(n).clear());
    await new Promise((res,rej)=>{tx.oncomplete=res;tx.onerror=()=>rej(tx.error);tx.onabort=()=>rej(tx.error);});
  }
  async function exportAll(){
    const [patients,approved,sources,meta,audit]=await Promise.all(['patients','approved','sources','meta','audit'].map(getAll));
    return {format:'alf-review-workspace-v1',exported_at:new Date().toISOString(),patients,approved,sources,meta,audit};
  }
  async function importAll(bundle,{replace=true}={}){
    if(!bundle||bundle.format!=='alf-review-workspace-v1') throw new Error('Not a ThunderResearch workspace export.');
    if(replace) await clearAll();
    for(const p of bundle.patients||[]) await put('patients',p);
    for(const p of bundle.approved||[]) await put('approved',p);
    for(const s of bundle.sources||[]) await put('sources',s);
    for(const m of bundle.meta||[]) await put('meta',m);
    for(const a of bundle.audit||[]){const c={...a}; delete c.id; await addAudit(c);}
  }

  root.ALFDB={openDB,put,get,getAll,del,clear,addAudit,clearAll,exportAll,importAll,DB_NAME,DB_VERSION};
})(typeof globalThis!=='undefined'?globalThis:this);
