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
