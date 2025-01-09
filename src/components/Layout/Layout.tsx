import React from "react";
import { motion } from "framer-motion";
import { Sidebar } from "../Sidebar/Sidebar";
import { Header } from "../Header";
import { Footer } from "./Footer";
import { useTheme } from "../../contexts/ThemeContext";

interface LayoutProps {
	children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
	const { theme } = useTheme();

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.3 }}
			className="flex h-screen overflow-hidden relative"
		>
			<Sidebar />
			<div className="flex flex-col flex-1 z-10">
				<Header />
				<main className="flex-1 p-4 overflow-hidden">
					<div
						className={`h-full backdrop-blur-lg rounded-2xl p-6 shadow-2xl border overflow-hidden
                        transition-colors duration-300
                        ${
													theme === "dark"
														? "bg-white/5 border-white/10"
														: "bg-white/60 border-white/20"
												}`}
					>
						<div className="h-full overflow-y-auto custom-scrollbar">
							{children}
						</div>
					</div>
				</main>
				<Footer />
			</div>
		</motion.div>
	);
}
