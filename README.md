# react-native-css — before/after captures

Device captures backing my open pull requests against
[nativewind/react-native-css](https://github.com/nativewind/react-native-css).

Each pair is shot on the **same device, in the same run**, differing only in whether the
package under test is patched:

- **before** — stock `react-native-css@3.0.7`
- **after** — the same build with the PR's fix applied

Captured on an Android 36 emulator at 1140×2400 @ 480dpi. Every frame carries a
`build-probe width=<dp>` line, which is how the capture harness proves which build produced
it: the value is a rem-derived box that only resolves correctly on a patched build, and a
capture whose probe disagrees with the variant it claims is refused rather than saved.

`pr-422-…-before.png` is cropped to its error surface — the stack frames below it carried
absolute paths from my working tree.
