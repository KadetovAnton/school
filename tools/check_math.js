const fs=require("fs"),vm=require("vm");
const ctx={window:{E:{}},Math,String,Array,JSON,console};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(__dirname+"/../engine/math.js","utf8"),ctx);
const G=ctx.window.E.GEN, sk=JSON.parse(fs.readFileSync(__dirname+"/../content/math2/skills/math.json")).skills;
let bad=0; const B=(g,m,it)=>{if(bad++<30)console.log("✗",g,m,JSON.stringify(it).slice(0,300));};
for(const s of sk){ if(!G[s.gen]){B(s.gen,"нема генератора");continue;}
 const seen=new Set();
 for(let i=0;i<3000;i++){const it=G[s.gen](s.args||{});
  const txt=JSON.stringify(it); if(/undefined|NaN|null/.test(txt))B(s.gen,"undefined/NaN",it);
  if(!it.long&&!it.p.includes("___"))B(s.gen,"нема ___",it);
  if(!it.h||it.h.length<2||!it.e)B(s.gen,"нема підказок/пояснення",it);
  seen.add(it.p);
  if(it.type==="num"){const v=eval(it.calc); if(String(v)!==it.a||!Number.isInteger(v)||v<0)B(s.gen,"відповідь "+v,it);
    for(const k in it.err||{}) if(k===it.a)B(s.gen,"err=правильна",it);
    // кожне число в прикладі 0..100
    (it.p.match(/\d+/g)||[]).forEach(n=>{if(+n>100)B(s.gen,"число >100",it);});
    // підстановка відповіді в рівняння
    if(!it.long && /[=]/.test(it.p) && !/[a-zа-яіїєґ]/i.test(it.p)){
      const ex=it.p.replace("___",it.a).replace(/−/g,"-").replace(/·/g,"*").replace(/:/g,"/").split("=");
      if(ex.length===2 && eval(ex[0])!==eval(ex[1]))B(s.gen,"рівність не виконується",it);}
    if(s.gen==="tens"){const m=it.p.match(/(\d+) дес\. (\d+) од\./)||[];}
    if(it.chk){ const x=+it.a; const ex=it.chk.replace(/x/g,"("+x+")").replace(/−/g,"-").split("="); if(eval(ex[0])!==eval(ex[1]))B(s.gen,"рівняння не виконується",it); }
  } else if(it.calc.ans!==undefined){ if(s.gen==="parts"){const nums=(it.p.match(/\d+/g)||[]);const sh=nums[nums.length-1];if(nums.slice(0,3).filter(x=>x===sh).length!==1)B(s.gen,"неоднозначно",it);}
    if(it.calc.ans!==it.a||!it.o.includes(it.a)||new Set(it.o).size!==it.o.length||it.o.length<2)B(s.gen,"choice",it);
    for(const k in it.err||{}) if(k===it.a)B(s.gen,"err=правильна",it);
  } else { const [a,b]=it.calc.cmp; const sg=a>b?">":a<b?"<":"="; if(sg!==it.a||!it.o.includes(it.a))B(s.gen,"знак",it);
    const l=it.p.split("___")[0].replace(/−/g,"-").replace(/дм|см/g,""); if(!/дм/.test(it.p)&&eval(l)!==a)B(s.gen,"ліва частина",it);}
  // специфічні межі
  const n=(it.p.match(/\d+/g)||[]).map(Number);
  if(s.gen==="add20"&&!(n[0]+n[1]>10&&n[0]+n[1]<=18&&n[0]<10&&n[1]<10))B(s.gen,"не через десяток",it);
  if(s.gen==="sub20"&&!(n[0]>10&&n[0]%10<n[1]&&n[1]<10&&n[0]-n[1]<10))B(s.gen,"не через десяток",it);
  if(s.gen==="addnc"&&(n[0]%10+n[1]%10>=10||n[0]+n[1]>99))B(s.gen,"є перехід",it);
  if(s.gen==="subnc"&&(n[0]%10<n[1]%10||n[0]-n[1]<=0))B(s.gen,"є перехід",it);
  if(s.gen==="addc"&&(n[0]%10+n[1]%10<10||n[0]+n[1]>100))B(s.gen,"нема переходу",it);
  if(s.gen==="subc"&&(n[0]%10>=n[1]%10||n[0]-n[1]<=0))B(s.gen,"нема переходу",it);
  if(s.gen==="mulT"&&s.args&&s.args.t.length===1&&!n.includes(s.args.t[0]))B(s.gen,"не та таблиця",it);
  if(s.gen==="divT"&&s.args&&s.args.t.length===1&&n[1]!==s.args.t[0])B(s.gen,"не та таблиця",it);
  if(s.gen==="add10"&&n[0]+(it.calc.includes("+")?n[1]:0)>10)B(s.gen,">10",it);
  if((s.gen==="prob20")&&(+it.a>20||n.some(x=>x>20)))B(s.gen,">20",it);
 }
 console.log(s.id.padEnd(11),"різних:",seen.size);
}
console.log(bad?"ПОМИЛОК: "+bad:"✓ усе гаразд");
