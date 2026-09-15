const fs=require('fs');
const path=require('path');
const assert=require('assert');
const ROOT=path.resolve(__dirname,'..');
global.ALF_SCHEMA=require(path.join(ROOT,'js/schema.js'));
const C=require(path.join(ROOT,'js/core.js'));
function fixture(name){return JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures',name),'utf8'));}

assert.equal(C.SCHEMA.field_count,113,'schema must have 113 fields');
const p1=C.canonicalizeDraft(fixture('patient_v1.json'),'patient_v1.json');
assert.equal(p1.fields.length,113);
const cr=p1.fields.find(f=>f.research_heading==='Peak creatinine');
assert.equal(cr.answer,'1.9');assert.equal(cr.status,'review');
assert(C.validateForApproval(p1).some(x=>x.includes('Peak creatinine')));
cr.status='ok';
for(const f of p1.fields){if(!f.answer)f.answer='NR';if(!f.evidence.length)f.evidence=[{text:'Synthetic evidence'}];}
assert.deepEqual(C.validateForApproval(p1),[]);

const p2=C.canonicalizeDraft(fixture('patient_v2.json'),'patient_v2.json');
assert.equal(p2.patient_id,'ALF-TEST-0002');
assert(Array.isArray(p2.fields[0].evidence));

const schemaCsv=C.buildSchemaOnlyCSV([p1,p2]);
const schemaRows=C.parseCSV(schemaCsv);
assert.equal(schemaRows.length,3);assert.equal(schemaRows[0].length,113);

const master=fs.readFileSync(path.join(__dirname,'fixtures/master.csv'),'utf8');
const out=C.buildMasterCSV(master,[p1,p2]);
const outRows=C.parseCSV(out);
assert.equal(outRows[0].length,131);
assert.equal(outRows.length,8);
assert.equal(outRows[5][0],'EXISTING-SYNTHETIC');
assert.equal(outRows[6][0],'ALF-TEST-0001');
assert.equal(outRows[7][0],'ALF-TEST-0002');

const src=fs.readFileSync(path.join(__dirname,'fixtures/ALF-TEST-0001.txt'),'utf8');
const ctx=C.sourceContext(src,{location:'L120-L122',text:'Creatinine 1.9'},3);
assert(ctx.lines.some(x=>x.line===120 && x.highlight));

const fuzzySource='Synthetic admission note\nCreatinine 1.9 mg/dL on arrival\nSynthetic follow-up note';
const fuzzyCtx=C.sourceContext(fuzzySource,{text:'Creatinine\n1.9 mg/dL on arrival'},1);
assert.equal(fuzzyCtx.matchLine,2,'source matching should tolerate evidence whitespace differences');

console.log('All core tests passed.');
