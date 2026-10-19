import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function createPlanet(config, placeholder) {
  const canvas=document.getElementById('galaxy'),motion=document.getElementById('motion');
  let renderer;
  try {renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});} catch {canvas.hidden=true;motion.hidden=true;document.getElementById('gallery').classList.add('fallback-gallery');return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(44,1,.1,100);
  const controls=new OrbitControls(camera,canvas);
  controls.enablePan=false;controls.enableDamping=true;controls.dampingFactor=.075;controls.rotateSpeed=.55;controls.zoomSpeed=.6;
  controls.minPolarAngle=.45;controls.maxPolarAngle=2.25;controls.minAzimuthAngle=-1.05;controls.maxAzimuthAngle=1.05;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let paused=reduced,elapsed=0,last=0,mobile=false,activeHover=-1,reveal=0;
  const pointer=new THREE.Vector2(),target=new THREE.Vector2(),smooth=new THREE.Vector2();
  const setPaused=()=>{document.body.classList.toggle('motion-paused',paused);motion.textContent=paused?'▷':'Ⅱ';motion.setAttribute('aria-label',paused?'Tiếp tục chuyển động':'Dừng chuyển động');motion.setAttribute('aria-pressed',String(paused));};
  setPaused();motion.onclick=()=>{paused=!paused;setPaused();};
  const spriteCanvas=document.createElement('canvas');spriteCanvas.width=spriteCanvas.height=64;
  const ctx=spriteCanvas.getContext('2d'),gradient=ctx.createRadialGradient(32,32,0,32,32,32);
  gradient.addColorStop(0,'#fff');gradient.addColorStop(.08,'#fff');gradient.addColorStop(.28,'#ffffff80');gradient.addColorStop(1,'#ffffff00');ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);
  const glowMap=new THREE.CanvasTexture(spriteCanvas);
  function points(positions,color,size,opacity=1){const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));return new THREE.Points(geometry,new THREE.PointsMaterial({color,size,opacity,map:glowMap,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));}
  const heart=new THREE.Group();scene.add(heart);
  const positions=[],colors=[],count=Math.min(4200,Math.max(1800,Number(config.density)*.45));
  const pink=new THREE.Color(config.planetColor),ivory=new THREE.Color('#ff5769');
  for(let i=0;i<count;i++){
    let x,y,f;
    do{x=Math.random()*2.4-1.2;y=Math.random()*2.4-1.1;f=Math.pow(x*x+y*y-1,3)-x*x*y*y*y;}while(f>0);
    positions.push(x*1.55,(y-.08)*1.55,(Math.random()-.5)*1.25*Math.sqrt(Math.max(.05,1-Math.min(1,x*x*.5+y*y*.35))));
    const c=pink.clone().lerp(ivory,Math.random()*.16);colors.push(c.r*1.2,c.g*1.2,c.b*1.2);
  }
  const heartStars=points(positions,'#ffffff',.125,.95);heartStars.geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));heartStars.material.vertexColors=true;heart.add(heartStars);
  const heartSparkles=points(positions.filter((_,i)=>Math.floor(i/3)%29===0),config.planetColor,.18,.85);heart.add(heartSparkles);
  const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:glowMap,color:config.planetColor,opacity:.09,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));halo.scale.set(6,5,1);halo.position.z=-1;heart.add(halo);
  const starPositions=[];for(let i=0;i<1800;i++)starPositions.push((Math.random()-.5)*40,(Math.random()-.5)*34,-2-Math.random()*22);
  const starfield=points(starPositions,'#ffffff',.095,.9);scene.add(starfield);
  const brightPositions=[];for(let i=0;i<100;i++)brightPositions.push((Math.random()-.5)*30,(Math.random()-.5)*22,-2-Math.random()*12);
  const brightStars=points(brightPositions,'#ffffff',.22,.9);scene.add(brightStars);
  const dustPositions=[];
  for(let i=0;i<7000;i++){
    const radius=2.3+Math.pow(Math.random(),.7)*4.7;
    const arm=i%3,angle=arm*Math.PI*2/3+radius*.8+(Math.random()-.5)*.7;
    dustPositions.push(Math.cos(angle)*radius,(Math.random()-.5)*.2,Math.sin(angle)*radius);
  }
  const dust=points(dustPositions,'#fff3fa',.065,config.orbitGlow?.8:0);scene.add(dust);
  const letter=document.getElementById('open-letter');
  const svgNS='http://www.w3.org/2000/svg';
  const ribbon=document.createElementNS(svgNS,'svg');ribbon.classList.add('orbital-ribbon');ribbon.setAttribute('aria-hidden','true');
  const segments=Array.from({length:40},(_,i)=>{const path=document.createElementNS(svgNS,'path');path.setAttribute('fill','none');path.setAttribute('stroke','#ff6cb7');path.setAttribute('stroke-linecap','round');path.setAttribute('stroke-width',String(1+10*(1-i/40)));path.setAttribute('opacity',String(.9*Math.pow(1-i/40,1.3)));ribbon.append(path);return path;});
  canvas.after(ribbon);letter.classList.add('orbital-letter');
  const projected=new THREE.Vector3();let letterHover=false;
  letter.addEventListener('pointerenter',()=>{letterHover=true;});letter.addEventListener('pointerleave',()=>{letterHover=false;});
  let letterTime=0;
  function letterPoint(angle){const r=mobile?2.8:3.6;projected.set(Math.cos(angle)*r,.65+Math.sin(angle*2)*.6,Math.sin(angle)*r);projected.project(camera);return [(projected.x*.5+.5)*canvas.clientWidth,(-projected.y*.5+.5)*canvas.clientHeight];}
  // Reuse a fixed particle pool for pointer trails and click bursts.
  const trailCount=70,trailPositions=new Float32Array(trailCount*3),life=new Float32Array(trailCount);trailPositions.fill(1000);
  const trail=points(trailPositions,'#fff0fa',.12,.85);scene.add(trail);let trailIndex=0;
  const raycaster=new THREE.Raycaster(),plane=new THREE.Plane(new THREE.Vector3(0,0,1),0),worldPointer=new THREE.Vector3();
  const photoMeshes=[],cards=[],loader=new THREE.TextureLoader();
  for(let i=0;i<10;i++){
    const source=config.photos[i]||placeholder(i),texture=loader.load(source,undefined,undefined,()=>{const img=new Image();img.onload=()=>{texture.image=img;texture.needsUpdate=true;};img.src=placeholder(i);});texture.colorSpace=THREE.SRGBColorSpace;
    const card=new THREE.Group(),frame=new THREE.Mesh(new THREE.PlaneGeometry(1.08,1.4),new THREE.MeshBasicMaterial({color:'#e8cbd8',transparent:true,opacity:.8}));
    const photo=new THREE.Mesh(new THREE.PlaneGeometry(1.02,1.3),new THREE.MeshBasicMaterial({map:texture,transparent:true}));photo.position.set(0,.015,.009);photo.userData={index:i,source};card.add(frame,photo);scene.add(card);cards.push(card);photoMeshes.push(photo);
  }
  function locate(e){const rect=canvas.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);target.copy(pointer);raycaster.setFromCamera(pointer,camera);raycaster.ray.intersectPlane(plane,worldPointer);return raycaster.intersectObjects(photoMeshes)[0];}
  let down;
  canvas.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY,};canvas.setPointerCapture(e.pointerId);locate(e);});
  canvas.addEventListener('pointermove',e=>{const hit=locate(e);activeHover=hit?hit.object.userData.index:-1;canvas.style.cursor=down?'grabbing':hit?'pointer':'grab';if(!paused&&!reduced){for(let j=0;j<2;j++){const index=trailIndex++%trailCount;trailPositions[index*3]=worldPointer.x+(Math.random()-.5)*.08;trailPositions[index*3+1]=worldPointer.y+(Math.random()-.5)*.08;trailPositions[index*3+2]=1;life[index]=1;}}});
  canvas.addEventListener('pointerleave',()=>{target.set(0,0);activeHover=-1;});canvas.addEventListener('pointercancel',()=>{down=null;});
  canvas.addEventListener('pointerup',e=>{const start=down;down=null;if(!start||Math.hypot(e.clientX-start.x,e.clientY-start.y)>12)return;const hit=locate(e);if(hit){const {index,source}=hit.object.userData;document.getElementById('large-photo').src=source;document.getElementById('photo-caption').textContent=config.captions[index]||'';document.getElementById('photo-dialog').showModal();}else if(!paused&&!reduced){for(let j=0;j<25;j++){const index=trailIndex++%trailCount,a=Math.random()*Math.PI*2,r=Math.random()*.6;trailPositions[index*3]=worldPointer.x+Math.cos(a)*r;trailPositions[index*3+1]=worldPointer.y+Math.sin(a)*r;trailPositions[index*3+2]=1;life[index]=1;}}});
  function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;mobile=w<650;renderer.setSize(w,h,false);camera.aspect=w/h;const fitWidth=mobile?4.4:7.1,distance=Math.max(14,fitWidth/(Math.tan(THREE.MathUtils.degToRad(22))*camera.aspect));camera.position.set(0,distance*.42,distance);controls.minDistance=distance*.7;controls.maxDistance=distance*1.35;controls.update();camera.updateProjectionMatrix();}
  window.addEventListener('resize',resize);resize();const cardScale=new THREE.Vector3();
  renderer.setAnimationLoop(time=>{
    const dt=Math.min((time-last)/1000,.05);last=time;if(document.hidden)return;
    const covered=!document.querySelector('.cover')?.hidden,dialogOpen=!!document.querySelector('dialog[open]'),moving=!paused&&!covered&&!dialogOpen;
    if(moving)elapsed+=dt;
    if(!covered)reveal=reduced?1:Math.min(1,reveal+dt/3.5);else reveal=0;
    controls.enableDamping=!reduced;controls.enabled=!covered&&!dialogOpen;controls.update();
    if(!reduced&&!paused)smooth.lerp(target,1-Math.exp(-dt*3));
    // A double pulse followed by a rest gives the heart a gentle heartbeat.
    const phase=elapsed%2.1,pulse=1+.035*Math.exp(-Math.pow((phase-.3)/.12,2))+.023*Math.exp(-Math.pow((phase-.61)/.14,2));
    const appear=THREE.MathUtils.smoothstep(reveal,0,.7);
    heart.scale.setScalar(pulse*(mobile?.78:1)*(.4+.6*appear));heart.rotation.y=smooth.x*.12;heart.rotation.x=-smooth.y*.07;heart.position.x=0;heartStars.material.opacity=appear*.95;halo.material.opacity=appear*.2;
    if(config.twinkle){heartSparkles.material.opacity=.58+Math.sin(elapsed*1.3)*.2;brightStars.material.opacity=.65+Math.sin(elapsed*.7)*.18;}
    starfield.position.set(-smooth.x*.3,-smooth.y*.22,0);dust.rotation.y=elapsed*.012;dust.rotation.z=0;dust.scale.setScalar(mobile?.62:1);dust.material.opacity=config.orbitGlow?appear*.8:0;
    cards.forEach((card,i)=>{
      const a=i/10*Math.PI*2+(config.autoRotate?elapsed*Number(config.speed)*.12:0);
      const depth=Math.sin(a),radius=i%2===0?1:1.16;
      const spread=THREE.MathUtils.smoothstep(reveal,.12+i*.035,.6+i*.035);
      // Inclined orbits place photographs in front of and behind the stellar heart.
      const x=Math.cos(a)*(mobile?3:4.8)*radius;
      const y=(i%2===0?.25:-.15);
      card.position.set(x*spread,y*spread+Math.sin(elapsed*.5+i)*.08,depth*(mobile?3.4:5)*radius);
      card.quaternion.copy(camera.quaternion);card.rotateZ(Math.sin(a)*.055);
      const selected=activeHover===i,scale=(mobile?.86:1)*(selected?1.16:1)*(.35+.65*spread);
      cardScale.setScalar(scale);card.scale.lerp(cardScale,1-Math.exp(-dt*6));
      card.children[0].material.opacity=spread*(selected?.95:.48);
      card.children[1].material.opacity=spread*(selected?1:.8+depth*.15);
      card.visible=spread>.01;
    });
    if(moving){for(let i=0;i<trailCount;i++){if(life[i]<=0)continue;life[i]-=dt*.8;trailPositions[i*3+1]-=dt*.13;trailPositions[i*3]+=(i%2?1:-1)*dt*.035;if(life[i]<=0)trailPositions[i*3+2]=1000;}trail.geometry.attributes.position.array.set(trailPositions);trail.geometry.attributes.position.needsUpdate=true;}
    camera.updateMatrixWorld();
    if(moving&&!letterHover&&!letter.matches(':focus-visible'))letterTime+=dt;
    if(config.letterEnabled&&!covered){
      const angle=letterTime*.24+1.2,head=letterPoint(angle);
      letter.style.left=`${head[0]}px`;letter.style.top=`${head[1]}px`;
      ribbon.style.opacity=String(appear);ribbon.setAttribute('viewBox',`0 0 ${canvas.clientWidth} ${canvas.clientHeight}`);
      segments.forEach((path,i)=>{const from=letterPoint(angle-i*.025),to=letterPoint(angle-(i+1)*.025);path.setAttribute('d',`M${from[0]},${from[1]} L${to[0]},${to[1]}`);});
    }else ribbon.style.opacity='0';
    renderer.render(scene,camera);
  });
  window.addEventListener('pagehide',event=>{if(event.persisted)return;renderer.setAnimationLoop(null);controls.dispose();scene.traverse(node=>{node.geometry?.dispose();for(const material of node.material?(Array.isArray(node.material)?node.material:[node.material]):[]){material.map?.dispose();material.dispose();}});renderer.dispose();});
}
