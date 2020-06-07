# TApp Developer Reference

[TOC]

Refer to the [main README.md](../README.md) for installation and deployment.

The static version of navigator is available at <http://localhost:8088/> if you ran `gram deploy`.

## For Developers

Build the dependencies:
`gram build-api navigator dev`

Then run:
`yarn start`
`yarn ios`
`yarn android`
`yarn browser`

Build iOS release version
`cordova build ios --release`

Build Android release version
`cordova build android --release`

### Navigator dev mode

Run `gram navigator` and turn on Developer Mode. To turn on developer mode just open the right-drawer navigation by clicking the icon in the bottom right corner

### Developer shell

Run `gram dev` to open a TApp developer shell. Run `gram helpdev` to see a list of commands

### WASM

@gram-net/wasm allows fift and func to interact with all manner of smart contracts directly on a mobile device.

#### Mobile testing: device only

Because of WASM compatibility issues, Testing most functionality works on mobile DEVICE ONLY. You can use the electron app for most development.

#### Using WASM modules on your own

You can check out examples of how FIFT/FUNC WASM modules are used in the `navigator/src/` directory (just search for `wasm` in those folders)

### Troubleshooting? You might want to clear local storage

Option 1: Open the navigation drawer, select 'Expert Mode', select 'Storage' from the Expert menu, and then select 'Clear' from the Storage screen

Option 2:  In the Electron Dev Tools UI, click console tab. at the bottom type in `window.localStorage.clear()` and press enter

### Android

#### You must prepare your Android dev environment with the correct PATH variables set in your .zshrc

#### OSX Android Environment setup reference guide

<https://gist.github.com/BitLox/40d3a4ab339a5f16d9393b5822b718e0>

#### You may also install Android Studio for a more automatic experience

#### OSX ~/.zshrc sample configuration:

```bash
export ANDROID_SDK_ROOT="/Users/YOURUSERNAME/Library/Android/sdk/"
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk1.8.0_212.jdk/Contents/Home
export PATH=${PATH}:/Users/YOURUSERNAME/Library/Android/sdk/tools
export PATH=${PATH}:/Users/YOURUSERNAME/Library/Android/sdk/platform-tools
export PATH=${PATH}:/Users/YOURUSERNAME/.fastlane/bin
```
