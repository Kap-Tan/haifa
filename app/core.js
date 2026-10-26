export const normalize = s => s.trim().toLowerCase().replace(/\s+/g,' ');
export function history(reports,name,unit){return reports.flatMap(r=>r.items.filter(i=>normalize(i.name)===normalize(name)&&normalize(i.unit)===normalize(unit)).map(i=>({...i,date:r.date,id:r.id}))).sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id));}
export function flag(i){return i.low!==''&&i.value<Number(i.low)?'Low':i.high!==''&&i.value>Number(i.high)?'High':'In range';}
export function parse(text){return text.split('\n').flatMap(line=>{const m=line.trim().match(/^([A-Za-z][A-Za-z0-9 ()/.,%-]*?)\s+([<>]?\d+(?:\.\d+)?)\s+([^\s]+)\s+(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)/);return m&&!/^[<>]/.test(m[2])?[{name:m[1],value:Number(m[2]),unit:m[3],low:m[4],high:m[5]}]:[];});}
const enc=new TextEncoder(),dec=new TextDecoder();
const b64=bytes=>{let result='';for(let n=0;n<bytes.length;n+=8192)result+=String.fromCharCode(...bytes.subarray(n,n+8192));return btoa(result);};
const un64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function key(pass,salt){const material=await crypto.subtle.importKey('raw',enc.encode(pass),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:600000,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);}
export async function seal(data,pass){const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));const ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv},await key(pass,salt),enc.encode(JSON.stringify(data)));return {v:1,salt:b64(salt),iv:b64(iv),ciphertext:b64(new Uint8Array(ciphertext))};}
export async function open(box,pass){if(box.v!==1)throw Error('Unsupported vault version');return JSON.parse(dec.decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:un64(box.iv)},await key(pass,un64(box.salt)),un64(box.ciphertext))));}
