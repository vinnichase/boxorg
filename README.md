<p align="center">
  <img src="assets/images/icon-rounded-border.png" width="112" alt="boxorg app icon">
</p>

<h1 align="center">boxorg</h1>

<p align="center"><b>Create order, meditatively.</b></p>

<p align="center"><a href="https://boxorg.app">boxorg.app</a></p>

Take a photo of your things, frame each item with your finger, into the box,
type in the number — with every frame your head gets a little clearer.

## You get to rethink

Your boxes don't need themes anymore: instead of a tool box, a toy box and
"misc" there are only numbers — you pack what fits into the box, not
necessarily what belongs together thematically. That way you use every box down
to the last corner. Where things are, boxorg remembers.

And when you're looking for something? Type a label or a box number — boxorg
shows you the photo and the box it's in.

## Finding things again

- Search by label: TOOLS, DECO, CHARGER
- Or by box: `#12` shows everything in box 12
- Every match comes with a picture — you recognize your things at a glance

## Your data is yours

- Everything stays on your device: no cloud, no account, no tracking
- Works completely offline, even in the basement or on the subway
- No data is collected at all

## Free forever

boxorg is open source — no ads, no subscription, no in-app purchases.

## Perfect for

- Moving: pack your boxes and still get to everything
- Basement, attic and storage room
- Seasonal stuff: decorations, ski gear, camping equipment
- Collections and workshop supplies

## Development

boxorg is a React Native app built with [Expo](https://expo.dev).

```bash
pnpm install
pnpm dev            # start the dev server (Expo Go)
pnpm ios            # start with iOS simulator target
pnpm test           # jest
pnpm lint           # eslint
```

See [docs/code-conventions.md](docs/code-conventions.md) for code style and
[docs/e2e.md](docs/e2e.md) for end-to-end testing notes.

### Building your own fork

To ship a fork under your own identity, set your bundle identifiers in a local
`.env` file (gitignored) — no tracked files need to change:

```bash
BOXORG_BUNDLE_ID=com.example.mybox
BOXORG_DEV_BUNDLE_ID=com.example.mybox.dev
```

## Contributing

Issues and pull requests are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE) — boxorg is free, open source, and will stay that way.
