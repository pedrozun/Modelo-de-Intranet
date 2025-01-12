import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
	BarChart3,
	AlertCircle,
	Calendar,
	CheckCircle2,
	XCircle,
	TrendingUp,
	ListChecks,
	Filter,
} from "lucide-react";
import { getAuthToken } from "../../services/authService";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../styles/datepicker.css";
import { ptBR } from "date-fns/locale";

interface TaskAnalytics {
	totalTasks: number;
	completedTasks: number;
	missingTasks: number;
	daysWithMissingTasks: {
		date: string;
		missingTasks: string[];
	}[];
	taskCompletionByDay: {
		date: string;
		completed: number;
		total: number;
		completionRate: string;
	}[];
	mostMissedTasks: {
		task: string;
		count: number;
	}[];
	startDate: string | null;
}

interface DateFilter {
	month: number;
	year: number;
}

const adjustDate = (dateString: string) => {
	const date = new Date(dateString);
	const userTimezoneOffset = date.getTimezoneOffset() * 60000;
	return new Date(date.getTime() + userTimezoneOffset);
};

export function DashboardsPage() {
	const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
	const [analytics, setAnalytics] = useState<TaskAnalytics | null>(null);
	const [filteredAnalytics, setFilteredAnalytics] =
		useState<TaskAnalytics | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [dateFilter, setDateFilter] = useState<DateFilter>(() => {
		const today = new Date();
		return {
			month: today.getMonth() + 1,
			year: today.getFullYear(),
		};
	});
	const [, setAvailableMonths] = useState<{ month: number; year: number }[]>(
		[]
	);

	const fetchAnalytics = async () => {
		try {
			const token = getAuthToken();
			if (!token) {
				throw new Error("Token de autenticação não encontrado");
			}

			const response = await fetch("/api/tasks/analytics", {
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			});

			if (response.status === 401) {
				throw new Error("Sessão expirada. Por favor, faça login novamente.");
			}

			if (!response.ok) {
				throw new Error("Erro ao buscar dados analíticos");
			}

			const data = await response.json();
			setAnalytics(data);
		} catch (error) {
			console.error("Erro ao carregar analytics:", error);
			setError(
				error instanceof Error
					? error.message
					: "Erro ao carregar dados analíticos"
			);
		} finally {
			setLoading(false);
		}
	};

	const filterAnalyticsByMonth = () => {
		if (!analytics) return;

		const { month, year } = dateFilter;

		const filteredData: TaskAnalytics = {
			...analytics,
			daysWithMissingTasks: analytics.daysWithMissingTasks.filter((day) => {
				const date = new Date(day.date);
				return date.getMonth() + 1 === month && date.getFullYear() === year;
			}),
			taskCompletionByDay: analytics.taskCompletionByDay.filter((day) => {
				const date = new Date(day.date);
				return date.getMonth() + 1 === month && date.getFullYear() === year;
			}),
		};

		// Recalcular totais baseado no período filtrado
		const completedTasks = filteredData.taskCompletionByDay.reduce(
			(sum, day) => sum + day.completed,
			0
		);
		const totalTasks = filteredData.taskCompletionByDay.reduce(
			(sum, day) => sum + day.total,
			0
		);
		const missingTasks = totalTasks - completedTasks;

		// Recalcular tarefas mais perdidas no período
		const missedTasksCount = new Map<string, number>();
		filteredData.daysWithMissingTasks.forEach((day) => {
			day.missingTasks.forEach((task) => {
				missedTasksCount.set(task, (missedTasksCount.get(task) || 0) + 1);
			});
		});

		const mostMissedTasks = Array.from(missedTasksCount.entries())
			.map(([task, count]) => ({ task, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 5);

		filteredData.totalTasks = totalTasks;
		filteredData.completedTasks = completedTasks;
		filteredData.missingTasks = missingTasks;
		filteredData.mostMissedTasks = mostMissedTasks;

		setFilteredAnalytics(filteredData);
	};

	useEffect(() => {
		fetchAnalytics();
	}, []);

	useEffect(() => {
		if (selectedDate) {
			const month = selectedDate.getMonth() + 1;
			const year = selectedDate.getFullYear();
			setDateFilter({ month, year });
		}
	}, [selectedDate]);

	useEffect(() => {
		if (analytics) {
			// Extrair todos os meses/anos disponíveis dos dados
			const dates = new Set<string>();
			analytics.taskCompletionByDay.forEach((day) => {
				const date = new Date(day.date);
				dates.add(`${date.getFullYear()}-${date.getMonth() + 1}`);
			});

			const monthsArray = Array.from(dates)
				.map((dateStr) => {
					const [year, month] = dateStr.split("-").map(Number);
					return { month, year };
				})
				.sort((a, b) => {
					if (a.year !== b.year) return b.year - a.year;
					return b.month - a.month;
				});

			setAvailableMonths(monthsArray);
		}
	}, [analytics]);

	useEffect(() => {
		if (analytics) {
			filterAnalyticsByMonth();
		}
	}, [analytics, dateFilter]);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-6 py-4 rounded-lg flex items-center gap-2">
					<AlertCircle className="h-5 w-5" />
					{error}
				</div>
			</div>
		);
	}

	if (!filteredAnalytics) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 px-6 py-4 rounded-lg flex items-center gap-2">
					<AlertCircle className="h-5 w-5" />
					Nenhum dado analítico disponível
				</div>
			</div>
		);
	}

	const completionRate =
		filteredAnalytics.totalTasks > 0
			? (filteredAnalytics.completedTasks / filteredAnalytics.totalTasks) * 100
			: 0;

	return (
		<div className="px-2 space-y-6">
			<div className="flex items-center justify-between flex-wrap gap-4">
				<h1 className="text-2xl font-bold text-gray-700 dark:text-white flex items-center gap-2">
					<BarChart3 className="h-8 w-8" />
					Dashboard de Tarefas
				</h1>

				{/* Updated Date Filter */}
				<div className="flex items-center gap-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 transition-colors duration-200">
					<div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
						<Filter className="h-5 w-5" />
						<span className="text-sm font-medium">Filtrar por período:</span>
					</div>
					<div className="relative">
						<ReactDatePicker
							selected={selectedDate}
							onChange={(date) => setSelectedDate(date)}
							locale={{
								...ptBR,
								localize: {
									...ptBR.localize,
									month: (n, options) => {
										const months = [
											"Janeiro",
											"Fevereiro",
											"Março",
											"Abril",
											"Maio",
											"Junho",
											"Julho",
											"Agosto",
											"Setembro",
											"Outubro",
											"Novembro",
											"Dezembro",
										];
										return options?.context === "standalone"
											? months[n]
											: months[n];
									},
								},
							}}
							dateFormat="MMMM 'de' yyyy"
							showMonthYearPicker
							className="bg-gray-50/80 dark:bg-gray-700/80 border border-gray-200/50 dark:border-gray-600/50 rounded-lg 
              px-4 py-2 text-sm text-gray-700 dark:text-white text-center w-40
              placeholder-gray-400 dark:placeholder-gray-500
              transition-all duration-200 hover:bg-gray-300 dark:hover:bg-gray-500 cursor-pointer"
							placeholderText="Selecione um mês"
						/>
					</div>
				</div>
			</div>

			{/* Cards de Visão Geral */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
				>
					<div className="flex items-center gap-4">
						<div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
							<TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
						</div>
						<div>
							<p className="text-sm text-gray-600 dark:text-gray-400">
								Taxa de Conclusão
							</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">
								{completionRate.toFixed(1)}%
							</p>
						</div>
					</div>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
				>
					<div className="flex items-center gap-4">
						<div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
							<CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
						</div>
						<div>
							<p className="text-sm text-gray-600 dark:text-gray-400">
								Tarefas Concluídas
							</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">
								{filteredAnalytics.completedTasks}
							</p>
						</div>
					</div>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
					className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
				>
					<div className="flex items-center gap-4">
						<div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
							<XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
						</div>
						<div>
							<p className="text-sm text-gray-600 dark:text-gray-400">
								Tarefas Pendentes
							</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">
								{filteredAnalytics.missingTasks}
							</p>
						</div>
					</div>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
					className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
				>
					<div className="flex items-center gap-4">
						<div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
							<Calendar className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
						</div>
						<div>
							<p className="text-sm text-gray-600 dark:text-gray-400">
								Dias com Pendências
							</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">
								{filteredAnalytics.daysWithMissingTasks.length}
							</p>
						</div>
					</div>
				</motion.div>
			</div>

			{/* Análise Detalhada */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Tarefas Mais Pendentes */}
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.5 }}
					className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
				>
					<h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
						<ListChecks className="h-5 w-5" />
						Tarefas Mais Pendentes
					</h2>
					<div className="space-y-4">
						{filteredAnalytics.mostMissedTasks.map((task, index) => (
							<div
								key={index}
								className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
							>
								<p className="text-gray-700 dark:text-gray-300">{task.task}</p>
								<span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-sm">
									{task.count}x
								</span>
							</div>
						))}
					</div>
				</motion.div>

				{/* Dias com Tarefas Pendentes */}
				<motion.div
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.6 }}
					className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
				>
					<h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
						<Calendar className="h-5 w-5" />
						Dias com Tarefas Pendentes
					</h2>
					<div
						className="px-2 
          space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar"
					>
						{filteredAnalytics.daysWithMissingTasks.map((day, index) => (
							<div
								key={index}
								className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
							>
								<p className="font-medium text-gray-700 dark:text-gray-300 mb-2">
									{adjustDate(day.date).toLocaleDateString("pt-BR")}
								</p>
								<ul className="list-disc list-inside space-y-1">
									{day.missingTasks.map((task, taskIndex) => (
										<li
											key={taskIndex}
											className="text-sm text-gray-600 dark:text-gray-400"
										>
											{task}
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</motion.div>
			</div>

			{/* Taxa de Conclusão por Dia */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.7 }}
				className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
			>
				<h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
					<TrendingUp className="h-5 w-5" />
					Taxa de Conclusão por Dia
				</h2>
				<div className="space-y-3">
					{filteredAnalytics.taskCompletionByDay.map((day, index) => (
						<div
							key={index}
							className="space-y-2"
						>
							<div className="flex justify-between text-sm">
								<span className="text-gray-600 dark:text-gray-400">
									{adjustDate(day.date).toLocaleDateString("pt-BR")}
								</span>
								<span className="text-gray-700 dark:text-gray-300">
									{day.completed}/{day.total} ({day.completionRate})
								</span>
							</div>
							<div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
								<div
									className="h-full bg-blue-500 dark:bg-blue-400 rounded-full transition-all duration-500"
									style={{ width: day.completionRate }}
								/>
							</div>
						</div>
					))}
				</div>
			</motion.div>
		</div>
	);
}
