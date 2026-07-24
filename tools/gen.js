// Paint by Numbers — 36x36 character generator.
// Design flat fills with primitives; auto-outline paints the plum border (7).
const fs = require('fs');
const W = 36, H = 36, CX = 17.5;
const make = () => Array.from({length:H}, () => Array(W).fill(0));
const inb = (c,r) => r>=0&&r<H&&c>=0&&c<W;
const px = (g,c,r,v) => { if(inb(c,r)) g[r][c]=v; };
function disc(g,cc,cr,rad,v){ for(let r=0;r<H;r++)for(let c=0;c<W;c++){const dx=c-cc,dy=r-cr; if(dx*dx+dy*dy<=rad*rad) g[r][c]=v;} }
function ell(g,cc,cr,rx,ry,v){ for(let r=0;r<H;r++)for(let c=0;c<W;c++){const dx=(c-cc)/rx,dy=(r-cr)/ry; if(dx*dx+dy*dy<=1) g[r][c]=v;} }
function rect(g,c0,r0,c1,r1,v){ for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++) px(g,c,r,v); }
function tri(g,cx,topR,baseR,halfW,v){ for(let r=topR;r<=baseR;r++){ const t=(r-topR)/(baseR-topR); const half=Math.round(halfW*t); for(let c=cx-half;c<=cx+half;c++) px(g,c,r,v);} }
// mirror a feature drawn on the left onto the right (about CX)
function outline(g,oc){ const s=g.map(r=>r.slice());
  for(let r=0;r<H;r++)for(let c=0;c<W;c++){ if(s[r][c]!==0) continue;
    const nb=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
    if(nb.some(([dr,dc])=> inb(c+dc,r+dr) && s[r+dr][c+dc]!==0)) g[r][c]=oc; } }

const OUT = {};
const P = {}; // palettes

/* ================= KITTY ================= */
P.kitty = {1:['#f5a9c7','Pink'],2:['#fcd5e5','Blush'],3:['#fff4e9','Cream'],4:['#a8e6cf','Mint'],5:['#ffe29a','Butter'],6:['#ee7ba6','Rose'],7:['#6e5a79','Plum']};
{ const g = make();
  // broad triangular cat ears, sitting on top of the head
  tri(g,11,5,12,4,1); tri(g,24,5,12,4,1);
  tri(g,11,8,12,2,2); tri(g,24,8,12,2,2);            // blush inner ears
  disc(g,CX,17,9.2,1);                               // head
  // bow between ears
  ell(g,13,7,2.6,2.4,4); ell(g,22,7,2.6,2.4,4);      // mint loops
  rect(g,16,5,19,9,5);                               // butter knot
  // body + collar + tail
  ell(g,30,30,2.6,4.2,1);                            // tail
  ell(g,CX,31,8.6,6,1);                              // body
  ell(g,CX,32,4.6,5,3);                              // cream belly
  rect(g,10,34,15,35,3); rect(g,20,34,25,35,3);      // paws
  rect(g,9,26,26,28,4);                              // mint collar
  rect(g,16,28,19,30,5);                             // butter bell
  // face
  rect(g,12,16,13,18,7); rect(g,22,16,23,18,7);      // eyes
  disc(g,11,21,2,6); disc(g,24,21,2,6);              // rose cheeks
  ell(g,CX,22,4.6,3.2,3);                            // cream muzzle
  rect(g,16,20,19,21,6);                             // nose
  rect(g,15,23,20,23,7);                             // mouth
  outline(g,7);
  rect(g,4,20,8,20,7); rect(g,4,22,8,22,7);          // left whiskers (after outline = crisp)
  rect(g,27,20,31,20,7); rect(g,27,22,31,22,7);      // right whiskers
  OUT.kitty = g; }

/* ================= PUPPY ================= */
P.puppy = {1:['#f4cf9e','Tan'],2:['#c88a5a','Brown'],3:['#fff4e9','Cream'],4:['#f58bb0','Pink'],6:['#f6b3c6','Blush'],7:['#6e5a79','Plum']};
{ const g = make();
  ell(g,7,17,3.6,6.4,2); ell(g,28,17,3.6,6.4,2);     // floppy ears
  disc(g,CX,14,8.2,1);                               // head
  ell(g,29,30,2.4,4,1);                              // little tail
  ell(g,CX,29,8.2,6.2,1);                            // body
  ell(g,CX,30,4.8,5.2,3);                            // cream chest
  disc(g,11,34,2.8,3); disc(g,24,34,2.8,3);          // paws
  ell(g,CX,19,5.4,3.6,3);                            // cream muzzle
  disc(g,10,18,2,6); disc(g,25,18,2,6);              // blush
  rect(g,11,13,12,15,7); rect(g,23,13,24,15,7);      // eyes
  rect(g,16,17,19,18,7);                             // nose
  rect(g,16,21,19,24,4);                             // tongue
  outline(g,7); OUT.puppy = g; }

/* ================= BUNNY ================= */
P.bunny = {1:['#fbf3f8','White'],2:['#ffc7dd','Pink'],3:['#ef8fb0','Rose'],4:['#a8e6cf','Mint'],6:['#f9b8ce','Blush'],7:['#6e5a79','Plum']};
{ const g = make();
  ell(g,12,8,2.6,6.6,1); ell(g,23,8,2.6,6.6,1);      // tall ears
  ell(g,12,8,1.2,4.8,2); ell(g,23,8,1.2,4.8,2);      // inner ears
  disc(g,CX,18,7.6,1);                               // head
  ell(g,CX,30,7.4,5.6,1);                            // body
  ell(g,CX,31,3.8,4.4,2);                            // belly
  disc(g,11,34,2.6,1); disc(g,24,34,2.6,1);          // feet
  ell(g,14,6,1.4,1.4,4); ell(g,21,6,1.4,1.4,4);      // mint bow
  rect(g,16,4,19,7,4);                               // bow knot
  disc(g,12,20,2,6); disc(g,23,20,2,6);              // blush
  rect(g,12,17,13,19,7); rect(g,22,17,23,19,7);      // eyes
  rect(g,16,20,19,21,3);                             // nose
  rect(g,17,22,18,23,3);                             // mouth
  outline(g,7); OUT.bunny = g; }

/* ================= BEAR ================= */
P.bear = {1:['#e8b06e','Honey'],2:['#f6e3c4','Cream'],3:['#ef7ba6','Rose'],6:['#f4a9c0','Blush'],7:['#6e5a79','Plum']};
{ const g = make();
  disc(g,9,8,3.6,1); disc(g,26,8,3.6,1);             // round ears
  disc(g,9,8,1.8,2); disc(g,26,8,1.8,2);             // inner ears
  disc(g,CX,15,8.6,1);                               // head
  ell(g,CX,30,8.2,6,1);                              // body
  ell(g,CX,30,4.8,5,2);                              // cream belly
  disc(g,10,34,2.6,1); disc(g,25,34,2.6,1);          // paws
  ell(g,CX,19,5,3.6,2);                              // muzzle
  disc(g,10,18,2,6); disc(g,25,18,2,6);              // blush
  rect(g,12,15,13,17,7); rect(g,22,15,23,17,7);      // eyes
  rect(g,16,17,19,18,7);                             // nose
  rect(g,17,19,18,20,7);                             // mouth
  // heart on belly
  rect(g,13,28,15,29,3); rect(g,20,28,22,29,3); rect(g,13,30,22,31,3); rect(g,15,32,20,32,3); rect(g,17,33,18,33,3);
  outline(g,7); OUT.bear = g; }

/* ================= CHICK ================= */
P.chick = {1:['#ffe08a','Yellow'],2:['#ffb15a','Orange'],3:['#f2bf4e','Straw'],6:['#f9c6d6','Blush'],7:['#6e5a79','Plum']};
{ const g = make();
  rect(g,16,4,19,7,3);                               // head tuft
  disc(g,CX,19,10.2,1);                              // big round body
  ell(g,7,20,2.6,4.6,3); ell(g,28,20,2.6,4.6,3);     // wings
  disc(g,10,20,2,6); disc(g,25,20,2,6);              // blush
  rect(g,13,16,14,18,7); rect(g,21,16,22,18,7);      // eyes
  // beak
  rect(g,16,20,19,21,2); rect(g,17,22,18,22,2);
  // feet
  rect(g,11,30,13,31,2); rect(g,10,32,14,32,2);
  rect(g,22,30,24,31,2); rect(g,21,32,25,32,2);
  outline(g,7); OUT.chick = g; }

/* ================= FOX ================= */
P.fox = {1:['#f4995a','Orange'],2:['#fff4e9','Cream'],6:['#f4a9c0','Blush'],7:['#6e5a79','Plum']};
{ const g = make();
  tri(g,9,4,12,4,1); tri(g,26,4,12,4,1);             // pointy ears
  tri(g,9,7,12,2,2); tri(g,26,7,12,2,2);             // cream inner ears
  disc(g,CX,15,8.4,1);                               // head
  ell(g,CX,20,6.2,4.8,2);                            // white lower face
  ell(g,30,28,3.4,5.2,1);                            // fluffy tail
  ell(g,31,32,2.2,3,2);                              // white tail tip
  ell(g,CX,30,7.4,6,1);                              // body
  ell(g,CX,31,4,4.8,2);                              // white chest
  disc(g,11,34,2.4,7); disc(g,24,34,2.4,7);          // dark paws
  disc(g,10,19,1.8,6); disc(g,25,19,1.8,6);          // blush
  rect(g,12,15,13,17,7); rect(g,22,15,23,17,7);      // eyes
  rect(g,16,20,19,21,7);                             // nose
  outline(g,7); OUT.fox = g; }

/* ================= FROG ================= */
P.frog = {1:['#9fd67e','Green'],2:['#cdeaa8','Pale'],3:['#ffffff','White'],4:['#f58bb0','Pink'],7:['#6e5a79','Plum']};
{ const g = make();
  disc(g,10,9,4,1); disc(g,25,9,4,1);                // eye bulges
  disc(g,10,9,2.2,3); disc(g,25,9,2.2,3);            // eye whites
  rect(g,9,8,11,10,7); rect(g,24,8,26,10,7);         // pupils
  disc(g,CX,22,10.6,1);                              // big body/head
  ell(g,CX,25,6.6,6,2);                              // pale belly
  rect(g,10,24,25,24,7); px(g,9,23,7); px(g,26,23,7);// wide smile
  disc(g,10,22,1.8,4); disc(g,25,22,1.8,4);          // pink cheeks
  disc(g,9,33,2.8,1); disc(g,26,33,2.8,1);           // webbed feet
  outline(g,7); OUT.frog = g; }

/* ================= PENGUIN ================= */
P.penguin = {1:['#97aee0','Blue'],2:['#fff4e9','White'],3:['#ffb15a','Orange'],6:['#f4a9c0','Blush'],7:['#6e5a79','Plum']};
{ const g = make();
  ell(g,6.5,21,2.4,6.5,1); ell(g,28.5,21,2.4,6.5,1);  // flippers
  ell(g,CX,20,9.5,13,1);                              // round body + head
  ell(g,CX,24,6,8.5,2);                               // white belly
  rect(g,16,5,19,6,1);                                // little head tuft
  rect(g,13,12,14,14,7); rect(g,21,12,22,14,7);       // eyes
  rect(g,16,15,19,16,3); rect(g,17,17,18,17,3);       // beak
  disc(g,11,16,1.8,6); disc(g,24,16,1.8,6);           // blush
  ell(g,13,34,3,1.7,3); ell(g,22,34,3,1.7,3);         // orange webbed feet
  outline(g,7); OUT.penguin = g; }

// ---- emit characters.js ----
const order = ['kitty','puppy','bunny','bear','chick','fox','frog','penguin'];
const names = {kitty:'Kitty',puppy:'Puppy',bunny:'Bunny',bear:'Bear',chick:'Chick',fox:'Fox',frog:'Frog',penguin:'Penguin'};
const big = require('./chars72');                       // the 72x72 set

const build = (ids, nameMap, pals, grids) => ids.map(id => {
  const pal = {}; for(const k of Object.keys(pals[id])) pal[k] = {hex:pals[id][k][0], name:pals[id][k][1]};
  return {id, name:nameMap[id], bg:'#eae2f6', palette:pal, grid:grids[id]};
});
const chars = [
  ...build(order, names, P, OUT),
  ...build(big.order, big.names, big.P, big.OUT),
];
const js = 'window.CHARACTERS = ' + JSON.stringify(chars) + ';\n';
fs.writeFileSync(require('path').join(__dirname, '..', 'characters.js'), js);  // repo root

// ---- report ----
for (const ch of chars){
  let n = 0;
  for (const row of ch.grid) for (const v of row) if (v) n++;
  console.log(`${ch.name.padEnd(10)} ${ch.grid.length}x${ch.grid[0].length}  ${String(n).padStart(4)} cells to paint  ${Object.keys(ch.palette).length} colours`);
}
console.log('\nwrote characters.js — run `node tools/preview.js` to look at it');
