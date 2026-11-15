const test = require('node:test');
const assert = require('node:assert/strict');
const G = require('../gym-core.js');
const E = require('../core.js');
const exercise = (extra={}) => ({id:'curl',name:'Curl de bíceps',unit:'per-hand',initialWeight:16,targetSets:4,repMin:8,repMax:12,increment:1,confirmations:2,archived:false,created:'2026-11-01',...extra});
const session = (date,extra={}) => ({id:'s'+date.replaceAll('-',''),exerciseId:'curl',date,unit:'per-hand',targetSets:4,repMin:8,repMax:12,sets:Array.from({length:4},()=>({kg:16,reps:12})),rir:2,quality:'good',note:'',...extra});
const gym = (...sessions) => ({exercises:[exercise()],sessions});
test('The first successful session asks for confirmation; two confirm a small rise',()=>{
 assert.equal(G.recommendation(gym(session('2026-11-01')),exercise()).kind,'confirm');
 const r=G.recommendation(gym(session('2026-11-01'),session('2026-11-03')),exercise());
 assert.equal(r.kind,'increase');assert.equal(r.next,17);assert.equal(r.percent,6.25);
});
test('16 to 18 kg and 18 to 20 kg are flagged as large jumps, not prefilled',()=>{
 const e=exercise({increment:2});const g={exercises:[e],sessions:[session('2026-11-01'),session('2026-11-03')]};
 const r=G.recommendation(g,e);assert.equal(r.kind,'large-step');assert.equal(r.next,18);assert.equal(r.percent,12.5);
 assert.equal(G.seed(g,e,'2026-11-05').sets[0].kg,16);
 const h={exercises:[e],sessions:['2026-11-01','2026-11-03'].map(d=>session(d,{sets:Array.from({length:4},()=>({kg:18,reps:12}))}))};
 assert.equal(G.recommendation(h,e).kind,'large-step');assert.equal(G.recommendation(h,e).next,20);
});
test('Every planned set must reach the ceiling: the average or first set does not qualify',()=>{
 const s=session('2026-11-03',{sets:[{kg:16,reps:12},{kg:16,reps:12},{kg:16,reps:11},{kg:16,reps:10}]});
 assert.equal(G.recommendation(gym(session('2026-11-01'),s),exercise()).kind,'build');
});
test('Technique, pain, missing effort and near-failure logs do not generate a rise',()=>{
 for(const [changes,kind]of [[{quality:'pain'},'pain'],[{quality:'technique'},'technique'],[{quality:'unknown'},'check'],[{rir:null},'check'],[{rir:0},'effort'],[{rir:1},'effort']]) {
  const g=gym(session('2026-11-01'),session('2026-11-03',changes));assert.equal(G.recommendation(g,exercise()).kind,kind);
 }
});
test('Partial sets, mixed loads, changed plans and below-range reps are handled independently',()=>{
 const cases=[
  [{sets:[{kg:16,reps:12}]},'incomplete'],
  [{sets:[{kg:16,reps:12},{kg:16,reps:12},{kg:14,reps:12},{kg:14,reps:12}]},'mixed'],
  [{repMax:15},'changed-plan'],
  [{sets:Array.from({length:4},()=>({kg:16,reps:7}))},'below']
 ];
 for(const [changes,kind]of cases)assert.equal(G.recommendation(gym(session('2026-11-01',changes)),exercise()).kind,kind);
});
test('Confirmation resets after an intermediate session or a load change',()=>{
 const g=gym(session('2026-11-01'),session('2026-11-02',{rir:0}),session('2026-11-03'));
 assert.equal(G.recommendation(g,exercise()).kind,'confirm');
 const h=gym(session('2026-11-01',{sets:Array.from({length:4},()=>({kg:14,reps:12}))}),session('2026-11-03'));
 assert.equal(G.recommendation(h,exercise()).kind,'confirm');
});
test('History is date ordered, excludes later sessions, and never uses future work for old dates',()=>{
 const g=gym(session('2026-11-03'),session('2026-11-01'));
 assert.equal(G.history(g,'curl','2026-11-02').length,1);
 assert.equal(G.recommendation(g,exercise(),'2026-11-02').kind,'confirm');
 assert.equal(G.seed(g,exercise(),'2026-11-01').source,'saved');
 assert.equal(G.history(g,'curl','2026-11-01',true).length,0);
});
test('New sessions show past weights/proposal, but repetitions, quality and RIR are never recorded automatically',()=>{
 const g=gym(session('2026-11-01'),session('2026-11-03'));
 const seed=G.seed(g,exercise(),'2026-11-05');
 assert.deepEqual(seed.sets,Array.from({length:4},()=>({kg:17,reps:''})));
 assert.equal(seed.rir,null);assert.equal(seed.quality,'unknown');assert.equal(g.sessions.length,2);
});
test('Configurable one-session mode and a zero external load do not produce invalid math',()=>{
 assert.equal(G.recommendation(gym(session('2026-11-01')),exercise({confirmations:1})).kind,'increase');
 const g=gym(session('2026-11-01',{sets:Array.from({length:4},()=>({kg:0,reps:12}))}));
 assert.equal(G.recommendation(g,exercise()).kind,'zero');
});
test('An older v1 backup gains an empty gym without losing habits, diary ciphertext or other records',()=>{
 const s=E.initial();delete s.gym;s.vault={v:1,iterations:600000,salt:Buffer.alloc(16).toString('base64'),iv:Buffer.alloc(12).toString('base64'),data:Buffer.alloc(16).toString('base64')};s.closings['2026-11']={saved:200,invested:100};s.days['2026-11-01']={habits:{gym:'done'},mood:50,achievement:'Un avance',starred:true};
 const restored=E.validate(JSON.parse(JSON.stringify(s)));assert.deepEqual(restored.gym,G.empty());assert.equal(restored.days['2026-11-01'].achievement,'Un avance');assert.equal(restored.closings['2026-11'].saved,200);assert.deepEqual(restored.vault,s.vault);
});
test('New backups preserve full exercise history, archived exercises, decimals and escaped text',()=>{
 const s=E.initial();s.gym={exercises:[exercise({archived:true,name:'<script>ejercicio</script>',increment:0.5})],sessions:[session('2026-11-01',{sets:Array.from({length:4},()=>({kg:16.5,reps:11}))})]};
 assert.deepEqual(E.validate(JSON.parse(JSON.stringify(s))),s);
});
test('Import rejects duplicate dates, dangling exercises, invalid loads and invalid progress settings',()=>{
 for(const mutate of [g=>g.sessions.push({...g.sessions[0],id:'different'}),g=>g.sessions[0].exerciseId='missing',g=>g.sessions[0].sets[0].kg=-1,g=>g.sessions[0].sets[0].reps=NaN,g=>g.sessions[0].unit='total',g=>g.sessions[0].rir=20,g=>g.exercises[0].repMin=12,g=>g.exercises[0].increment=0,g=>g.exercises[0].confirmations=0,g=>g.exercises[0].id='__proto__']) {
  const g=gym(session('2026-11-01'));mutate(g);assert.throws(()=>G.validate(g,E.validDate));
 }
});

test('Very large configured jumps do not expose a proposed load button or seed',()=>{const e=exercise({increment:10,confirmations:1});const g={exercises:[e],sessions:[session('2026-11-01')]};const r=G.recommendation(g,e);assert.equal(r.kind,'too-large');assert.equal(r.next,undefined);assert.equal(G.seed(g,e,'2026-11-02').sets[0].kg,16);});
