import solid from "solid-start/vite";
import { defineConfig } from "vite";
import cloudflare from "solid-start-cloudflare-pages";

export default defineConfig({
  plugins: [solid({ adapter: cloudflare({}) })],
  optimizeDeps: {
    disabled: false,
  },
  build: {
    commonjsOptions: {
      include: [],
    },
  },
});
