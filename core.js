'use strict';
const STORE='pocket-stable-v1', DAY=86400000;
const animals=[['Pip','🐱','Kitten',1],['Mochi','🐰','Bunny',2],['Sprout','🐸','Frog',3],['Biscuit','🐶','Puppy',4],['Pebble','🦊','Fox',6],['Nova','🐼','Panda',8],['Ember','🐲','Dragon',11],['Luna','🦄','Unicorn',15],['Clover','🦦','Otter',18],['Puddle','🐢','Turtle',21]];
const catalog=[['Bow','🎀',35],['Top Hat','🎩',50],['Flower','🌸',40],['Crown','👑',120],['Sparkles','✨',60],['Ribbon','🎗️',30],['Sunglasses','🕶️',65],['Leaf','🍃',35],['Star','⭐',75],['Tiara','💎',140],['Mushroom','🍄',45],['Party Hat','🥳',55],['Heart','💗',70],['Butterfly','🦋',90],['Scarf','🧣',70],['Halo','😇',125],['Moon','🌙',80],['Bubbles','🫧',50]];
const statNames=['speed','swim','climb','endure','recover'];
// Species-specific natural ranges: Speed, Swim, Climb, Endure, Recover.
// Every species has 2–3 strong suits and at least one clear weakness.
const speciesRanges=[
 [[65,90],[20,45],[80,100],[60,85],[55,80]], // Cat
 [[80,100],[15,35],[55,80],[75,95],[55,80]], // Rabbit
 [[25,50],[85,100],[75,95],[55,80],[50,75]], // Frog
 [[65,90],[55,80],[30,55],[75,95],[65,90]], // Dog
 [[75,100],[20,45],[65,90],[75,95],[60,85]], // Fox
 [[25,50],[40,65],[65,90],[80,100],[20,45]], // Panda
 [[75,95],[70,95],[80,100],[75,95],[35,60]], // Dragon
 [[85,100],[65,90],[60,85],[80,100],[35,60]], // Unicorn
 [[45,70],[85,100],[60,85],[75,95],[70,95]], // Otter
 [[15,35],[80,100],[15,40],[85,100],[50,75]] // Turtle
];

const rivalNameSources=[['Gr|ace','Ja|mes','Cl|aire','Bl|ake','Br|ooke','Ch|ase','Fa|ith','Gr|ant','Pa|ige','Cl|ark','Qu|inn','Sc|ott','Sh|ane','Dr|ake','Re|ese'],['Kay|lin','Jay|den','Sar|ah','Ma|son','Chy|na','Cal|vin','Han|nah','Mar|cus','Ra|chel','Ash|ton','Jas|mine','Lo|gan','Char|lotte','Con|nor','Par|ker'],['Mari|anne','Ben|jamin','Nat|alie','Nich|olas','Abi|gail','An|thony','Saman|tha','Dom|inic','Re|becca','Oli|ver','Jes|sica','Juli|an','Caro|line','Zach|ary','Gabri|elle']];
const rivalNamePools=rivalNameSources.map(list=>[0,1].map(i=>[...new Set(list.map(n=>n.split('|')[i]))]));
const pickRandom=a=>a[Math.floor(Math.random()*a.length)];
function randomRivalName(used=new Set()){let pool=pickRandom(rivalNamePools);let candidates=pool[0].flatMap(a=>pool[1].map(b=>a+b)).filter(n=>n.length>=5&&!used.has(n.toLowerCase())&&!/ass|fuck|shit|bitch|cunt|dick|cock|piss|slut|whore|fag|nigg|rape|twat|crap/i.test(n));if(!candidates.length)candidates=rivalNamePools.flatMap(p=>p[0].flatMap(a=>p[1].map(b=>a+b))).filter(n=>n.length>=5&&!used.has(n.toLowerCase())&&!/ass|fuck|shit|bitch|cunt|dick|cock|piss|slut|whore|fag|nigg|rape|twat|crap/i.test(n));let name=pickRandom(candidates);used.add(name.toLowerCase());return name}
function localDate(date=new Date()){let y=date.getFullYear(),m=String(date.getMonth()+1).padStart(2,'0'),d=String(date.getDate()).padStart(2,'0');return `${y}-${m}-${d}`}
function dayCount(iso){return Math.round(new Date(iso+'T12:00:00').getTime()/DAY)}
function isoPlus(iso,days){let d=new Date(iso+'T12:00:00');d.setDate(d.getDate()+days);return localDate(d)}
function id(){return Math.random().toString(36).slice(2)+Date.now().toString(36)}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function attr(v){return esc(v)}
function toast(msg){let node=document.getElementById('toast');node.innerHTML=`<div class="toast">${esc(msg)}</div>`;clearTimeout(notifyTimer);notifyTimer=setTimeout(()=>node.innerHTML='',2600)}
function levelStart(lv){let total=0;for(let i=1;i<lv;i++)total+=Math.round(70*Math.pow(1.22,i-1));return total}function levelEnd(lv){return levelStart(lv+1)}function level(xp){let lv=1;while(lv<10000&&xp>=levelEnd(lv))lv++;return lv}function pct(n,d){return Math.max(0,Math.min(100,Math.round((n/Math.max(1,d))*100)))}
function seeded(seed){let x=seed|0;return ()=>{x|=0;x=x+0x6D2B79F5|0;let t=Math.imul(x^x>>>15,1|x);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296}}
function maintenance(){for(let p of s.pets){let elapsed=Math.max(0,Date.now()-(p.lastEnergy||Date.now()));p.energy=Math.min(100,(p.energy??100)+elapsed/60000*2);p.lastEnergy=Date.now()}syncUnlocks();let today=localDate();if(!s.loginDates.includes(today)){s.loginDates.push(today);s.loginDates.sort()}if(s.lastSeen!==today){let diff=Math.max(0,dayCount(today)-dayCount(s.lastSeen||today));for(let p of s.pets)p.hp=Math.max(15,p.hp-Math.min(45,diff*4));s.lastSeen=today}if(s.quests.dailyPeriod!==today){s.quests.daily=makeQuests(false,today,3);s.quests.dailyPeriod=today}let w=weekPeriod();if(s.quests.bonusPeriod!==w){s.quests.bonus=makeQuests(true,w,2);s.quests.bonusPeriod=w}save()}
function cssVars(){let r=document.documentElement.style;Object.entries({bg:s.settings.bg,card:s.settings.card,ink:s.settings.ink,accent:s.settings.accent}).forEach(([k,v])=>r.setProperty('--'+k,v));document.body.classList.toggle('compact',!!s.settings.compact)}
function reward(xp,coins){let p=s.pets[s.active];let before=level(p.xp),beforeGlobal=level(s.globalXP);p.xp+=xp;s.globalXP+=xp;p.hp=Math.min(100,p.hp+9);s.coins+=coins;if(level(p.xp)>before)toast(`🎉 ${p.name} reached level ${level(p.xp)}!`);else if(level(s.globalXP)>beforeGlobal)toast('🎉 Trainer level up! A pet may have unlocked!');else toast(`✨ +${xp} XP · 🪙 +${coins} coins`)}