# react-native-css — before/after captures

Device captures backing my open pull requests against
[nativewind/react-native-css](https://github.com/nativewind/react-native-css).

Each pair is shot on the same device, in the same run, differing only in the build of the
package under test.

## `images/3.1.0-rc.0/`

- **before** — the published `react-native-css@3.1.0-rc.0`, plus what my test app needs from
  my other patches to run: the `native` and `native-internal` subpath exports, PR 459,
  cascade-layer ranking, and a shim that compiles a class-qualified `:root` inert.
- **after** — the same app with my open pull requests applied.

Captured on an Android 16 emulator (API 36), 1140×2400 @ 480dpi. Every frame carries a
`build-probe marker=` line read off the device: `gallery-minimum` names the `before` build and
`absent` the `after` one, and the capture harness refuses a frame whose marker disagrees with
the variant it claims.

`pr-389-…-before.png` is cropped to the render error's header.

## `images/`

Pairs captured on `react-native-css@3.0.7`, against each pull request's earlier revision. They
stay so the earlier revisions of my evidence comments still render; each pull request's current
comment shows its `3.1.0-rc.0` pair, or says why it has none.

`pr-422-…-before.png` is cropped to its error surface — the stack frames below it carried
absolute paths from my working tree.

## `images/example-app/`

- **before** — the library's own example app, built against `main` at the pull request's base.
- **after** — the same app built against the pull request's head.

Release builds of the app, so each APK carries its own bundle. Captured on an Android 16 emulator (API 36),
1140×2400 @ 480dpi. Each run first reads a property the fix changes off the device's view tree and refuses
a build whose reading disagrees with the variant it claims.

## `images/example-app-ios/`

- **before** — the library's own example app, built against `main`.
- **after** — the same app built against `main` with the pull request merged in.

Release builds for an iPhone 12 Pro Max on iOS 27.0.1, made with Xcode 27.1, so both sides also carry what the
example needs to build and launch there: `expo` 57.0.31 and the UIKit scene life cycle. Each capture first reads
the installed app's build number off the device and refuses one that disagrees with the variant it claims. iOS
hands back a frame in Display P3 when it holds wide-colour content, so every frame is converted to sRGB through
its own profile before it is cropped.
