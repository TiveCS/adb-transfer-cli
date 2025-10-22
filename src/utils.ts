import { readdirSync, statSync } from 'fs';
import { join } from 'path';

/**
 * Recursively calculate the total size of a folder in bytes
 */
export function getFolderSize(path: string): number {
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
 * Format bytes to human-readable size (B/KB/MB/GB)
 */
export function formatSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  } else if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  } else {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
}

/**
 * List items (files and directories) in a given path
 */
export function listItems(path: string): Array<{ name: string; isDirectory: boolean }> {
  try {
    const items = readdirSync(path);
    return items.map((item) => {
      const fullPath = join(path, item);
      const stats = statSync(fullPath);
      return {
        name: item,
        isDirectory: stats.isDirectory()
      };
    });
  } catch (error) {
    throw new Error(`Failed to list items in ${path}: ${error}`);
  }
}
