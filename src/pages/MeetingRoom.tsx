import React, { useState, useEffect } from "react";
import { CalendarDays, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { addMonths, subMonths, format, parseISO } from "date-fns";
import { useAuth } from "../contexts/AuthContext";
import { getAuthToken } from "../services/authService";
import { Calendar } from "../components/Calendar/Calendar";
import { MeetingForm } from "../components/Calendar/MeetingForm";

interface Meeting {
	id: string;
	title: string;
	date: string;
	startTime: string;
	endTime: string;
	createdBy: string;
}

export function MeetingRoomPage() {
	const [meetings, setMeetings] = useState<Meeting[]>([]);
	const [currentDate, setCurrentDate] = useState(new Date());
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [showForm, setShowForm] = useState(false);
	const [formData, setFormData] = useState({
		title: "",
		startTime: "",
		endTime: "",
	});
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const { user } = useAuth();

	useEffect(() => {
		fetchMeetings();
	}, []);

	const fetchMeetings = async () => {
		try {
			setLoading(true);
			setError(null);

			const response = await fetch("/api/meetings", {
				headers: {
					Authorization: `Bearer ${getAuthToken()}`,
				},
			});

			if (!response.ok) {
				throw new Error(response.statusText || "Failed to fetch meetings");
			}

			const data = await response.json();
			setMeetings(data);
		} catch (error) {
			console.error("Error fetching meetings:", error);
			setError(
				"Não foi possível carregar as reuniões. Por favor, tente novamente."
			);
		} finally {
			setLoading(false);
		}
	};

	const handleDateSelect = (date: Date) => {
		setSelectedDate(date);
		setShowForm(true);
		setFormData({
			title: "",
			startTime: "",
			endTime: "",
		});
	};

	const handleFormSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedDate) return;

		try {
			const response = await fetch("/api/meetings", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${getAuthToken()}`,
				},
				body: JSON.stringify({
					...formData,
					date: format(selectedDate, "yyyy-MM-dd"),
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to create meeting");
			}

			const newMeeting = await response.json();
			setMeetings([...meetings, newMeeting]);
			setShowForm(false);
			setError(null);
		} catch (error) {
			console.error("Error creating meeting:", error);
			setError("Não foi possível criar a reunião. Por favor, tente novamente.");
		}
	};

	const handleDeleteMeeting = async (meetingId: string) => {
		try {
			const response = await fetch(`/api/meetings/${meetingId}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${getAuthToken()}`,
				},
			});

			if (!response.ok) {
				throw new Error("Failed to delete meeting");
			}

			setMeetings(meetings.filter((meeting) => meeting.id !== meetingId));
		} catch (error) {
			console.error("Error deleting meeting:", error);
			setError(
				"Não foi possível excluir a reunião. Por favor, tente novamente."
			);
		}
	};

	const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const getAvailableTimeSlots = (date: Date) => {
		const dayMeetings = meetings.filter(
			(meeting) =>
				format(parseISO(meeting.date), "yyyy-MM-dd") ===
				format(date, "yyyy-MM-dd")
		);

		const timeSlots = [];
		for (let hour = 8; hour < 18; hour++) {
			for (let minute = 0; minute < 60; minute += 30) {
				const startTime = `${hour.toString().padStart(2, "0")}:${minute
					.toString()
					.padStart(2, "0")}`;
				const endHour = minute === 30 ? hour + 1 : hour;
				const endMinute = minute === 30 ? 0 : 30;
				const endTime = `${endHour.toString().padStart(2, "0")}:${endMinute
					.toString()
					.padStart(2, "0")}`;

				const isAvailable = !dayMeetings.some((meeting) => {
					const meetingStart = meeting.startTime;
					const meetingEnd = meeting.endTime;
					return (
						(startTime >= meetingStart && startTime < meetingEnd) ||
						(endTime > meetingStart && endTime <= meetingEnd) ||
						(startTime <= meetingStart && endTime >= meetingEnd)
					);
				});

				if (isAvailable) {
					timeSlots.push({ startTime, endTime });
				}
			}
		}
		return timeSlots;
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold text-gray-700 dark:text-white flex items-center gap-2">
					<CalendarDays className="h-8 w-8" />
					Agenda da Sala de Reunião
				</h1>
			</div>

			{error && (
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 
                   text-red-800 dark:text-red-200 px-4 py-3 rounded-lg flex items-center gap-2"
				>
					<AlertCircle className="h-5 w-5 flex-shrink-0" />
					<span>{error}</span>
				</motion.div>
			)}

			<Calendar
				currentDate={currentDate}
				meetings={meetings}
				onDateSelect={handleDateSelect}
				onPreviousMonth={() => setCurrentDate(subMonths(currentDate, 1))}
				onNextMonth={() => setCurrentDate(addMonths(currentDate, 1))}
				selectedDate={selectedDate}
				currentUser={user?.username || ""}
				onDeleteMeeting={handleDeleteMeeting}
			/>

			{showForm && selectedDate && (
				<MeetingForm
					selectedDate={selectedDate}
					formData={formData}
					onSubmit={handleFormSubmit}
					onChange={handleFormChange}
					onClose={() => setShowForm(false)}
					availableTimeSlots={getAvailableTimeSlots(selectedDate)}
				/>
			)}
		</div>
	);
}
