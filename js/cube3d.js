/* Cube NxN 3D bằng CSS 3D: mỗi khối nhỏ có vị trí + ma trận xoay; scramble áp bằng phép xoay 90°. */
const Cube3D=(()=>{
  const COL={U:'#f4f4f0',D:'#f5c400',F:'#1fa355',B:'#2468e8',R:'#da3a3a',L:'#f48a1c'};
  const NORM={U:[0,-1,0],D:[0,1,0],L:[-1,0,0],R:[1,0,0],F:[0,0,1],B:[0,0,-1]};
  const FACES=[['R',1,0,0,'rotateY(90deg)'],['L',-1,0,0,'rotateY(-90deg)'],['U',0,-1,0,'rotateX(90deg)'],['D',0,1,0,'rotateX(-90deg)'],['F',0,0,1,''],['B',0,0,-1,'rotateY(180deg)']];
  const root=document.getElementById('cube'),scene=document.getElementById('scene');
  let n=3,s=50,cubies=[],rx=-28,ry=-38;
  const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const rot90=(k,v)=>{const c=cross(k,v),d=dot(k,v);return[c[0]+k[0]*d,c[1]+k[1]*d,c[2]+k[2]*d]};

  function paint(c){
    const M=c.M,p=c.p;
    c.el.style.transform=`matrix3d(${M[0][0]},${M[0][1]},${M[0][2]},0,${M[1][0]},${M[1][1]},${M[1][2]},0,${M[2][0]},${M[2][1]},${M[2][2]},0,${p[0]*s},${p[1]*s},${p[2]*s},1)`;
  }
  function build(size){
    n=size;s=Math.round(165/n);root.innerHTML='';cubies=[];
    const h=(n-1)/2;
    for(let x=0;x<n;x++)for(let y=0;y<n;y++)for(let z=0;z<n;z++){
      const p=[x-h,y-h,z-h];
      if(!p.some(v=>Math.abs(v)===h))continue;
      const el=document.createElement('div');el.className='cb';
      el.style.cssText=`width:${s}px;height:${s}px;left:${-s/2}px;top:${-s/2}px`;
      for(const[f,a,b,c,t]of FACES){
        const i=document.createElement('i');
        if(p[0]*a+p[1]*b+p[2]*c===h){i.className='c';i.style.background=COL[f]}
        i.style.transform=`${t} translateZ(${s/2}px)`;el.appendChild(i);
      }
      root.appendChild(el);
      const cb={p,M:[[1,0,0],[0,1,0],[0,0,1]],el};cubies.push(cb);paint(cb);
    }
  }
  function view(){root.style.transform=`rotateX(${rx}deg) rotateY(${ry}deg)`}
  function move(tok){
    const m=/^(\d*)([UDLRFB])(w?)(['2]?)$/.exec(tok);if(!m)return;
    const k=m[1]?+m[1]:(m[3]?2:1),nv=NORM[m[2]],times=m[4]==='2'?2:m[4]==="'"?3:1,lim=(n-1)/2-(k-1)-1e-6;
    for(const c of cubies){
      if(dot(c.p,nv)<lim)continue;
      for(let t=0;t<times;t++){c.p=rot90(nv,c.p);c.M=c.M.map(col=>rot90(nv,col))}
      paint(c);
    }
  }
  function set(size,scr){build(size);scr.split(/\s+/).filter(Boolean).forEach(move);view()}
  let drag=null;
  scene.addEventListener('pointerdown',e=>{drag=[e.clientX,e.clientY];scene.setPointerCapture(e.pointerId)});
  scene.addEventListener('pointermove',e=>{if(!drag)return;ry+=(e.clientX-drag[0])*.6;rx-=(e.clientY-drag[1])*.6;drag=[e.clientX,e.clientY];view()});
  scene.addEventListener('pointerup',()=>drag=null);
  return {set};
})();
