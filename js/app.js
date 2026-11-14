(()=>{
  const $=id=>document.getElementById(id),KEY='timercube.v1',TYPES=Scramble.TYPES;
  const D={theme:null,type:'333',inspect:true,hold:300,hide:false,showCube:true,size:24,solves:[]};
  const S=Object.assign({},D,(()=>{try{
    const saved=JSON.parse(localStorage.getItem(KEY))||{};
    if(saved.showCube===undefined&&saved.show3d!==undefined)saved.showCube=saved.show3d;
    delete saved.show3d;
    return saved;
  }catch(e){return{}}})());
  const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};

  // Định dạng & thống kê (WCA: hiển thị cắt xuống 0,01s; trung bình làm tròn 0,01s)
  const val=s=>s.pen==='dnf'?Infinity:s.t+(s.pen===2?2000:0);
  function fmt(v){
    if(v==null)return '—';if(v===Infinity)return 'DNF';
    const cs=Math.floor(v/10),m=Math.floor(cs/6000),sec=((cs%6000)/100).toFixed(2);
    return m?`${m}:${sec.padStart(5,'0')}`:sec;
  }
  const fmtS=s=>s.pen==='dnf'?'DNF':fmt(val(s))+(s.pen===2?'+':'');
  function avg(a,N){ // bỏ tốt nhất & tệ nhất; ≥2 DNF => DNF
    if(a.length<N)return null;
    const v=a.slice(-N).map(val);
    if(v.filter(x=>x===Infinity).length>1)return Infinity;
    v.sort((x,y)=>x-y);const m=v.slice(1,-1);
    return Math.round(m.reduce((p,x)=>p+x,0)/m.length/10)*10;
  }
  const mine=()=>S.solves.filter(x=>x.type===S.type);

  const typeSel=$('cubeType');
  TYPES.forEach(t=>typeSel.add(new Option(t.name,t.id)));typeSel.value=S.type;
  function theme(t){document.documentElement.dataset.theme=t;S.theme=t;save()}
  $('themeBtn').onclick=()=>theme(document.documentElement.dataset.theme==='dark'?'light':'dark');

  let scr='',scrambleRequest=0;
  async function newScramble(){
    const request=++scrambleRequest;
    const t=TYPES.find(x=>x.id===S.type);
    scr='';$('scramble').textContent='Đang tạo scramble...';
    $('cubeBox').style.display=S.showCube?'':'none';
    if(t.n)$('cubeNote').textContent='Cube 2D theo scramble';
    else{
      $('cubeNote').textContent='Hình 2D hiện hỗ trợ cube NxN (2x2 – 7x7)';
      $('cube').replaceChildren();
    }
    try{
      const result=await t.gen();
      if(request!==scrambleRequest||t.id!==S.type)return;
      scr=result;$('scramble').textContent=scr;
      if(t.n)Cube2D.set(t.n,scr);
    }catch(e){
      if(request!==scrambleRequest)return;
      console.error('Không thể tạo scramble bằng cubing.js:',e);
      $('scramble').textContent='Không thể tạo scramble. Hãy kiểm tra kết nối Internet rồi thử lại.';
    }
  }
  function render(){
    const a=mine(),vs=a.map(val).filter(isFinite);
    $('stats').innerHTML=[['Tốt nhất',vs.length?Math.min(...vs):null],['Số lần',a.length],['Ao5',avg(a,5)],['Ao12',avg(a,12)],['Trung bình',vs.length?Math.round(vs.reduce((p,x)=>p+x,0)/vs.length/10)*10:null]]
      .map(([k,v])=>`<div><dt>${k}</dt><dd>${k==='Số lần'?v:fmt(v)}</dd></div>`).join('');
    $('times').innerHTML=a.length?a.slice().reverse().slice(0,100).map((s,i)=>`<li title="${s.scr.replace(/\n/g,' ')}"><span>${a.length-i}</span><span>${fmtS(s)}</span></li>`).join(''):'<li class="empty">Chưa có lần giải nào</li>';
    $('scramble').style.setProperty('--ss',S.size+'px');
  }
  typeSel.onchange=()=>{S.type=typeSel.value;save();typeSel.blur();reset();T.textContent='0.00';newScramble();render()};
  $('newScramble').onclick=e=>{e.stopPropagation();newScramble()};

  // Timer (WCA A3/A6/A7: quan sát 15s, +2 trong 15–17s, DNF sau 17s)
  const T=$('timer'),H=$('hint');
  let phase='idle',holding=false,ready=false,swallow=false,holdTm,t0=0,insT=0,raf=0,pen0=0;
  const cls=c=>T.className='timer '+(c||'');
  const hint=()=>H.textContent=phase==='run'?'Chạm hoặc nhấn phím bất kỳ để dừng':phase==='inspect'?'Giữ Space rồi thả để bắt đầu giải · Esc để huỷ':`Giữ Space (hoặc chạm giữ) tới khi chữ xanh, thả để ${S.inspect?'bắt đầu quan sát':'bấm giờ'}`;
  function reset(){cancelAnimationFrame(raf);phase='idle';holding=ready=false;clearTimeout(holdTm);cls();hint()}
  function add(t,pen){S.solves.push({type:S.type,t,pen,scr,ts:Date.now()});save();newScramble();render()}

  function tickInspect(){
    const e=performance.now()-insT;
    if(e>=17000){cancelAnimationFrame(raf);add(0,'dnf');phase='idle';T.textContent='DNF';cls();hint();return}
    T.textContent=e>15000?'+2':String(15-Math.floor(e/1000));
    raf=requestAnimationFrame(tickInspect);
  }
  function startInspect(){phase='inspect';insT=performance.now();cls('insp');hint();tickInspect()}
  function startRun(){
    pen0=0;
    if(phase==='inspect'){cancelAnimationFrame(raf);pen0=performance.now()-insT>15000?2:0}
    phase='run';t0=performance.now();cls();hint();
    (function loop(){if(phase!=='run')return;T.textContent=S.hide?'···':fmt(Math.floor((performance.now()-t0)/10)*10);raf=requestAnimationFrame(loop)})();
  }
  function stop(){
    const t=Math.floor((performance.now()-t0)/10)*10;
    cancelAnimationFrame(raf);phase='idle';add(t,pen0);
    T.textContent=fmtS(S.solves[S.solves.length-1]);hint();
  }
  function down(){
    if(!scr)return;
    if(phase==='run'){stop();return true}
    if(holding)return;holding=true;ready=false;cls('hold');
    holdTm=setTimeout(()=>{ready=true;cls('ready')},S.hold);
  }
  function up(){
    if(swallow){swallow=false;return}
    if(!holding)return;holding=false;clearTimeout(holdTm);
    if(!ready){cls(phase==='inspect'?'insp':'');return}
    ready=false;
    if(phase==='idle'&&S.inspect)startInspect();else startRun();
  }
  addEventListener('keydown',e=>{
    if($('dlg').open||e.metaKey||e.ctrlKey)return;
    if(e.code==='Escape'&&phase==='inspect'){reset();T.textContent='0.00';return}
    if(phase==='run'){e.preventDefault();stop();if(e.code==='Space')swallow=true;return}
    if(e.code==='Space'&&!e.repeat){e.preventDefault();document.activeElement.blur();down()}
    else if(e.code==='KeyN'&&phase==='idle')newScramble();
  });
  addEventListener('keyup',e=>{if(e.code==='Space'&&!$('dlg').open)up()});
  $('stage').addEventListener('pointerdown',e=>{if(e.target.closest('button,#scramble'))return;if(down())swallow=true});
  addEventListener('pointerup',()=>{if(holding||swallow)up()});

  // Phạt / xoá
  const lastIdx=()=>{for(let i=S.solves.length-1;i>=0;i--)if(S.solves[i].type===S.type)return i;return -1};
  function pen(p){const i=lastIdx();if(i<0)return;const s=S.solves[i];s.pen=s.pen===p?0:p;save();render();T.textContent=fmtS(s)}
  $('bPlus').onclick=e=>{e.stopPropagation();pen(2)};
  $('bDnf').onclick=e=>{e.stopPropagation();pen('dnf')};
  $('bDel').onclick=e=>{e.stopPropagation();const i=lastIdx();if(i>=0){S.solves.splice(i,1);save();render();T.textContent='0.00'}};

  // Cài đặt
  const dlg=$('dlg');
  $('settingsBtn').onclick=()=>{$('sInspect').checked=S.inspect;$('sHold').value=S.hold;$('sHide').checked=S.hide;$('sCube').checked=S.showCube;$('sSize').value=S.size;dlg.showModal()};
  dlg.addEventListener('close',()=>{
    S.inspect=$('sInspect').checked;S.hold=Math.max(0,+$('sHold').value||0);S.hide=$('sHide').checked;S.showCube=$('sCube').checked;S.size=+$('sSize').value;
    delete S.show3d;
    save();$('cubeBox').style.display=S.showCube?'':'none';render();hint();
  });
  $('sSize').oninput=e=>$('scramble').style.setProperty('--ss',e.target.value+'px');
  $('sClear').onclick=()=>{if(confirm('Xoá toàn bộ kết quả đã lưu?')){S.solves=[];save();render();T.textContent='0.00'}};

  newScramble();render();hint();
})();
