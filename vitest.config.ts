import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    testTimeout: 30000, // 30 second timeout for slow tests (file I/O, workflow generation)
    hookTimeout: 10000,  // 10 second timeout for hooks
    teardownTimeout: 10000, // 10 second timeout for teardown
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/'],
    },
    // Prevent hanging on file operations
    isolate: true,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: false,
      },
    },
  },
  plugins: [tsconfigPaths()],
});
