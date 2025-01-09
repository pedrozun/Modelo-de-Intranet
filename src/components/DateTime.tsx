import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { formatDatePtBR, formatTime } from "../utils/dateFormatter";

export function DateTime() {
	const [currentTime, setCurrentTime] = useState(new Date());

	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentTime(new Date());
		}, 1000);

		return () => clearInterval(timer);
	}, []);

	return (
		<div className="text-gray-700 dark:text-gray-300">
			<p className="text-md font-medium">{formatDatePtBR(currentTime)}</p>
			<p className="text-md flex items-center gap-1">
				<Clock className="h-4 w-4" />
				{formatTime(currentTime)}
			</p>
		</div>
	);
}
