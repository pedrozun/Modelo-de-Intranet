import fs from "fs";
import path from "path";
import ExcelJS from "exceljs";
import { createHash } from "../utils/hashUtils.js";
import { getDayName } from "../utils/dateUtils.js";

class HolidayService {
	constructor() {
		this.holidaysCache = new Map();
	}

	async fetchHolidays(year) {
		if (this.holidaysCache.has(year)) {
			return this.holidaysCache.get(year);
		}

		try {
			const response = await fetch(
				`https://brasilapi.com.br/api/feriados/v1/${year}`
			);
			if (!response.ok) {
				throw new Error(`Failed to fetch holidays: ${response.status}`);
			}

			const holidays = await response.json();
			const holidayDates = holidays.map((h) =>
				this.formatDateToISO(new Date(h.date))
			);
			this.holidaysCache.set(year, holidayDates);
			return holidayDates;
		} catch (error) {
			console.error(`Error fetching holidays for ${year}:`, error);
			return [];
		}
	}

	formatDateToISO(date) {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	}
}

export class TaskService {
	constructor() {
		this.workbookPath = path.join(process.cwd(), "tarefas", "Tarefas.xlsx");
		this.tasksDir = path.join(process.cwd(), "tarefas");
		this.holidayService = new HolidayService();
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

	isWeekend(date) {
		return date.getDay() === 0 || date.getDay() === 6;
	}

	async isHoliday(date) {
		const year = date.getFullYear();
		const holidays = await this.holidayService.fetchHolidays(year);
		const dateStr = this.holidayService.formatDateToISO(date);
		return holidays.includes(dateStr);
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

	getDayTasks(date) {
		const fileName = this.getDayMapping()[date.getDay()];
		if (!fileName) return [];

		const filePath = path.join(this.tasksDir, fileName);
		if (!fs.existsSync(filePath)) return [];

		return fs
			.readFileSync(filePath, "utf8")
			.split("\n")
			.filter((line) => line.trim());
	}

	parseExcelDate(dateCell) {
		if (!dateCell.value) return null;

		let date;
		if (dateCell.type === ExcelJS.ValueType.Date) {
			date = dateCell.value;
		} else if (typeof dateCell.value === "string") {
			const parts = dateCell.value.split(/[-\/]/);
			if (parts.length === 3) {
				const [day, month, year] = parts.map(Number);
				date = new Date(year, month - 1, day);
			}
		} else if (typeof dateCell.value === "number") {
			date = new Date((dateCell.value - 25569) * 86400 * 1000);
		}

		return date && !isNaN(date.getTime()) ? date : null;
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

			return completedTasks;
		} catch (error) {
			console.error("Error reading Excel:", error);
			return {};
		}
	}

	async getTodaysTasks() {
		const today = new Date();
		const dayOfWeek = today.getDay();

		if (this.isWeekend(today)) {
			return {
				tasks: [],
				isWeekend: true,
				dayName: dayOfWeek === 0 ? "Domingo" : "Sábado",
			};
		}

		const fileName = this.getDayMapping()[dayOfWeek];
		const filePath = path.join(this.tasksDir, fileName);

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

	async getTaskAnalytics() {
		try {
			const workbook = new ExcelJS.Workbook();
			await workbook.xlsx.readFile(this.workbookPath);
			const worksheet = workbook.getWorksheet(1);

			if (!worksheet || worksheet.rowCount <= 1) {
				return this.getEmptyAnalytics();
			}

			const dateRange = {
				start: null,
				end: null,
			};

			const excelTasksByDate = new Map();

			for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
				const row = worksheet.getRow(rowNumber);
				const dateCell = row.getCell(1);
				const taskCell = row.getCell(2);

				if (!dateCell.value || !taskCell.value) continue;

				const date = this.parseExcelDate(dateCell);
				if (!date) continue;

				if (this.isWeekend(date) || (await this.isHoliday(date))) continue;

				if (!dateRange.start || date < dateRange.start) {
					dateRange.start = date;
				}
				if (!dateRange.end || date > dateRange.end) {
					dateRange.end = date;
				}

				const dateStr = this.holidayService.formatDateToISO(date);
				if (!excelTasksByDate.has(dateStr)) {
					excelTasksByDate.set(dateStr, new Map());
				}

				const task = taskCell.value.toString().trim();
				const completed = row.getCell(4).value === 1;

				const dateTaskMap = excelTasksByDate.get(dateStr);
				dateTaskMap.set(task, completed);
			}

			const analytics = {
				totalTasks: 0,
				completedTasks: 0,
				missingTasks: 0,
				daysWithMissingTasks: [],
				taskCompletionByDay: [],
				mostMissedTasks: new Map(),
				startDate: dateRange.start
					? this.holidayService.formatDateToISO(dateRange.start)
					: null,
				endDate: dateRange.end
					? this.holidayService.formatDateToISO(dateRange.end)
					: null,
			};

			if (!dateRange.start || !dateRange.end) {
				return this.getEmptyAnalytics();
			}

			const currentDate = new Date(dateRange.start);
			while (currentDate <= dateRange.end) {
				if (
					!this.isWeekend(currentDate) &&
					!(await this.isHoliday(currentDate))
				) {
					const dateStr = this.holidayService.formatDateToISO(currentDate);
					const expectedTasks = this.getDayTasks(currentDate);

					if (expectedTasks.length > 0) {
						const excelTasks = excelTasksByDate.get(dateStr) || new Map();
						const completedTasks = new Set();
						const missingTasks = [];

						for (const expectedTask of expectedTasks) {
							if (!excelTasks.has(expectedTask)) {
								missingTasks.push(expectedTask);
								analytics.mostMissedTasks.set(
									expectedTask,
									(analytics.mostMissedTasks.get(expectedTask) || 0) + 1
								);
							} else if (excelTasks.get(expectedTask)) {
								completedTasks.add(expectedTask);
							} else {
								missingTasks.push(expectedTask);
								analytics.mostMissedTasks.set(
									expectedTask,
									(analytics.mostMissedTasks.get(expectedTask) || 0) + 1
								);
							}
						}

						analytics.totalTasks += expectedTasks.length;
						analytics.completedTasks += completedTasks.size;

						if (missingTasks.length > 0) {
							analytics.daysWithMissingTasks.push({
								date: dateStr,
								missingTasks,
							});
						}

						analytics.taskCompletionByDay.push({
							date: dateStr,
							completed: completedTasks.size,
							total: expectedTasks.length,
							completionRate: `${(
								(completedTasks.size / expectedTasks.length) *
								100
							).toFixed(1)}%`,
						});
					}
				}

				currentDate.setDate(currentDate.getDate() + 1);
			}

			analytics.missingTasks = analytics.totalTasks - analytics.completedTasks;

			analytics.daysWithMissingTasks.sort(
				(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
			);

			analytics.taskCompletionByDay.sort(
				(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
			);

			analytics.mostMissedTasks = Array.from(
				analytics.mostMissedTasks.entries()
			)
				.map(([task, count]) => ({ task, count }))
				.sort((a, b) => b.count - a.count)
				.slice(0, 5);

			return analytics;
		} catch (error) {
			console.error("Error generating analytics:", error);
			throw new Error("Failed to generate analytics");
		}
	}

	getEmptyAnalytics() {
		return {
			totalTasks: 0,
			completedTasks: 0,
			missingTasks: 0,
			daysWithMissingTasks: [],
			taskCompletionByDay: [],
			mostMissedTasks: [],
			startDate: null,
			endDate: null,
		};
	}
}
