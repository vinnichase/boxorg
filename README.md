# boxorg

**Know what's in the box.** Photograph a box, frame the items with your finger,
assign a box number — done. When you look for something later, search by name
or box number and instantly see which box it's in, with a picture.

No typing out inventory lists. No cloud, no account, no tracking — everything
stays on your device.

## How it works

1. **Photograph** the open box before you close it
2. **Frame** each item by dragging a square around it
3. **Tag** the items and give the run a box number (override per item if needed)
4. **Search** anytime — by tag or `#boxnumber` — and find the right box

## Privacy

boxorg is local-first by design: all data lives in a SQLite database and image
files on your device. The app works completely offline and collects nothing.

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

## Contributing

Issues and pull requests are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE) — boxorg is free, open source, and will stay that way.
