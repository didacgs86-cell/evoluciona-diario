/* Encryption primitives shared by the app and security checks. */
(function(root){'use strict';
const bytesTo64=b=>{let s='';for(const n of b)s+=String.fromCharCode(n);return btoa(s)};
const from64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function derive(password,salt){const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:600000,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);}
async function encryptEntries(entries,key,salt){const iv=crypto.getRandomValues(new Uint8Array(12));const ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,new TextEncoder().encode(JSON.stringify(entries)));return {v:1,iterations:600000,salt,iv:bytesTo64(iv),data:bytesTo64(new Uint8Array(ciphertext))};}
const api={bytesTo64,from64,derive,encryptEntries};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.EvoCrypto=api;
})(globalThis);
