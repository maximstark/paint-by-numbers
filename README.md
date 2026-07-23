# 🎨 Paint by Numbers

A tiny, adorable **paint-by-numbers game for little artists**, made for playing on a
tablet in the browser. Pick a cute pixel character, tap a color, and fill in the
matching numbers to reveal it. Comes with **seven candy-pastel characters** 🐱🐶🐰🐻🐥🦊🐸.

Built as a gift for my daughter after one too many junky app-store games — so it's
**fully open source**, ad-free, tracker-free, and works completely offline.

**▶ Play it here:** https://maximstark.github.io/paint-by-numbers/

<p align="center">
  <img src="screenshot.png" alt="The seven paintable pixel characters: kitty, puppy, bunny, bear, chick, fox, frog" width="640">
</p>

## How to play

1. **Pick a picture** from the gallery (kitty, puppy, bunny, bear, chick, fox, frog).
2. Tap a **color** at the bottom. The squares that match it gently glow.
3. **Tap or drag** across those squares to paint them.
4. Fill every number to finish the picture — then enjoy the confetti! 🎉

Little touches for little hands:
- **Big, friendly pixels** and large touch targets.
- The chosen color’s squares **light up** so it’s easy to find where to paint.
- Wrong squares just do a friendly **wiggle** — you can’t "ruin" the picture.
- Finished colors get a **✓**, and it hops to the next color for you.
- **Progress is saved** for each picture, so she can stop and come back later. Finished
  pictures earn a ⭐ in the gallery.
- Gentle tap sounds + a happy chime (there’s a 🔊/🔇 button to mute).
- **🏠 pick another picture** and **↺ start over** buttons (start-over asks first, so it
  isn’t tapped by accident).

## Run it yourself

No build step, no dependencies — just `index.html` plus a `characters.js` data file.

- Easiest: open `index.html` in a browser. (For sound, you may need to serve it — below.)
- Local server (recommended for tablets on your home network):

  ```bash
  # from inside the project folder
  python -m http.server 8000
  # then open http://<your-computer-ip>:8000 on the tablet
  ```

### Add it to a tablet’s home screen
Open the live URL (or your local server) in the tablet browser, then use
**“Add to Home Screen.”** It launches full-screen like a real app, and works with no
internet once loaded.

## Add your own character

Characters are drawn with simple shape primitives in [`tools/gen.js`](tools/gen.js) —
circles, ellipses, rectangles, triangles — plus an automatic outline. It's much easier
than placing pixels by hand. For example:

```js
disc(g, CX, 15, 8.6, 1);          // a round head in color 1
disc(g, 9, 8, 3.6, 1); disc(g, 26, 8, 3.6, 1);   // two round ears
rect(g, 12, 15, 13, 17, 7);       // an eye in color 7 (the plum outline color)
outline(g, 7);                    // auto-draw the border around everything
```

To add a character:

1. Add a `palette` (number → `{hex, name}`) and a drawing block in `tools/gen.js`,
   then list its `id` in the `order`/`names` maps at the bottom.
2. Run `node tools/gen.js` — it rewrites `characters.js` and prints a text preview of
   each sprite so you can eyeball it.
3. Refresh the game; the new character appears in the gallery automatically.

Prefer raw pixels? You can also edit `characters.js` directly — each character is
`{ id, name, bg, palette, grid }`, where `grid` is a 2-D array of color numbers and
`0` means "background, not painted." The current characters are **36×36**.

Pull requests with new characters are very welcome! 💖

## License

[MIT](LICENSE) — do anything you like with it. Made with love for kids everywhere.
