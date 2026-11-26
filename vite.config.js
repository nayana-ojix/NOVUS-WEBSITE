import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0', // Exposes on all network interfaces including local Wi-Fi / LAN
    port: 5173,
    open: true
  }
});
