#!/usr/bin/env bun

import { intro, outro, multiselect, spinner, isCancel } from '@clack/prompts';
import { config } from 'dotenv';
import { execSync } from 'child_process';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

// Load environment variables
config();

const SOURCE_FOLDER = process.env.SOURCE_FOLDER;
const TARGET_FOLDER = process.env.TARGET_FOLDER;

/**
 * Recursively calculate the total size of a folder in bytes
 */
function getFolderSize(path: string): number {
  let totalSize = 0;

  try {
    const stats = statSync(path);

    if (stats.isFile()) {
      return stats.size;
    }

    if (stats.isDirectory()) {
      const files = readdirSync(path);
      for (const file of files) {
        totalSize += getFolderSize(join(path, file));
      }
    }
  } catch (error) {
    // Ignore errors (permission issues, etc.)
  }

  return totalSize;
}

/**
 * Format bytes to human-readable size (B/KB/MB)
 */
function formatSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}

/**
 * Main function
 */
async function main() {
  intro('Manga Transfer Tool');

  // Validate environment variables
  if (!SOURCE_FOLDER || !TARGET_FOLDER) {
    console.error('Error: SOURCE_FOLDER and TARGET_FOLDER must be set in .env file');
    process.exit(1);
  }

  // Discover folders
  let folders: string[];
  try {
    const items = readdirSync(SOURCE_FOLDER);
    folders = items.filter((item) => {
      const fullPath = join(SOURCE_FOLDER, item);
      return statSync(fullPath).isDirectory();
    });
  } catch (error) {
    console.error(`Error reading source folder: ${error}`);
    process.exit(1);
  }

  // Check if any folders found
  if (folders.length === 0) {
    console.log('No folders found in source directory.');
    process.exit(0);
  }

  // Prepare multiselect options
  const options = [
    { value: '__all__', label: 'Select All' },
    ...folders.map((folder) => ({ value: folder, label: folder }))
  ];

  // Prompt for selection
  const selected = await multiselect({
    message: 'Select folders to transfer:',
    options,
    required: true
  });

  // Handle cancellation
  if (isCancel(selected)) {
    outro('Transfer cancelled');
    process.exit(0);
  }

  // Determine which folders to transfer
  let foldersToTransfer: string[];
  if (selected.includes('__all__')) {
    foldersToTransfer = folders;
  } else {
    foldersToTransfer = selected as string[];
  }

  // Transfer folders
  for (const folder of foldersToTransfer) {
    const s = spinner();
    s.start(`Transferring: ${folder}`);

    const sourcePath = join(SOURCE_FOLDER, folder);
    const targetPath = join(TARGET_FOLDER, folder);

    // Calculate folder size
    const folderSize = getFolderSize(sourcePath);

    // Record start time
    const startTime = Date.now();

    try {
      // Execute ADB push command
      execSync(`adb push "${sourcePath}" "${targetPath}"`, { stdio: 'pipe' });

      // Calculate elapsed time and speed
      const elapsed = (Date.now() - startTime) / 1000;
      const speed = folderSize / elapsed / 1024 / 1024;

      s.stop(`✓ ${folder} - ${formatSize(folderSize)} - ${elapsed.toFixed(1)}s - ${speed.toFixed(2)} MB/s`);
    } catch (error) {
      s.stop(`✗ ${folder} - Transfer failed: ${error}`);
    }
  }

  outro('Transfer complete');
}

main();
