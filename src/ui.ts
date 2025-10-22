import { select, multiselect, text, isCancel, confirm } from '@clack/prompts';
import { execSync } from 'child_process';
import { join } from 'path';
import { loadConfig, addPcPath, addPhonePath, validatePcPath, validatePhonePath } from './config';
import { listItems } from './utils';
import type { TransferDirection, TransferItem } from './transfer';

/**
 * Show lobby menu to select transfer direction
 */
export async function showLobby(): Promise<TransferDirection | null> {
  const direction = await select({
    message: 'Select transfer direction:',
    options: [
      { value: 'pc-to-phone' as const, label: 'Copy from PC to Phone' },
      { value: 'phone-to-pc' as const, label: 'Copy from Phone to PC' }
    ]
  });

  if (isCancel(direction)) {
    return null;
  }

  return direction;
}

/**
 * Select a path (either PC or Phone)
 */
export async function selectPath(type: 'pc' | 'phone'): Promise<string | null> {
  const config = loadConfig();
  const paths = type === 'pc' ? config.pcPaths : config.phonePaths;

  const options = [
    ...paths.map((path) => ({ value: path, label: path })),
    { value: '__manual__', label: '+ Enter path manually' }
  ];

  if (options.length === 1) {
    // Only manual input option available
    return await manualPathInput(type);
  }

  const selected = await select({
    message: `Select ${type === 'pc' ? 'PC' : 'Phone'} path:`,
    options
  });

  if (isCancel(selected)) {
    return null;
  }

  if (selected === '__manual__') {
    return await manualPathInput(type);
  }

  return selected as string;
}

/**
 * Manual path input with validation
 */
async function manualPathInput(type: 'pc' | 'phone'): Promise<string | null> {
  const pathInput = await text({
    message: `Enter ${type === 'pc' ? 'PC' : 'Phone'} path:`,
    placeholder: type === 'pc' ? '/home/user/documents' : '/sdcard/Download',
    validate: (value) => {
      if (!value) return 'Path cannot be empty';
      return undefined;
    }
  });

  if (isCancel(pathInput)) {
    return null;
  }

  const path = pathInput as string;

  // Validate path
  const isValid = type === 'pc' ? validatePcPath(path) : validatePhonePath(path);

  if (!isValid) {
    console.error(`Error: Path does not exist: ${path}`);
    return null;
  }

  // Ask to save path
  const shouldSave = await confirm({
    message: 'Save this path for future use?',
    initialValue: true
  });

  if (!isCancel(shouldSave) && shouldSave) {
    if (type === 'pc') {
      addPcPath(path);
    } else {
      addPhonePath(path);
    }
  }

  return path;
}

/**
 * List items from phone path using ADB
 */
function listPhoneItems(path: string): Array<{ name: string; isDirectory: boolean }> {
  try {
    // Use adb shell ls -F to differentiate files and directories
    // Directories will have '/' suffix
    const output = execSync(`adb shell "ls -F '${path}' 2>/dev/null"`, {
      stdio: 'pipe',
      encoding: 'utf-8'
    }).trim();

    if (!output) return [];

    return output.split('\n').map((item) => {
      const isDirectory = item.endsWith('/');
      const name = isDirectory ? item.slice(0, -1) : item;
      return { name, isDirectory };
    });
  } catch (error) {
    throw new Error(`Failed to list phone items: ${error}`);
  }
}

/**
 * Select files/folders from a path
 */
export async function selectItems(
  path: string,
  type: 'pc' | 'phone'
): Promise<TransferItem[] | null> {
  // List items
  const items = type === 'pc' ? listItems(path) : listPhoneItems(path);

  if (items.length === 0) {
    console.log('No items found in this directory.');
    return null;
  }

  // Prepare options for multiselect
  const options = items.map((item) => ({
    value: item.name,
    label: item.isDirectory ? `📁 ${item.name}` : `📄 ${item.name}`
  }));

  const selected = await multiselect({
    message: 'Select items to transfer:',
    options,
    required: true
  });

  if (isCancel(selected)) {
    return null;
  }

  const selectedNames = selected as string[];
  const transferItems: TransferItem[] = [];

  // Process selected items
  for (const name of selectedNames) {
    const item = items.find((i) => i.name === name);
    if (!item) continue;

    const sourcePath = join(path, name);

    // If it's a directory, ask whether to copy whole or select inside
    if (item.isDirectory) {
      const action = await select({
        message: `"${name}" is a directory. What would you like to do?`,
        options: [
          { value: 'whole', label: 'Copy entire directory' },
          { value: 'browse', label: 'Select files inside' }
        ]
      });

      if (isCancel(action)) {
        continue;
      }

      if (action === 'whole') {
        transferItems.push({
          sourcePath,
          name,
          isDirectory: true
        });
      } else {
        // Browse inside and select items
        const nestedItems = await selectItems(sourcePath, type);
        if (nestedItems) {
          transferItems.push(...nestedItems);
        }
      }
    } else {
      // It's a file
      transferItems.push({
        sourcePath,
        name,
        isDirectory: false
      });
    }
  }

  return transferItems.length > 0 ? transferItems : null;
}
