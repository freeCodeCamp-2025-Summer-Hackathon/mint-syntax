import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '../', 'VITE_');
  return {
    envDir: '../',
    plugins: [react()],
    server: {
      cors: {
        origin: JSON.stringify(env.VITE_HOME_LOCATION),
      },
    },
  };
});
