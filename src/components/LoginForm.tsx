import React, { useState, useEffect, useRef } from "react";
import { User, KeyRound } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

interface LoginFormProps {
	onSubmit: (
		username: string,
		password: string,
		rememberMe: boolean
	) => Promise<void>;
	error?: string;
	initialUsername?: string;
}

export function LoginForm({
	onSubmit,
	error,
	initialUsername,
}: LoginFormProps) {
	const [username, setUsername] = useState(initialUsername || "");
	const [password, setPassword] = useState("");
	const [rememberMe, setRememberMe] = useState(false);
	const { theme } = useTheme();
	const usernameInputRef = useRef<HTMLInputElement>(null);

	// Carregar dados do localStorage quando o componente for montado
	useEffect(() => {
		const savedUsername = localStorage.getItem("username");
		const savedPassword = localStorage.getItem("password");
		const savedRememberMe = localStorage.getItem("rememberMe") === "true";

		if (savedRememberMe) {
			setUsername(savedUsername || "");
			setPassword(savedPassword || "");
			setRememberMe(savedRememberMe);
		}
	}, []);

	// Jogar foco no campo de input do usuário ao carregar o componente
	useEffect(() => {
		if (usernameInputRef.current) {
			usernameInputRef.current.focus();
		}
	}, []);

	// Salvar dados no localStorage quando o "rememberMe" for alterado
	useEffect(() => {
		if (rememberMe) {
			localStorage.setItem("username", username);
			localStorage.setItem("password", password);
			localStorage.setItem("rememberMe", "true");
		} else {
			localStorage.removeItem("username");
			localStorage.removeItem("password");
			localStorage.removeItem("rememberMe");
		}
	}, [rememberMe, username, password]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await onSubmit(username, password, rememberMe);
	};

	const buttonClasses =
		theme === "dark"
			? "bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900"
			: "bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-700";

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-6"
			autoComplete="on" // Adicionando autoComplete para todo o formulário
		>
			{error && (
				<div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm backdrop-blur-lg">
					{error}
				</div>
			)}

			{/* Usuário */}
			<div className="space-y-2">
				<label
					htmlFor="username"
					className="block text-sm font-medium text-gray-700 dark:text-gray-300"
				>
					Usuário
				</label>
				<div className="relative group">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<User className="h-5 w-5 text-gray-400 group-focus-within:text-gray-600 dark:text-gray-400 dark:group-focus-within:text-gray-300" />
					</div>
					<input
						id="username"
						ref={usernameInputRef}
						type="text"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						className="pl-10 w-full px-4 py-2.5 bg-gray-0 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 
                      text-gray-900 dark:text-gray-100 rounded-lg 
                      transition-all placeholder-gray-500 dark:placeholder-gray-400"
						placeholder="Digite seu usuário"
						required
						autoComplete="username" // Adicionando autocomplete para o campo de usuário
					/>
				</div>
			</div>

			{/* Senha */}
			<div className="space-y-2">
				<label
					htmlFor="password"
					className="block text-sm font-medium text-gray-700 dark:text-gray-300"
				>
					Senha
				</label>
				<div className="relative group">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<KeyRound className="h-5 w-5 text-gray-400 group-focus-within:text-gray-600 dark:text-gray-400 dark:group-focus-within:text-gray-300" />
					</div>
					<input
						id="password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="pl-10 w-full px-4 py-2.5 bg-gray-0 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 
                      text-gray-900 dark:text-gray-100 rounded-lg 
                      transition-all placeholder-gray-500 dark:placeholder-gray-400"
						placeholder="Digite sua senha"
						required
						autoComplete="current-password" // Adicionando autocomplete para o campo de senha
					/>
				</div>
			</div>

			{/* Lembrar usuário */}
			<div className="flex items-center space-x-2">
				<label className="relative inline-flex items-center cursor-pointer">
					<input
						type="checkbox"
						id="remember"
						checked={rememberMe}
						onChange={(e) => setRememberMe(e.target.checked)}
						className="sr-only peer"
					/>
					<div
						className={`w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 
              ${
								theme === "dark"
									? "peer-focus:ring-gray-200"
									: "peer-focus:ring-black"
							} 
              rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-300 dark:peer-checked:bg-blue-200`}
					></div>
					<div className="absolute left-[2px] top-[2px] w-5 h-5 bg-white rounded-full transition-all peer-checked:translate-x-5 peer-checked:bg-blue-500"></div>
				</label>
				<label
					htmlFor="remember"
					className="text-sm text-gray-700 dark:text-gray-300"
				>
					Lembrar usuário
				</label>
			</div>

			{/* Botão de Submit */}
			<button
				type="submit"
				className={`w-full py-3 px-4 text-white rounded-lg font-medium transition-all duration-200 shadow-lg
             focus:outline-none focus:ring-2 
            ${theme === "dark" ? "focus:ring-gray-200" : "focus:ring-black"} 
            ${buttonClasses}`}
			>
				Entrar
			</button>
		</form>
	);
}
