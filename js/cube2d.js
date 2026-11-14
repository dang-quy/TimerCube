/* Render scramble as a flat cube net so the preview stays light on mobile. */
const Cube2D=(()=>{
  const COL={U:'#f4f4f0',D:'#f5c400',F:'#1fa355',B:'#2468e8',R:'#da3a3a',L:'#f48a1c'};
  const NORM={U:[0,-1,0],D:[0,1,0],L:[-1,0,0],R:[1,0,0],F:[0,0,1],B:[0,0,-1]};
  const FACE_ORDER=['U','L','F','R','B','D'];
  const root=document.getElementById('cube');
  const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const rot90=(k,v)=>{const c=cross(k,v),d=dot(k,v);return[c[0]+k[0]*d,c[1]+k[1]*d,c[2]+k[2]*d]};

  function facePosition(face,row,col,n){
    const h=(n-1)/2,r=row-h,c=col-h;
    switch(face){
      case'U':return[[c,-h,r],[0,-1,0]];
      case'D':return[[c,h,-r],[0,1,0]];
      case'L':return[[-h,r,c],[-1,0,0]];
      case'R':return[[h,r,-c],[1,0,0]];
      case'B':return[[-c,r,-h],[0,0,-1]];
      default:return[[c,r,h],[0,0,1]];
    }
  }

  function location(face,p,n){
    const h=(n-1)/2;
    switch(face){
      case'U':return[Math.round(p[2]+h),Math.round(p[0]+h)];
      case'D':return[Math.round(h-p[2]),Math.round(p[0]+h)];
      case'L':return[Math.round(p[1]+h),Math.round(p[2]+h)];
      case'R':return[Math.round(p[1]+h),Math.round(h-p[2])];
      case'B':return[Math.round(p[1]+h),Math.round(h-p[0])];
      default:return[Math.round(p[1]+h),Math.round(p[0]+h)];
    }
  }

  function set(n,scr){
    root.replaceChildren();
    const stickers=[];
    for(const face of FACE_ORDER){
      const el=document.createElement('div');
      el.className=`cube-face face-${face}`;
      el.style.gridTemplateColumns=`repeat(${n},minmax(0,1fr))`;
      el.style.gridTemplateRows=`repeat(${n},minmax(0,1fr))`;
      el.setAttribute('aria-label',`${face} face`);
      for(let row=0;row<n;row++)for(let col=0;col<n;col++){
        const [p,normal]=facePosition(face,row,col,n);
        const cell=document.createElement('i');
        cell.className='sticker';
        el.appendChild(cell);
        stickers.push({p,normal,color:COL[face],cell});
      }
      root.appendChild(el);
    }

    const h=(n-1)/2;
    for(const tok of scr.split(/\s+/).filter(Boolean)){
      const m=/^(\d*)([UDLRFB])(w?)(['2]?)$/.exec(tok);
      if(!m)continue;
      const width=m[1]?+m[1]:(m[3]?2:1),axis=NORM[m[2]];
      const turns=m[4]==='2'?2:m[4]==="'"?3:1;
      const limit=h-(width-1)-1e-6;
      for(const sticker of stickers){
        if(dot(sticker.p,axis)<limit)continue;
        for(let i=0;i<turns;i++){
          sticker.p=rot90(axis,sticker.p);
          sticker.normal=rot90(axis,sticker.normal);
        }
      }
    }

    for(const sticker of stickers){
      const face=Object.keys(NORM).find(key=>dot(sticker.normal,NORM[key])===1);
      const [row,col]=location(face,sticker.p,n);
      const el=root.querySelector(`.face-${face}`).children[row*n+col];
      el.style.backgroundColor=sticker.color;
    }
  }
  return{set};
})();
