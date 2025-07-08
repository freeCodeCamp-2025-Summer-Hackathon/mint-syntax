import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '../', 'VITE_');
  return {
    envDir: '../',
    plugins: [tailwindcss(), react()],
    server: {
      cors: {
        origin: JSON.stringify(env.VITE_HOME_LOCATION),
      },
    },
  };
});
