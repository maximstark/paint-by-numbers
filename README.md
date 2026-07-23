# 🎨 Paint by Numbers

A tiny, adorable **paint-by-numbers game for little artists**, made for playing on a
tablet in the browser. Tap a color, then fill in the matching numbers to reveal a
cute pixel character. Starts with a candy-pastel **kitty cat** 🐱.

Built as a gift for my daughter after one too many junky app-store games — so it's
**fully open source**, ad-free, tracker-free, and works completely offline.

**▶ Play it here:** https://maximstark.github.io/paint-by-numbers/

<p align="center">
  <img src="screenshot.png" alt="The finished candy-pastel pixel kitty" width="360">
</p>

## How to play

1. Tap **▶ Play**.
2. Tap a **color** at the bottom. The squares that match it gently glow.
3. **Tap or drag** across those squares to paint them.
4. Fill every number to finish the picture — then enjoy the confetti! 🎉

Little touches for little hands:
- **Big chunky pixels** and large touch targets.
- The chosen color’s squares **light up** so it’s easy to find where to paint.
- Wrong squares just do a friendly **wiggle** — you can’t "ruin" the picture.
- Finished colors get a **✓**, and it hops to the next color for you.
- Gentle tap sounds + a happy chime (there’s a 🔊/🔇 button to mute).
- **↺ Start over** button, with a "Are you sure?" so it isn’t tapped by accident.

## Run it yourself

It's a **single `index.html` file** with no build step and no dependencies.

- Easiest: just open `index.html` in a browser. (For the sound to work you may need
  to serve it — see below.)
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

Everything is data-driven, so a new character is just a small object. Open
`index.html` and look for the `KITTY` object near the top of the `<script>`:

```js
const NEWPAL = {
  id: 'bunny',
  name: 'Bunny',
  bg: '#eae2f6',                       // soft background color (not painted)
  palette: {                           // number -> { hex, name }
    1: { hex:'#ffffff', name:'White' },
    2: { hex:'#ffd7e6', name:'Pink'  },
    // ...up to about 10 colors works great for kids
  },
  grid: [                              // rows of color numbers; 0 = background
    [0,0,1,1,0,0],
    [0,1,2,2,1,0],
    // ...any width/height you like (square-ish looks best)
  ],
};
```

Then add it to the `CHARACTERS` array. The grid is a plain 2-D array where each
number is the color that square should be painted, and `0` means "leave as
background." Keep the pixels chunky (roughly 14–20 squares wide) and it’ll stay easy
and cute.

Pull requests with new characters are very welcome! 💖

## License

[MIT](LICENSE) — do anything you like with it. Made with love for kids everywhere.
