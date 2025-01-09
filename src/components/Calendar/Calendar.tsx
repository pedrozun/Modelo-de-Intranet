import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
	format,
	startOfMonth,
	endOfMonth,
	eachDayOfInterval,
	isSameMonth,
	isToday,
	isSameDay,
	parseISO,
	getYear,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";

interface Meeting {
	id: string;
	date: string;
	startTime: string;
	endTime: string;
	createdBy: string;
}

interface Holiday {
	date: string;
	name: string;
	type: string;
	fullName?: string;
}

interface CalendarProps {
	currentDate: Date;
	meetings: Meeting[];
	onDateSelect: (date: Date) => void;
	onPreviousMonth: () => void;
	onNextMonth: () => void;
	selectedDate: Date | null;
	currentUser: string;
	onDeleteMeeting: (meetingId: string) => void;
}

export function Calendar({
	currentDate,
	meetings,
	onDateSelect,
	onPreviousMonth,
	onNextMonth,
	selectedDate,
	currentUser,
	onDeleteMeeting,
}: CalendarProps) {
	const [meetingToDelete, setMeetingToDelete] = useState<string | null>(null);
	const [holidays, setHolidays] = useState<Holiday[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchHolidays = async () => {
			const year = getYear(currentDate);
			try {
				setLoading(true);
				setError(null);
				const response = await fetch(
					`https://brasilapi.com.br/api/feriados/v1/${year}`
				);

				if (!response.ok) {
					if (response.status === 404) {
						throw new Error("Ano fora do intervalo suportado");
					}
					throw new Error("Erro ao carregar feriados");
				}

				const data = await response.json();
				setHolidays(data);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Erro ao carregar feriados"
				);
			} finally {
				setLoading(false);
			}
		};

		fetchHolidays();
	}, [currentDate]);

	const monthStart = startOfMonth(currentDate);
	const monthEnd = endOfMonth(currentDate);
	const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
	const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

	const formatUsername = (username: string) => {
		return username
			.split(".")
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join(" ");
	};

	const formatMeetingTime = (startTime: string, endTime: string) => {
		return `${startTime} - ${endTime}`;
	};

	const getMeetingsForDate = (date: Date) => {
		return meetings.filter((meeting) =>
			isSameDay(parseISO(meeting.date), date)
		);
	};

	const getHolidayForDate = (date: Date) => {
		return holidays.find((holiday) => isSameDay(parseISO(holiday.date), date));
	};

	const handleDeleteClick = (e: React.MouseEvent, meetingId: string) => {
		e.stopPropagation();
		setMeetingToDelete(meetingId);
	};

	const handleConfirmDelete = () => {
		if (meetingToDelete) {
			onDeleteMeeting(meetingToDelete);
			setMeetingToDelete(null);
		}
	};

	const handleDayClick = (date: Date) => {
		onDateSelect(date); // Chamando a função de seleção de data
	};

	const capitalizeFirstLetter = (string: string) => {
		return string.charAt(0).toUpperCase() + string.slice(1);
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center p-4">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
			</div>
		);
	}

	if (error) {
		return <div className="text-red-500 p-4 text-center">{error}</div>;
	}

	return (
		<>
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-visible">
				{/* Calendar Header */}
				<div className="px-6 py-2 border-b border-gray-200 dark:border-gray-700">
					<div className="flex items-center justify-center space-x-4">
						<button
							onClick={onPreviousMonth}
							className="py-1 px-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg
           hover:bg-gray-100 dark:hover:bg-gray-700 
           transition-colors duration-200
           border border-gray-200 dark:border-gray-700"
						>
							<ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
						</button>
						<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
							{capitalizeFirstLetter(
								format(currentDate, "MMMM yyyy", { locale: ptBR })
							)}
						</h2>
						<button
							onClick={onNextMonth}
							className="py-1 px-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg
           hover:bg-gray-100 dark:hover:bg-gray-700 
           transition-colors duration-200
           border border-gray-200 dark:border-gray-700"
						>
							<ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
						</button>
					</div>

					{/* Adicione a legenda aqui */}
					<div className="mt-4 text-center">
						<span className="inline-block bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-1 rounded-md text-sm">
							Feriados
						</span>
						<span className="inline-block bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-md text-sm ml-2">
							Hoje
						</span>
						<span className="inline-block bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-2 py-1 rounded-md text-sm ml-2">
							Suas Reuniões
						</span>
						<span className="inline-block bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md text-sm ml-2">
							Outras Reuniões
						</span>
					</div>
				</div>

				{/* Calendar Grid */}
				<div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
					{/* Week days header */}
					{weekDays.map((day) => (
						<div
							key={day}
							className="bg-gray-50 dark:bg-gray-800 py-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
						>
							{day}
						</div>
					))}

					{/* Calendar days */}
					{daysInMonth.map((date) => {
						const dayMeetings = getMeetingsForDate(date);
						const holiday = getHolidayForDate(date);
						const isSelected = selectedDate && isSameDay(date, selectedDate);
						const isCurrentDay = isToday(date);
						const isCurrentMonth = isSameMonth(date, currentDate);

						return (
							<div
								key={date.toString()}
								onClick={() => handleDayClick(date)}
								className={`
                  min-h-[100px] p-2 relative cursor-pointer transition-colors
                  ${
										holiday
											? "bg-red-50 dark:bg-red-900/20"
											: isCurrentDay
											? "bg-amber-50 dark:bg-amber-900/20"
											: isCurrentMonth
											? "bg-white dark:bg-gray-800"
											: "bg-gray-50 dark:bg-gray-900"
									}
                  ${
										isSelected
											? "ring-2 ring-blue-500 ring-inset relative z-10"
											: ""
									}
                  ${!isCurrentMonth ? "text-gray-400 dark:text-gray-600" : ""}
                  hover:bg-gray-50 dark:hover:bg-gray-700
                `}
							>
								<span
									className={`text-sm ${
										holiday
											? "font-bold text-red-600 dark:text-red-400"
											: isCurrentDay
											? "font-bold text-amber-600 dark:text-amber-400"
											: isCurrentMonth
											? "text-gray-900 dark:text-gray-100"
											: "text-gray-400 dark:text-gray-600"
									}`}
								>
									{format(date, "d")}
								</span>

								{/* Holiday indicator - more compact */}
								{holiday && (
									<div className="mt-1">
										<div className="text-xs p-1 rounded-md bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300">
											<span className="truncate block">{holiday.name}</span>
										</div>
									</div>
								)}

								{/* Meeting indicators - optimized for space */}
								<div className="mt-1 space-y-1">
									{dayMeetings.slice(0, 3).map((meeting) => {
										const isUserMeeting = meeting.createdBy === currentUser;
										// Define a cor baseada se é uma reunião do usuário ou não
										const meetingColor = isUserMeeting
											? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300"
											: "bg-blue-100 dark:bg-blue-900/70 text-blue-700 dark:text-blue-300";
										return (
											<div
												key={meeting.id}
												className={`
		  text-xs p-1 rounded-md transition-all duration-200
		  ${
				isUserMeeting
					? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300"
					: "bg-blue-100 dark:bg-blue-900/70 text-blue-700 dark:text-blue-300"
			}
		`}
											>
												<div className="flex items-center justify-between">
													<span className="truncate flex-1">
														{formatMeetingTime(
															meeting.startTime,
															meeting.endTime
														)}
													</span>

													{/* Nome de quem criou a reunião no canto direito */}
													<span className="text-xs ml-2">
														{formatUsername(meeting.createdBy)}
													</span>

													{isUserMeeting && (
														<button
															onClick={(e) => handleDeleteClick(e, meeting.id)}
															className="ml-1 p-0.5 rounded-full hover:bg-red-200 dark:hover:bg-red-800/50 flex items-center justify-center"
														>
															<X className="w-4 h-4 text-red-500 dark:text-red-400" />
														</button>
													)}
												</div>
											</div>
										);
									})}
									{dayMeetings.length > 3 && (
										<div className="text-xs text-gray-500 dark:text-gray-400 pl-1">
											+{dayMeetings.length - 3} mais
										</div>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* Delete Confirmation Modal */}
			{meetingToDelete && (
				<DeleteConfirmationModal
					isOpen={!!meetingToDelete}
					onClose={() => setMeetingToDelete(null)}
					onConfirm={handleConfirmDelete}
				/>
			)}
		</>
	);
}
