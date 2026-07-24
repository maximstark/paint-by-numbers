// Render characters.js to PNGs so the art can be reviewed by eye.
//   node tools/preview.js            -> preview/_sheet.png + preview/<id>.png
//   node tools/preview.js narwhal    -> just that one, bigger
const fs = require('fs');
const path = require('path');
const { encodePNG } = require('./png');

const root = path.join(__dirname, '..');
global.window = {};
eval(fs.readFileSync(path.join(root, 'characters.js'), 'utf8'));
const CHARS = global.window.CHARACTERS;

const only = process.argv[2];
const outDir = path.join(root, 'preview');
fs.mkdirSync(outDir, { recursive: true });

const hex = h => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];

function render(ch, scale){
  const R = ch.grid.length, C = ch.grid[0].length;
  const w = C*scale, h = R*scale;
  const buf = Buffer.alloc(w*h*3);
  for (let r=0;r<R;r++) for (let c=0;c<C;c++){
    const v = ch.grid[r][c];
    const [rr,gg,bb] = hex(v === 0 ? ch.bg : ch.palette[v].hex);
    for (let y=r*scale;y<(r+1)*scale;y++) for (let x=c*scale;x<(c+1)*scale;x++){
      const i = (y*w+x)*3; buf[i]=rr; buf[i+1]=gg; buf[i+2]=bb;
    }
  }
  return { w, h, buf };
}

if (only){
  const ch = CHARS.find(c => c.id === only);
  if (!ch){ console.error('no such character: ' + only); process.exit(1); }
  const { w, h, buf } = render(ch, 8);
  fs.writeFileSync(path.join(outDir, only + '.png'), encodePNG(w, h, buf));
  console.log('preview/' + only + '.png  (' + w + 'x' + h + ')');
  process.exit(0);
}

// contact sheet — every character at the same tile size, whatever its grid
const list = CHARS.map(ch => ({ ch, img: render(ch, Math.round(288 / ch.grid.length)) }));
const cols = 5, gap = 8, pad = 8;
const cw = Math.max(...list.map(l => l.img.w)), chh = Math.max(...list.map(l => l.img.h));
const rows = Math.ceil(list.length / cols);
const W = pad*2 + cols*cw + (cols-1)*gap, H = pad*2 + rows*chh + (rows-1)*gap;
const sheet = Buffer.alloc(W*H*3);
for (let i=0;i<W*H;i++){ const [r,g,b] = hex('#f6eefb'); sheet[i*3]=r; sheet[i*3+1]=g; sheet[i*3+2]=b; }
list.forEach((l, i) => {
  const gx = pad + (i % cols)*(cw+gap), gy = pad + Math.floor(i/cols)*(chh+gap);
  for (let y=0;y<l.img.h;y++) l.img.buf.copy(sheet, ((gy+y)*W + gx)*3, y*l.img.w*3, (y+1)*l.img.w*3);
});
fs.writeFileSync(path.join(outDir, '_sheet.png'), encodePNG(W, H, sheet));
for (const l of list) fs.writeFileSync(path.join(outDir, l.ch.id + '.png'), encodePNG(l.img.w, l.img.h, l.img.buf));
console.log('preview/_sheet.png (' + W + 'x' + H + ') + ' + list.length + ' individual PNGs');
