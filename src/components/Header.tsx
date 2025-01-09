import { useAuth } from "../contexts/AuthContext";
import { DateTime } from "./DateTime";
import { ThemeToggle } from "./ThemeToggle";

const formatUsername = (username?: string) => {
	if (!username) return "Usuário";
	return username
		.split(".")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
};

export function Header() {
	const { user } = useAuth();

	return (
		<header className="bg-gray-100/80 dark:bg-white/5 backdrop-blur-lg border-b border-gray-200 dark:border-white/10 px-6 py-1">
			<div className="flex items-center justify-between">
				<DateTime />
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-3">
						<div className="text-right">
							<p className="text-md font-medium text-gray-700 dark:text-gray-200">
								{formatUsername(user?.username)}
							</p>
						</div>
						<ThemeToggle />
					</div>
				</div>
			</div>
		</header>
	);
}

export function HeaderUsr() {
	return (
		<header className="bg-gray-100/80 dark:bg-white/5 backdrop-blur-lg border-b border-gray-200 dark:border-white/10 px-6 py-1">
			<div className="flex items-center justify-between">
				<DateTime />
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-3">
						<div className="text-right"></div>
						<ThemeToggle />
					</div>
				</div>
			</div>
		</header>
	);
}
