import { existsSync, readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

const CONFIG_PATH = join(process.cwd(), 'app.config.json');

export interface AppConfig {
  pcPaths: string[];
  phonePaths: string[];
}

/**
 * Load configuration from app.config.json
 */
export function loadConfig(): AppConfig {
  try {
    if (!existsSync(CONFIG_PATH)) {
      // Create default config if not exists
      const defaultConfig: AppConfig = {
        pcPaths: [],
        phonePaths: []
      };
      saveConfig(defaultConfig);
      return defaultConfig;
    }

    const content = readFileSync(CONFIG_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to load config: ${error}`);
  }
}

/**
 * Save configuration to app.config.json
 */
export function saveConfig(config: AppConfig): void {
  try {
    writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
  } catch (error) {
    throw new Error(`Failed to save config: ${error}`);
  }
}

/**
 * Add a new PC path to config if it doesn't exist
 */
export function addPcPath(path: string): void {
  const config = loadConfig();
  if (!config.pcPaths.includes(path)) {
    config.pcPaths.push(path);
    saveConfig(config);
  }
}

/**
 * Add a new phone path to config if it doesn't exist
 */
export function addPhonePath(path: string): void {
  const config = loadConfig();
  if (!config.phonePaths.includes(path)) {
    config.phonePaths.push(path);
    saveConfig(config);
  }
}

/**
 * Validate if a PC path exists
 */
export function validatePcPath(path: string): boolean {
  return existsSync(path);
}

/**
 * Validate if a phone path exists using ADB
 */
export function validatePhonePath(path: string): boolean {
  try {
    execSync(`adb shell "[ -e '${path}' ] && echo exists || echo notfound"`, {
      stdio: 'pipe',
      encoding: 'utf-8'
    }).trim();

    // Check if the command output contains "exists"
    const result = execSync(`adb shell "[ -e '${path}' ] && echo exists || echo notfound"`, {
      stdio: 'pipe',
      encoding: 'utf-8'
    }).trim();

    return result.includes('exists');
  } catch (error) {
    return false;
  }
}
