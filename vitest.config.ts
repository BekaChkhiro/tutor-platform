import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const alias = {
  '@': path.resolve(__dirname, 'src'),
};

export default defineConfig({
  resolve: { alias },
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/tests/**',
        'src/**/__tests__/**',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/app/**/{layout,page,loading,error,not-found,template,route,global-error}.{ts,tsx}',
        'src/instrumentation*.ts',
        'sentry.*.config.ts',
      ],
      thresholds: {
        lines: 60,
        branches: 60,
        functions: 60,
        statements: 60,
        'src/lib/**': {
          lines: 80,
          branches: 80,
          functions: 80,
          statements: 80,
        },
      },
    },
    projects: [
      {
        resolve: { alias },
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/**/*.unit.test.{ts,tsx}'],
          exclude: ['node_modules', 'dist', '.next', 'e2e'],
        },
      },
      {
        resolve: { alias },
        test: {
          name: 'integration',
          environment: 'node',
          include: ['src/**/*.integration.test.{ts,tsx}'],
          exclude: ['node_modules', 'dist', '.next', 'e2e'],
          testTimeout: 120_000,
          hookTimeout: 120_000,
          pool: 'forks',
          fileParallelism: false,
        },
      },
      {
        plugins: [react()],
        resolve: { alias },
        test: {
          name: 'component',
          environment: 'jsdom',
          include: ['src/**/*.component.test.{ts,tsx}'],
          exclude: ['node_modules', 'dist', '.next', 'e2e'],
          setupFiles: ['./vitest.setup.ts'],
        },
      },
    ],
  },
});
