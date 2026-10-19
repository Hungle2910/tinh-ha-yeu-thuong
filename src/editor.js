const fonts = ['Cormorant Garamond', 'Playfair Display', 'Nunito'];
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const $ = id => document.getElementById(id);

export function renderEditor({ config, save, placeholder, readPhoto, readFile }) {
  let stage = 'flower';
  let revision = 0;
  let savedRevision = 0;
  let saveQueue = Promise.resolve();
  let debounce;
  let pendingFiles = 0;
  let musicPreview;
  const field = (id, label, max = 180) => `<label for="${id}">${label}</label><input id="${id}" name="${id}" maxlength="${max}" value="${esc(config[id])}" autocomplete="off">`;
  const sizeField=(id,label)=>`<label for="${id}">${label}<output id="${id}-value">${config[id]}%</output></label><input id="${id}" type="range" min="70" max="150" step="5" value="${config[id]}">`;
  const toggle = (id, label) => `<label class="switch"><input id="${id}" type="checkbox" ${config[id] ? 'checked' : ''}><span aria-hidden="true"></span><b>${label}</b></label>`;
  const heading = (symbol, title, control = '') => `<div class="section-title"><h2><span class="section-icon" aria-hidden="true">${symbol}</span>${title}</h2>${control}</div>`;
  document.body.classList.add('studio');
  $('app').innerHTML = `<header class="studio-header"><a class="brand" href="index.html">dear<span>♡</span> <small>GIFT STUDIO</small></a><a href="index.html" target="_blank" rel="noopener">Mở món quà <span aria-hidden="true">↗</span></a></header>
  <div class="studio-layout"><main><div class="editor-intro"><div class="micro">DÀNH RIÊNG CHO MỘT NGƯỜI</div><h1>Tạo bó hoa ảnh</h1><div id="save-state" role="status">● Bản lưu trên thiết bị này</div></div>
  <form id="settings" class="settings"><section>${heading('❀', 'Ảnh & bó hoa')}
  <label class="drop-zone" for="bouquet-file"><span class="upload-symbol" aria-hidden="true">↥</span><span class="upload-cta">＋ Chọn ảnh</span><small>PNG trong suốt, JPG hoặc WebP · Tối đa 20 MB</small><input id="bouquet-file" type="file" accept="image/png,image/jpeg,image/webp"></label><div class="asset-row"><span id="bouquet-name">${config.bouquetImage ? 'Đang dùng ảnh bó hoa của bạn' : 'Đang dùng bó hồng mặc định'}</span><button type="button" class="text-button" id="reset-bouquet">Dùng hoa mặc định</button></div>
<details class="extra-settings"><summary>Chỉnh lời nhắn trên bó hoa</summary>  ${field('touchText','Chữ trước khi chạm bó hoa',100)}${field('nextText','Chữ sau khi ảnh hiện lên',120)}<p class="field-note">6 ảnh đầu trong bộ ảnh bên dưới sẽ nở lên từ bó hoa.</p></details></section>
  <section>${heading('✧', 'Ngân hà 3D', toggle('galaxyEnabled','Bật ngân hà'))}
  <div class="label-between"><label>Lời nhắn giữa các vì sao</label><span id="wish-count"></span></div><div id="wishes"></div><button class="text-button" id="add-wish" type="button">＋ Thêm lời nhắn</button><small>Các câu lần lượt xuất hiện trong tinh hà, mỗi câu 5 giây.</small><div class="memory-upload">  <div class="label-between"><label for="batch">Ảnh ngân hà</label><span id="photo-count"></span></div><label class="drop-zone compact photo-batch-zone" for="batch"><strong>＋ Thêm ảnh ngân hà</strong><small>Chọn từ 1 đến 10 ảnh · JPG, PNG, WebP · 20 MB/ảnh</small><input id="batch" type="file" accept="image/*" multiple></label><small>Ảnh mới lấp các ô trống. Chọn 10 ảnh để thay cả bộ. Chú thích đi cùng ảnh khi đổi vị trí.</small><div class="upload-grid" id="photos"></div>
</div><details class="extra-settings"><summary>Tiêu đề & chữ trong ngân hà</summary>  ${field('planetText','Dòng nhắn ở trái tim',40)}${field('title','Tiêu đề tinh hà',100)}${field('occasionLabel','Ngày hoặc dòng chữ phía trên',40)}
</details></section>
  <section>${heading('✉','Lá thư',toggle('letterEnabled','Bật lá thư'))}${field('envelopeTitle','Chữ trên phong bì',100)}${field('envelopeCaption','Lời nhắn trên phong bì',120)}${field('recipient','Gửi đến',120)}<div class="label-between"><label for="letter">Những điều muốn nói</label><span id="letter-count"></span></div><textarea id="letter" name="letter" maxlength="5000" rows="10" placeholder="Viết lá thư của bạn…">${esc(config.letter)}</textarea><div class="suggestion-row"><label for="letter-idea">Gợi ý để bắt đầu</label><select id="letter-idea"><option value="">Chọn một đoạn để thêm vào thư…</option><option value="gentle">Một lời chúc dịu dàng</option><option value="memory">Nhắc về kỷ niệm</option><option value="promise">Một lời hẹn</option></select></div>${field('sender','Chữ ký',100)}<label class="drop-zone compact" for="letter-image"><strong>＋ Thêm ảnh vào thư</strong><small>JPG, PNG, WebP · Tối đa 20 MB</small><input id="letter-image" type="file" accept="image/*"></label><div class="asset-row"><span id="letter-image-state">${config.letterImage?'Đã chọn ảnh riêng':'Dùng ảnh đầu tiên trong bộ ảnh'}</span><button type="button" id="remove-letter-image" class="text-button">Dùng ảnh trong bộ</button></div></section>
  <section>${heading('♫','Nhạc nền')}<label class="drop-zone compact" for="music"><strong>＋ Thêm bài hát của hai người</strong><small>MP3, WAV hoặc OGG · Tối đa 15 MB</small><input id="music" type="file" accept="audio/*"></label><div class="asset-row"><span id="music-name">${esc(config.musicName || (config.music ? 'Đã lưu nhạc nền' : 'Chưa chọn nhạc'))}</span><div><button type="button" class="text-button" id="listen">Nghe thử</button><button type="button" class="text-button" id="remove-music">Xóa nhạc</button></div></div><label for="volume">Âm lượng <output id="volume-value">${Math.round(config.volume*100)}%</output></label><input id="volume" type="range" min="0" max="1" step="0.05" value="${config.volume}"><small>Nhạc chỉ phát sau khi người nhận chạm vào món quà.</small></section>
  <section>${heading('Aa','Kiểu chữ & màu sắc')}<div class="row"><div><label for="font">Kiểu chữ</label><select id="font">${fonts.map(f=>`<option ${config.font===f?'selected':''}>${f}</option>`).join('')}</select></div><div><label for="color">Màu tinh hà</label><input type="color" id="color" value="${esc(config.color)}"></div></div><label for="planetColor">Màu trái tim sao</label><input type="color" id="planetColor" value="${esc(config.planetColor)}"><div class="font-sample" id="font-sample">Em là cả một tinh hà ♡</div><div class="row"><div><label for="textColor">Màu chữ ngân hà</label><input type="color" id="textColor" value="${esc(config.textColor)}"></div><div><label for="textScale">Cỡ chữ <output id="scale-value">${config.textScale}%</output></label><input id="textScale" type="range" min="75" max="130" step="5" value="${config.textScale}"></div></div></section>
  <section>${heading('Tt','Cỡ chữ từng phần')}<div class="size-grid"><div>${sizeField('titleScale','Tiêu đề tinh hà')}</div><div>${sizeField('heartScale','Chữ ở trái tim')}</div><div>${sizeField('wishScale','Lời nhắn luân phiên')}</div><div>${sizeField('letterScale','Nội dung lá thư')}</div></div></section><section>${heading('✦','Hiệu ứng tinh hà')}<div class="effect-options">${toggle('twinkle','Sao lấp lánh')}${toggle('shootingStars','Sao băng')}${toggle('showWishes','Hiện lời nhắn')}${toggle('autoRotate','Tự động xoay')}${toggle('orbitGlow','Bụi sao quanh trái tim')}${toggle('butterflies','Bướm quanh bó hoa')}${toggle('photoBouquet','Ảnh trong bó hoa')}</div><label for="speed">Tốc độ xoay <output id="speed-value">${config.speed}×</output></label><input id="speed" type="range" min="0" max="1.5" step="0.05" value="${config.speed}"><label for="density">Mật độ sao</label><select id="density"><option value="3000">Dịu nhẹ · 3.000 sao</option><option value="6500">Lấp lánh · 6.500 sao</option><option value="10000">Rực rỡ · 10.000 sao</option></select></section>
  <div class="editor-actions"><button type="submit" class="save">Lưu & cập nhật xem trước</button><button type="button" id="export" class="secondary">↓ Tải món quà</button></div><div id="status" role="status"></div><small class="storage-note">Tự lưu trên trình duyệt này. Tệp tải xuống chứa cả ảnh và nhạc; có thể đưa lên hosting để chia sẻ bằng đường dẫn.</small></form></main>
  <aside class="preview-column"><div class="preview-label"><span>● &nbsp; Xem trước món quà</span><a href="index.html" target="_blank" rel="noopener" aria-label="Mở món quà trong cửa sổ mới">↗</a></div><div class="preview-tabs" role="tablist" aria-label="Màn xem trước"><button role="tab" type="button" data-stage="flower" aria-selected="true">Bó hoa</button><button role="tab" type="button" data-stage="galaxy" aria-selected="false">Ngân hà</button><button role="tab" type="button" data-stage="letter" aria-selected="false">Lá thư</button></div><div class="phone-frame"><iframe id="gift-preview" title="Xem trước món quà" src="index.html?preview&stage=flower" allow="autoplay"></iframe><div class="phone-home" aria-hidden="true"></div></div><label class="auto-preview"><input type="checkbox" id="auto-preview" checked> Tự cập nhật xem trước</label><div class="preview-footer"><span id="preview-state">Bản đã lưu</span><button type="button" class="text-button" id="refresh-preview">↻ Cập nhật</button></div></aside></div>`;
  $('density').value=config.density;
  const notify=(message,error=false)=>{ $('status').textContent=message; $('status').classList.toggle('error',error); };
  function collect(){
    for(const key of ['envelopeTitle','envelopeCaption','touchText','nextText','occasionLabel','title','recipient','letter','sender','font','color','textColor','planetText','planetColor']) config[key]=$(key).value;
    for(const key of ['volume','speed','density','textScale','titleScale','heartScale','wishScale','letterScale']) config[key]=Number($(key).value);
    for(const key of ['galaxyEnabled','letterEnabled','twinkle','shootingStars','showWishes','autoRotate','orbitGlow','butterflies','photoBouquet']) config[key]=$(key).checked;
  }
  function updateLabels(){
    $('letter-count').textContent=`${$('letter').value.length}/5000`;
    $('volume-value').textContent=`${Math.round(Number($('volume').value)*100)}%`;
    $('scale-value').textContent=`${$('textScale').value}%`;
    $('speed-value').textContent=`${$('speed').value}×`;
    $('font-sample').style.fontFamily=`"${$('font').value}",serif`;
    $('font-sample').textContent=$('title').value||'Một lời thương dành cho em';
    for(const key of ['titleScale','heartScale','wishScale','letterScale'])$(key+'-value').textContent=$(key).value+'%';
    if(musicPreview) musicPreview.volume=Number($('volume').value);
  }
  function persist(){
    collect();const snapshot=structuredClone(config), current=revision;
    saveQueue=saveQueue.catch(()=>{}).then(()=>save(snapshot)).then(()=>{
      savedRevision=current;
      if(current===revision) $('save-state').textContent='● Đã lưu trên máy';
    });
    return saveQueue;
  }
  function dirty(){
    revision++;$('save-state').textContent='● Đang lưu…';$('preview-state').textContent='Có thay đổi mới';updateLabels();clearTimeout(debounce);
    debounce=setTimeout(()=>persist().then(()=>{if($('auto-preview').checked&&!pendingFiles&&savedRevision===revision){$('gift-preview').src=`index.html?preview&stage=${stage}&t=${Date.now()}`;$('preview-state').textContent='Đã cập nhật';}}).catch(()=>{ $('save-state').textContent='● Chưa lưu được';notify('Không lưu được trên trình duyệt. Hãy tải món quà để giữ thay đổi.',true); }),1000);
  }
  async function refresh(){
    if(pendingFiles){notify('Đang xử lý tệp, vui lòng chờ một chút.');return;}
    clearTimeout(debounce);
    try{await persist();$('gift-preview').src=`index.html?preview&stage=${stage}&t=${Date.now()}`;$('preview-state').textContent='Đã cập nhật';notify('Đã lưu và cập nhật bản xem trước.');}
    catch{notify('Không thể cập nhật xem trước vì chưa lưu được. Bạn vẫn có thể tải món quà.',true);}
  }
  async function processFile(task){
    pendingFiles++;$('export').disabled=true;
    try{await task();dirty();notify('Đã xử lý tệp. Bấm Cập nhật để xem thay đổi.');}catch(error){notify(error.message||'Không đọc được tệp.',true);}
    finally{pendingFiles--;$('export').disabled=pendingFiles>0;}
  }
  function tiles(){
    $('photo-count').textContent=`${config.photos.filter(Boolean).length}/10 ảnh`;
    $('photos').innerHTML=config.photos.map((p,i)=>`<div class="photo-editor"><label class="upload-tile"><img src="${p||placeholder(i)}" width="180" height="228" alt="Ảnh ngân hà ${i+1}"><input type="file" accept="image/*" data-image="${i}" aria-label="Thay ảnh ${i+1}"><span>${String(i+1).padStart(2,'0')}</span></label><input class="caption-input" data-caption="${i}" aria-label="Chú thích ảnh ${i+1}" maxlength="120" placeholder="Một kỷ niệm…" value="${esc(config.captions[i])}"><div class="photo-tools"><button type="button" data-move="${i}" ${i===0?'disabled':''} aria-label="Đưa ảnh ${i+1} về trước">←</button><button type="button" data-remove="${i}" aria-label="Xóa ảnh ${i+1}" ${!p?'disabled':''}>×</button></div></div>`).join('');
    $('photos').querySelectorAll('[data-image]').forEach(input=>input.onchange=()=>{const f=input.files[0];if(f)processFile(async()=>{config.photos[+input.dataset.image]=await readPhoto(f);tiles();});});
    $('photos').querySelectorAll('[data-caption]').forEach(input=>input.oninput=()=>{config.captions[+input.dataset.caption]=input.value;});
    $('photos').querySelectorAll('[data-remove]').forEach(button=>button.onclick=()=>{config.photos[+button.dataset.remove]='';tiles();dirty();});
    $('photos').querySelectorAll('[data-move]').forEach(button=>button.onclick=()=>{const i=+button.dataset.move;if(i<1)return;for(const key of ['photos','captions']) [config[key][i-1],config[key][i]]=[config[key][i],config[key][i-1]];tiles();dirty();});
  }
  function wishes(focus=false){
    $('wish-count').textContent=`${config.wishes.length}/20 câu`;
    $('wishes').innerHTML=config.wishes.map((w,i)=>`<div class="wish-row"><span>${String(i+1).padStart(2,'0')}</span><input data-wish="${i}" aria-label="Lời nhắn ${i+1}" maxlength="80" value="${esc(w)}" placeholder="Viết một lời thương…"><small>${w.length}/80</small><button type="button" data-delete-wish="${i}" aria-label="Xóa lời nhắn ${i+1}">×</button></div>`).join('');
    $('add-wish').disabled=config.wishes.length>=20;
    $('wishes').querySelectorAll('[data-wish]').forEach(input=>input.oninput=()=>{config.wishes[+input.dataset.wish]=input.value;input.nextElementSibling.textContent=`${input.value.length}/80`;});
    $('wishes').querySelectorAll('button').forEach(button=>button.onclick=()=>{config.wishes.splice(+button.dataset.deleteWish,1);wishes();dirty();});
    if(focus)$('wishes').querySelector('.wish-row:last-child input')?.focus();
  }
  tiles();wishes();updateLabels();
  $('settings').addEventListener('input',e=>{if(e.target.type!=='file')dirty();});
  $('settings').onsubmit=e=>{e.preventDefault();refresh();};
  $('refresh-preview').onclick=refresh;
  document.querySelectorAll('[data-stage]').forEach(button=>{button.onclick=()=>{stage=button.dataset.stage;document.querySelectorAll('[data-stage]').forEach(b=>b.setAttribute('aria-selected',String(b===button)));refresh();};button.onkeydown=e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();const tabs=[...document.querySelectorAll('[data-stage]')],index=tabs.indexOf(button);tabs[(index+(e.key==='ArrowRight'?1:2))%3].focus();tabs[(index+(e.key==='ArrowRight'?1:2))%3].click();};});
  $('add-wish').onclick=()=>{if(config.wishes.length>=20)return;config.wishes.push('');wishes(true);dirty();};
  $('batch').onchange=()=>{const files=[...$('batch').files];if(!files.length)return;const empty=config.photos.flatMap((p,i)=>p?[]:[i]);if(files.length>10||(files.length!==10&&files.length>empty.length)){notify('Không đủ ô trống. Xóa bớt ảnh hoặc chọn đúng 10 ảnh để thay cả bộ.',true);return;}processFile(async()=>{const images=await Promise.all(files.map(readPhoto));if(images.length===10)config.photos=images;else images.forEach((p,i)=>config.photos[empty[i]]=p);tiles();$('batch').value='';});};
  $('bouquet-file').onchange=()=>{const file=$('bouquet-file').files[0];if(!file)return;processFile(async()=>{config.bouquetImage=await readBouquet(file);$('bouquet-name').textContent=file.name;});};
  $('letter-image').onchange=()=>{const file=$('letter-image').files[0];if(file)processFile(async()=>{config.letterImage=await readPhoto(file);$('letter-image-state').textContent=file.name;});};
  $('remove-letter-image').onclick=()=>{config.letterImage='';$('letter-image').value='';$('letter-image-state').textContent='Dùng ảnh đầu tiên trong bộ ảnh';dirty();};
  $('reset-bouquet').onclick=()=>{config.bouquetImage='';$('bouquet-file').value='';$('bouquet-name').textContent='Đang dùng bó hồng mặc định';dirty();};
  $('music').onchange=()=>{const file=$('music').files[0];if(!file)return;processFile(async()=>{if(!file.type.startsWith('audio/')||file.size>15*1024*1024)throw new Error('Chọn tệp âm thanh nhỏ hơn 15 MB.');const data=await readFile(file);musicPreview?.pause();musicPreview=null;config.music=data;config.musicName=file.name;$('music-name').textContent=file.name;$('listen').textContent='Nghe thử';});};
  $('listen').onclick=async()=>{if(!config.music){notify('Hãy thêm nhạc trước khi nghe thử.',true);return;}if(!musicPreview){musicPreview=new Audio(config.music);musicPreview.onended=()=>{$('listen').textContent='Nghe thử';};}musicPreview.volume=Number($('volume').value);if(!musicPreview.paused){musicPreview.pause();$('listen').textContent='Nghe thử';return;}try{await musicPreview.play();$('listen').textContent='Dừng nghe';}catch{notify('Trình duyệt không phát được tệp này. Hãy thử tệp MP3 khác.',true);}};
  $('remove-music').onclick=()=>{musicPreview?.pause();musicPreview=null;config.music='';config.musicName='';$('music').value='';$('music-name').textContent='Chưa chọn nhạc';$('listen').textContent='Nghe thử';dirty();};
  $('letter-idea').onchange=()=>{const ideas={gentle:'Mong những điều dịu dàng nhất luôn tìm đến em. Chúc em luôn mỉm cười, luôn được yêu thương và tự tin làm những điều mình thích.',memory:'Có những khoảnh khắc rất nhỏ, nhưng mỗi lần nhớ lại anh vẫn mỉm cười. Cảm ơn em vì đã cùng anh tạo nên những kỷ niệm ấy.',promise:'Hẹn em ở những chuyến đi tiếp theo, những buổi chiều bình yên và cả những ngày chẳng có gì đặc biệt — chỉ cần có nhau.'};const text=ideas[$('letter-idea').value];if(!text)return;const next=[$('letter').value,text].filter(Boolean).join('\n\n');if(next.length>5000){notify('Lá thư đã gần đủ 5.000 ký tự. Hãy rút gọn trước khi thêm gợi ý.',true);return;}$('letter').value=next;$('letter-idea').value='';dirty();};
  $('export').onclick=async()=>{if(pendingFiles)return;collect();$('export').disabled=true;notify('Đang đóng gói món quà…');try{const response=await fetch('gift-template.html');if(!response.ok)throw new Error();const template=await response.text();if(!template.includes('<!--GIFT_DATA-->'))throw new Error();const json=JSON.stringify(config).replace(/</g,'\\u003c');const html=template.replace('<!--GIFT_DATA-->',()=>`<script id="gift-data" type="application/json">${json}</script>`);const url=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='tinh-ha-danh-cho-em.html';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);notify('Đã tải món quà cùng ảnh, lời nhắn và nhạc.');}catch{notify('Không tải được gói website. Hãy thử lại khi máy chủ hoạt động.',true);}finally{$('export').disabled=false;}};
  window.addEventListener('beforeunload',e=>{if(revision!==savedRevision||pendingFiles){e.preventDefault();e.returnValue='';}});
  async function readBouquet(file){if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>20*1024*1024)throw new Error('Chọn ảnh PNG, JPG hoặc WebP nhỏ hơn 20 MB.');const src=await readFile(file);return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>{const ratio=Math.min(1,1200/Math.max(image.width,image.height));const canvas=document.createElement('canvas');canvas.width=Math.round(image.width*ratio);canvas.height=Math.round(image.height*ratio);canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL('image/png'));};image.onerror=()=>reject(new Error('Không đọc được ảnh bó hoa.'));image.src=src;});}
}
