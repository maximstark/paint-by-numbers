// Tiny dependency-free PNG writer (8-bit RGB) — used by tools/preview.js so the
// artwork can be eyeballed as a real image instead of ASCII.
const zlib = require('zlib');

let TABLE = null;
function table(){
  if (TABLE) return TABLE;
  TABLE = new Int32Array(256);
  for (let n=0;n<256;n++){ let c=n; for (let k=0;k<8;k++) c = (c&1) ? (0xEDB88320 ^ (c>>>1)) : (c>>>1); TABLE[n]=c; }
  return TABLE;
}
function crc32(buf){
  const t = table();
  let c = 0xFFFFFFFF;
  for (let i=0;i<buf.length;i++) c = t[(c ^ buf[i]) & 255] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}
function chunk(type, data){
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const td  = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td), 0);
  return Buffer.concat([len, td, crc]);
}

// rgb: Buffer of w*h*3 bytes
function encodePNG(w, h, rgb){
  const sig  = Buffer.from([137,80,78,71,13,10,26,10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w,0); ihdr.writeUInt32BE(h,4);
  ihdr[8]=8; ihdr[9]=2;                       // 8-bit, truecolour
  const stride = w*3;
  const raw = Buffer.alloc((stride+1)*h);
  for (let y=0;y<h;y++){ raw[y*(stride+1)] = 0; rgb.copy(raw, y*(stride+1)+1, y*stride, (y+1)*stride); }
  return Buffer.concat([sig, chunk('IHDR',ihdr), chunk('IDAT', zlib.deflateSync(raw,{level:9})), chunk('IEND', Buffer.alloc(0))]);
}

module.exports = { encodePNG };
