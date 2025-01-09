export function Footer() {
	const currentYear = new Date().getFullYear(); // Obtém o ano atual

	return (
		<footer className="bg-gray-100/80 dark:bg-white/5 backdrop-blur-lg border-t border-gray-200 dark:border-white/10 py-2 px-6 z-10">
			<div className="flex justify-between items-center">
				<div>
					<p className="text-sm text-gray-400">
						&copy; {currentYear} Empresa. Todos os direitos reservados.
					</p>
				</div>
				<div className="text-sm text-gray-500">
					<p>Versão 1.0.0</p>
				</div>
			</div>
		</footer>
	);
}
