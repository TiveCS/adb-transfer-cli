# ADB Transfer CLI

A bidirectional command-line tool for transferring files and folders between your PC and Android device via ADB (Android Debug Bridge).

## Features

- **Bidirectional transfer**: PC → Phone and Phone → PC
- **Multi-path support**: Register and save frequently used paths
- **Manual path input**: Enter custom paths on-the-fly
- **Interactive selection**: Browse and select files/folders with `@clack/prompts`
- **Nested browsing**: Choose to copy entire directories or select files inside
- **Real-time progress**: Transfer statistics (size, time, speed)
- **Auto-save paths**: Automatically save manually entered paths for future use

## Prerequisites

### 1. Bun Runtime

Install Bun if you haven't already:

```bash
curl -fsSL https://bun.sh/install | bash
```

### 2. ADB (Android Debug Bridge)

#### **Ubuntu/Debian**
```bash
sudo apt update
sudo apt install adb
```

#### **Fedora/RHEL**
```bash
sudo dnf install android-tools
```

#### **Arch Linux**
```bash
sudo pacman -S android-tools
```

#### **macOS**
```bash
brew install android-platform-tools
```

#### **Windows**
1. Download [Android SDK Platform Tools](https://developer.android.com/studio/releases/platform-tools)
2. Extract the ZIP file
3. Add the folder to your system PATH

Verify ADB installation:
```bash
adb --version
```

## Android Device Setup

### 1. Enable Developer Options
1. Open **Settings** on your Android device
2. Go to **About Phone**
3. Tap **Build Number** 7 times until you see "You are now a developer"

### 2. Enable USB Debugging
1. Go back to **Settings**
2. Open **Developer Options** (or **System > Developer Options**)
3. Enable **USB Debugging**

### 3. Connect Your Device
1. Connect your Android device to your computer via USB
2. On your device, a prompt will appear asking to "Allow USB debugging"
3. Check "Always allow from this computer" and tap **OK**

### 4. Verify Connection
```bash
adb devices
```

You should see your device listed:
```
List of devices attached
XXXXXXXXXX    device
```

If you see "unauthorized", check your phone for the authorization prompt.

## Installation

1. Clone or download this project:
```bash
git clone <repository-url>
cd adb-transfer-cli
```

2. Install dependencies:
```bash
bun install
```

3. (Optional) Pre-configure paths in `app.config.json`:
```json
{
  "pcPaths": [
    "/home/user/Documents/Files",
    "/home/user/Downloads"
  ],
  "phonePaths": [
    "/sdcard/Download",
    "/sdcard/DCIM"
  ]
}
```

**Note**: You can also add paths during runtime via manual input, which will be automatically saved to the config file.

## Usage

### Run the tool:

```bash
./index.ts
```

Or:

```bash
bun start
```

Or:

```bash
bun run transfer
```

### Interactive Flow:

1. **Select transfer direction**:
   ```
   ◆ Select transfer direction:
   │  ○ Copy from PC to Phone
   │  ○ Copy from Phone to PC
   └
   ```

2. **Select source path** (from registered paths or manual input):
   ```
   ◆ Select PC path:
   │  ○ /home/user/Documents
   │  ○ /home/user/Downloads
   │  ○ + Enter path manually
   └
   ```

3. **Select files/folders** from source:
   ```
   ◆ Select items to transfer:
   │  ☑ 📁 Photos
   │  ☑ 📄 document.pdf
   │  ☐ 📁 Videos
   └
   ```

4. **For directories**: Choose to copy whole or browse inside:
   ```
   ◆ "Photos" is a directory. What would you like to do?
   │  ○ Copy entire directory
   │  ○ Select files inside
   └
   ```

5. **Select destination path** (from registered paths or manual input)

6. **Transfer with progress**:
   ```
   ⠋ Transferring: Photos
   ✓ Photos - 245.67 MB - 12.3s - 19.97 MB/s
   ```

## Troubleshooting

### Device Not Found
```bash
# List connected devices
adb devices

# Restart ADB server
adb kill-server
adb start-server
```

### Permission Denied
- Ensure USB debugging is enabled
- Re-authorize your computer on the device
- Try a different USB cable or port
- Check USB connection mode (should be "File Transfer" or "MTP")

### Cannot Write to Target Folder
```bash
# Test if target folder is writable
adb shell ls -la /sdcard/

# Create target folder manually
adb shell mkdir -p /sdcard/Manga
```

### Transfer Speed Is Slow
- Use USB 3.0 port if available
- Close other ADB connections
- Avoid USB hubs
- Enable "USB Tethering" on some devices for faster transfers

### "No items found" Error
- Verify the path exists and is accessible
- Check permissions for PC folders
- For phone paths, ensure the device is connected and authorized

## Project Structure

```
adb-transfer-cli/
├── app.config.json     # Path configuration
├── index.ts            # Main entry point
├── package.json        # Project dependencies
├── src/
│   ├── config.ts       # Config management
│   ├── transfer.ts     # Transfer logic
│   ├── ui.ts           # Interactive UI
│   └── utils.ts        # Helper functions
└── README.md           # This file
```

## Technical Details

- **Runtime**: Bun
- **Language**: TypeScript
- **UI Library**: @clack/prompts
- **Transfer Method**: ADB push/pull commands
- **Transfer Mode**: Sequential (one item at a time)
- **Direction**: Bidirectional (PC ↔ Phone)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
