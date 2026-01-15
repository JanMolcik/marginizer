import { LocalStorageAdapter } from './localStorage';
import type { StorageAdapter } from './types';

// Export the active storage adapter
// To switch to API/database: import and instantiate ApiStorageAdapter instead
export const storage: StorageAdapter = new LocalStorageAdapter();

export type { StorageAdapter } from './types';
