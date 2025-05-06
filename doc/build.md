# 🛠️ Build & Development Guide
#### This guide outlines how to set up your development environment and build the Electron app for production across different platforms.

## 📦 Development Setup
#### To start developing the application locally, use the following commands in separate terminals:

### 1. Frontend Development Server

```bash
 npm run dev 
 ```

- Starts the Next development server
- Auto-reloads on UI code changes

2. Electron Main Process (Live Reload)
   
```bash    
npm run electron:dev
```
   

- Watches for changes in main.js, preload.js, etc.

## 🚀 Production Builds
#### Use the following commands to create platform-specific builds. These produce installable binaries in the dist/ directory.

### macOS

```bash 
npm run electron:build:mac:arm
```
  	
- Apple Silicon (arm64)	dist/mac-arm64/*.dmg

```bash 
npm run electron:build:mac:universal
```
- Universal (x64 + arm64)	dist/mac/*.dmg

### Linux

```bash
npm run electron:build:linux:arm	
```
- ARM (Raspberry Pi, etc.)	dist/linux-armv7l/*.AppImage`

```bash
npm run electron:build:linux:64
```
- x64	dist/linux-unpacked/ or .AppImage

### Windows

```bash
npm run electron:build:win:32 
```
- 32-bit	dist/win-ia32/*.exe
```bash
npm run electron:build:win:64
```
- 64-bit	dist/win-unpacked/*.exe