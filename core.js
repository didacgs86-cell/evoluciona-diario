/* Shared domain logic: browser + Node tests. No external dependencies. */
(function(root){
'use strict';
const VERSION=1;
const dateKey=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const parseDate=s=>new Date(`${s}T12:00:00`);
const validDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(+parseDate(s))&&dateKey(parseDate(s))===s&&s>='2000-01-01'&&s<='2100-12-31';
const validMonth=s=>typeof s==='string'&&/^\d{4}-(0[1-9]|1[0-2])$/.test(s)&&s>='2000-01'&&s<='2100-12';
const shiftDate=(key,days)=>{const d=parseDate(key);d.setDate(d.getDate()+days);return dateKey(d)};
const uid=()=>crypto.randomUUID();
function initial(){return {version:VERSION,habits:[{id:'gym',name:'Gimnasio',area:'Salud',icon:'🏋️',target:3,created:dateKey(),archived:false},{id:'study',name:'Estudio',area:'Estudio',icon:'📚',target:null,created:dateKey(),archived:false},{id:'creatine',name:'Creatina',area:'Suplementos',icon:'💊',target:null,created:dateKey(),archived:false},{id:'protein',name:'Proteína',area:'Suplementos',icon:'🥛',target:null,created:dateKey(),archived:false}],days:{},tasks:[],improvements:[],expenses:[],closings:{},vault:null};}
const plain=o=>o!==null&&typeof o==='object'&&!Array.isArray(o)&&(Object.getPrototypeOf(o)===Object.prototype||Object.getPrototypeOf(o)===null);
const str=(s,max=2000)=>typeof s==='string'&&s.length<=max;
const money=n=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=100000000;
const id=s=>typeof s==='string'&&/^[a-zA-Z0-9_-]{1,80}$/.test(s)&&!['__proto__','constructor','prototype'].includes(s);
const assert=(b)=>{if(!b)throw new Error('La copia no tiene un formato válido o pertenece a otra versión.');};
function validate(s){
 assert(plain(s)&&s.version===VERSION&&Array.isArray(s.habits)&&s.habits.length<=200&&plain(s.days)&&plain(s.closings));
 const ids=new Set();for(const h of s.habits){assert(plain(h)&&id(h.id)&&!ids.has(h.id)&&str(h.name,50)&&h.name.trim()&&str(h.area,50)&&str(h.icon,20)&&typeof h.archived==='boolean'&&validDate(h.created)&&(h.target===null||Number.isInteger(h.target)&&h.target>=1&&h.target<=7));ids.add(h.id);}
 assert(Object.keys(s.days).length<=40000);for(const [date,d] of Object.entries(s.days)){assert(validDate(date)&&plain(d)&&plain(d.habits)&&(d.mood===null||Number.isInteger(d.mood)&&d.mood>=0&&d.mood<=100)&&str(d.achievement,2000)&&typeof d.starred==='boolean');for(const [key,val]of Object.entries(d.habits))assert(ids.has(key)&&['done','no','rest'].includes(val));}
 for(const name of ['tasks','improvements','expenses']){assert(Array.isArray(s[name])&&s[name].length<=50000);const seen=new Set();for(const item of s[name]){assert(plain(item)&&id(item.id)&&!seen.has(item.id));seen.add(item.id);}}
 for(const t of s.tasks)assert(str(t.title,160)&&str(t.area,50)&&(t.due===''||validDate(t.due))&&typeof t.done==='boolean');
 for(const i of s.improvements)assert(str(i.title,160)&&str(i.step,160)&&typeof i.done==='boolean');
 for(const e of s.expenses)assert(money(e.amount)&&e.amount>0&&validDate(e.date)&&str(e.note,160)&&['planned','chosen','review'].includes(e.kind));
 for(const [month,c]of Object.entries(s.closings))assert(validMonth(month)&&plain(c)&&money(c.saved)&&money(c.invested));
 assert(s.vault===null||plain(s.vault)&&s.vault.v===1&&s.vault.iterations===600000&&[s.vault.salt,s.vault.iv,s.vault.data].every(x=>typeof x==='string'&&/^[A-Za-z0-9+/]+=*$/.test(x))&&s.vault.salt.length===24&&s.vault.iv.length===16&&s.vault.data.length<=12000000);
 return s;
}
function monthSummary(s,month){const entries=Object.entries(s.days).filter(([d])=>d.startsWith(month));const moods=entries.map(([,d])=>d.mood).filter(v=>v!==null);return {recorded:entries.filter(([,d])=>Object.keys(d.habits).length||d.mood!==null||d.achievement.trim()).length,achievements:entries.filter(([,d])=>d.achievement.trim()).length,mood:moods.length?Math.round(moods.reduce((a,b)=>a+b,0)/moods.length):null,moodCount:moods.length,gym:entries.filter(([,d])=>d.habits.gym==='done').length};}
function weeklyCount(s,habit,key){const d=parseDate(key);const monday=shiftDate(key,-((d.getDay()+6)%7));return Array.from({length:7},(_,i)=>s.days[shiftDate(monday,i)]?.habits[habit]==='done').filter(Boolean).length;}
const api={VERSION,dateKey,parseDate,validDate,validMonth,shiftDate,uid,initial,validate,monthSummary,weeklyCount};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Evo=api;
})(typeof globalThis==='undefined'?this:globalThis);
