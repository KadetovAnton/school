global.window={};global.localStorage={_:{},getItem(k){return this._[k]||null},setItem(k,v){this._[k]=v}};
require(__dirname + '/../engine/engine.js');const E=window.E;const fs=require('fs');
const B=__dirname + '/../content/english/';
const files=fs.readdirSync(B+'skills');let bad=[],keys={},n=0;
for(const f of files){const j=JSON.parse(fs.readFileSync(B+'skills/'+f));E.addSkills(j);
 for(const s of j.skills){
  if(!s.worked||!s.alt||!s.rule)bad.push('meta '+s.id);
  for(const it of s.items){n++;
   if(keys[it.key])bad.push('dup '+it.key);keys[it.key]=1;
   if(!it.h||it.h.length<2||!it.e)bad.push('hints '+it.p);
   if(it.type==='fix'){const w=it.p.split(' '),a=it.a.split(' ');
     if(E.check(it,String(it.bad)).st!=='ok')bad.push('fix '+it.p);
     if(!w[it.bad])bad.push('fixidx '+it.p);
     if(w.length===a.length){let d=w.filter((x,i)=>x!==a[i]).length;if(d!==1)bad.push('fixdiff '+it.p);if(w[it.bad]===a[it.bad])bad.push('fix-bad-not-changed '+it.p)}
   } else {
     for(const a of E.answersOf(it)) if(E.check(it,a).st!=='ok')bad.push('ans '+it.p+' / '+a);
   }
   if(it.type==='choice'){if(!it.o.includes(it.a))bad.push('opt '+it.p); for(const o of it.o) if(o!==it.a && E.check(it,o).st==='ok')bad.push('2right '+it.p)}
   if(it.type==='order')for(const x of it.a){if(E.norm(x).split(' ').sort().join(' ')!==it.words.map(E.norm).sort().join(' '))bad.push('orderwords '+it.p+' / '+x)}
   for(const k in (it.err||{})){const r=E.check(it,k);if(r.st!=='wrong'||!r.msg)bad.push('err '+it.p+' / '+k+' -> '+r.st)}
   if(it.type==='input'&&it.p.indexOf('___')<0)bad.push('blank '+it.p);
  }
  console.log(f.padEnd(10),s.id.padEnd(11),s.items.length, s.items.map(i=>i.type[0]).join(''));
 }}
for(const l of fs.readdirSync(B+'lessons')){const L=JSON.parse(fs.readFileSync(B+'lessons/'+l));
 for(const s of L.skills)if(!E.SK[s])bad.push('lesson skill missing '+l+' '+s);
 for(const s in L.test.plan)if(!E.SK[s]||E.SK[s].items.length<L.test.plan[s]+L.practice.perSkill)bad.push('bank too small '+l+' '+s);
 if(!L.words||L.words.length<8)bad.push('words '+l);}
console.log('items',n,'problems',bad);
