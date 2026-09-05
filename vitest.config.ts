import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { environment: 'jsdom', include: ['apps/zotero/tests/**/*.test.{ts,tsx}'], testTimeout: 10000 } });
