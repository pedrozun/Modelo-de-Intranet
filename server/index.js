import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { AuthController } from "./controllers/authController.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
import { TaskService } from "./services/taskService.js";
import { MeetingService } from "./services/meetingService.js";
import { OfficeService } from "./services/officeService.js";
import { ExtensionsService } from "./services/extensionsService.js";
import { setupStaticServer } from "./services/webServer.js";
import dotenv from "dotenv";
import os from "os";

dotenv.config();

// Initialize services
const app = express();
const port = process.env.PORT || 8080;
const authController = new AuthController();
const taskService = new TaskService();
const meetingService = new MeetingService();
const officeService = new OfficeService();
const extensionsService = new ExtensionsService();

// Shared middleware
app.use(cors());
app.use(express.json());

// Authentication routes
app.post("/api/auth/ad", (req, res) => authController.login(req, res));

// Tasks routes
app.get("/api/tasks/today", authMiddleware, async (req, res) => {
	try {
		const tasksData = await taskService.getTodaysTasks();
		res.json(tasksData);
	} catch (error) {
		console.error("Error reading tasks:", error);
		res.status(500).json({ error: "Failed to read tasks" });
	}
});

app.post("/api/tasks/complete", authMiddleware, async (req, res) => {
	try {
		console.log("Received request to complete tasks:", req.body);
		console.log("User:", req.user);

		const { tasks } = req.body;

		if (!Array.isArray(tasks) || tasks.length === 0) {
			return res.status(400).json({ error: "Invalid tasks data" });
		}

		const result = await taskService.markTasksAsCompleted(
			tasks,
			req.user.username
		);
		console.log("Task completion result:", result);

		res.json(result);
	} catch (error) {
		console.error("Error completing tasks:", error);
		res
			.status(500)
			.json({ error: "Failed to complete tasks", details: error.message });
	}
});

//Dashboard route
app.get("/api/tasks/analytics", authMiddleware, async (req, res) => {
	try {
		const analytics = await taskService.getTaskAnalytics();
		res.json(analytics);
	} catch (error) {
		console.error("Error fetching task analytics:", error);
		res.status(500).json({ error: "Failed to fetch task analytics" });
	}
});

// Meeting room routes
app.get("/api/meetings", authMiddleware, async (req, res) => {
	try {
		const meetings = await meetingService.getMeetings();
		res.json(meetings);
	} catch (error) {
		console.error("Error fetching meetings:", error);
		res.status(500).json({ error: "Failed to fetch meetings" });
	}
});

app.post("/api/meetings", authMiddleware, async (req, res) => {
	try {
		const meeting = await meetingService.createMeeting({
			...req.body,
			createdBy: req.user.username,
		});
		res.status(201).json(meeting);
	} catch (error) {
		console.error("Error creating meeting:", error);
		res.status(500).json({ error: "Failed to create meeting" });
	}
});

app.delete("/api/meetings/:id", authMiddleware, async (req, res) => {
	try {
		await meetingService.deleteMeeting(req.params.id, req.user.username);
		res.status(204).send();
	} catch (error) {
		console.error("Error deleting meeting:", error);
		res.status(500).json({ error: "Failed to delete meeting" });
	}
});

// Extensions route
app.get("/api/extensions", authMiddleware, async (req, res) => {
	try {
		const extensions = await extensionsService.getExtensions();
		if (!extensions) {
			throw new Error("Failed to fetch extensions");
		}
		res.json(extensions);
	} catch (error) {
		console.error("Error fetching extensions:", error);
		res.status(500).json({ error: "Failed to fetch extensions" });
	}
});

// PDF routes// PDF routes
app.get("/api/papers", authMiddleware, (req, res) => {
	//const pdfFolderPath = "\\\\192.168.100.205\\kem\\PAPERS Publicados"; // Caminho UNC para a pasta de rede
	const pdfFolderPath = "/mnt/papers"; // Caminho montado no Linux

	console.log(`Reading files in folder: ${pdfFolderPath}`);

	fs.readdir(pdfFolderPath, (err, files) => {
		if (err) {
			console.error("Error listing files:", err);
			return res.status(500).json({ message: "Error listing files" });
		}

		const pdfFiles = files
			.filter((file) => file.endsWith(".pdf"))
			.map((file) => ({
				name: path.parse(file).name,
				path: `/api/papers/${file}`,
			}));

		res.json(pdfFiles);
	});
});

app.get("/api/papers/:filename", authMiddleware, (req, res) => {
	//const pdfFolderPath = "\\\\192.168.100.205\\kem\\PAPERS Publicados"; // Caminho UNC para a pasta de rede Windows
	const pdfFolderPath = "/mnt/papers"; // Caminho montado no Linux
	const filename = req.params.filename;
	const filePath = path.join(pdfFolderPath, filename);
	console.log("File Path:", filePath);

	// Verifica se o caminho do arquivo começa com o caminho de rede
	if (!filePath.startsWith(pdfFolderPath)) {
		return res.status(403).json({ message: "Access denied" });
	}

	fs.access(filePath, fs.constants.F_OK, (err) => {
		if (err) {
			return res.status(404).json({ message: "File not found" });
		}
		res.sendFile(filePath);
	});
});

// Office management routes
app.get("/api/office/clients", authMiddleware, async (req, res) => {
	try {
		const clients = await officeService.getClients();
		res.json(clients);
	} catch (error) {
		console.error("Error fetching clients:", error);
		res.status(500).json({ error: "Failed to fetch clients" });
	}
});

app.post("/api/office/clients", authMiddleware, async (req, res) => {
	try {
		const { name, acronym } = req.body;
		const result = await officeService.createClient(name, acronym);
		res.json(result);
	} catch (error) {
		console.error("Error creating client:", error);
		res.status(500).json({
			error: error.message || "Failed to create client",
		});
	}
});

app.get("/api/office/products", authMiddleware, async (req, res) => {
	try {
		const products = await officeService.getProducts();
		res.json(products);
	} catch (error) {
		console.error("Error fetching products:", error);
		res.status(500).json({ error: "Failed to fetch products" });
	}
});

app.post("/api/office/batches", authMiddleware, async (req, res) => {
	try {
		const { client, product, quantity } = req.body;
		const result = await officeService.createBatch(client, product, quantity);
		res.json(result);
	} catch (error) {
		console.error("Error creating batch:", error);
		res.status(500).json({
			error: error.message || "Failed to create batch",
		});
	}
});

// Setup static file serving - deve ser colocado APÓS todas as rotas da API
setupStaticServer(app);

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({
		success: false,
		message: "Internal server error",
	});
});

// Start server
app.listen(port, () => {
	const networkInterfaces = os.networkInterfaces();
	const localIp =
		networkInterfaces["eth0"]?.find((iface) => iface.family === "IPv4")
			?.address || "localhost"; // Use eth0 or adjust if necessary
	const localUrl = `http://${localIp}:${port}`;

	console.log(`Servidor rodando em:`);
	console.log(`  ➜  Local:   http://localhost:${port}/`);
	console.log(`  ➜  Network: ${localUrl}`);
});
