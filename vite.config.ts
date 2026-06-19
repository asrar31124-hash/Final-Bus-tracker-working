import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

export default defineConfig({
  plugins: [
    // TanStack Start SSR/plugin – required for this project
    tanstackStart({
      // Add custom options here if needed
    }),
    react(),
  ],
  resolve: {
    // Enable native TypeScript path resolution – removes the need for tsconfck
    tsconfig: true,
  },
});
