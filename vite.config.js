import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  build: {
    rollupOptions: {
      input: {
        home: './home.html',
        login: './login.html',
        bbb: './bbb.html',
        users: './users.html'
      }
    }
  }
});
