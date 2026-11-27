'use strict';
const STORE='pocket-stable-v1', DAY=86400000;
const animals=[['Pip','🐱','Kitten',1],['Mochi','🐰','Bunny',2],['Sprout','🐸','Frog',3],['Biscuit','🐶','Puppy',4],['Pebble','🦊','Fox',6],['Nova','🐼','Panda',8],['Ember','🐲','Dragon',11],['Luna','🦄','Unicorn',15],['Clover','🦦','Otter',18],['Puddle','🐢','Turtle',21],['Tide','🐙','Kraken',25],['Summit','🐐','Mountain Goat',12],['Frost','🐺','Wolf',12],['Flipper','🦭','Seal',1],['Sky','🦅','Eagle',2]];
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
 [[15,35],[80,100],[15,40],[85,100],[50,75]],
 [[65,85],[90,100],[60,85],[80,100],[65,90]],[[60,85],[20,45],[85,100],[75,95],[55,80]],[[85,100],[40,65],[65,85],[80,95],[60,80]],[[20,45],[85,100],[15,35],[65,85],[60,85]],[[65,85],[20,40],[85,100],[55,80],[65,85]]
];

const rivalNameSources=[['Gr|ace','Ja|mes','Cl|aire','Bl|ake','Br|ooke','Ch|ase','Fa|ith','Gr|ant','Pa|ige','Cl|ark','Qu|inn','Sc|ott','Sh|ane','Dr|ake','Re|ese'],['Kay|lin','Jay|den','Sar|ah','Ma|son','Chy|na','Cal|vin','Han|nah','Mar|cus','Ra|chel','Ash|ton','Jas|mine','Lo|gan','Char|lotte','Con|nor','Par|ker'],['Mari|anne','Ben|jamin','Nat|alie','Nich|olas','Abi|gail','An|thony','Saman|tha','Dom|inic','Re|becca','Oli|ver','Jes|sica','Juli|an','Caro|line','Zach|ary','Gabri|elle']];
const rivalNamePools=rivalNameSources.map(list=>[0,1].map(i=>[...new Set(list.map(n=>n.split('|')[i]))]));
const pickRandom=a=>a[Math.floor(Math.random()*a.length)];
const rarityTiers=[{name:'Common',color:'#ffffff',race:50,starter:25},{name:'Uncommon',color:'#43a65c',race:25,starter:25},{name:'Rare',color:'#3b82f6',race:15,starter:25},{name:'Epic',color:'#a855f7',race:7,starter:15},{name:'Legendary',color:'#d9a520',race:3,starter:10}];
const speciesTier=[0,1,1,0,2,3,4,4,3,2,4,2,3,0,1];
function rarityBadge(i){let r=rarityTiers[speciesTier[i]];return '<span class="chip" style="background:'+r.color+';color:#171717;border:1px solid #777">'+r.name+'</span>'}
function weightedSpecies(pool,mode='race',previous=[]){let weights=pool.map(i=>rarityTiers[speciesTier[i]][mode]/3*Math.pow(.12,previous.filter(x=>x===i).length));let roll=Math.random()*weights.reduce((a,b)=>a+b,0);for(let j=0;j<pool.length;j++){roll-=weights[j];if(roll<0)return pool[j]}return pool.at(-1)}
function starterRoll(existing=[]){let out=[...new Set(existing)].filter(i=>Number.isInteger(i)&&i>=0&&i<animals.length).slice(0,6);if(out.length===6&&out.filter(i=>speciesTier[i]>=2).length<2)out=[];while(out.length<6){let need=Math.max(0,2-out.filter(i=>speciesTier[i]>=2).length),pool=animals.map((_,i)=>i).filter(i=>!out.includes(i)&&(6-out.length>need||speciesTier[i]>=2));out.push(weightedSpecies(pool,'starter'))}return out}
const nameWords=[
[['Jay','Mar','Cal','Ken','El','Sam','Ros','Ben','Ash','Lia','Nico','Em','Theo','Ari','Dani','Jo','Max','Kai'],['den','ibel','vin','dra','ena','uel','alie','jamin','ley','na','las','ilia','dor','elle','son','anna','ine','lyn']],
[['Mochi','Peach','Tiny','Honey','Berry','Boba','Puff','Lemon','Sugar','Mint','Cocoa','Sunny','Cherry','Bunny','Mallow','Cookie'],['Bean','Paws','Bun','Moth','Cloud','Pop','Petal','Sprout','Puff','Bear','Bee','Drop','Kit','Bloom','Star','Cake']],
[['Void','Frost','Pixel','Shadow','Neon','Cyber','Nova','Storm','Iron','Ghost','Turbo','Rogue','Blaze','Echo','Lunar','Glitch'],['Runner','Byte','Fox','Blade','Core','Wolf','Knight','Dash','Quest','Zero','Shift','Spark','Rift','Pulse','Wing','Strike']],
[['milo','bella','noodl','frog','alex','jules','sam','ivy','luna','kai','olive','bee','fin','toby','poppy','sage'],['lover','plays','here','online','daily','time','world','stuff','vibes','life','fan','zone']],
[['Ae','Sol','Nyth','El','Vael','Syl','Thal','Iri','Lun','Eir','Kael','Or','Zel','Myr','Ari','Fae'],['lora','wyn','eris','vani','ith','ara','orin','iel','essa','ion','aris','eth','ora','une','ael','is']],
[['Wet','Soup','Toasty','Angry','Sleepy','Wobbly','Crunchy','Tiny','Lost','Spicy','Confused','Sneaky','Soggy','Fancy','Grumpy','Bouncy'],['Sock','Goblin','Bread','Bean','Potato','Spoon','Pickle','Toast','Noodle','Goose','Muffin','Chair','Bug','Turnip','Waffle','Rock']]];
function randomRivalName(used=new Set(),styles=new Set()){let groups=[0,1,2,3,4,5].filter(i=>!styles.has(i));let g=pickRandom(groups.length?groups:[0,1,2,3,4,5]);styles.add(g);for(let n=0;n<200;n++){let a=pickRandom(nameWords[g][0]),b=pickRandom(nameWords[g][1]),num=10+Math.floor(Math.random()*90),patterns=g===0?[a+b,a+b+num,a+b+'s',a+b+'_'+num]:g===1?[a+b,b+a,a+b+num,a+'_'+b]:g===2?[a+b,'x'+a+'x',a+num,a+'_'+b]:g===3?[a,'just'+a,a+b+num,'its'+a]:g===4?[a+b,a+b+num,a+b+'a',a+b+'yn']:[a+b,b+a,a+b+num,a+'_'+b];let name=pickRandom(patterns);if(!used.has(name.toLowerCase())&&!/ass|fuck|shit|bitch|cunt|dick|cock|piss|slut|whore|fag|nigg|rape|twat|crap/i.test(name)){used.add(name.toLowerCase());return name}}let fallback='Trainer'+id();used.add(fallback.toLowerCase());return fallback}
function localDate(date=new Date()){let y=date.getFullYear(),m=String(date.getMonth()+1).padStart(2,'0'),d=String(date.getDate()).padStart(2,'0');return `${y}-${m}-${d}`}
function dayCount(iso){return Math.round(new Date(iso+'T12:00:00').getTime()/DAY)}
function isoPlus(iso,days){let d=new Date(iso+'T12:00:00');d.setDate(d.getDate()+days);return localDate(d)}
function id(){return Math.random().toString(36).slice(2)+Date.now().toString(36)}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function attr(v){return esc(v)}
function toast(msg){let node=document.getElementById('toast');node.innerHTML=`<div class="toast">${esc(msg)}</div>`;clearTimeout(notifyTimer);notifyTimer=setTimeout(()=>node.innerHTML='',2600)}
function levelStart(lv){let total=0;for(let i=1;i<lv;i++)total+=Math.round(70*Math.pow(1.22,i-1));return total}function levelEnd(lv){return levelStart(lv+1)}function level(xp){let lv=1;while(lv<10000&&xp>=levelEnd(lv))lv++;return lv}function pct(n,d){return Math.max(0,Math.min(100,Math.round((n/Math.max(1,d))*100)))}
function seeded(seed){let x=seed|0;return ()=>{x|=0;x=x+0x6D2B79F5|0;let t=Math.imul(x^x>>>15,1|x);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296}}
function maintenance(){for(let p of s.pets){let elapsed=Math.max(0,Date.now()-(p.lastEnergy||Date.now()));p.energy=Math.min(maxEnergy(p),(p.energy??maxEnergy(p))+elapsed/60000*2);p.lastEnergy=Date.now()}syncUnlocks();let today=localDate();if(!s.loginDates.includes(today)){s.loginDates.push(today);s.loginDates.sort()}if(s.lastSeen!==today){let diff=Math.max(0,dayCount(today)-dayCount(s.lastSeen||today));for(let p of s.pets)p.hp=Math.max(15,p.hp-Math.min(45,diff*4));s.lastSeen=today}if(s.quests.dailyPeriod!==today){s.quests.daily=makeQuests(false,today,3);s.quests.dailyPeriod=today}let w=weekPeriod();if(s.quests.bonusPeriod!==w){s.quests.bonus=makeQuests(true,w,2);s.quests.bonusPeriod=w}save()}
function cssVars(){let r=document.documentElement.style;Object.entries({bg:s.settings.bg,card:s.settings.card,ink:s.settings.ink,accent:s.settings.accent}).forEach(([k,v])=>r.setProperty('--'+k,v));document.body.classList.toggle('compact',!!s.settings.compact)}
function reward(xp,coins){let p=s.pets[s.active];let before=level(p.xp),beforeGlobal=level(s.globalXP);p.xp+=xp;s.globalXP+=xp;p.hp=Math.min(100,p.hp+9);s.coins+=coins;if(level(p.xp)>before)toast(`🎉 ${p.name} reached level ${level(p.xp)}!`);else if(level(s.globalXP)>beforeGlobal)toast('🎉 Trainer level up! A pet may have unlocked!');else toast(`✨ +${xp} XP · 🪙 +${coins} coins`)}
const baseWeights=[8,5,1,15,12,25,30,28,10,6,20,18,22,16,5];
function petWeight(p){return Math.round(baseWeights[p.id]*(1+.08*(level(p.xp)-1))*10)/10}
function maxEnergy(p){return 100+5*(level(p.xp)-1)}
function feedPrice(){let bucket=Math.floor(Date.now()/900000),area=Math.max(1,s.area||1);return 8+2*(area-1)+(Math.imul(bucket^Math.imul(area,7919),2654435761)>>>0)%5}
function feedQuote(p,kind){let cap=maxEnergy(p),gain=Math.max(0,Math.min(cap-p.energy,kind==='full'?cap:cap*(kind==='meal'?.5:.2)));let pounds=Math.ceil(gain/cap*petWeight(p)*.2*100)/100;return {gain,pounds,cost:Math.ceil(pounds*feedPrice()*(kind==='full'?1.05:1.02))}}
