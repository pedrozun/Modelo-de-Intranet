import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { LoginForm } from "../components/LoginForm";
import { Footer } from "../components/Layout/Footer";
import { HeaderUsr } from "../components/Header";
export function LoginPage() {
	const [error, setError] = useState("");
	const navigate = useNavigate();
	const { login } = useAuth();
	const { theme } = useTheme();

	const savedUsername = localStorage.getItem("rememberedUsername");

	const handleSubmit = async (
		username: string,
		password: string,
		rememberMe: boolean
	) => {
		try {
			await login(username, password);
			if (rememberMe) {
				localStorage.setItem("rememberedUsername", username);
			} else {
				localStorage.removeItem("rememberedUsername");
			}
			navigate("/", { replace: true });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Erro ao fazer login");
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.3 }}
			className="min-h-screen flex flex-col relative"
		>
			<HeaderUsr />
			<div className="flex-grow relative flex items-center justify-center">
				<div className="absolute top-4 right-4 z-10"></div>
				<motion.div
					initial={{ scale: 0.95, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.3 }}
					className={`relative backdrop-blur-lg rounded-2xl p-8 w-full max-w-md shadow-2xl border
                    transition-colors duration-300
                    ${
											theme === "dark"
												? "bg-white/5 border-white/10"
												: "bg-white/60 border-gray-200"
										}`}
				>
					<div className="flex flex-col items-center mb-8">
						<motion.div
							initial={{ y: -10, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ delay: 0.1, duration: 0.3 }}
							className="w-100 h-100 mb-6"
						>
							<img
								src="/logo.png"
								alt="K&M Logo"
								className="w-full h-full object-contain"
							/>
						</motion.div>
						<motion.h1
							initial={{ y: -10, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ delay: 0.2, duration: 0.3 }}
							className={`text-3xl font-bold mb-2 transition-colors duration-300
                       ${theme === "dark" ? "text-gray-100" : "text-gray-700"}`}
						>
							Intranet
						</motion.h1>
						<motion.p
							initial={{ y: -10, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ delay: 0.3, duration: 0.3 }}
							className={`transition-colors duration-300
                      ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
						>
							Faça login para continuar
						</motion.p>
					</div>

					<motion.div
						initial={{ y: 10, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.4, duration: 0.3 }}
					>
						<LoginForm
							onSubmit={handleSubmit}
							error={error}
							initialUsername={savedUsername || ""}
						/>
					</motion.div>
				</motion.div>
			</div>
			<div className={`${theme === "dark" ? "bg-gray-900" : "bg-gray-100"}`}>
				<Footer />
			</div>
		</motion.div>
	);
}
