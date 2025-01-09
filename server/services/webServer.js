import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, "../../dist");

export function setupStaticServer(app) {
	// Serve static files from the dist directory
	app.use(express.static(distPath));

	// Handle client-side routing by serving index.html for all routes
	// except for API routes and static files
	app.get(/^(?!\/api).*/, (req, res) => {
		res.sendFile(path.join(distPath, "index.html"));
	});
}
