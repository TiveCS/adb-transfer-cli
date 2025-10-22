#!/usr/bin/env bun

import { intro, outro } from '@clack/prompts';
import { showLobby, selectPath, selectItems } from './src/ui';
import { transfer } from './src/transfer';

/**
 * Main function
 */
async function main() {
  intro('ADB Transfer Tool');

  // Step 1: Show lobby and select direction
  const direction = await showLobby();
  if (!direction) {
    outro('Transfer cancelled');
    return;
  }

  // Determine source and destination types based on direction
  const sourceType = direction === 'pc-to-phone' ? 'pc' : 'phone';
  const destinationType = direction === 'pc-to-phone' ? 'phone' : 'pc';

  // Step 2: Select source path
  const sourcePath = await selectPath(sourceType);
  if (!sourcePath) {
    outro('Transfer cancelled');
    return;
  }

  // Step 3: Select items from source
  const items = await selectItems(sourcePath, sourceType);
  if (!items || items.length === 0) {
    outro('No items selected');
    return;
  }

  // Step 4: Select destination path
  const destinationPath = await selectPath(destinationType);
  if (!destinationPath) {
    outro('Transfer cancelled');
    return;
  }

  // Step 5: Execute transfer
  await transfer(items, destinationPath, direction);

  outro('Transfer complete');
}

main();
