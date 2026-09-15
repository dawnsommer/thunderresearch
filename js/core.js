(function(root,factory){
  const value=factory(root.ALF_SCHEMA || (typeof require==='function' ? require('./schema.js') : null));
  if(typeof module!=='undefined' && module.exports){module.exports=value;}
  root.ALFCore=value;
})(typeof globalThis!=='undefined'?globalThis:this,function(SCHEMA){
  'use strict';
  if(!SCHEMA) throw new Error('ALF schema not loaded');

  const fieldNames = SCHEMA.fields.map(f=>f.research_heading);
  const fieldSet = new Set(fieldNames);

  function naturalCompare(a,b){
    return String(a).localeCompare(String(b), undefined, {numeric:true, sensitivity:'base'});
  }

  function normalizeStatus(value, explicit){
    const raw=String(explicit||'').trim().toLowerCase();
    const allowed=new Set(['ok','review','calculated','nr','na']);
    if(allowed.has(raw)) return raw;
    const s=String(value??'').trim();
    if(/\[review\]/i.test(s)) return 'review';
    if(/\[calc(?:ulated)?\]/i.test(s)) return 'calculated';
    if(/^nr$/i.test(s)) return 'nr';
    if(/^n\/?a$/i.test(s)) return 'na';
    return 'ok';
  }

  function cleanAnswer(value){
    return String(value??'')
      .replace(/\s*\[review\]\s*/ig,' ')
      .replace(/\s*\[calc(?:ulated)?\]\s*/ig,' ')
      .replace(/\s+/g,' ')
      .trim();
  }

  function evidenceArray(entry){
    const ev=entry?.evidence;
    if(Array.isArray(ev)){
      return ev.map(x=>{
        if(typeof x==='string') return {text:x, location:'', date:''};
        return {
          text:String(x?.text??''),
          location:String(x?.location??x?.lines??''),
          date:String(x?.date??''),
          label:String(x?.label??'')
        };
      }).filter(x=>x.text || x.location || x.date || x.label);
    }
    const legacy=entry?.verbatim_evidence ?? entry?.evidence_text ?? entry?.why ?? '';
    if(String(legacy).trim()) return [{text:String(legacy).trim(), location:'', date:''}];
    return [];
  }

  function validateDraftShape(raw){
    if(!raw || typeof raw!=='object') return {ok:false, errors:['JSON root must be an object.']};
    const patientId=String(raw.patient_id ?? raw.studyID ?? raw.study_id ?? '').trim();
    if(!patientId) return {ok:false, errors:['Missing patient_id.']};
    const sourceEntries=Array.isArray(raw.fields)?raw.fields:Array.isArray(raw.entries)?raw.entries:null;
    if(!sourceEntries) return {ok:false, errors:['Expected fields[] or entries[].']};
    const seen=new Set(), unknown=[], duplicates=[];
    for(const e of sourceEntries){
      const h=String(e?.research_heading ?? e?.heading ?? '').trim();
      if(!h) continue;
      if(!fieldSet.has(h)) unknown.push(h);
      if(seen.has(h)) duplicates.push(h);
      seen.add(h);
    }
    const missing=fieldNames.filter(h=>!seen.has(h));
    const errors=[];
    if(unknown.length) errors.push(`Unknown research headings: ${[...new Set(unknown)].join('; ')}`);
    if(duplicates.length) errors.push(`Duplicate research headings: ${[...new Set(duplicates)].join('; ')}`);
    if(missing.length) errors.push(`Missing ${missing.length} schema headings: ${missing.join('; ')}`);
    return {ok:errors.length===0, errors, patient_id:patientId};
  }

  function canonicalizeDraft(raw, fileName=''){
    const shape=validateDraftShape(raw);
    if(!shape.ok){
      const err=new Error(shape.errors.join('\n'));
      err.validationErrors=shape.errors;
      throw err;
    }
    const entries=Array.isArray(raw.fields)?raw.fields:raw.entries;
    const byHeading=new Map(entries.map(e=>[String(e.research_heading ?? e.heading).trim(),e]));
    const now=new Date().toISOString();
    const patientId=shape.patient_id;
    const sourceFile=String(raw.source_file ?? raw.sourceFile ?? '').trim() || fileName.replace(/\.json$/i,'.txt');
    const fields=SCHEMA.fields.map(meta=>{
      const e=byHeading.get(meta.research_heading) || {};
      const original=cleanAnswer(e.proposed_answer ?? e.answer ?? e.value ?? '');
      const status=normalizeStatus(e.proposed_answer ?? e.answer ?? e.value ?? '', e.status);
      return {
        research_heading:meta.research_heading,
        order:meta.order,
        group:meta.group,
        proposed_answer:original,
        answer:original,
        last_audited_answer:original,
        status,
        evidence:evidenceArray(e),
        reviewer_note:String(e.reviewer_note??'')
      };
    });
    // Patient ID is source-derived, not a clinical inference. Fill only if extractor left it blank.
    const idField=fields.find(f=>f.research_heading==='Patient ID');
    if(idField && !idField.answer){
      idField.proposed_answer=patientId;
      idField.answer=patientId;
      idField.last_audited_answer=patientId;
      if(!idField.evidence.length) idField.evidence=[{text:`Filename/JSON identifier: ${patientId}`,location:'filename',date:''}];
    }
    return {
      format:'alf-review-patient-v2',
      schema_version:String(raw.schema_version ?? SCHEMA.schema_version),
      patient_id:patientId,
      source_file:sourceFile,
      source_sha256:String(raw.source_sha256 ?? raw.sourceFileHashSHA256 ?? ''),
      generated_at:String(raw.generated_at ?? raw.generatedAt ?? ''),
      imported_at:now,
      updated_at:now,
      approval_status:'pending',
      approved_at:null,
      fields
    };
  }

  function validateForApproval(patient){
    const errors=[];
    if(!patient) return ['No patient selected.'];
    if(!Array.isArray(patient.fields) || patient.fields.length!==SCHEMA.field_count){
      errors.push(`Expected ${SCHEMA.field_count} fields; found ${patient.fields?.length ?? 0}.`);
      return errors;
    }
    const seen=new Set();
    for(const meta of SCHEMA.fields){
      const f=patient.fields.find(x=>x.research_heading===meta.research_heading);
      if(!f){errors.push(`Missing field: ${meta.research_heading}`); continue;}
      if(seen.has(f.research_heading)) errors.push(`Duplicate field: ${f.research_heading}`);
      seen.add(f.research_heading);
      if(!String(f.answer??'').trim()) errors.push(`Blank answer: ${f.research_heading}`);
      if(f.status==='review') errors.push(`Unresolved REVIEW: ${f.research_heading}`);
      if(!Array.isArray(f.evidence) || f.evidence.length===0 || !f.evidence.some(e=>String(e.text??e.location??'').trim())){
        errors.push(`Missing evidence: ${f.research_heading}`);
      }
    }
    const idField=patient.fields.find(f=>f.research_heading==='Patient ID');
    if(idField && String(idField.answer).trim()!==String(patient.patient_id).trim()){
      errors.push(`Patient ID field (${idField.answer}) does not match JSON patient_id (${patient.patient_id}).`);
    }
    return errors;
  }

  function patientCounts(patient){
    const out={total:0,review:0,calculated:0,nr:0,na:0,changed:0,blank:0};
    for(const f of patient?.fields||[]){
      out.total++;
      if(f.status in out) out[f.status]++;
      if(!String(f.answer??'').trim()) out.blank++;
      if(String(f.answer??'')!==String(f.proposed_answer??'')) out.changed++;
    }
    return out;
  }

  function parseCSV(text){
    const rows=[]; let row=[], field='', i=0, quoted=false;
    text=String(text??'').replace(/^\uFEFF/,'');
    while(i<text.length){
      const c=text[i];
      if(quoted){
        if(c==='"'){
          if(text[i+1]==='"'){field+='"'; i+=2; continue;}
          quoted=false; i++; continue;
        }
        field+=c; i++; continue;
      }
      if(c==='"'){quoted=true; i++; continue;}
      if(c===','){row.push(field); field=''; i++; continue;}
      if(c==='\r' || c==='\n'){
        row.push(field); field=''; rows.push(row); row=[];
        if(c==='\r' && text[i+1]==='\n') i+=2; else i++;
        continue;
      }
      field+=c; i++;
    }
    if(field.length || row.length){row.push(field); rows.push(row);}
    return rows;
  }

  function csvEscape(v){
    const s=String(v??'');
    return /[",\r\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s;
  }
  function toCSV(rows){return rows.map(r=>r.map(csvEscape).join(',')).join('\r\n')+'\r\n';}

  function approvedAnswerMap(patient){
    const m=new Map();
    for(const f of patient.fields) m.set(f.research_heading,String(f.answer??'').trim());
    return m;
  }

  function buildSchemaOnlyCSV(approvedPatients){
    const pats=[...approvedPatients].sort((a,b)=>naturalCompare(a.patient_id,b.patient_id));
    const rows=[fieldNames];
    for(const p of pats){
      const m=approvedAnswerMap(p);
      rows.push(fieldNames.map(h=>m.get(h)||''));
    }
    return toCSV(rows);
  }

  function buildMasterCSV(masterText, approvedPatients){
    const rows=parseCSV(masterText);
    if(!rows.length) throw new Error('Master CSV is empty.');
    const width=Math.max(...rows.map(r=>r.length), 131);
    rows.forEach(r=>{while(r.length<width)r.push('');});
    const headerIndex=rows.findIndex(r=>String(r[0]).trim()==='Patient ID' && String(r[1]).trim()==='Admission date');
    if(headerIndex<0) throw new Error('Could not locate master header row (Patient ID / Admission date).');
    if(width<=Math.max(...SCHEMA.fields.map(f=>f.master_column_index))) throw new Error('Master CSV has fewer columns than required by schema mapping.');
    for(const meta of SCHEMA.fields){
      const candidates=[rows[headerIndex]?.[meta.master_column_index],rows[headerIndex-1]?.[meta.master_column_index]].map(x=>String(x||'').trim()).filter(Boolean);
      if(!candidates.includes(meta.research_heading)){
        throw new Error(`Master CSV heading mismatch at column ${meta.master_excel_column}: expected "${meta.research_heading}".`);
      }
    }
    const existingIds=new Set(rows.slice(headerIndex+1).map(r=>String(r[0]||'').trim()).filter(Boolean));
    const pats=[...approvedPatients].sort((a,b)=>naturalCompare(a.patient_id,b.patient_id));
    const newRows=[];
    const seen=new Set();
    for(const p of pats){
      if(seen.has(p.patient_id)) throw new Error(`Duplicate approved Patient ID: ${p.patient_id}`);
      if(existingIds.has(p.patient_id)) throw new Error(`Patient ID already exists in master CSV: ${p.patient_id}`);
      seen.add(p.patient_id);
      const m=approvedAnswerMap(p); const row=Array(width).fill('');
      for(const meta of SCHEMA.fields) row[meta.master_column_index]=m.get(meta.research_heading)||'';
      newRows.push(row);
    }
    let lastNonBlank=headerIndex;
    for(let i=headerIndex+1;i<rows.length;i++) if(rows[i].some(x=>String(x).trim())) lastNonBlank=i;
    const output=[...rows.slice(0,lastNonBlank+1),...newRows,...rows.slice(lastNonBlank+1)];
    return toCSV(output);
  }

  function exportPatient(patient, approved=false){
    const copy=JSON.parse(JSON.stringify(patient));
    copy.format='alf-review-patient-v2';
    copy.exported_at=new Date().toISOString();
    if(approved) copy.approval_status='approved';
    return copy;
  }

  function parseLineRange(text){
    const s=String(text??'');
    let m=s.match(/\bL(?:ine(?:s)?)?\s*(\d+)\s*(?:[-–:]\s*L?\s*(\d+))?/i);
    if(!m) m=s.match(/\[(?:[^\]]*?\|\s*)?L\s*(\d+)\s*(?:[-–:]\s*L?\s*(\d+))?\]/i);
    if(!m) return null;
    return {start:Number(m[1]), end:Number(m[2]||m[1])};
  }

  function normalizedSourceText(text){
    return String(text??'').toLowerCase().replace(/[“”]/g,'"').replace(/[‘’]/g,"'").replace(/\s+/g,' ').trim();
  }

  function findEvidenceLine(lines,evidence){
    const raw=String(evidence?.text??'').replace(/^['"“]|['"”]$/g,'').trim();
    if(!raw)return -1;
    const needle=normalizedSourceText(raw);
    let idx=lines.findIndex(line=>{
      const candidate=normalizedSourceText(line);
      return candidate.includes(needle) || (candidate.length>15 && needle.includes(candidate));
    });
    if(idx>=0)return idx;
    const tokens=needle.split(/\s+/).filter(token=>token.length>2).slice(0,18);
    if(tokens.length<2)return -1;
    const threshold=Math.max(2,Math.ceil(tokens.length*.6));
    idx=lines.findIndex(line=>{
      const candidate=normalizedSourceText(line);
      return tokens.filter(token=>candidate.includes(token)).length>=threshold;
    });
    return idx;
  }

  function sourceContext(sourceText, evidence, padding=8){
    const lines=String(sourceText??'').split(/\r?\n/);
    const location=String(evidence?.location??'');
    const range=parseLineRange(location)||parseLineRange(evidence?.text??'');
    let start,end,matchLine=null;
    if(range){start=Math.max(1,range.start-padding); end=Math.min(lines.length,range.end+padding); matchLine=range.start;}
    else{
      const needle=String(evidence?.text??'').replace(/^['"“]|['"”]$/g,'').trim();
      if(needle){
        const idx=findEvidenceLine(lines,evidence);
        if(idx>=0){matchLine=idx+1; start=Math.max(1,idx+1-padding); end=Math.min(lines.length,idx+1+padding);}
      }
    }
    if(!start){start=1; end=Math.min(lines.length,60);}
    return {
      start,end,matchLine,
      lines:lines.slice(start-1,end).map((text,i)=>({line:start+i,text,highlight:matchLine!==null && start+i>=matchLine && start+i<=(range?.end||matchLine)}))
    };
  }

  return {
    SCHEMA, fieldNames, naturalCompare, normalizeStatus, cleanAnswer, validateDraftShape,
    canonicalizeDraft, validateForApproval, patientCounts, parseCSV, toCSV,
    buildSchemaOnlyCSV, buildMasterCSV, exportPatient, parseLineRange, sourceContext
  };
});
