import { Sun, Moon } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export function ThemeToggle() {
	const { theme, toggleTheme } = useTheme();

	return (
		<button
			onClick={toggleTheme}
			className="p-2 rounded-lg transition-colors duration-200
                dark:bg-gray-700 dark:hover:bg-gray-500 dark:text-gray-200
                bg-gray-200 hover:bg-gray-300 text-gray-800"
			aria-label="Toggle theme"
		>
			{theme === "dark" ? (
				<Sun className="h-15 w-15" />
			) : (
				<Moon className="h-15 w-15" />
			)}
		</button>
	);
}
