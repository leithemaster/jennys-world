import { defineConfig } from 'vite';

// Relative base so the build works at https://<user>.github.io/<repo>/
export default defineConfig({
  base: './',
  server: { port: 5173 },
  build: { target: 'es2022' },
});
