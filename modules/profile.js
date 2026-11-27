function usernameForm(){return `<form id="username-form"><label class="field">Username<input name="username" required maxlength="40" autocomplete="nickname" value="${attr(s.profile.username||'')}"></label><p class="hint">Saved on this device with your progress. No online account yet.</p><button class="btn" type="submit">Save username</button></form>`}
function usernamePrompt(){return s.profile.username?'':`<section class="panel"><h2>Choose your username</h2>${usernameForm()}</section>`}

function profilePortrait(){let i=s.profile.favoritePet;if(i==null||!unlocked(i))return '👤';let p=s.pets[i],bg=petBackgrounds.find(x=>x[0]===s.profile.favoriteBackground);return `<span class="profile-portrait" style="background:${bg?.[1]||'var(--card)'}"><span>${animals[i][1]}</span>${accessoryOnPet(p,'portrait-gear')}</span>`}
function profileBackgroundChoices(){return [...new Set(['Default',...s.pets.flatMap(p=>p.backgrounds||[])])].filter(n=>petBackgrounds.some(b=>b[0]===n))}
