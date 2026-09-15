(function(){
  'use strict';
  const C=window.ALFCore, DB=window.ALFDB;
  const $=id=>document.getElementById(id);
  const state={patients:[],approved:new Map(),sources:new Map(),master:null,audit:[],lastBackupAt:null,selected:null,patientFilter:'all',fieldFilter:'all',fieldSearch:'',patientSearch:'',sourceEvidence:null};
  const saveTimers=new Map();

  const els={
    dbDot:$('dbDot'),dbStatus:$('dbStatus'),masterStatus:$('masterStatus'),sourceStatus:$('sourceStatus'),backupStatus:$('backupStatus'),storageStatus:$('storageStatus'),saveStatus:$('saveStatus'),themeToggle:$('themeToggle'),
    patientList:$('patientList'),cohortSummary:$('cohortSummary'),patientSearch:$('patientSearch'),fieldSearch:$('fieldSearch'),emptyState:$('emptyState'),patientWorkspace:$('patientWorkspace'),
    patientTitle:$('patientTitle'),patientPosition:$('patientPosition'),patientStatePill:$('patientStatePill'),patientMeta:$('patientMeta'),fieldContainer:$('fieldContainer'),validationBanner:$('validationBanner'),
    allCount:$('allCount'),reviewCount:$('reviewCount'),calcCount:$('calcCount'),missingCount:$('missingCount'),changedCount:$('changedCount'),
    approveBtn:$('approveBtn'),reopenBtn:$('reopenBtn'),resolveReviewsBtn:$('resolveReviewsBtn'),openSourceBtn:$('openSourceBtn'),exportPatientBtn:$('exportPatientBtn'),historyBtn:$('historyBtn'),prevPatientBtn:$('prevPatientBtn'),nextPatientBtn:$('nextPatientBtn'),nextReviewBtn:$('nextReviewBtn'),
    jsonInput:$('jsonInput'),txtInput:$('txtInput'),masterInput:$('masterInput'),workspaceInput:$('workspaceInput'),
    sourceDialog:$('sourceDialog'),sourceDialogTitle:$('sourceDialogTitle'),sourceContext:$('sourceContext'),sourceSearch:$('sourceSearch'),
    messageDialog:$('messageDialog'),messageTitle:$('messageTitle'),messageBody:$('messageBody'),auditDialog:$('auditDialog'),auditDialogTitle:$('auditDialogTitle'),auditSummary:$('auditSummary'),auditList:$('auditList'),toastRegion:$('toastRegion')
  };

  function esc(s){return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  function now(){return new Date().toISOString();}
  function selectedPatient(){return state.patients.find(p=>p.patient_id===state.selected)||null;}
  function isApproved(id){return state.approved.has(id);}
  function fmtTime(iso){if(!iso)return ''; try{return new Date(iso).toLocaleString();}catch{return iso;}}
  function setSaved(text='Saved'){els.saveStatus.textContent=text;}
  function toast(msg,type=''){const d=document.createElement('div');d.className='toast '+type;d.textContent=msg;els.toastRegion.appendChild(d);setTimeout(()=>d.remove(),3600);}
  function download(name,text,type='application/json'){const blob=new Blob([text],{type});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1000);}
  function showMessage(title,html){els.messageTitle.textContent=title;els.messageBody.innerHTML=html;els.messageDialog.showModal();}
  function statusLabel(status){return ({ok:'OK',review:'REVIEW',calculated:'CALCULATED',nr:'NR',na:'N/A'})[status]||String(status).toUpperCase();}
  function currentTheme(){return document.documentElement.dataset.theme||(window.matchMedia?.('(prefers-color-scheme: dark)').matches?'dark':'light');}
  function updateThemeToggle(){const dark=currentTheme()==='dark';els.themeToggle.textContent=dark?'☀ Light mode':'☾ Dark mode';els.themeToggle.setAttribute('aria-pressed',String(dark));els.themeToggle.setAttribute('aria-label',`Switch to ${dark?'light':'dark'} mode`);els.themeToggle.title=`Switch to ${dark?'light':'dark'} mode`;}
  function setTheme(theme){const next=theme==='dark'?'dark':'light';document.documentElement.dataset.theme=next;try{localStorage.setItem('thunderresearch-theme',next);}catch{}updateThemeToggle();}
  async function recordAudit(entry){const record={timestamp:now(),...entry};await DB.put('audit',record);state.audit.unshift(record);return record;}

  async function loadFromDB(){
    try{
      await DB.openDB();
      const [patients,approved,sources,masterRec,audit,backupRec]=await Promise.all([DB.getAll('patients'),DB.getAll('approved'),DB.getAll('sources'),DB.get('meta','masterCsv'),DB.getAll('audit'),DB.get('meta','lastWorkspaceExportAt')]);
      state.patients=patients.sort((a,b)=>C.naturalCompare(a.patient_id,b.patient_id));
      state.approved=new Map(approved.map(p=>[p.patient_id,p]));
      state.sources=new Map(sources.map(s=>[s.source_file,s]));
      state.master=masterRec||null;
      state.audit=audit.sort((a,b)=>String(b.timestamp||'').localeCompare(String(a.timestamp||'')));
      state.lastBackupAt=backupRec?.value||null;
      els.dbDot.classList.add('ok'); els.dbStatus.textContent='IndexedDB active';
      refreshStatus();
      if(state.patients.length){state.selected=state.patients[0].patient_id;renderAll();} else renderAll();
    }catch(e){els.dbDot.classList.add('bad');els.dbStatus.textContent='IndexedDB unavailable';showMessage('Storage error',`<p>${esc(e.message)}</p><p>The app requires IndexedDB for refresh-safe persistence.</p>`);}
  }

  function refreshStatus(){
    els.masterStatus.textContent=state.master?`Master CSV: ${state.master.name}`:'Master CSV: not loaded';
    els.sourceStatus.textContent=`Source TXTs: ${state.sources.size} loaded`;
    els.backupStatus.textContent=state.lastBackupAt?`Backup: ${fmtTime(state.lastBackupAt)}`:'Backup: never';
    const total=state.patients.length, approved=state.approved.size, pending=Math.max(0,total-approved);
    els.cohortSummary.textContent=`${total} loaded · ${approved} approved · ${pending} pending`;
    updateStorageStatus();
  }

  async function updateStorageStatus(){
    if(!navigator.storage?.estimate){els.storageStatus.textContent='Storage: local browser';return;}
    try{
      const estimate=await navigator.storage.estimate();
      if(estimate.usage==null||estimate.quota==null){els.storageStatus.textContent='Storage: local browser';return;}
      const used=estimate.usage<1024*1024?`${Math.max(1,Math.round(estimate.usage/1024))} KB`:`${(estimate.usage/1024/1024).toFixed(1)} MB`;
      const percent=estimate.quota?Math.round(estimate.usage/estimate.quota*100):0;
      els.storageStatus.textContent=`Storage: ${used} used${percent?` · ${percent}% of quota`:''}`;
    }catch{els.storageStatus.textContent='Storage: local browser';}
  }

  function renderAll(){refreshStatus();renderPatientList();renderPatient();}

  function renderPatientList(){
    const q=state.patientSearch.toLowerCase();
    const pats=state.patients.filter(p=>{
      if(q&&!p.patient_id.toLowerCase().includes(q))return false;
      if(state.patientFilter==='approved'&&!isApproved(p.patient_id))return false;
      if(state.patientFilter==='pending'&&isApproved(p.patient_id))return false;
      return true;
    });
    if(!pats.length){els.patientList.innerHTML='<div class="empty-side">No patients match this view.</div>';return;}
    els.patientList.innerHTML=pats.map(p=>{
      const a=isApproved(p.patient_id), counts=C.patientCounts(p), icon=a?'✓':counts.review?'⚠':'○';
      const sub=a?'Approved':counts.review?`${counts.review} review field${counts.review===1?'':'s'}`:'Ready to review';
      return `<button class="patient-row ${p.patient_id===state.selected?'active':''}" data-patient="${esc(p.patient_id)}" type="button" aria-current="${p.patient_id===state.selected?'page':'false'}">
        <span class="patient-icon">${icon}</span><span><div class="patient-id">${esc(p.patient_id)}</div><div class="patient-sub">${esc(sub)}</div></span>
        ${counts.review&&!a?`<span class="issue-count">${counts.review}</span>`:''}</button>`;
    }).join('');
    els.patientList.querySelectorAll('[data-patient]').forEach(b=>b.addEventListener('click',()=>{state.selected=b.dataset.patient;state.fieldFilter='all';state.fieldSearch='';els.fieldSearch.value='';renderAll();}));
  }

  function renderPatient(){
    const p=selectedPatient();
    if(!p){els.emptyState.classList.remove('hidden');els.patientWorkspace.classList.add('hidden');return;}
    els.emptyState.classList.add('hidden');els.patientWorkspace.classList.remove('hidden');
    const idx=state.patients.findIndex(x=>x.patient_id===p.patient_id)+1, approved=isApproved(p.patient_id), counts=C.patientCounts(p);
    els.patientPosition.textContent=`PATIENT ${idx} OF ${state.patients.length}`;els.patientTitle.textContent=p.patient_id;
    els.patientStatePill.textContent=approved?'APPROVED':'REVIEW PENDING';els.patientStatePill.className='status-pill '+(approved?'approved':'pending');
    const resolved=Math.max(0,counts.total-counts.review);
    els.patientMeta.textContent=[`Review progress: ${resolved}/${counts.total} resolved`,p.source_file?`Source: ${p.source_file}`:'',p.generated_at?`Extracted: ${fmtTime(p.generated_at)}`:'',`Updated: ${fmtTime(p.updated_at)}`].filter(Boolean).join(' · ');
    els.approveBtn.classList.toggle('hidden',approved);els.reopenBtn.classList.toggle('hidden',!approved);els.resolveReviewsBtn.classList.toggle('hidden',approved||counts.review===0);
    els.openSourceBtn.disabled=!state.sources.has(p.source_file);
    const idxBefore=state.patients.findIndex(x=>x.patient_id===p.patient_id);
    els.prevPatientBtn.disabled=idxBefore<=0;els.nextPatientBtn.disabled=idxBefore<0||idxBefore>=state.patients.length-1;
    els.nextReviewBtn.disabled=counts.review===0;
    els.allCount.textContent=counts.total;els.reviewCount.textContent=counts.review;els.calcCount.textContent=counts.calculated;els.missingCount.textContent=counts.nr+counts.na;els.changedCount.textContent=counts.changed;
    document.querySelectorAll('[data-field-filter]').forEach(b=>{const active=b.dataset.fieldFilter===state.fieldFilter;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
    renderValidation(p,approved);renderFields(p,approved);
  }

  function renderValidation(p,approved){
    const errors=C.validateForApproval(p);
    if(approved){els.validationBanner.classList.add('hidden');return;}
    if(!errors.length){els.validationBanner.className='validation-banner';els.validationBanner.innerHTML='<strong>Ready for approval.</strong> All structural checks pass and no REVIEW fields remain.';return;}
    const reviewOnly=errors.filter(e=>e.startsWith('Unresolved REVIEW')).length;
    const blank=errors.filter(e=>e.startsWith('Blank answer')).length;
    const evidence=errors.filter(e=>e.startsWith('Missing evidence')).length;
    els.validationBanner.className='validation-banner'+((blank||evidence)?' error':'');
    els.validationBanner.innerHTML=`<strong>Approval blocked:</strong> ${errors.length} issue${errors.length===1?'':'s'}${reviewOnly?` · ${reviewOnly} unresolved REVIEW`:''}${blank?` · ${blank} blank`:''}${evidence?` · ${evidence} without evidence`:''}.`;
  }

  function fieldVisible(f){
    const q=state.fieldSearch.toLowerCase(); if(q&&!f.research_heading.toLowerCase().includes(q))return false;
    if(state.fieldFilter==='review'&&f.status!=='review')return false;
    if(state.fieldFilter==='calculated'&&f.status!=='calculated')return false;
    if(state.fieldFilter==='missing'&&!['nr','na'].includes(f.status))return false;
    if(state.fieldFilter==='changed'&&String(f.answer)===String(f.proposed_answer))return false;
    return true;
  }

  function evidenceHtml(ev,index,sourceAvailable,approved){
    const meta=[ev.date,ev.location,ev.label].filter(Boolean).join(' · ');
    return `<div class="evidence-item"><div><div class="evidence-meta">${esc(meta||`Evidence ${index+1}`)}</div><div class="evidence-text">${esc(ev.text||'(location only)')}</div></div>${sourceAvailable?`<button class="mini-btn source-context-btn" data-evidence="${index}">View context</button>`:''}</div>`;
  }

  const STATUS_OPTIONS=[['ok','OK'],['review','REVIEW'],['calculated','CALCULATED'],['nr','NR'],['na','N/A']];

  function renderFields(p,approved){
    const fields=p.fields.filter(fieldVisible); let html='',lastGroup=null; const sourceAvailable=state.sources.has(p.source_file);
    for(const f of fields){
      if(f.group!==lastGroup){html+=`<div class="group-title">${esc(f.group)}</div>`;lastGroup=f.group;}
      const changed=String(f.answer)!==String(f.proposed_answer);
      const evidence=f.evidence?.length?f.evidence.map((e,i)=>evidenceHtml(e,i,sourceAvailable,approved)).join(''):'<div class="no-evidence">No evidence supplied in imported draft.</div>';
      const reviewFlag=f.status==='review'?'<span class="review-flag">REVIEW NEEDED</span>':'';
      const statusChoices=STATUS_OPTIONS.map(([value,label])=>`<button class="status-option status-${value}" type="button" data-status="${value}" aria-pressed="${f.status===value?'true':'false'}" tabindex="${f.status===value?'0':'-1'}" ${approved?'disabled':''}>${label}</button>`).join('');
      html+=`<article class="field-card ${esc(f.status)} ${changed?'changed':''}" data-heading="${esc(f.research_heading)}">
        <div class="field-top"><div class="heading-cell"><div class="heading-order">${f.order} · ${esc(f.group)}</div><div class="heading-text">${esc(f.research_heading)}</div>${reviewFlag}</div>
        <div class="answer-cell"><div class="answer-row"><textarea class="answer-input" rows="2" aria-label="Answer for ${esc(f.research_heading)}" ${approved?'disabled':''}>${esc(f.answer)}</textarea>
        <div class="status-choice" role="group" aria-label="Status for ${esc(f.research_heading)}">${statusChoices}</div>
        ${changed&&!approved?`<button class="mini-btn revert-btn" type="button" aria-label="Revert ${esc(f.research_heading)} to initial extraction">Revert</button>`:'<span></span>'}</div>
        ${changed?`<div class="initial-answer"><strong>Initial extraction:</strong> ${esc(f.proposed_answer||'(blank)')}</div>`:''}</div></div>
        <div class="evidence-section"><div class="evidence-label">Verbatim/source evidence</div>${evidence}</div></article>`;
    }
    if(!fields.length) html='<div class="field-empty">No fields match this filter.</div>';
    els.fieldContainer.innerHTML=html;
    bindFieldEvents(p,approved);
  }

  function bindFieldEvents(p,approved){
    if(approved)return;
    els.fieldContainer.querySelectorAll('.field-card').forEach(card=>{
      const heading=card.dataset.heading, field=p.fields.find(f=>f.research_heading===heading), input=card.querySelector('.answer-input'), statusButtons=[...card.querySelectorAll('.status-option')];
      input.addEventListener('input',()=>{field.answer=input.value;field.updated_at=now();p.updated_at=now();queueSave(p);});
      input.addEventListener('change',async()=>{await auditAnswer(p,field);renderPatientList();renderPatient();});
      const setStatus=async status=>{const old=field.status;if(old===status)return;field.status=status;p.updated_at=now();await recordAudit({patient_id:p.patient_id,field:heading,type:'status',old_value:old,new_value:status});await savePatient(p);renderPatientList();renderPatient();};
      statusButtons.forEach((button,index)=>{
        button.addEventListener('click',()=>setStatus(button.dataset.status));
        button.addEventListener('keydown',event=>{
          if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
          event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?statusButtons.length-1:Math.max(0,Math.min(statusButtons.length-1,index+(event.key==='ArrowRight'?1:-1)));statusButtons[next].focus();
        });
      });
      card.querySelector('.revert-btn')?.addEventListener('click',async()=>{const old=field.answer;field.answer=field.proposed_answer;field.last_audited_answer=field.answer;p.updated_at=now();await recordAudit({patient_id:p.patient_id,field:heading,type:'answer_revert',old_value:old,new_value:field.answer});await savePatient(p);renderPatient();renderPatientList();});
      card.querySelectorAll('.source-context-btn').forEach(btn=>btn.addEventListener('click',()=>openSourceContext(p,field,Number(btn.dataset.evidence))));
    });
  }

  function queueSave(p){
    setSaved('Saving…'); clearTimeout(saveTimers.get(p.patient_id));
    saveTimers.set(p.patient_id,setTimeout(()=>savePatient(p),350));
  }
  async function savePatient(p){p.updated_at=now();await DB.put('patients',p);setSaved('Saved');}
  async function auditAnswer(p,f){
    if(String(f.answer)!==String(f.last_audited_answer)){
      await recordAudit({patient_id:p.patient_id,field:f.research_heading,type:'answer',old_value:f.last_audited_answer,new_value:f.answer});f.last_audited_answer=f.answer;await savePatient(p);
    }
  }

  async function importPatientFiles(files){
    let added=0,replaced=0;const errors=[];
    for(const file of files){
      try{
        const raw=JSON.parse(await file.text());
        if(raw.format==='alf-review-workspace-v1'){errors.push(`${file.name}: this is a workspace backup; use Import workspace backup.`);continue;}
        const p=C.canonicalizeDraft(raw,file.name); const existing=state.patients.find(x=>x.patient_id===p.patient_id);
        if(existing){
          const ok=confirm(`${p.patient_id} already exists in local storage. Replace the draft? Existing approval, if any, will be removed.`); if(!ok)continue;
          await DB.del('approved',p.patient_id);state.approved.delete(p.patient_id);replaced++;
        }else added++;
        await DB.put('patients',p);await recordAudit({patient_id:p.patient_id,type:'import',file_name:file.name});
        const idx=state.patients.findIndex(x=>x.patient_id===p.patient_id);if(idx>=0)state.patients[idx]=p;else state.patients.push(p);
      }catch(e){errors.push(`${file.name}: ${e.message}`);}
    }
    state.patients.sort((a,b)=>C.naturalCompare(a.patient_id,b.patient_id));if(!state.selected&&state.patients.length)state.selected=state.patients[0].patient_id;renderAll();
    if(added||replaced)toast(`Imported ${added} patient${added===1?'':'s'}${replaced?`; replaced ${replaced}`:''}.`,'success');
    if(errors.length)showMessage('Some files were not imported',`<ul>${errors.map(e=>`<li>${esc(e)}</li>`).join('')}</ul>`);
  }

  async function importSources(files){
    let n=0;for(const file of files){const rec={source_file:file.name,text:await file.text(),loaded_at:now()};await DB.put('sources',rec);state.sources.set(file.name,rec);n++;}
    refreshStatus();renderPatient();toast(`Loaded ${n} source TXT file${n===1?'':'s'} into IndexedDB.`,'success');
  }

  async function importMaster(file){
    const text=await file.text();
    try{C.buildMasterCSV(text,[]);}catch(e){showMessage('Master CSV rejected',`<p>${esc(e.message)}</p>`);return;}
    const rec={key:'masterCsv',name:file.name,text,loaded_at:now()};await DB.put('meta',rec);state.master=rec;refreshStatus();toast(`Master CSV loaded: ${file.name}`,'success');
  }

  async function approveCurrent(){
    const p=selectedPatient(); if(!p)return; const errors=C.validateForApproval(p);
    if(errors.length){showMessage('Cannot approve patient',`<p>Resolve the following first:</p><ul>${errors.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`);return;}
    const snap=C.exportPatient(p,true);snap.approved_at=now();snap.approval_status='approved';snap.approved_snapshot=true;
    await DB.put('approved',snap);state.approved.set(p.patient_id,snap);p.approval_status='approved';p.approved_at=snap.approved_at;await DB.put('patients',p);await recordAudit({patient_id:p.patient_id,type:'approve'});renderAll();toast(`${p.patient_id} approved.`,'success');
  }

  async function resolveAllReviews(){
    const p=selectedPatient();if(!p||isApproved(p.patient_id))return;const reviewFields=p.fields.filter(f=>f.status==='review');if(!reviewFields.length){toast('No REVIEW fields to update.','error');return;}
    if(!confirm(`Mark all ${reviewFields.length} REVIEW field${reviewFields.length===1?'':'s'} for ${p.patient_id} as OK? This changes statuses only; answers and evidence stay unchanged.`))return;
    for(const field of reviewFields){const old=field.status;field.status='ok';await recordAudit({patient_id:p.patient_id,field:field.research_heading,type:'status',old_value:old,new_value:'ok',bulk_action:'mark_all_review_ok'});}
    p.updated_at=now();await savePatient(p);renderAll();toast(`Marked ${reviewFields.length} REVIEW field${reviewFields.length===1?'':'s'} as OK.`,'success');
  }

  async function reopenCurrent(){
    const p=selectedPatient(); if(!p)return;if(!confirm(`Reopen ${p.patient_id}? Its approved snapshot will be removed until you approve it again.`))return;
    await DB.del('approved',p.patient_id);state.approved.delete(p.patient_id);p.approval_status='pending';p.approved_at=null;await DB.put('patients',p);await recordAudit({patient_id:p.patient_id,type:'reopen'});renderAll();toast(`${p.patient_id} reopened.`);
  }

  function exportCurrent(){const p=selectedPatient();if(!p)return;const obj=isApproved(p.patient_id)?state.approved.get(p.patient_id):C.exportPatient(p,false);download(`${p.patient_id}_${isApproved(p.patient_id)?'approved':'review'}.json`,JSON.stringify(obj,null,2));}
  function exportApprovedBundle(){const pats=[...state.approved.values()].sort((a,b)=>C.naturalCompare(a.patient_id,b.patient_id));if(!pats.length){toast('No approved patients to export.','error');return;}download('ThunderResearch_Approved_Patients.json',JSON.stringify({format:'alf-approved-bundle-v1',schema_version:C.SCHEMA.schema_version,exported_at:now(),patients:pats},null,2));}

  async function exportWorkspace(){const bundle=await DB.exportAll();const backupAt=bundle.exported_at;download(`ThunderResearch_Workspace_${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(bundle,null,2));state.lastBackupAt=backupAt;await DB.put('meta',{key:'lastWorkspaceExportAt',value:backupAt});refreshStatus();toast('Workspace backup exported.','success');}
  async function importWorkspace(file){
    try{const obj=JSON.parse(await file.text());if(!confirm('Importing a workspace backup will replace the current local database. Continue?'))return;await DB.importAll(obj,{replace:true});state.selected=null;await loadFromDB();toast('Workspace restored.','success');}catch(e){showMessage('Workspace import failed',`<p>${esc(e.message)}</p>`);}
  }

  function buildCsv(){
    const pats=[...state.approved.values()];if(!pats.length){toast('Approve at least one patient first.','error');return;}
    try{
      if(state.master){const text=C.buildMasterCSV(state.master.text,pats);download('ThunderResearch_Final.csv','\uFEFF'+text,'text/csv;charset=utf-8');toast(`Generated final CSV from ${pats.length} approved patient${pats.length===1?'':'s'} + master.`,'success');}
      else{
        if(!confirm('No master CSV is loaded. Generate a schema-only 113-column CSV from approved patients?'))return;
        const text=C.buildSchemaOnlyCSV(pats);download('ThunderResearch_Approved_SchemaOnly.csv','\uFEFF'+text,'text/csv;charset=utf-8');toast('Generated schema-only approved-patient CSV.','success');
      }
    }catch(e){showMessage('CSV generation failed',`<p>${esc(e.message)}</p>`);}
  }

  async function clearDatabase(){
    if(!confirm('Clear ALL locally stored ThunderResearch data from this browser? This includes patient drafts, approvals, source TXTs, master CSV, and audit history.'))return;
    if(!confirm('This cannot be undone unless you exported a workspace backup. Clear the local database now?'))return;
    await DB.clearAll();state.patients=[];state.approved.clear();state.sources.clear();state.master=null;state.audit=[];state.lastBackupAt=null;state.selected=null;renderAll();toast('Local database cleared.','success');
  }

  function focusFieldCard(card){
    if(!card)return;
    card.scrollIntoView({behavior:'smooth',block:'center'});card.classList.add('focus-target');
    card.querySelector('.answer-input')?.focus({preventScroll:true});
    setTimeout(()=>card.classList.remove('focus-target'),1200);
  }
  function moveField(offset){
    const cards=[...els.fieldContainer.querySelectorAll('.field-card')];if(!cards.length)return;
    const current=document.activeElement?.closest('.field-card');const index=current?cards.indexOf(current):(offset>0?-1:cards.length);
    focusFieldCard(cards[(index+offset+cards.length)%cards.length]);
  }
  function nextUnresolved(){
    const p=selectedPatient();if(!p)return;
    const reviewFields=p.fields.filter(f=>f.status==='review');if(!reviewFields.length){toast('No unresolved REVIEW fields remain.','success');return;}
    const current=document.activeElement?.closest('.field-card')?.dataset.heading;const currentIndex=reviewFields.findIndex(f=>f.research_heading===current);
    const next=reviewFields[(currentIndex+1+reviewFields.length)%reviewFields.length];
    state.fieldFilter='review';state.fieldSearch='';els.fieldSearch.value='';renderPatient();focusFieldCard(els.fieldContainer.querySelector(`[data-heading="${CSS.escape(next.research_heading)}"]`));
  }
  function movePatient(offset){
    if(!state.patients.length)return;const index=state.patients.findIndex(p=>p.patient_id===state.selected);const nextIndex=index+offset;if(nextIndex<0||nextIndex>=state.patients.length)return;const next=state.patients[nextIndex];
    if(!next)return;state.selected=next.patient_id;state.fieldFilter='all';state.fieldSearch='';els.fieldSearch.value='';renderAll();els.fieldContainer.querySelector('.field-card')?.scrollIntoView({block:'start'});
  }
  function auditTypeLabel(type){return ({import:'Imported patient',answer:'Answer edited',answer_revert:'Answer reverted',status:'Status changed',approve:'Patient approved',reopen:'Patient reopened'})[type]||String(type||'Audit event');}
  function auditValue(value){return String(value??'').trim()||'—';}
  function openAudit(){
    const p=selectedPatient();if(!p)return;const entries=state.audit.filter(x=>x.patient_id===p.patient_id).sort((a,b)=>String(b.timestamp||'').localeCompare(String(a.timestamp||'')));
    els.auditDialogTitle.textContent=`${p.patient_id} history`;els.auditSummary.textContent=`${entries.length} local event${entries.length===1?'':'s'} · stored in this browser only`;
    els.auditList.innerHTML=entries.length?entries.map(entry=>`<article class="audit-item"><div class="audit-top"><span class="audit-type">${esc(auditTypeLabel(entry.type))}</span><span class="audit-time">${esc(fmtTime(entry.timestamp))}</span></div>${entry.field?`<div class="audit-field">${esc(entry.field)}</div>`:''}${entry.old_value!=null||entry.new_value!=null?`<div class="audit-values"><strong>From:</strong> ${esc(auditValue(entry.old_value))}<br><strong>To:</strong> ${esc(auditValue(entry.new_value))}</div>`:''}${entry.file_name?`<div class="audit-field">File: ${esc(entry.file_name)}</div>`:''}</article>`).join(''):'<div class="audit-empty">No audit events for this patient yet.</div>';
    els.auditDialog.showModal();
  }

  function openSourceContext(p,field,evidenceIndex=0){
    const src=state.sources.get(p.source_file);if(!src){toast(`Source TXT not loaded: ${p.source_file}`,'error');return;}
    const ev=field?.evidence?.[evidenceIndex]||{text:'',location:''};state.sourceEvidence={p,field,ev};
    els.sourceDialogTitle.textContent=`${p.source_file} · ${field?.research_heading||'Source'}`;els.sourceSearch.value='';renderSourceContext(src.text,ev);els.sourceDialog.showModal();
  }
  function openWholeSource(){const p=selectedPatient(),src=p&&state.sources.get(p.source_file);if(!src){toast('Matching source TXT is not loaded.','error');return;}state.sourceEvidence={p,field:null,ev:{}};els.sourceDialogTitle.textContent=p.source_file;els.sourceSearch.value='';renderSourceLines(src.text,1,Math.min(80,src.text.split(/\r?\n/).length));els.sourceDialog.showModal();}
  function renderSourceContext(text,ev){const ctx=C.sourceContext(text,ev,8);renderSourceLines(text,ctx.start,ctx.end,ctx);}
  function renderSourceLines(text,start,end,ctx=null){const lines=text.split(/\r?\n/);const hitSet=new Set((ctx?.lines||[]).filter(x=>x.highlight).map(x=>x.line));els.sourceContext.innerHTML=lines.slice(start-1,end).map((t,i)=>{const n=start+i;return `<div class="source-line ${hitSet.has(n)?'hit':''}"><span class="ln">${n}</span><span>${esc(t)}</span></div>`;}).join('');}
  function searchSource(){const p=selectedPatient(),src=p&&state.sources.get(p.source_file),q=els.sourceSearch.value.trim();if(!src||!q)return;const lines=src.text.split(/\r?\n/),idx=lines.findIndex(l=>l.toLowerCase().includes(q.toLowerCase()));if(idx<0){toast('Text not found in source.','error');return;}const start=Math.max(1,idx+1-12),end=Math.min(lines.length,idx+1+12);const ctx={lines:Array.from({length:end-start+1},(_,i)=>({line:start+i,highlight:start+i===idx+1}))};renderSourceLines(src.text,start,end,ctx);}

  function bindGlobal(){
    updateThemeToggle();els.themeToggle.onclick=()=>setTheme(currentTheme()==='dark'?'light':'dark');
    $('importJsonBtn').onclick=$('emptyImportBtn').onclick=()=>els.jsonInput.click();$('importTxtBtn').onclick=()=>els.txtInput.click();$('importMasterBtn').onclick=()=>els.masterInput.click();
    $('exportWorkspaceBtn').onclick=()=>{closeMenu();exportWorkspace();};$('importWorkspaceBtn').onclick=()=>{closeMenu();els.workspaceInput.click();};$('exportApprovedBtn').onclick=()=>{closeMenu();exportApprovedBundle();};$('buildCsvBtn').onclick=()=>{closeMenu();buildCsv();};$('clearDbBtn').onclick=()=>{closeMenu();clearDatabase();};
    els.jsonInput.onchange=e=>{importPatientFiles([...e.target.files]);e.target.value='';};els.txtInput.onchange=e=>{importSources([...e.target.files]);e.target.value='';};els.masterInput.onchange=e=>{if(e.target.files[0])importMaster(e.target.files[0]);e.target.value='';};els.workspaceInput.onchange=e=>{if(e.target.files[0])importWorkspace(e.target.files[0]);e.target.value='';};
    $('moreBtn').onclick=()=>{const m=$('moreMenu');m.classList.toggle('hidden');$('moreBtn').setAttribute('aria-expanded',String(!m.classList.contains('hidden')));};document.addEventListener('click',e=>{if(!e.target.closest('.menu-wrap'))closeMenu();});
    function drag(e){e.preventDefault();if(e.dataTransfer?.files?.length&&[...e.dataTransfer.files].every(f=>f.name.toLowerCase().endsWith('.json')))importPatientFiles([...e.dataTransfer.files]);}
    document.addEventListener('dragover',e=>e.preventDefault());document.addEventListener('drop',drag);
    els.patientSearch.oninput=()=>{state.patientSearch=els.patientSearch.value.trim();renderPatientList();};els.fieldSearch.oninput=()=>{state.fieldSearch=els.fieldSearch.value.trim();renderPatient();};
    document.querySelectorAll('[data-patient-filter]').forEach(b=>b.onclick=()=>{state.patientFilter=b.dataset.patientFilter;document.querySelectorAll('[data-patient-filter]').forEach(x=>{const active=x===b;x.classList.toggle('active',active);x.setAttribute('aria-pressed',String(active));});renderPatientList();});
    document.querySelectorAll('[data-field-filter]').forEach(b=>b.onclick=()=>{state.fieldFilter=b.dataset.fieldFilter;document.querySelectorAll('[data-field-filter]').forEach(x=>{const active=x===b;x.classList.toggle('active',active);x.setAttribute('aria-pressed',String(active));});renderPatient();});
    els.approveBtn.onclick=approveCurrent;els.reopenBtn.onclick=reopenCurrent;els.resolveReviewsBtn.onclick=resolveAllReviews;els.openSourceBtn.onclick=openWholeSource;els.exportPatientBtn.onclick=exportCurrent;els.historyBtn.onclick=openAudit;
    els.prevPatientBtn.onclick=()=>movePatient(-1);els.nextPatientBtn.onclick=()=>movePatient(1);els.nextReviewBtn.onclick=nextUnresolved;
    $('sourceCloseBtn').onclick=()=>els.sourceDialog.close();$('sourceSearchBtn').onclick=searchSource;els.sourceSearch.addEventListener('keydown',e=>{if(e.key==='Enter')searchSource();});$('messageCloseBtn').onclick=()=>els.messageDialog.close();$('auditCloseBtn').onclick=()=>els.auditDialog.close();
    document.addEventListener('keydown',e=>{
      if(e.key==='Escape'){closeMenu();return;}
      if(!e.altKey||e.ctrlKey||e.metaKey)return;
      if(['INPUT','TEXTAREA','SELECT'].includes(e.target?.tagName))return;
      if(e.shiftKey&&e.key==='ArrowUp'){e.preventDefault();moveField(-1);return;}
      if(e.shiftKey&&e.key==='ArrowDown'){e.preventDefault();moveField(1);return;}
      if(e.shiftKey)return;
      if(e.key==='ArrowDown'){e.preventDefault();nextUnresolved();}
      if(e.key==='ArrowLeft'){e.preventDefault();movePatient(-1);}
      if(e.key==='ArrowRight'){e.preventDefault();movePatient(1);}
    });
    window.addEventListener('beforeunload',()=>setSaved('Saved in IndexedDB'));
  }
  function closeMenu(){$('moreMenu').classList.add('hidden');$('moreBtn').setAttribute('aria-expanded','false');}

  bindGlobal();loadFromDB();
})();
