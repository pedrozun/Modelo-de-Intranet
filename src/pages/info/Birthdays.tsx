import React, { useState, useMemo } from "react";
import { Gift, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import {
	months,
	birthdays,
	getTodaysBirthdays,
	formatDate,
} from "../../data/birthdaysData";

export function BirthdaysPage() {
	const [selectedMonth, setSelectedMonth] = useState<number>(
		new Date().getMonth()
	);
	const currentMonth = new Date().getMonth();
	const currentDay = new Date().getDate();

	const todaysBirthdays = useMemo(() => getTodaysBirthdays(), []);

	const birthdaysByMonth = useMemo(() => {
		return months.map((_, index) => {
			return birthdays
				.filter((birthday) => birthday.month === index + 1)
				.sort((a, b) => a.day - b.day);
		});
	}, []);

	const container = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const item = {
		hidden: { y: 20, opacity: 0 },
		show: { y: 0, opacity: 1 },
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold text-gray-700 dark:text-white flex items-center gap-2">
					<Calendar className="h-8 w-8" />
					Aniversários
				</h1>
			</div>

			{/* Today's Birthdays */}
			{todaysBirthdays.length > 0 && (
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg"
				>
					<div className="flex items-center gap-4">
						<div className="p-3 bg-white/20 rounded-lg">
							<Gift className="h-6 w-6" />
						</div>
						<div>
							<h2 className="text-xl font-semibold mb-2">
								{todaysBirthdays.length === 1
									? "Aniversariante"
									: "Aniversariantes"}{" "}
								do dia
							</h2>
							<div className="space-y-1">
								{todaysBirthdays.map((birthday, index) => (
									<p
										key={index}
										className="font-medium"
									>
										{birthday.name}
									</p>
								))}
							</div>
						</div>
					</div>
				</motion.div>
			)}

			<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
				{/* Months List */}
				<div className="lg:col-span-1 space-y-2">
					{months.map((month, index) => (
						<button
							key={month}
							onClick={() => setSelectedMonth(index)}
							className={`
                ml-2 w-full p-3 rounded-lg text-left transition-all duration-200
                ${
									index === selectedMonth
										? "bg-blue-500 text-white shadow-lg"
										: "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
								}
                ${
									index === currentMonth &&
									"ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900"
								}
              `}
						>
							<div className="flex items-center justify-between">
								<span className="font-medium">{month}</span>
								<span className="text-sm opacity-80">
									{birthdaysByMonth[index].length}
								</span>
							</div>
						</button>
					))}
				</div>

				{/* Birthdays List */}
				<div className="mr-3 lg:col-span-3">
					<motion.div
						key={selectedMonth}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden"
					>
						<div className="p-6 border-b border-gray-200 dark:border-gray-700">
							<h2 className="text-xl font-bold text-gray-800 dark:text-white">
								Aniversariantes de {months[selectedMonth]}
							</h2>
						</div>

						<div className="divide-y divide-gray-200 dark:divide-gray-700">
							{birthdaysByMonth[selectedMonth].length > 0 ? (
								birthdaysByMonth[selectedMonth].map((birthday, index) => (
									<div
										key={index}
										className={`
                      p-4 transition-colors
                      ${
												birthday.month === currentMonth + 1 &&
												birthday.day === currentDay
													? "bg-blue-50 dark:bg-blue-900/30"
													: "hover:bg-gray-50 dark:hover:bg-gray-700"
											}
                    `}
									>
										<div className="flex items-center justify-between">
											<span className="font-medium text-gray-900 dark:text-white">
												{birthday.name}
											</span>
											<span className="text-sm text-gray-500 dark:text-gray-400">
												{formatDate(birthday.day, birthday.month)}
											</span>
										</div>
									</div>
								))
							) : (
								<div className="p-8 text-center text-gray-500 dark:text-gray-400">
									Nenhum aniversariante neste mês
								</div>
							)}
						</div>
					</motion.div>
				</div>
			</div>
		</div>
	);
}
