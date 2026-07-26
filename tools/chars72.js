// Paint by Numbers — the 72x72 set (four times the pixels of the originals).
// Same idea as tools/gen.js: flat fills built from primitives, then auto-outline
// paints the plum border (7). The extra resolution buys curves, so this file has
// a richer toolkit — capsules, beziers, superellipses, tapered strokes, masked
// patterns, and edged() for parts that overlap the body and need their own line.
// Preview your changes with:  node tools/gen.js && node tools/preview.js

const W = 72, H = 72, CX = 35.5;

const make = () => Array.from({length:H}, () => Array(W).fill(0));
const inb  = (c,r) => r>=0 && r<H && c>=0 && c<W;
const px   = (g,c,r,v) => { c=Math.round(c); r=Math.round(r); if (inb(c,r)) g[r][c]=v; };

function ell(g,cc,cr,rx,ry,v){
  for (let r=0;r<H;r++) for (let c=0;c<W;c++){
    const dx=(c-cc)/rx, dy=(r-cr)/ry;
    if (dx*dx+dy*dy <= 1) g[r][c]=v;
  }
}
const disc = (g,cc,cr,rad,v) => ell(g,cc,cr,rad,rad,v);

// superellipse — p=2 is an ellipse, p=3..4 gives the blunt rounded-rectangle
// shapes that make a capybara look like a capybara and not a bear
function sq(g,cc,cr,rx,ry,p,v){
  for (let r=0;r<H;r++) for (let c=0;c<W;c++){
    const dx=Math.abs((c-cc)/rx), dy=Math.abs((r-cr)/ry);
    if (Math.pow(dx,p)+Math.pow(dy,p) <= 1) g[r][c]=v;
  }
}

function rect(g,c0,r0,c1,r1,v){
  for (let r=Math.round(r0);r<=Math.round(r1);r++) for (let c=Math.round(c0);c<=Math.round(c1);c++) px(g,c,r,v);
}

// capsule: a line of thickness t with round caps — the workhorse for limbs,
// tentacles, branches and tapered bodies
function seg(g,x0,y0,x1,y1,t,v){
  const rad = t/2;
  const c0 = Math.max(0, Math.floor(Math.min(x0,x1)-rad-1)), c1 = Math.min(W-1, Math.ceil(Math.max(x0,x1)+rad+1));
  const r0 = Math.max(0, Math.floor(Math.min(y0,y1)-rad-1)), r1 = Math.min(H-1, Math.ceil(Math.max(y0,y1)+rad+1));
  const dx = x1-x0, dy = y1-y0, L2 = dx*dx+dy*dy || 1;
  for (let r=r0;r<=r1;r++) for (let c=c0;c<=c1;c++){
    let u = ((c-x0)*dx + (r-y0)*dy) / L2;
    u = u<0?0:u>1?1:u;
    const qx = x0+u*dx, qy = y0+u*dy;
    if ((c-qx)*(c-qx) + (r-qy)*(r-qy) <= rad*rad) g[r][c]=v;
  }
}
const curve = (g,pts,t,v) => { for (let i=0;i<pts.length-1;i++) seg(g,pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1],t,v); };
// thickness eased from t0 to t1 along the path (horns, tails)
function taper(g,pts,t0,t1,v){
  for (let i=0;i<pts.length-1;i++){
    const u = i/(pts.length-2 || 1);
    seg(g,pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1], t0+(t1-t0)*u, v);
  }
}
// thickness from an arbitrary profile — lets a body swell in the middle and come
// to a point at both ends in one pass (a second pass could only ever add width)
function taperFn(g,pts,fn,v){
  for (let i=0;i<pts.length-1;i++){
    const u = i/(pts.length-2 || 1);
    seg(g,pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1], Math.max(1, fn(u)), v);
  }
}
function bez(p0,p1,p2,n=40){
  const out=[];
  for (let i=0;i<=n;i++){ const u=i/n, k=1-u;
    out.push([k*k*p0[0]+2*k*u*p1[0]+u*u*p2[0], k*k*p0[1]+2*k*u*p1[1]+u*u*p2[1]]); }
  return out;
}
// control point that pulls a quadratic through a wanted apex at u=0.5
const apexCtl = (p0,p2,ax,ay) => [2*ax-0.5*(p0[0]+p2[0]), 2*ay-0.5*(p0[1]+p2[1])];
// unit normal to a sampled path — used to hang fins off a body at the right angle
function normalAt(pts,i){
  const a = pts[Math.max(0,i-1)], b = pts[Math.min(pts.length-1,i+1)];
  const dx = b[0]-a[0], dy = b[1]-a[1], L = Math.hypot(dx,dy) || 1;
  return [-dy/L, dx/L];
}
function poly(g,pts,v){                                  // even-odd scanline fill
  const ys = pts.map(p=>p[1]);
  const y0 = Math.max(0, Math.floor(Math.min(...ys))), y1 = Math.min(H-1, Math.ceil(Math.max(...ys)));
  for (let y=y0;y<=y1;y++){
    const xs=[];
    for (let i=0;i<pts.length;i++){
      const a=pts[i], b=pts[(i+1)%pts.length];
      if ((a[1]<=y && b[1]>y) || (b[1]<=y && a[1]>y)) xs.push(a[0] + (y-a[1])/(b[1]-a[1])*(b[0]-a[0]));
    }
    xs.sort((p,q)=>p-q);
    for (let i=0;i+1<xs.length;i+=2)
      for (let x=Math.ceil(xs[i]); x<=Math.floor(xs[i+1]); x++) px(g,x,y,v);
  }
}

/* layers: draw a shape on a scratch grid, then paste it only where it belongs —
   keeps bellies, blush and patterns from spilling off the body, and lets things
   be drawn behind other things */
function layer(fn){ const l = make(); fn(l); return l; }
function stamp(g,l,v){ for (let r=0;r<H;r++) for (let c=0;c<W;c++) if (l[r][c]) g[r][c]=v; }
function paste(g,l){ for (let r=0;r<H;r++) for (let c=0;c<W;c++) if (l[r][c]) g[r][c]=l[r][c]; }
function stampOn(g,l,v,onVals){
  for (let r=0;r<H;r++) for (let c=0;c<W;c++) if (l[r][c] && onVals.includes(g[r][c])) g[r][c]=v;
}
function dilate(l){
  const d = make(), nb=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
  for (let r=0;r<H;r++) for (let c=0;c<W;c++) if (l[r][c]){
    d[r][c]=1;
    for (const [dr,dc] of nb) if (inb(c+dc,r+dr)) d[r+dr][c+dc]=1;
  }
  return d;
}
const FILL = [1,2,3,4,5,6];                              // every paintable colour except the plum line
// a part that lies on top of the body (flipper, fin, arm): give it a plum edge
// where it crosses the body, and let the silhouette outline handle the rest
function edged(g,v,fn){ const l = layer(fn); stampOn(g, dilate(l), 7, FILL); stamp(g,l,v); }
const shade = (g,v,on,fn) => stampOn(g, layer(fn), v, on);
const blush = (g,c,r,rad,v,on=FILL) => stampOn(g, layer(l=>disc(l,c,r,rad,1)), v, on);
const mirror = g => { for (let r=0;r<H;r++) for (let c=0;c<W/2;c++) g[r][W-1-c] = g[r][c]; };

// a friendly eye: plum bead with a bright glint
function eye(g,c,r,rad,glint){
  disc(g,c,r,rad,7);
  px(g, c-Math.round(rad*0.4), r-Math.round(rad*0.4), glint);
  if (rad >= 3.4) px(g, c-Math.round(rad*0.4)+1, r-Math.round(rad*0.4), glint);
}
function outline(g,oc){
  const s = g.map(r=>r.slice());
  const nb = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
  for (let r=0;r<H;r++) for (let c=0;c<W;c++){
    if (s[r][c]!==0) continue;
    if (nb.some(([dr,dc]) => inb(c+dc,r+dr) && s[r+dr][c+dc]!==0)) g[r][c]=oc;
  }
}

const OUT = {}, P = {};

/* ================= NARWHAL ================= */
P.narwhal = {1:['#9db8e8','Blue'],2:['#fbf3f8','White'],3:['#ffd98a','Gold'],4:['#a8e6cf','Mint'],6:['#f6b3c6','Blush'],7:['#6e5a79','Plum']};
{ const g = make();
  disc(g,58,14,3.4,4); disc(g,65,22,2.4,4); disc(g,51,22,1.7,4);            // bubbles
  taper(g, bez([23,33],[16,22],[8,9]), 5.5, 1.8, 3);                        // the famous tusk
  poly(g, [[53,46],[66,29],[69,35],[60,46],[69,58],[65,64],[53,51]], 1);    // tail flukes
  ell(g,35,46,22,14,1);                                                     // body
  disc(g,20,42,10.5,1);                                                     // rounded brow
  shade(g,2,[1], l => ell(l,33,55,16,6,1));                                 // pale belly
  edged(g,1, l => poly(l,[[29,55],[43,58],[36,67],[26,63]],1));             // pectoral flipper
  eye(g,23,40,3.2,2);
  blush(g,16,47,3.4,6);
  curve(g, bez([14,49],[19,53],[25,51]), 1.8, 7);                           // smile
  outline(g,7);
  OUT.narwhal = g; }

/* ================= SLOTH ================= */
P.sloth = {1:['#cbb59c','Fawn'],2:['#fff1e0','Cream'],3:['#b0835a','Bark'],4:['#a8e6cf','Leaf'],6:['#f6b3c6','Blush'],7:['#6e5a79','Plum']};
{ const g = make();
  seg(g,0,9,71,12,7,3);                                                     // branch
  disc(g,9,5,4.5,4); disc(g,17,3,3.4,4); disc(g,59,4,4,4); disc(g,66,8,3,4);// leaves
  ell(g,35.5,51,15,17,1);                                                   // body
  shade(g,2,[1], l => ell(l,35.5,54,10,11,1));                              // tummy
  edged(g,1, l => { curve(l,[[28,43],[20,29],[14,16]],8,1);                 // arms reaching up
                    curve(l,[[43,43],[51,29],[57,16]],8,1); });
  seg(g,12,14,12,5,3,7); seg(g,17,14,17,5,3,7);                             // claws hooked over the branch
  seg(g,54,14,54,5,3,7); seg(g,59,14,59,5,3,7);
  disc(g,35.5,31,12.5,1);                                                   // head
  shade(g,2,[1], l => ell(l,35.5,33,9.5,8,1));                              // face mask
  ell(g,29,31,4.4,4,3); ell(g,42,31,4.4,4,3);                               // sleepy eye patches
  eye(g,29,31,2.6,2); eye(g,42,31,2.6,2);
  poly(g, [[33,36],[38,36],[35.5,39]], 7);                                  // nose
  curve(g, bez([31,41],[35.5,44],[40,41]), 1.8, 7);                         // smile
  blush(g,25,37,3.2,6); blush(g,46,37,3.2,6);
  edged(g,1, l => { disc(l,28,66,4,1); disc(l,43,66,4,1); });               // dangling feet
  outline(g,7);
  OUT.sloth = g; }

/* ================= TURTLE ================= */
P.turtle = {1:['#a5d98b','Green'],2:['#f2c777','Amber'],3:['#e0a04f','Rust'],4:['#fff1e0','Cream'],6:['#f6b3c6','Blush'],7:['#6e5a79','Plum']};
{ const g = make();
  disc(g,35.5,18,10,1);                                                     // head
  poly(g,[[32,62],[39,62],[35.5,69]],1);                                    // tail
  ell(g,35.5,44,24,20,4);                                                   // shell rim
  ell(g,35.5,44,21,17,2);                                                   // shell
  disc(g,35.5,44,6.5,3);                                                    // centre plate
  for (let k=0;k<6;k++){                                                    // ring of plates
    const a = -Math.PI/2 + k*Math.PI/3;
    disc(g, 35.5+Math.cos(a)*14.5, 44+Math.sin(a)*12, 5, 3);
  }
  edged(g,1, l => { ell(l,15,38,7.5,5.5,1); ell(l,18,60,6.5,5,1); });       // flippers tucked under the shell
  eye(g,31,16,2.8,4); eye(g,40,16,2.8,4);
  blush(g,26,22,3.2,6); blush(g,45,22,3.2,6);
  curve(g, bez([32,22],[35.5,25],[39,22]), 1.8, 7);                         // smile
  mirror(g);
  outline(g,7);
  OUT.turtle = g; }

/* ================= AXOLOTL ================= */
P.axolotl = {1:['#f9b6cf','Pink'],2:['#f58bb0','Rose'],3:['#fff1f6','White'],4:['#a8e6cf','Mint'],7:['#6e5a79','Plum']};
{ const g = make();
  // three feathery gills a side, all sweeping up and back like a little crown —
  // slim stems with a puff of three small bobbles at the tip
  for (const [ax,ay,bx,by] of [[27,21,19,7],[23,26,10,15],[21,33,6,28]]){
    taper(g, [[ax,ay],[bx,by]], 3.4, 2.2, 2);
    disc(g,bx,by,2.4,2); disc(g,bx-2,by-2.4,1.9,2); disc(g,bx+1,by-3,1.7,2);
  }
  ell(g,35.5,52,13,15,1);                                                   // body
  disc(g,35.5,32,15,1);                                                     // big round head
  shade(g,3,[1], l => ell(l,35.5,55,8.5,9,1));                              // belly
  edged(g,1, l => { seg(l,25,52,20,57,5,1); disc(l,19,58,3,1); });          // stubby arm
  eye(g,28,31,2.8,3);
  blush(g,25,39,3.6,2);
  curve(g, bez([29,40],[35.5,46],[42,40]), 2, 7);                           // wide happy smile
  mirror(g);
  disc(g,59,16,2.8,4); disc(g,65,24,1.9,4);                                 // bubbles (after mirroring)
  outline(g,7);
  OUT.axolotl = g; }

/* ================= CAPYBARA ================= */
P.capybara = {1:['#ceaa78','Tan'],2:['#f6e6cd','Cream'],3:['#ffa94d','Orange'],4:['#8fd18a','Leaf'],5:['#a97c52','Cocoa'],6:['#f6b3c6','Blush'],7:['#6e5a79','Plum']};
{ const g = make();
  disc(g,24,15,3.6,1);                                                      // small ear, high on the head
  sq(g,35.5,53,19,17,2.6,1);                                                // barrel body
  sq(g,35.5,29,16,13,3,1);                                                  // the blunt, blocky head
  shade(g,2,[1], l => ell(l,35.5,58,11,9,1));                               // chest
  shade(g,2,[1], l => sq(l,35.5,37,11.5,6,3,1));                            // long squared-off muzzle
  disc(g,24,15,1.7,6);                                                      // inner ear
  sq(g,35.5,33,5.5,2.6,2.6,5);                                              // broad nose
  px(g,32,33,7); px(g,39,33,7);                                             // nostrils
  curve(g, bez([32,39],[35.5,42],[39,39]), 1.8, 7);                         // unbothered mouth
  eye(g,26,25,2.4,2);
  blush(g,22,34,3.2,6);
  edged(g,5, l => ell(l,27,68,5.5,3,1));                                    // foot
  disc(g,35.5,11,6,3);                                                      // an orange, as is traditional
  mirror(g);
  ell(g,42,6,3.6,1.8,4);                                                    // one leaf (after mirroring)
  outline(g,7);
  OUT.capybara = g; }

/* ================= MANATEE ================= */
P.manatee = {1:['#c2b5d6','Lilac'],2:['#ece5f4','Pale'],3:['#8fd18a','Grass'],4:['#a8e6cf','Mint'],6:['#f6b3c6','Blush'],7:['#6e5a79','Plum']};
{ const g = make();
  disc(g,59,15,2.8,4); disc(g,66,23,1.9,4);                                 // bubbles
  // a manatee is one continuous teardrop: blunt head, no neck, gently narrowing
  // back to a tail that flares into a broad rounded paddle
  edged(g,3, l => { curve(l,[[8,71],[5,58]],3,1); curve(l,[[11,71],[14,60]],3,1);
                    curve(l,[[9,71],[9,56]],2.6,1); });                     // seagrass on the seabed
  seg(g,48,44,56,44,9,1);                                                   // slim peduncle
  ell(g,62,44,6,13,1);                                                      // paddle tail
  ell(g,34,44,21,15,1);                                                     // fat body
  disc(g,17,44,11,1);                                                       // blunt head
  shade(g,2,[1], l => ell(l,33,54,15,5,1));                                 // pale underside
  shade(g,2,[1], l => ell(l,10,47,5.5,6,1));                                // square muzzle pad, at the front
  edged(g,1, l => poly(l,[[24,54],[38,56],[31,66],[21,60]],1));             // flipper
  eye(g,21,38,2.8,2);
  blush(g,15,41,2.4,6);
  curve(g, bez([7,50],[10,52],[14,50]), 1.8, 7);                            // mouth on the pad
  px(g,9,44,7); px(g,12,45,7); px(g,8,47,7);                                // whisker dots
  outline(g,7);
  OUT.manatee = g; }

/* ================= BELUGA ================= */
P.beluga = {1:['#fbf3f8','White'],2:['#d4e6f7','Ice'],3:['#8fd3f4','Aqua'],6:['#f6b3c6','Blush'],7:['#6e5a79','Plum']};
{ const g = make();
  disc(g,13,14,3.4,3); disc(g,21,22,2.4,3); disc(g,7,24,1.7,3);             // bubbles
  poly(g,[[20,41],[8,30],[5,35],[14,46],[5,55],[8,60],[20,51]],1);          // two-lobed whale tail
  ell(g,38,46,21,14,1);                                                     // body
  disc(g,55,39,12,1);                                                       // bulbous melon forehead
  ell(g,66,46,5.5,4,1);                                                     // short beak
  shade(g,2,[1], l => ell(l,38,60,19,10,1));                                // underside, hugging the belly
  edged(g,1, l => poly(l,[[35,56],[49,58],[42,67],[31,62]],1));             // flipper
  curve(g, bez([70,46],[64,51],[56,49]), 1.8, 7);                           // the beluga smile
  eye(g,58,41,2.8,2);
  blush(g,64,45,2.8,6);
  outline(g,7);
  OUT.beluga = g; }

/* ================= DOLPHIN ================= */
P.dolphin = {1:['#8fbfe8','Sky'],2:['#fff4e9','Cream'],3:['#a8e6cf','Mint'],4:['#d8f3ff','Foam'],6:['#f6b3c6','Blush'],7:['#6e5a79','Plum']};
{ const g = make();
  rect(g,0,63,71,71,3);                                                     // the sea
  for (let k=0;k<9;k++) disc(g, 2+k*8.6, 63, 4.5, 3);                       // scalloped wave top
  for (let k=0;k<4;k++) disc(g, 9+k*18, 66, 2.2, 4);                        // foam
  // the dolphin rides on its own layer so it keeps a plum outline against the sea
  const P0=[14,42], P2=[62,38], A = bez(P0, apexCtl(P0,P2,38,28), P2, 44);
  const width = u => u<0.5 ? 6+u*2*7 : 13 - ((u-0.5)/0.5)*5;                // still 8 wide at the head
  const at = (i,off) => { const n=normalAt(A,i); return [A[i][0]+n[0]*off, A[i][1]+n[1]*off]; };
  const d = layer(l => {
    taperFn(l, A, width, 1);
    poly(l,[[17,40],[7,29],[4,34],[12,42],[4,51],[7,56],[17,44]],1);        // tail flukes
    const dr = 17, pf = 30;                                                 // fins hung off the back
    poly(l,[ at(dr,-5), at(dr+10,-4), at(dr+3,-15) ], 1);                   // swept dorsal fin
    poly(l,[ at(pf, 4), at(pf+8, 3), at(pf-1, 15) ], 1);                    // pectoral fin
    poly(l,[[60,35],[70,40],[69,44],[58,43]],1);                            // beak
    shade(l,2,[1], m => taperFn(m, A.map((p,i)=>at(i,3)), u => 3+u*5, 1));  // pale underside
    eye(l,54,35,2.8,2);
    curve(l, bez([69,43],[64,45],[57,42]), 1.8, 7);                         // smile along the beak
    blush(l,58,40,2.4,6);
    outline(l,7);
  });
  paste(g,d);
  outline(g,7);
  OUT.dolphin = g; }

/* ================= JELLYFISH ================= */
P.jellyfish = {1:['#c9a9e8','Lilac'],2:['#f5a9c7','Pink'],3:['#ecd9f7','Pale'],4:['#a8e6cf','Mint'],6:['#f6b3c6','Blush'],7:['#6e5a79','Plum']};
{ const g = make();
  for (let k=0;k<3;k++){                                                    // wavy tentacles, behind the bell
    const x = 14 + k*8, pts = [];
    for (let i=0;i<=10;i++) pts.push([x + Math.sin(i*0.85 + k*1.6)*4.5, 34+i*3.2]);
    curve(g, pts, 3.4, k===1 ? 4 : 2);
  }
  paste(g, layer(l => {                                                     // the bell, over the tentacles
    ell(l,35.5,30,20,16,1);
    rect(l,0,31,71,71,0);                                                   // keep the dome
    for (let k=0;k<3;k++) disc(l, 17+k*9, 31, 5, 1);                        // scalloped rim
  }));
  shade(g,3,[1], l => ell(l,26,20,7,4,1));                                  // shine
  eye(g,27,24,3.2,3);
  blush(g,21,31,3.2,6);
  curve(g, bez([30,31],[35.5,36],[41,31]), 2, 7);                           // smile
  seg(g,10,12,10,19,2,4); seg(g,6,15.5,14,15.5,2,4);                        // sparkle
  mirror(g);
  seg(g,35.5,38,35.5,66,3.4,2);                                             // centre tentacle
  outline(g,7);
  OUT.jellyfish = g; }

/* ================= FOAL ================= */
P.foal = {1:['#e2ab7d','Caramel'],2:['#fff1e0','Cream'],3:['#ffd98a','Blonde'],5:['#a97c52','Hoof'],6:['#f6b3c6','Blush'],7:['#6e5a79','Plum']};
{ const g = make();
  // the far pair of legs goes down first so the near pair can be outlined over it
  seg(g,25,48,23,64,6,1); seg(g,48,47,50,63,6,1);
  ell(g,23,65,3.4,2.6,5); ell(g,50,64,3.4,2.6,5);
  taper(g, bez([50,34],[61,42],[58,56]), 9, 4, 3);                            // swishy tail
  ell(g,38,42,17,13,1);                                                      // round foal barrel
  seg(g,28,38,17,25,12,1);                                                   // neck
  disc(g,16,21,8,1);                                                         // skull
  seg(g,13,25,9,33,9,1);                                                     // long muzzle
  poly(g,[[12,13],[10,4],[17,12]],1); poly(g,[[19,12],[22,3],[25,12]],1);    // pricked ears
  curve(g, bez([21,12],[25,20],[29,28]), 5.5, 3);                            // mane along the crest
  disc(g,18,10,4.4,3);                                                       // forelock
  shade(g,2,[1], l => seg(l,15,15,10,30,5,1));                               // blaze down the face
  shade(g,2,[1], l => disc(l,9,33,5,1));                                     // pale muzzle
  edged(g,1, l => { seg(l,31,49,31,65,6,1); seg(l,52,47,54,63,6,1); });       // near legs
  ell(g,31,66,3.6,2.6,5); ell(g,54,64,3.6,2.6,5);
  eye(g,14,20,2.8,2);
  blush(g,11,27,2.6,6);
  px(g,8,32,7);                                                              // nostril
  curve(g, bez([6,35],[9,37],[12,35]), 1.6, 7);                              // soft muzzle line
  outline(g,7);
  OUT.foal = g; }

/* ================= MERMAID ================= */
P.mermaid = {1:['#f7cfb0','Peach'],2:['#f0906f','Coral'],3:['#79cfc0','Teal'],4:['#a8e6cf','Aqua'],5:['#ffd9e8','Shell'],6:['#f6b3c6','Blush'],7:['#6e5a79','Plum']};
{ const g = make();
  disc(g,35.5,21,14,2);                                                      // hair, behind everything
  seg(g,23,26,20,49,10,2); disc(g,20,50,5,2);                                // long side fall
  ell(g,35.5,31,13,12,2);
  disc(g,35.5,23,11,1);                                                      // face
  shade(g,2,[1], l => ell(l,35.5,13,11,6,1));                                // bangs
  ell(g,35.5,41,9.5,11,1);                                                   // torso
  edged(g,1, l => { seg(l,27,36,25,45,5,1); disc(l,25,46,3,1); });           // arm hanging at her side
  taperFn(g, [[35.5,46],[35,51],[35.5,56]], u => 20-u*8, 3);                 // tail
  shade(g,4,[3], l => { for (let r=46;r<57;r+=4)                             // rows of scales
    for (let c=20;c<40;c+=5) disc(l, c + (Math.floor(r/4)%2 ? 2.5 : 0), r, 1.8, 1); });
  seg(g,35.5,57,19,63,10,3);                                                 // broad fluke lobe
  disc(g,31,38,3.4,5);                                                       // shell top
  eye(g,30,24,3.2,5);
  blush(g,25,29,3.2,6);
  curve(g, bez([32,30],[35.5,33],[39,30]), 1.8, 7);                          // smile
  mirror(g);
  outline(g,7);
  OUT.mermaid = g; }

/* ================= CALF ================= */
P.calf = {1:['#fdf6fa','White'],2:['#b0835a','Cocoa'],3:['#f9b6cf','Pink'],4:['#ffd98a','Butter'],6:['#f6b3c6','Blush'],7:['#6e5a79','Plum']};
{ const g = make();
  ell(g,14,21,6,4.5,1);                                                      // floppy ear, behind the head
  disc(g,27,9,3.4,4);                                                        // horn bud
  sq(g,35.5,51,19,17,2.6,1);                                                 // body
  sq(g,35.5,25,16.5,13.5,2.8,1);                                            // blocky calf head
  shade(g,3,[1], l => ell(l,13,21,3.6,2.4,1));                               // inner ear
  shade(g,3,[1], l => sq(l,35.5,33,10.5,6,3,1));                             // big soft muzzle
  seg(g,24,40,47,40,5,2);                                                    // collar
  edged(g,4, l => disc(l,35.5,47,4.2,1));                                    // bell
  px(g,32,32,7); px(g,33,32,7);                                              // nostril
  blush(g,22,30,3.2,6);
  curve(g, bez([32,36],[35.5,38],[39,36]), 1.6, 7);                          // mouth
  edged(g,2, l => ell(l,25,67,6,3.4,1));                                     // hoof
  mirror(g);
  rect(g,34,49,37,50,7);                                                     // bell slot
  // cows are lopsided: patches go on after mirroring, then the eyes on top
  ell(g,27,21,7.5,6.5,2); ell(g,23,56,7.5,6,2); ell(g,49,49,5.5,4.5,2);
  eye(g,27,22,3.2,1); eye(g,44,22,3.2,1);
  outline(g,7);
  OUT.calf = g; }

const order = ['narwhal','sloth','turtle','axolotl','capybara','manatee','beluga','dolphin','jellyfish',
               'foal','mermaid','calf'];
const names = {narwhal:'Narwhal', sloth:'Sloth', turtle:'Turtle', axolotl:'Axolotl', capybara:'Capybara',
               manatee:'Manatee', beluga:'Beluga', dolphin:'Dolphin', jellyfish:'Jellyfish',
               foal:'Baby Horse', mermaid:'Mermaid', calf:'Baby Cow'};

module.exports = { order, names, P, OUT, W, H };
