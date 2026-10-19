import { createPlanet } from './planet.js';
import defaultBouquet from './assets/rose-bouquet.png?inline';
import './style.css';
import './studio.css';
import './experience.css';
import './romance.css';
import './journey.css';
import { renderEditor } from './editor.js';

const defaults={title:'Em là cả một tinh hà',subtitle:'Giữa hàng triệu vì sao, anh vẫn chọn em.',recipient:'Gửi em, người anh thương',letter:'Có những điều anh không giỏi nói thành lời, nên anh gửi chúng vào những vì sao.\n\nCảm ơn em đã đến, đã làm những ngày bình thường trở nên thật đặc biệt. Mong em luôn được yêu thương, luôn mỉm cười và luôn là chính mình.\n\nChúc em một ngày 20/10 thật dịu dàng. Cả tinh hà này, dành riêng cho em.',sender:'Thương em, thật nhiều ♡',font:'Cormorant Garamond',color:'#e9a7c5',speed:0.35,density:6500,twinkle:true,music:'',photos:Array(10).fill('')};
Object.assign(defaults,{coverLabel:'MỘT MÓN QUÀ NHỎ · DÀNH RIÊNG CHO EM',coverTitle:'Có một vũ trụ đang chờ em.',bouquetTitle:'Một bó yêu thương',bouquetNote:'Vì em xứng đáng với những điều dịu dàng nhất.',bouquetImage:'',captions:Array(10).fill(''),wishes:['Chúc em luôn mỉm cười','Cảm ơn em đã đến bên anh','Em là vì sao đặc biệt nhất'],galaxyEnabled:true,letterEnabled:true,showWishes:true,shootingStars:true,autoRotate:true,textColor:'#fff0f5',textScale:100,volume:.6,musicName:'',planetText:'You & me',planetColor:'#ff2145',orbitGlow:true,butterflies:true,photoBouquet:true});
Object.assign(defaults,{occasionLabel:'20 · 10',touchText:'Chạm vào bó hoa',nextText:'Chạm thêm lần nữa để vào ngân hà',titleScale:100,heartScale:100,wishScale:100,letterScale:100,letterImage:''});
const fontMap={'Cormorant Garamond':"'Cormorant Garamond',serif",'Playfair Display':"'Playfair Display',serif",Nunito:'Nunito,sans-serif'};
const embedded=document.querySelector('#gift-data');
let db;
async function database(){if(db)return db;db=await new Promise((resolve,reject)=>{const r=indexedDB.open('tinh-ha-gift',1);r.onupgradeneeded=()=>r.result.createObjectStore('settings');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});return db}
async function load(){if(embedded)return JSON.parse(embedded.textContent);const d=await database();return new Promise((resolve,reject)=>{const r=d.transaction('settings').objectStore('settings').get('gift');r.onsuccess=()=>resolve(r.result||{});r.onerror=()=>reject(r.error)})}
async function save(data){const d=await database();return new Promise((resolve,reject)=>{const t=d.transaction('settings','readwrite');t.objectStore('settings').put(data,'gift');t.oncomplete=resolve;t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error)})}
let config={...defaults};
async function init(){
try{config={...defaults,...await load()}}catch(e){console.error('Không thể đọc bản lưu',e)}
if(config.planetColor==='#ed719d')config.planetColor='#ff2145';
config.photos=Array.from({length:10},(_,i)=>config.photos?.[i]||'');
config.captions=Array.from({length:10},(_,i)=>config.captions?.[i]||'');
config.wishes=Array.isArray(config.wishes)?config.wishes.slice(0,20):defaults.wishes;
document.documentElement.style.setProperty('--gift-text',config.textColor);
document.documentElement.style.setProperty('--text-scale',config.textScale/100);
document.documentElement.style.setProperty('--gift-font',fontMap[config.font]||fontMap[defaults.font]);
document.documentElement.style.setProperty('--accent',config.color);
for(const key of ['titleScale','heartScale','wishScale','letterScale'])document.documentElement.style.setProperty('--'+key,config[key]/100);
}
const app=document.querySelector('#app');
const $=id=>document.getElementById(id);
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isConfig=location.pathname.endsWith('config.html');
const preview=new URLSearchParams(location.search).has('preview');
init().then(()=>{if(isConfig)renderEditor({config,save,placeholder,readPhoto,readFile});else renderGift()});

function flowerSVG(){let stems='',flowers='';const points=[[-80,115],[-40,74],[0,58],[45,82],[85,122],[-54,143],[0,120],[48,151],[-20,177],[23,192]];for(const [x,y]of points){stems+=`<path d="M185 340 Q${185+x/3} 230 ${185+x} ${y}" stroke="#527660" stroke-width="4" fill="none"/><ellipse cx="${185+x/2}" cy="${y+85}" rx="12" ry="30" fill="#7c9876" transform="rotate(${x>0?35:-35} ${185+x/2} ${y+85})"/>`;flowers+=`<g transform="translate(${185+x} ${y})">${Array.from({length:7},(_,i)=>`<ellipse cx="0" cy="-14" rx="18" ry="23" fill="${['#e5a4b5','#f1bec9','#d888a3'][i%3]}" transform="rotate(${i*51.4})"/>`).join('')}<circle r="16" fill="#f8ccd3"/><path d="M-8 5 Q-18 -12 2 -11 Q16 -4 3 7 Q-5 10 -4 0" fill="none" stroke="#c77a95" stroke-width="3"/></g>`}return `<svg viewBox="0 0 370 420" role="img" aria-label="Bó hoa hồng màu hồng, giấy gói kem và nơ lụa"><path d="M65 177 L185 394 L310 172 L222 208 L166 183 L115 214Z" fill="#d4b7ba"/><path d="M78 192 L185 394 L285 199 L203 230 L150 211Z" fill="#f1e5d8"/>${stems}${flowers}<path d="M100 244 L185 394 L265 244 L190 279Z" fill="#f4eadd" opacity=".95"/><path d="M173 320 Q103 273 120 320 Q127 345 180 328 M190 320 Q256 275 244 319 Q235 346 184 328" fill="#bd6d8e" stroke="#a75c7b" stroke-width="2"/><circle cx="183" cy="323" r="10" fill="#d38ba5"/><path d="M178 328 L151 383 L175 371 L184 337 L202 381 L217 388 L192 327" fill="#bd6d8e"/></svg>`}

function renderGift(){app.innerHTML=`<canvas id="galaxy" aria-label="Tinh hà 3D với 10 ảnh kỷ niệm"></canvas><header class="gift-header"><span class="occasion">20 <i>·</i> 10</span></header><main class="heading"><h1 id="gift-title"></h1><p id="gift-subtitle"></p></main><div class="quiet-controls"><button class="icon-button" id="sound" aria-label="Bật nhạc">♫</button><button class="icon-button" id="motion" aria-label="Dừng chuyển động">Ⅱ</button><button class="keyboard-gallery" id="gallery">Xem ảnh kỷ niệm</button></div><button id="open-letter" class="letter-comet" aria-label="Mở lá thư" title="Lá thư dành cho em"><span class="comet-tail" aria-hidden="true"></span><svg viewBox="0 0 70 54" aria-hidden="true"><path d="M6 8 Q35 1 64 8 L62 46 Q35 52 8 46Z" fill="#fbe5ee" stroke="#f5bbd2"/><path d="M7 9 L35 30 L63 9 M8 45 L27 27 M62 45 L43 27" fill="none" stroke="#bc7595" stroke-width="1.2"/><path d="M35 26 C27 18 23 29 35 35 C47 29 43 18 35 26" fill="#bc688d"/></svg><span class="comet-spark" aria-hidden="true">✧</span></button><footer class="bottom" hidden><div class="hint"></div><span class="micro"></span><button id="open-flowers" hidden></button></footer><section class="cover" ${preview&&['galaxy','letter'].includes(new URLSearchParams(location.search).get('stage'))?'hidden':''}><div><div class="micro">MỘT MÓN QUÀ NHỎ · 20 / 10</div><span class="seal">♡</span><h2>Có một vũ trụ<br>đang chờ em.</h2><p>Mười khoảnh khắc. Một lá thư.<br>Và những điều anh muốn dành cho em.</p><button class="pill primary" id="enter">Chạm để mở món quà &nbsp; ↗</button></div></section><dialog id="letter-dialog"><button class="close" aria-label="Đóng lá thư">×</button><article class="letter"><h2 id="recipient"></h2><p id="letter-text"></p><p class="signature" id="sender"></p></article></dialog><dialog id="flower-dialog"><button class="close" aria-label="Đóng bó hoa">×</button><div class="bouquet">${flowerSVG()}<h2>Một bó yêu thương</h2><p>Vì em xứng đáng với những điều dịu dàng nhất.</p></div></dialog><dialog id="photo-dialog" class="photo-dialog"><button class="close" aria-label="Đóng ảnh">×</button><img id="large-photo" alt="Ảnh kỷ niệm"><p id="photo-caption"></p></dialog><span id="audio-status" role="status" style="position:fixed;top:80px;right:22px;font-size:12px;z-index:12"></span>`;
for(const [id,key]of [['gift-title','title'],['gift-subtitle','subtitle'],['recipient','recipient'],['letter-text','letter'],['sender','sender']])$(id).textContent=config[key];
$('open-letter').onclick=()=>$('letter-dialog').showModal();$('open-flowers').onclick=()=>$('flower-dialog').showModal();document.querySelectorAll('dialog').forEach(d=>{d.querySelector('.close').onclick=()=>d.close();d.onclick=e=>{if(e.target===d)d.close()}});
const audio=new Audio(config.music||undefined);audio.loop=true;audio.volume=config.volume;
async function play(){if(!config.music){$('audio-status').textContent='Chưa chọn nhạc nền';return}try{await audio.play();$('sound').textContent='Ⅱ';$('sound').setAttribute('aria-label','Tắt nhạc');$('audio-status').textContent=''}catch{$('audio-status').textContent='Không phát được nhạc. Hãy chọn lại tệp âm thanh.'}}
$('sound').onclick=()=>{if(audio.paused)play();else{audio.pause();$('sound').textContent='♫';$('sound').setAttribute('aria-label','Bật nhạc')}};
document.querySelector('.occasion').textContent=config.occasionLabel;
setupGiftStages(play);
const gallery=document.createElement("dialog");gallery.className="gallery-dialog";gallery.innerHTML=`<button class="close" aria-label="Đóng album">×</button><h2>Mười kỷ niệm</h2><div class="album">${config.photos.map((p,i)=>`<button data-photo="${i}" aria-label="Xem ảnh ${i+1}"><img src="${p||placeholder(i)}" alt="Kỷ niệm ${i+1}" width="180" height="228"></button>`).join("")}</div>`;app.append(gallery);gallery.querySelector(".close").onclick=()=>gallery.close();$("gallery").onclick=()=>gallery.showModal();gallery.querySelectorAll("[data-photo]").forEach(b=>b.onclick=()=>{const i=Number(b.dataset.photo);$("large-photo").src=config.photos[i]||placeholder(i);$("photo-caption").textContent=config.captions[i]||'';$("photo-dialog").showModal()});if(config.galaxyEnabled)createPlanet(config,placeholder);else {$("galaxy").hidden=true;$("motion").hidden=true;$("gallery").hidden=true;document.querySelector(".hint").hidden=true;} }

function placeholder(i){
  const c=document.createElement('canvas');c.width=360;c.height=460;const x=c.getContext('2d');
  const palettes=[['#101525','#9d7c99'],['#291d35','#c8919c'],['#0b2832','#86a2a6'],['#33253c','#e6a397'],['#142c38','#a6b7bb']];
  const palette=palettes[i%5],g=x.createLinearGradient(0,0,0,460);g.addColorStop(0,palette[0]);g.addColorStop(1,palette[1]);x.fillStyle=g;x.fillRect(0,0,360,460);
  const moonX=110+(i%3)*60,moonY=105+(i%2)*40;const halo=x.createRadialGradient(moonX,moonY,0,moonX,moonY,100);halo.addColorStop(0,'#ffe7d452');halo.addColorStop(1,'#ffe7d400');x.fillStyle=halo;x.fillRect(0,0,360,300);x.fillStyle='#ffe8db';x.beginPath();x.arc(moonX,moonY,18+i%4*3,0,Math.PI*2);x.fill();
  for(let k=0;k<3;k++){x.fillStyle=['#231f3e70','#181e32a0','#101a27'][k];x.beginPath();x.moveTo(0,330+k*35);for(let j=0;j<=12;j++)x.lineTo(j*30,300+k*38+Math.sin(j*.7+i+k*3)*35);x.lineTo(360,460);x.lineTo(0,460);x.fill();}
  x.fillStyle='#fffbf0';for(let j=0;j<70;j++){const px=(Math.sin(j*44+i)*.5+.5)*360,py=(Math.cos(j*9+i)*.5+.5)*280;x.globalAlpha=.3+(j%5)*.14;x.beginPath();x.arc(px,py,j%9===0?1.2:.5,0,Math.PI*2);x.fill();}x.globalAlpha=1;
  return c.toDataURL('image/jpeg',.88);
}
function setupGiftStages(play) {
  const cover=document.querySelector('.cover');
  const bouquetSource=config.bouquetImage||defaultBouquet;
  cover.classList.add('flower-cover');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const syncStage=()=>{document.body.classList.toggle('gift-open',cover.hidden);document.querySelector('.quiet-controls').inert=!cover.hidden;$('open-letter').inert=!cover.hidden;};
  const sparks=Array.from({length:230},(_,i)=>`<i style="--x:${(i*37.43)%100}%;--y:${(i*19.87)%100}%;--s:${i%11===0?5:i%4===0?3:1}px;--d:${1.8+(i%9)*.43}s;--delay:-${i%9}s"></i>`).join('');
  const ambient=document.createElement('div');ambient.className='gold-sparks ambient-stars';ambient.setAttribute('aria-hidden','true');ambient.innerHTML=sparks;app.prepend(ambient);
  const butterflies=config.butterflies?Array.from({length:4},(_,i)=>`<span class="butterfly" style="--x:${18+i*21}%;--y:${33+(i%2)*25}%;--delay:-${i*1.7}s" aria-hidden="true"></span>`).join(''):'';
  const photoPositions=[[17,17,-9],[38,10,0],[59,19,8],[15,35,-12],[38,36,0],[61,36,12]];
  const photoCollage=config.photoBouquet?config.photos.slice(0,6).map((p,i)=>p||placeholder(i)).map((p,i)=>`<img src="${p}" alt="" style="--x:${photoPositions[i][0]}%;--y:${photoPositions[i][1]}%;--r:${photoPositions[i][2]}deg;--fly-x:${(i%3-1)*190}px;--fly-y:${i<3?-220:140}px;--photo-delay:${i*.1}s">`).join(''):'';
  cover.innerHTML=`<div class="gold-sparks" aria-hidden="true">${sparks}</div><div class="flower-intro"><div class="micro" id="cover-label"></div><h2 id="cover-title"></h2><button id="enter" class="bouquet-enter" aria-label="Chạm vào bó hoa để hiện ảnh">${bouquetSource?`<img class="bouquet-art" src="${bouquetSource}" alt="Bó hoa dành cho em">`:flowerSVG().replace('<svg ','<svg class="bouquet-art" ')}<span class="bouquet-photos">${photoCollage}</span><img class="bouquet-wrap" src="${bouquetSource}" alt="" aria-hidden="true">${butterflies}</button><p id="bouquet-greeting"></p><span class="bouquet-touch">Chạm vào bó hoa</span></div>`;
  cover.querySelector('.bouquet-touch').textContent=config.touchText;
  $('cover-label').textContent=config.coverLabel;
  $('cover-title').textContent=config.coverTitle;
  $('bouquet-greeting').textContent=config.bouquetTitle;
  const flower=document.querySelector('#flower-dialog .bouquet');
  flower.querySelector('h2').textContent=config.bouquetTitle;
  flower.querySelector('p').textContent=config.bouquetNote;
  if(bouquetSource){const image=new Image();image.src=bouquetSource;image.alt='Bó hoa dành cho em';flower.querySelector('svg').replaceWith(image);}
  const envelope=document.createElement('dialog');envelope.className='envelope-dialog letter-journey';envelope.innerHTML='<button class="close" aria-label="Đóng phong bì">×</button><div class="envelope-scene"><button class="envelope" aria-label="Mở phong bì"><span class="envelope-paper" aria-hidden="true">♡</span><span class="envelope-flap"></span><span class="envelope-seal">♡</span><span class="envelope-label"></span></button></div>';app.append(envelope);
  envelope.querySelector('.envelope-label').textContent=config.recipient;
  let envelopeTimer,enterTimer;
  const resetEnvelope=()=>{clearTimeout(envelopeTimer);envelope.classList.remove('envelope-opening','letter-unfolded');envelope.querySelector('.envelope').disabled=false;envelope.querySelector('.letter').hidden=true;};
  envelope.querySelector('.close').onclick=()=>envelope.close();envelope.addEventListener('close',resetEnvelope);
  const openEnvelope=()=>{resetEnvelope();envelope.querySelector('.close').setAttribute('aria-label','Đóng phong bì');envelope.showModal();};
  $('open-letter').onclick=openEnvelope;
  const paper=$('letter-dialog').querySelector('.letter');paper.hidden=true;envelope.append(paper);$('letter-dialog').remove();
  const portrait=config.letterImage||config.photos.find(Boolean);if(portrait){const img=new Image();img.className='letter-portrait';img.src=portrait;img.alt='Một kỷ niệm của chúng mình';$('letter-text').before(img);}
  envelope.querySelector('.envelope').onclick=()=>{envelope.classList.add('envelope-opening');envelope.querySelector('.envelope').disabled=true;envelopeTimer=setTimeout(()=>{paper.hidden=false;envelope.classList.add('letter-unfolded');envelope.querySelector('.close').setAttribute('aria-label','Đóng lá thư');envelope.querySelector('.close').focus({preventScroll:true});},reduced?0:750);};
  let bloomReadyAt=0;
  const enter=()=>{
    if(cover.classList.contains('leaving'))return;
    if(!cover.classList.contains('photos-revealed')&&config.photoBouquet){
      if(config.music)play();
      cover.classList.add('photos-revealed');
      bloomReadyAt=performance.now()+(reduced?0:1900);
      $('enter').setAttribute('aria-label','Chạm bó hoa để bước vào ngân hà');
      cover.querySelector('.bouquet-touch').textContent=config.nextText;
      return;
    }
    if(performance.now()<bloomReadyAt)return;
    if(config.music)play();cover.classList.add('leaving');
    enterTimer=setTimeout(()=>{cover.hidden=true;syncStage();cover.classList.remove('leaving');if(!config.galaxyEnabled&&config.letterEnabled)openEnvelope();},reduced?0:1250);
  };
  $('open-flowers').onclick=()=>{clearTimeout(enterTimer);cover.classList.remove('leaving','photos-revealed');bloomReadyAt=0;cover.querySelector('.bouquet-touch').textContent=config.touchText;$('enter').setAttribute('aria-label','Chạm vào bó hoa để hiện ảnh');cover.hidden=false;syncStage();};
  $('enter').onclick=enter;
  $('open-letter').hidden=!config.letterEnabled;
  const stage=new URLSearchParams(location.search).get('stage');
  if(preview&&stage==='flower')cover.hidden=false;
  if(preview&&stage==='letter'){
    if(config.letterEnabled)openEnvelope();
    else {const note=document.createElement('p');note.className='disabled-stage';note.textContent='Lá thư đang tắt. Bật Lá thư trong phần chỉnh sửa để xem.';app.append(note);}
  }
  if(!config.galaxyEnabled){$('gift-title').textContent=config.bouquetTitle;$('gift-subtitle').textContent=config.bouquetNote;document.querySelector('.bottom>.micro').textContent='MỘT MÓN QUÀ DÀNH RIÊNG CHO EM';}
  if(config.shootingStars){const stars=document.createElement('div');stars.className='shooting-stars';stars.setAttribute('aria-hidden','true');stars.innerHTML='<i></i><i></i>';app.prepend(stars);}
  syncStage();
  if(config.planetText){const inscription=document.createElement('span');inscription.className='heart-inscription';inscription.textContent=config.planetText;app.append(inscription);}
  const wishes=config.wishes.filter(w=>w.trim());
  if(config.showWishes&&config.galaxyEnabled&&wishes.length){
    const line=document.createElement('p');line.className='galaxy-wish';line.textContent=wishes[0];document.querySelector('.heading').append(line);let index=0;
    if(!matchMedia('(prefers-reduced-motion: reduce)').matches)setInterval(()=>{if(document.hidden||document.body.classList.contains('motion-paused')||!cover.hidden)return;line.animate([{opacity:1},{opacity:0},{opacity:1}],{duration:1200});setTimeout(()=>{index=(index+1)%wishes.length;line.textContent=wishes[index];},600);},5000);
  }
}

function readFile(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(new Error('Không đọc được tệp.'));r.readAsDataURL(file)})}
async function readPhoto(file){if(!file.type.startsWith('image/')||file.size>20*1024*1024)throw new Error('Vui lòng chọn ảnh nhỏ hơn 20 MB.');const src=await readFile(file);return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{const c=document.createElement('canvas');c.width=720;c.height=912;const x=c.getContext('2d');const s=Math.max(c.width/img.width,c.height/img.height);x.drawImage(img,(c.width-img.width*s)/2,(c.height-img.height*s)/2,img.width*s,img.height*s);resolve(c.toDataURL('image/jpeg',.88))};img.onerror=()=>reject(new Error('Ảnh không đọc được. Hãy dùng JPG, PNG hoặc WebP.'));img.src=src})}
