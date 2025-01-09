import fs from "fs";
import path from "path";
import ExcelJS from "exceljs";
import { createHash } from "../utils/hashUtils.js";
import { getDayName } from "../utils/dateUtils.js";

export class TaskService {
	constructor() {
		this.workbookPath = path.join(process.cwd(), "tarefas", "Tarefas.xlsx");
	}

	async ensureWorkbookExists() {
		const dir = path.dirname(this.workbookPath);
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}

		if (!fs.existsSync(this.workbookPath)) {
			const workbook = new ExcelJS.Workbook();
			workbook.addWorksheet("Planilha1");
			await workbook.xlsx.writeFile(this.workbookPath);
		}
	}

	formatDate(date) {
		const [day, month, year] = date.split("/");
		return `${day}-${month}-${year}`;
	}

	async markTasksAsCompleted(tasks, username) {
		if (!Array.isArray(tasks) || tasks.length === 0) {
			throw new Error("No tasks provided");
		}

		try {
			await this.ensureWorkbookExists();
			const workbook = new ExcelJS.Workbook();
			await workbook.xlsx.readFile(this.workbookPath);
			const worksheet = workbook.getWorksheet("Planilha1");
			const today = this.formatDate(new Date().toLocaleDateString("pt-BR"));

			const existingTasks = new Set();
			worksheet.eachRow((row) => {
				const dateCell = row.getCell(1);
				const hashCell = row.getCell(5);
				if (dateCell.value === today) {
					existingTasks.add(hashCell.value);
				}
			});

			for (const task of tasks) {
				const hash = createHash(task);
				if (!existingTasks.has(hash)) {
					worksheet.addRow([today, task, username, 1, hash]);
				}
			}

			await workbook.xlsx.writeFile(this.workbookPath);
			return { success: true };
		} catch (error) {
			throw new Error(`Failed to save completed tasks: ${error.message}`);
		}
	}

	async getCompletedTasksFromExcel() {
		try {
			if (!fs.existsSync(this.workbookPath)) {
				return {};
			}

			const workbook = new ExcelJS.Workbook();
			await workbook.xlsx.readFile(this.workbookPath);
			const worksheet = workbook.getWorksheet("Planilha1");
			const todayStr = this.formatDate(new Date().toLocaleDateString("pt-BR"));

			const completedTasks = {};

			worksheet.eachRow((row) => {
				// Get values directly from cells since there's no header row
				const date = row.getCell(1).value;
				const task = row.getCell(2).value;
				const completed = row.getCell(4).value;

				if (date === todayStr && completed === 1) {
					if (!completedTasks[date]) {
						completedTasks[date] = [];
					}
					completedTasks[date].push(task);
				}
			});

			console.log("Reading completed tasks:", completedTasks);
			return completedTasks;
		} catch (error) {
			console.error("Error reading Excel:", error);
			return {};
		}
	}

	getDayMapping() {
		return {
			1: "Segunda.txt",
			2: "Terça.txt",
			3: "Quarta.txt",
			4: "Quinta.txt",
			5: "Sexta.txt",
		};
	}

	async getTodaysTasks() {
		const today = new Date();
		const dayOfWeek = today.getDay();

		if (dayOfWeek === 0 || dayOfWeek === 6) {
			return {
				tasks: [],
				isWeekend: true,
				dayName: dayOfWeek === 0 ? "Domingo" : "Sábado",
			};
		}

		const fileName = this.getDayMapping()[dayOfWeek];
		const filePath = path.join(process.cwd(), "tarefas", fileName);

		if (!fs.existsSync(filePath)) {
			throw new Error("Task file not found");
		}

		const tasks = fs
			.readFileSync(filePath, "utf8")
			.split("\n")
			.filter((line) => line.trim());

		const completedTasks = await this.getCompletedTasksFromExcel();
		const todayStr = this.formatDate(new Date().toLocaleDateString("pt-BR"));

		return {
			tasks,
			completedTasks: completedTasks[todayStr] || [],
			isWeekend: false,
			dayName: getDayName(dayOfWeek),
		};
	}
}
