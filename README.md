# Clore Wallet App

## Usage

This project is a standard Next.js app, so the typical Next.js development process applies (`npm run dev` for browser-based development). However, there is one caveat: the app must be exported to deploy to iOS and Android, since it must run purely client-side. ([more on Next.js export](https://nextjs.org/docs/advanced-features/static-html-export))

To build the app, run:

```bash
npm run build
```

All the client side files will be sent to the `./out/` directory. These files need to be copied to the native iOS and Android projects, and this is where Capacitor comes in:

```bash
npm run sync
```

Finally, use the following run commands to run the app on each platform:

```bash
npm run ios
npm run android
```

## Livereload/Instant Refresh

To enable Livereload and Instant Refresh during development (when running `npm run dev`), find the IP address of your local interface (ex: `192.168.1.2`) and port your Next.js server is running on, and then set the server url config value to point to it in `capacitor.config.json`:

```json
{
  "server": {
    "url": "http://192.168.1.2:3000"
  }
}
```

Note: this configuration wil be easier in Capacitor 3 which [recently went into beta](https://capacitorjs.com/blog/announcing-capacitor-3-0-beta).

## API Routes

API Routes can be used but some minimal configuration is required. See [this discussion](https://github.com/mlynch/nextjs-tailwind-ionic-capacitor-starter/issues/4#issuecomment-754030049) for more information.

Installation into an existing Capacitor application.#
Note: these instructions require a Capacitor version of ^3.2.0

1. Build your webapp in your capacitor initiated project ('npm run build' for example).
2. Run npm i @capacitor-community/electron in your webapp project directory. This will install the platform for use with the @capacitor/cli.
3. Run npx cap add @capacitor-community/electron to initiate the platform, this will create the electron folder in your webapp project.
4. Run npx cap open @capacitor-community/electron to start your app in electron.

Note: You can use other npx cap commands with the platform by: npx cap <command> @capacitor-community/electron

# electron build envrionment

    "build": "tsc && electron-rebuild",
    "electron:start-live": "node ./live-runner.js",
    "electron:start": "npm run build && electron --inspect=5858 ./",
    "electron:pack": "npm run build && electron-builder build --dir -c ./electron-builder.config.json",
    "electron:make": "npm run build && electron-builder build -c ./electron-builder.config.json -p always",
    "build:mac": "electron-packager . --overwrite --asar=true --platform=darwin --arch=x64 --icon=assets/icons/mac/icon.icns --prune=true --out=release-builds",
    "build:windows": "electron-packager . --overwrite --asar=true --platform=win32 --arch=ia32 --icon=assets/icons/win/icon.ico --prune=true --out=release-builds --version-string.CompanyName=Clore --version-string.FileDescription=Clore --version-string.ProductName='Clore Wallet'",
    "build:linux": "electron-packager . --overwrite --asar=true --platform=linux --arch=x64 --icon=assets/icons/png/1024x1024.png --prune=true --out=release-builds"
