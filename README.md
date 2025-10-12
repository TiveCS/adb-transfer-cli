# Manga Transfer CLI

A command-line tool for transferring manga folders from your local machine to an Android device via ADB (Android Debug Bridge).

## Features

- Interactive folder selection with `@clack/prompts`
- "Select All" option for bulk transfers
- Real-time progress indicators
- Transfer statistics (size, time, speed)
- Error handling and graceful failures

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

3. Configure environment variables:
```bash
# Edit .env file
nano .env
```

Update with your paths:
```env
SOURCE_FOLDER=/absolute/path/to/your/manga/folders
TARGET_FOLDER=/sdcard/Manga
```

**Note**:
- `SOURCE_FOLDER`: The directory containing your manga folders on your computer
- `TARGET_FOLDER`: The destination directory on your Android device (common paths: `/sdcard/`, `/storage/emulated/0/`, `/storage/sdcard0/`)

## Usage

### Run the tool:

```bash
./transfer.ts
```

Or:

```bash
bun transfer.ts
```

Or use the npm script:

```bash
bun run transfer
```

### Interactive Flow:

1. The tool will scan your `SOURCE_FOLDER` for directories
2. You'll see an interactive selection menu:
   ```
   ◆ Select folders to transfer:
   │  ○ Select All
   │  ○ One Piece
   │  ○ Naruto
   │  ○ Bleach
   └
   ```
3. Use arrow keys to navigate, space to select, enter to confirm
4. Selected folders will be transferred sequentially with progress indicators
5. After completion, you'll see statistics for each transfer:
   ```
   ✓ One Piece - 245.67 MB - 12.3s - 19.97 MB/s
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

### "No folders found" Error
- Verify `SOURCE_FOLDER` path in `.env` is correct and absolute
- Ensure the folder contains subdirectories (not just files)

## Project Structure

```
adb-transfer-cli/
├── .env                # Environment configuration
├── package.json        # Project dependencies
├── transfer.ts         # Main transfer script
└── README.md          # This file
```

## Technical Details

- **Runtime**: Bun
- **Language**: TypeScript
- **UI Library**: @clack/prompts
- **Transfer Method**: ADB push command
- **Transfer Mode**: Sequential (one folder at a time)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
