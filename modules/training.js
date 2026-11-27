const biomes={speed:["Jungle","Meadow","Desert","Snowfield"],swim:["River","Reef","Marsh","Glacier"],climb:["Forest","Cliffs","Canyon","Ruins"]};
const biomePalette={Jungle:'#77c69a',Meadow:'#bdeca0',Desert:'#f1d69c',Snowfield:'#cde9f5',River:'#8dc8ef',Reef:'#68d7d5',Marsh:'#9bb9a4',Glacier:'#b5dff4',Forest:'#8fb88a',Cliffs:'#b8a3a0',Canyon:'#e8af85',Ruins:'#c6b8d3'};
const specialties=[["climb","Forest"],["speed","Meadow"],["swim","Marsh"],["speed","Meadow"],["speed","Jungle"],["climb","Cliffs"],["climb","Ruins"],["speed","Snowfield"],["swim","River"],["swim","Glacier"]];
function specialty(i,terrain,biome){let [t,b]=specialties[i]||specialties[0];return (t===terrain?1.05:1)*(b===biome?1.10:1)}
function awardSkillXP(p,k,amount){p.skillXP=p.skillXP||{};p.skillLevels=p.skillLevels||{};p.skillLevels[k]=p.skillLevels[k]||1;if(p.skillLevels[k]>=skillCap())return 0;p.skillXP[k]=(p.skillXP[k]||0)+Math.max(0,Math.round(amount));let gained=0;while(p.skillLevels[k]<skillCap()&&p.skillXP[k]>=skillNeed(p.skillLevels[k])){p.skillXP[k]-=skillNeed(p.skillLevels[k]);p.skillLevels[k]++;gained++}return gained}
let trainingGame=null,trainingTimer=null;
function trainingNeed(points){return 10+5*points}
let autoTrainingTimer=null;
function randomTrainingTerrain(previous=''){
 const choices=Object.entries(biomes).flatMap(([type,names])=>names.map(name=>({type,name})) ).filter(x=>x.name!==previous);
 return choices[Math.floor(Math.random()*choices.length)];
}
// Shared terrain generator and skill rules for races, marathons and endless training.
const COURSE_TYPES=['speed','swim','climb'];
function makeCourseSection(type,previous=''){
 const key=type||COURSE_TYPES[Math.floor(Math.random()*3)];
 const names=biomes[key].filter(n=>n!==previous);
 const name=names[Math.floor(Math.random()*names.length)]||biomes[key][0];
 const length=8+Math.random()*22;
 const icons=key==='swim'?['🪷','🐟','🫧','🌊','🪨']:key==='climb'?['🪨','🌿','🍂','🌲','🪵']:['🌼','🌳','🍄','🌿','🪨'];
 return {type:key,name,length,decorations:Array.from({length:12+Math.floor(Math.random()*8)},()=>({x:5+Math.random()*90,y:Math.random()*96,size:13+Math.random()*30,icon:icons[Math.floor(Math.random()*icons.length)]}))};
}
function makeCourse(count,previous=''){
 const types=count===Infinity?[]:Array.from({length:count},(_,i)=>COURSE_TYPES[i%3]);
 let prior=previous;
 return types.map(type=>{let section=makeCourseSection(type,prior);prior=section.name;return section});
}
function courseSkill(type){return type==='speed'?'speed':type==='swim'?'swim':'climb'}
function awardCourseXP(p,section,amount,extra=0){
 let result={};result[courseSkill(section.type)]=amount;
 result.endure=Math.round(extra*.5);result.recover=Math.round(extra*.5);
 for(let [k,v] of Object.entries(result))if(v>0)awardSkillXP(p,k,v);
 return result;
}
function courseSpeed(stats,section,sprinting,bonus=1){
 const index=COURSE_TYPES.indexOf(section.type);
 return (.038+stats[index]*.0023)*(sprinting?1.5:1)*bonus;
}
function trainingTerrain(k){return ['speed','swim','climb'].includes(k)?k:null}
function newTrainingSection(g){
 const section=makeCourseSection(trainingTerrain(g.skill),g.biome);
 // Early sections are brief; later ones gradually become longer.
 section.length=Math.min(85,5+g.segments*2.3+Math.random()*(4+g.segments*.35));
 Object.assign(g,{biome:section.name,terrain:section.type,sectionLength:section.length,distance:0,decorations:section.decorations,currentSection:section});
}
function trainingScenery(section){
 return section.decorations.map(d=>`<span style="position:absolute;left:${d.x}%;bottom:${d.y}%;font-size:${d.size}px">${d.icon}</span>`).join('');
}
function trainingPanel(section,id){
 return `<div class="training-panel" id="${id}" style="background:${biomePalette[section.name]||'#bce7b4'}"><span class="training-biome-label">${section.name}</span>${trainingScenery(section)}</div>`;
}
function trainStat(k){
 if(!statNames.includes(k)||raceState?.running||trainingGame?.running)return;
 let p=s.pets[s.active];if(p.energy<2)return toast('Feed your pet before training!');
 trainingGame={skill:k,pet:s.active,running:true,finished:false,segments:0,earned:0,distance:0,obstacles:0,phase:0,lastObstacle:'',startedAt:performance.now(),elapsedMs:0,speedMultiplier:1,lane:50,boostUntil:0,jumpUntil:0,obstacle:null,nextObstacle:1600,successes:0};
 newTrainingSection(trainingGame);
 trainingGame.nextSection=makeCourseSection(trainingTerrain(k),trainingGame.biome);
 trainingGame.nextSection.length=Math.min(85,5+(trainingGame.segments+1)*2.3+Math.random()*5);
 showAutoTraining(true);
 clearInterval(autoTrainingTimer);
 autoTrainingTimer=setInterval(()=>{
 const g=trainingGame;if(!g?.running){clearInterval(autoTrainingTimer);return}
 const pet=s.pets[g.pet];g.frame=(g.frame||0)+1;if(g.speedMultiplier===1&&g.frame%2===0)return;g.phase++;
 g.elapsedMs+=420;
 const boost=g.elapsedMs<g.boostUntil?(g.boostPower||1):1;
 g.distance+=Math.max(.3,effectiveStat(g.pet,g.terrain)/140)*boost;
 g.lastObstacle='';
 if(g.terrain!=='speed'){
   if(!g.obstacle&&g.elapsedMs>=g.nextObstacle)g.obstacle={x:15+Math.random()*70,born:g.elapsedMs};
   if(g.obstacle&&g.elapsedMs-g.obstacle.born>=2100){
     const avoided=g.terrain==='swim'?Math.abs(g.lane-g.obstacle.x)>18:g.elapsedMs<=g.jumpUntil;
     if(avoided){g.successes++;g.lastObstacle='Nice dodge!';awardSkillXP(pet,g.terrain,2)}
     else{let damage=1+Math.floor(Math.random()*5);pet.energy=Math.max(0,pet.energy-damage);g.obstacles++;g.lastObstacle='Obstacle! −'+damage+' energy'}
     g.obstacle=null;g.nextObstacle=g.elapsedMs+900+Math.random()*1300;
   }
 }
 pet.energy=Math.max(0,pet.energy-(.025+.18/(1+effectiveStat(g.pet,'endure')/55)));
 if(g.distance>=g.sectionLength){
  g.segments++;let gain=5+Math.floor(Math.random()*5);
  awardCourseXP(pet,g.currentSection,gain,gain);g.earned+=gain;
  s.globalXP+=Math.round(gain*.35);pet.xp+=Math.round(gain*.35);
  const overflow=g.distance-g.sectionLength;
  g.currentSection=g.nextSection;g.obstacle=null;g.nextObstacle=g.elapsedMs+1200;
  g.biome=g.currentSection.name;g.terrain=g.currentSection.type;
  g.sectionLength=g.currentSection.length;g.decorations=g.currentSection.decorations;g.distance=Math.min(overflow,g.sectionLength);
  g.nextSection=makeCourseSection(trainingTerrain(g.skill),g.biome);
  g.nextSection.length=Math.min(85,5+(g.segments+1)*2.3+Math.random()*(4+g.segments*.35));
  save();advanceTrainingPanels(g);showAutoTraining(false);
 }else showAutoTraining(false);
 if(pet.energy<=0)finishAutoTraining();
 },210);
}
function advanceTrainingPanels(g){
 const course=document.querySelector('.training-course');
 const old=document.getElementById('training-current'),up=document.getElementById('training-upcoming');
 if(!course||!old||!up)return;
 old.remove();up.id='training-current';
 up.style.transition='none';up.style.transform='translateY(0%)';
 course.insertAdjacentHTML('afterbegin',trainingPanel(g.nextSection,'training-upcoming'));
 const next=document.getElementById('training-upcoming');
 next.style.transition='none';next.style.transform='translateY(-100%)';
 const divider=document.getElementById('training-divider');if(divider)divider.style.top='0%';
 // Allow layout to settle before resuming animated scrolling.
 void course.offsetHeight;
 up.style.transition='transform .21s linear';next.style.transition='transform .21s linear';
}
function showAutoTraining(rebuild=false){
 const g=trainingGame,host=document.getElementById('overlay');if(!g||!host)return;
 const p=s.pets[g.pet],progress=Math.min(1,g.distance/g.sectionLength);
 // Both terrains exist at the same time. The incoming terrain scrolls
 // down from above, separated by a clear boundary; no sudden color swap.
 if(rebuild||!document.getElementById('training-current')){
 host.innerHTML=`<div class="training-fullscreen" role="dialog" aria-modal="true"><div class="row"><h2>🏋️ ${skillLabels[g.skill]}</h2><div class="row"><button class="btn secondary small" data-action="train2x" id="training-speed">1× Speed</button><button class="btn secondary small" data-action="autofinish">Finish</button></div></div><div class="auto-course training-course">${trainingPanel(g.currentSection,'training-current')}${trainingPanel(g.nextSection,'training-upcoming')}<div class="training-divider" id="training-divider"></div><div class="auto-pet" id="interactive-pet">${animals[g.pet][1]}</div><span id="interactive-obstacle" class="interactive-obstacle" hidden>🪨</span></div><div id="training-controls"></div><div class="training-score">⏱️ <span id="training-clock">00:00</span></div><div class="training-details"><strong>⚡ <span id="training-energy">${Math.ceil(p.energy)}/100</span> · <span id="training-section-count">0 sections</span></strong><p id="training-info"></p><div class="track"><div id="training-progress" class="fill xp"></div></div><p id="training-obstacles"></p></div><button class="btn" data-action="autofinish">Finish training</button></div>`;
 }
 updateTrainingControls(g);
 const current=document.getElementById('training-current'),upcoming=document.getElementById('training-upcoming'),divider=document.getElementById('training-divider');
 // The entire current biome scrolls past. Next biome moves in at the
 // boundary, with a short neutral obstacle transition stripe.
 const travel=progress*100;
 if(current)current.style.transform=`translateY(${travel}%)`;
 if(upcoming)upcoming.style.transform=`translateY(${travel-100}%)`;
 if(divider)divider.style.top=`${travel}%`;
 const clock=document.getElementById('training-clock');if(clock){const secs=Math.floor(g.elapsedMs/1000);clock.textContent=String(Math.floor(secs/60)).padStart(2,'0')+':'+String(secs%60).padStart(2,'0')}
 const energy=document.getElementById('training-energy');if(energy)energy.textContent=`${Math.ceil(p.energy)}/100`;
 const sectionCount=document.getElementById('training-section-count');if(sectionCount)sectionCount.textContent=g.segments+' sections';const speedButton=document.getElementById('training-speed');if(speedButton)speedButton.textContent=g.speedMultiplier+'× Speed';const info=document.getElementById('training-info');if(info)info.textContent=`${g.biome} → ${g.nextSection.name} · ${g.segments} sections · +${g.earned} skill XP`;
 const bar=document.getElementById('training-progress');if(bar)bar.style.width=`${progress*100}%`;
 const obs=document.getElementById('training-obstacles');if(obs)obs.textContent=`${Math.floor(g.distance)} / ${Math.ceil(g.sectionLength)} distance · ${g.lastObstacle||'Running…'}`;
}
function timingPosition(g){return 100*Math.abs(((g.elapsedMs%2400)/1200)-1)}
function updateTrainingControls(g){
 const controls=document.getElementById('training-controls'),pet=document.getElementById('interactive-pet'),ob=document.getElementById('interactive-obstacle');
 if(!controls||!pet||!ob)return;
 if(controls.dataset.terrain!==g.terrain){
 controls.dataset.terrain=g.terrain;
 controls.innerHTML=g.terrain==='swim'?`<label>Slide to dodge obstacles<input id="swim-slider" type="range" min="8" max="92" value="${g.lane}" style="width:100%"></label>`:g.terrain==='climb'?`<button class="btn" data-action="trainingjump">⬆ Jump / climb</button><p class="hint">Jump just before the obstacle reaches you.</p>`:`<div class="boost-meter"><span id="boost-marker"></span></div><button class="btn" data-action="trainingboost">⚡ Boost</button><p class="hint">Red: small · Yellow: medium · Green: big boost</p>`;
 const slider=document.getElementById('swim-slider');if(slider)slider.addEventListener('input',()=>{g.lane=Number(slider.value);pet.style.left=g.lane+'%'});
 }
 pet.style.left=(g.terrain==='swim'?g.lane:50)+'%';
 pet.style.bottom=g.terrain==='climb'&&g.elapsedMs<g.jumpUntil?'32%':'16%';
 ob.hidden=!g.obstacle;
 if(g.obstacle){ob.style.left=(g.terrain==='climb'?50:g.obstacle.x)+'%';ob.style.top=(8+Math.min(1,(g.elapsedMs-g.obstacle.born)/2100)*68)+'%';ob.textContent=g.terrain==='swim'?'🪨':'🪵'}
 const marker=document.getElementById('boost-marker');if(marker)marker.style.left=timingPosition(g)+'%';
}
function trainingBoost(){let g=trainingGame;if(!g?.running||g.terrain!=='speed'||g.elapsedMs<g.boostUntil)return;let d=Math.abs(timingPosition(g)-50);g.boostPower=d<=10?2:d<=28?1.5:1.15;g.boostUntil=g.elapsedMs+1600;g.successes++;awardSkillXP(s.pets[g.pet],'speed',d<=10?3:d<=28?2:1)}
function trainingJump(){let g=trainingGame;if(g?.running&&g.terrain==='climb'&&g.elapsedMs>=g.jumpUntil+300)g.jumpUntil=g.elapsedMs+850}
function finishAutoTraining(){let g=trainingGame;if(!g)return;clearInterval(autoTrainingTimer);g.running=false;g.finished=true;save();document.getElementById('overlay').innerHTML=`<div class="training-fullscreen"><h2>🏅 Training finished</h2><p>⏱️ ${Math.floor(g.elapsedMs/60000)}m ${Math.floor(g.elapsedMs/1000)%60}s · Cleared ${g.segments} sections · +${g.earned} ${skillLabels[g.skill]} XP</p><p>⚡ ${Math.ceil(s.pets[g.pet].energy)} energy left</p><div class="modalactions"><button class="btn secondary" data-action="autoclose">Finish</button><button class="btn" data-action="autoagain" ${s.pets[g.pet].energy<2?'disabled':''}>Continue</button></div></div>`}
function showTraining(){let g=trainingGame,host=document.getElementById('overlay');if(!g||!host)return;let names={speed:'🏃 Speed · Catch the target',swim:'🏊 Swim · Dodge the waves',climb:'🧗 Climb · Grab the handhold',endure:'⚡ Endure · Hold your pace',recover:'💨 Recover · Time your breath'};let instructions={speed:'Tap when the moving marker reaches the green target.',swim:'Dodge alternating waves: aim for the left lane, then right lane.',climb:'Grab handholds in order: left, middle, right.',endure:'Keep a steady pace: aim for the middle of the slower-moving meter.',recover:'Hit the tiny center window on the fast-moving recovery meter.'};host.innerHTML=`<div class="training-fullscreen" role="dialog" aria-modal="true" aria-label="Training minigame"><h2>${names[g.skill]}</h2><p class="hint">${instructions[g.skill]} Eight tries, 22 seconds. Better accuracy earns more training XP.</p><div style="position:relative;height:76px;border-radius:18px;background:var(--bg);border:2px solid var(--line);margin:25px 0;overflow:hidden"><div style="position:absolute;left:${g.skill==='swim'?(g.attempts%2?22:62):g.skill==='climb'?[17,42,67][g.attempts%3]:g.skill==='recover'?46:42}%;width:${g.skill==='recover'?8:16}%;top:0;bottom:0;background:#65c99177;border-left:2px solid #3b9d68;border-right:2px solid #3b9d68"></div><div id="training-marker" style="position:absolute;left:${g.position}%;top:5px;bottom:5px;width:9px;border-radius:8px;background:var(--accent);transform:translateX(-50%);box-shadow:0 0 10px #0003"></div></div><p id="training-counter" style="text-align:center;font-weight:800">${g.attempts}/8 attempts · ${g.score} points</p><div class="modalactions"><button class="btn secondary" data-action="trainingfinish">Finish early</button><button class="btn" data-action="trainingtap">${g.skill==='swim'?'Dodge!':g.skill==='climb'?'Grab!':g.skill==='recover'?'Recover!':g.skill==='endure'?'Hold pace!':'Tap!'}</button></div></div>`}
function trainingTap(){let g=trainingGame;if(!g||g.finished)return;let target=g.skill==='speed'?50:g.skill==='swim'?(g.attempts%2?30:70):g.skill==='climb'?[25,50,75][g.attempts%3]:g.skill==='endure'?50:50;let distance=Math.abs(g.position-target);g.score+=distance<(g.skill==='recover'?5:8)?3:distance<17?2:distance<28?1:0;g.attempts++;g.phase+=1.7;if(g.attempts>=8)finishTraining();else showTraining()}
function finishTraining(){let g=trainingGame;if(!g||g.finished)return;g.finished=true;clearInterval(trainingTimer);let earned=Math.max(1,Math.min(5,Math.ceil(g.score/5))),p=s.pets[g.pet],k=g.skill;p.trainingXP[k]=(p.trainingXP[k]||0)+earned;let gains=0,cap=level(p.xp)*10;while(p.training[k]<cap&&p.trainingXP[k]>=trainingNeed(p.training[k])){p.trainingXP[k]-=trainingNeed(p.training[k]);p.training[k]++;gains++}save();let host=document.getElementById('overlay');host.innerHTML=`<div class="training-fullscreen" role="dialog" aria-modal="true"><h2>🎉 Training complete!</h2><p>You earned <strong>${earned} training XP</strong> for ${esc(k)}.</p><p>${gains?`🌟 +${gains} stat point!`:`${p.trainingXP[k]}/${trainingNeed(p.training[k])} XP toward your next point.`}</p><button class="btn secondary" data-action="trainingclose">Finish</button><button class="btn" data-action="trainingagain">Continue training</button></div>`}
function trainingMenu(){let p=s.pets[s.active];let host=document.getElementById('overlay');host.innerHTML=`<div class="training-fullscreen" role="dialog" aria-modal="true"><div class="row"><h2>🏋️ Choose a skill</h2><button class="btn secondary" data-action="trainingmenuclose">✕ Close</button></div><p class="hint">Training has no entry energy cost. Energy drains slowly as your pet runs; obstacles may drain an additional 1–5 energy.</p>${petSkillSheet(p)}<div class="training-menu">${statNames.map(k=>`<button class="btn secondary" data-action="train" data-stat="${k}" ${p.energy<2||p.skillLevels?.[k]>=skillCap()?'disabled':''}>${skillLabels[k]} <span class="tiny">· Auto train</span></button>`).join('')}</div></div>`}