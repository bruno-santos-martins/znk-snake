import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    preview: {
        allowedHosts: ['znk-snake-client.onrender.com', 'localhost']
    }
});
