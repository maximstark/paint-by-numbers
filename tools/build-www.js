// Assemble a clean web-only folder for Capacitor to bundle into the iOS app.
// The live website is served from the repo root; this just copies the runtime
// assets (no tools/, no node_modules) into www/ so `cap sync` stays clean.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const www = path.join(root, 'www');
fs.rmSync(www, { recursive: true, force: true });
fs.mkdirSync(www, { recursive: true });

for (const f of ['index.html', 'characters.js', 'manifest.webmanifest', 'sw.js']) {
  fs.copyFileSync(path.join(root, f), path.join(www, f));
}
fs.cpSync(path.join(root, 'icons'), path.join(www, 'icons'), { recursive: true });

console.log('built www/ (' + fs.readdirSync(www).join(', ') + ')');
