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
      ],
      // Coverage thresholds disabled during early-stage development (T1.x auth foundations).
      // Re-enable once critical-path tests exist — see PROJECT_PLAN follow-up task.
      thresholds: undefined,
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
