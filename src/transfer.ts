import { execSync } from 'child_process';
import { join } from 'path';
import { spinner } from '@clack/prompts';
import { getFolderSize, formatSize } from './utils';
import { statSync } from 'fs';

export type TransferDirection = 'pc-to-phone' | 'phone-to-pc';

export interface TransferItem {
  sourcePath: string;
  name: string;
  isDirectory: boolean;
}

/**
 * Transfer files/folders from PC to Phone or Phone to PC
 */
export async function transfer(
  items: TransferItem[],
  destinationBasePath: string,
  direction: TransferDirection
): Promise<void> {
  for (const item of items) {
    const s = spinner();
    s.start(`Transferring: ${item.name}`);

    const destinationPath = join(destinationBasePath, item.name);

    try {
      let itemSize = 0;
      const startTime = Date.now();

      // Calculate size based on direction
      if (direction === 'pc-to-phone') {
        // For PC to Phone, calculate local file/folder size
        itemSize = item.isDirectory ? getFolderSize(item.sourcePath) : statSync(item.sourcePath).size;

        // Execute ADB push
        execSync(`adb push "${item.sourcePath}" "${destinationPath}"`, { stdio: 'pipe' });
      } else {
        // For Phone to PC, we'll estimate size or skip calculation for now
        // (Getting file size from phone requires additional adb commands)

        // Execute ADB pull
        execSync(`adb pull "${item.sourcePath}" "${destinationPath}"`, { stdio: 'pipe' });

        // Calculate size after pulling
        itemSize = item.isDirectory ? getFolderSize(destinationPath) : statSync(destinationPath).size;
      }

      // Calculate elapsed time and speed
      const elapsed = (Date.now() - startTime) / 1000;
      const speed = itemSize / elapsed / 1024 / 1024;

      s.stop(`✓ ${item.name} - ${formatSize(itemSize)} - ${elapsed.toFixed(1)}s - ${speed.toFixed(2)} MB/s`);
    } catch (error) {
      s.stop(`✗ ${item.name} - Transfer failed: ${error}`);
    }
  }
}
