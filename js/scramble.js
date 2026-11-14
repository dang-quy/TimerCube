/* Random-state scramble generation via cubing.js. */
const Scramble=(()=>{
  let modulePromise;
  async function gen(event){
    if(!modulePromise)modulePromise=import('https://cdn.cubing.net/v0/js/cubing/scramble');
    let cubing;
    try{cubing=await modulePromise}catch(e){modulePromise=null;throw e}
    return (await cubing.randomScrambleForEvent(event)).toString();
  }
  const TYPES=[
    {id:'222',name:'2x2',n:2,event:'222'},
    {id:'333',name:'3x3',n:3,event:'333'},
    {id:'444',name:'4x4',n:4,event:'444'},
    {id:'555',name:'5x5',n:5,event:'555'},
    {id:'666',name:'6x6',n:6,event:'666'},
    {id:'777',name:'7x7',n:7,event:'777'},
    {id:'pyra',name:'Pyraminx',event:'pyram'},
    {id:'skewb',name:'Skewb',event:'skewb'},
    {id:'mega',name:'Megaminx',event:'minx'},
  ].map(t=>({...t,gen:()=>gen(t.event)}));
  return {TYPES};
})();
