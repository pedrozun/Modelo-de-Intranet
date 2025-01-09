import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [react()],
	optimizeDeps: {
		exclude: ["lucide-react"],
	},
	server: {
		proxy: {
			"/api": {
				target: "http://localhost:3000",
				changeOrigin: true,
			},
			"/papers": {
				target: "http://localhost:3000",
				changeOrigin: true,
			},
		},
	},
	build: {
		// Aumenta o limite de tamanho de chunk para suprimir o aviso
		chunkSizeWarningLimit: 1000, // 1000 kB ou 1MB

		rollupOptions: {
			output: {
				// Divisão manual dos chunks
				manualChunks(id) {
					// Divida pacotes de node_modules em chunks separados
					if (id.includes("node_modules")) {
						return id.split("node_modules/")[1].split("/")[0]; // Exemplo: separa pacotes como 'react', 'lodash', etc.
					}
				},
			},
		},
	},
});
