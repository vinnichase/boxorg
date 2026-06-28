# End-to-End Test Concept

BoxOrg uses E2E tests as a release gate for the core object workflow across representative screen sizes, OS versions, and real devices.

## Tooling

- Use **Maestro** for primary UI smoke tests. It drives the installed app from the outside and works well with Expo/React Native.
- Prefer simulator/emulator runs for fast layout and navigation coverage.
- Use real devices for camera, permissions, file-system behavior, touch gestures, and final release confidence.
- Add Appium/XCUITest or a device cloud only when we need automated real-iPhone coverage beyond local manual checks.

## Test Build

- Add an `e2e` EAS profile before implementing flows.
- Android E2E builds should produce an installable APK.
- iOS E2E builds should be internal/dev builds for registered devices.
- E2E builds must include stable `testID` values for every interacted control.

## Required Test Mode

Automated E2E should not depend on live camera input. Add an E2E mode that loads a deterministic test image from `assets/images/test/` so the same flow can run on every device.

Required stable selectors:

- `home.boxIdInput`
- `home.cameraButton` or `home.testImageButton`
- `segment.imageCanvas`
- `segment.confirmButton`
- `collect.objectTile`
- `collect.saveButton`
- `label.tagInput`
- `label.saveButton`
- `search.input`
- `search.result`
- `edit.saveButton`

## Smoke Flow

Every release candidate should pass one short happy-path smoke test:

1. Launch app.
2. Verify Home is visible.
3. Enter a box ID.
4. Load deterministic E2E test image.
5. Segment one object.
6. Add one tag.
7. Save object.
8. Search for the tag.
9. Open result.
10. Save from edit screen.

Keep smoke tests short. Detailed edge cases belong in focused unit or integration tests.

## Device Matrix

Run the smoke flow against this minimum matrix before App Store / Google Play submission:

| Platform | Device type | OS target | Purpose |
| --- | --- | --- | --- |
| iOS | small simulator | oldest supported iOS | Small-screen layout |
| iOS | large simulator | latest iOS | Current iPhone layout |
| Android | small/mid emulator | oldest supported API | Compatibility |
| Android | large emulator | latest API | Current Android layout |
| iOS | real iPhone | latest available | Camera, permissions, gestures |
| Android | real phone | latest available | Camera, files, permissions |

Do not chase every device model locally. Add cloud coverage only for regressions, paid release needs, or repeated device-specific bugs.

## Local Commands

List devices:

```bash
adb devices
xcrun simctl list devices
```

Run Maestro:

```bash
maestro --device <DEVICE_ID> test .maestro/smoke.yaml
```

Build release candidates:

```bash
npx eas build --profile e2e --platform all
```

## Release Rule

Production builds should only be submitted after:

- Unit tests pass.
- The Maestro smoke flow passes on the simulator/emulator matrix.
- One real iPhone and one real Android smoke test pass.
- Camera and permission prompts have been manually verified on at least one real device per platform.
