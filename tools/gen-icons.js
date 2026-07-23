// Generates app icons (PWA + App Store) from the flagship kitty — pure Node, no deps.
// Run:  node tools/gen-icons.js   ->  writes into icons/
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// ---- load characters.js (it assigns window.CHARACTERS) ----
global.window = {};
eval(fs.readFileSync(path.join(__dirname, '..', 'characters.js'), 'utf8'));
const kitty = window.CHARACTERS.find(c => c.id === 'kitty');
const G = kitty.grid, N = G.length;

// ---- minimal PNG encoder (RGBA=6 or RGB=2) ----
function crc32(buf){ let c=~0; for(let i=0;i<buf.length;i++){ c^=buf[i]; for(let k=0;k<8;k++) c=(c>>>1)^(0xEDB88320&-(c&1)); } return (~c)>>>0; }
function chunk(type,data){ const len=Buffer.alloc(4); len.writeUInt32BE(data.length,0);
  const t=Buffer.from(type,'ascii'); const body=Buffer.concat([t,data]);
  const crc=Buffer.alloc(4); crc.writeUInt32BE(crc32(body),0); return Buffer.concat([len,body,crc]); }
function encodePNG(w,h,rgba,channels){
  const sig=Buffer.from([137,80,78,71,13,10,26,10]);
  const ihdr=Buffer.alloc(13); ihdr.writeUInt32BE(w,0); ihdr.writeUInt32BE(h,4);
  ihdr[8]=8; ihdr[9]=channels===4?6:2;
  const rowLen=w*channels, raw=Buffer.alloc(h*(1+rowLen));
  for(let y=0;y<h;y++){ raw[y*(1+rowLen)]=0;
    for(let x=0;x<w;x++){ const s=(y*w+x)*4, d=y*(1+rowLen)+1+x*channels;
      raw[d]=rgba[s]; raw[d+1]=rgba[s+1]; raw[d+2]=rgba[s+2]; if(channels===4) raw[d+3]=rgba[s+3]; } }
  return Buffer.concat([sig, chunk('IHDR',ihdr), chunk('IDAT',zlib.deflateSync(raw,{level:9})), chunk('IEND',Buffer.alloc(0))]);
}
const hex = h => [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const lerp = (a,b,t) => Math.round(a+(b-a)*t);

// ---- draw one icon into an RGBA buffer ----
function drawIcon(size, {inset=0.66}={}){
  const A=hex('#ffe0f1'), B=hex('#c9b7f1');        // candy pink -> lavender, diagonal
  const rgba=new Uint8Array(size*size*4);
  for(let y=0;y<size;y++) for(let x=0;x<size;x++){
    const t=(x+y)/(2*size);
    const i=(y*size+x)*4;
    rgba[i]=lerp(A[0],B[0],t); rgba[i+1]=lerp(A[1],B[1],t); rgba[i+2]=lerp(A[2],B[2],t); rgba[i+3]=255;
  }
  const cell=Math.floor(size*inset/N);
  const ox=Math.round((size-cell*N)/2), oy=Math.round((size-cell*N)/2);
  for(let r=0;r<N;r++) for(let c=0;c<N;c++){
    const v=G[r][c]; if(v===0) continue;            // let the gradient show through
    const [cr,cg,cb]=hex(kitty.palette[v].hex);
    for(let dy=0;dy<cell;dy++) for(let dx=0;dx<cell;dx++){
      const x=ox+c*cell+dx, y=oy+r*cell+dy; if(x<0||y<0||x>=size||y>=size) continue;
      const i=(y*size+x)*4; rgba[i]=cr; rgba[i+1]=cg; rgba[i+2]=cb; rgba[i+3]=255;
    }
  }
  return rgba;
}

const outDir=path.join(__dirname,'..','icons');
fs.mkdirSync(outDir,{recursive:true});
const jobs=[
  {size:1024, name:'icon-1024.png', ch:3, inset:0.66},  // App Store — NO alpha channel
  {size:512,  name:'icon-512.png',  ch:4, inset:0.66},
  {size:512,  name:'icon-maskable-512.png', ch:4, inset:0.52}, // extra safe-zone padding
  {size:192,  name:'icon-192.png',  ch:4, inset:0.66},
  {size:180,  name:'icon-180.png',  ch:4, inset:0.66},  // apple-touch-icon
];
for(const j of jobs){
  const rgba=drawIcon(j.size,{inset:j.inset});
  fs.writeFileSync(path.join(outDir,j.name), encodePNG(j.size,j.size,rgba,j.ch));
  console.log('wrote icons/'+j.name+'  ('+j.size+'x'+j.size+(j.ch===3?', no-alpha':'')+')');
}

// Capacitor asset sources — feed `npx @capacitor/assets generate`
const resDir=path.join(__dirname,'..','resources');
fs.mkdirSync(resDir,{recursive:true});
fs.writeFileSync(path.join(resDir,'icon.png'), encodePNG(1024,1024, drawIcon(1024,{inset:0.66}), 4));
fs.writeFileSync(path.join(resDir,'splash.png'), encodePNG(2732,2732, drawIcon(2732,{inset:0.30}), 4));
console.log('wrote resources/icon.png (1024) and resources/splash.png (2732)');
