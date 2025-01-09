import { useState, useEffect, useMemo } from "react";
import { FileText, Search, ChevronLeft, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PdfViewer } from "../../components/PdfViewer/PdfViewer";
import { getAuthToken } from "../../services/authService";
import { useNavigate } from "react-router-dom";

interface Paper {
	name: string;
	path: string;
}

const categories = [
	{ label: "Todos", tag: "ALL", description: "Visualizar todos os documentos" },
	{
		label: "Homologação",
		tag: "HMO",
		description: "Documentos de homologação de produtos",
	},
	{
		label: "Pesquisa Técnica",
		tag: "PST",
		description: "Relatórios de pesquisas técnicas",
	},
	{
		label: "Manual de Orientação",
		tag: "MDO",
		description: "Manuais e guias de orientação",
	},
	{
		label: "Avaliação de Hardware",
		tag: "ADH",
		description: "Relatórios de avaliação de hardware",
	},
	{
		label: "Informação Técnica",
		tag: "IFT",
		description: "Documentos de informação técnica",
	},
];

export function PapersPage() {
	const [papers, setPapers] = useState<Paper[]>([]);
	const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("ALL");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
	const [showCategoryMenu, setShowCategoryMenu] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		async function loadPapers() {
			try {
				setIsLoading(true);
				const authToken = getAuthToken();
				const response = await fetch("/api/papers", {
					headers: {
						Authorization: `Bearer ${authToken}`,
					},
				});

				if (!response.ok) {
					if (response.status === 401) {
						throw new Error("Unauthorized access. Please log in again.");
					}
					throw new Error("Failed to fetch papers");
				}

				const data = await response.json();
				const transformedData = data.map((paper: Paper) => ({
					...paper,
					path: `/api/papers/${paper.name}.pdf` // Always use the API route
				  }));
				setPapers(transformedData);
				setError(null);
			} catch (error) {
				const message =
					error instanceof Error ? error.message : "Failed to load papers";
				setError(message);
				if (message.includes("Unauthorized")) {
					navigate("/login");
				}
			} finally {
				setIsLoading(false);
			}
		}

		loadPapers();
	}, [navigate]);

	const memoizedFile = useMemo(
		() => selectedPaper?.path || null,
		[selectedPaper?.path]
	);

	const filteredPapers = useMemo(() => {
		return papers.filter((paper) => {
			const matchesSearch = paper.name
				.toLowerCase()
				.includes(searchTerm.toLowerCase().trim());
			const matchesCategory =
				selectedCategory === "ALL" || paper.name.includes(selectedCategory);
			return matchesSearch && matchesCategory;
		});
	}, [papers, searchTerm, selectedCategory]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	return (
		<div className="flex h-full">
			<div
				className={`flex-shrink-0 transition-all duration-300 h-full ${
					isSidebarOpen ? "w-80" : "w-0 overflow-hidden"
				}`}
			>
				<div className="flex flex-col h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-lg shadow-lg mr-4 border border-gray-200 dark:border-gray-700">
					<div className="p-4 border-b border-gray-200 dark:border-gray-700">
						<h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
							<FileText className="h-8 w-8" />
							Papers Publicados
						</h1>

						<div className="relative mt-4">
							<button
								onClick={() => setShowCategoryMenu(!showCategoryMenu)}
								className="w-full px-4 py-2 text-sm rounded-lg transition-all duration-200
                         bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
                         text-gray-700 dark:text-gray-200 font-medium
                         flex items-center justify-between"
							>
								<span className="flex items-center gap-2">
									<Filter className="h-4 w-4" />
									{categories.find((c) => c.tag === selectedCategory)?.label ||
										"Categorias"}
								</span>
								<ChevronLeft
									className={`h-4 w-4 transition-transform duration-200 ${
										showCategoryMenu ? "rotate-90" : "-rotate-90"
									}`}
								/>
							</button>

							<AnimatePresence>
								{showCategoryMenu && (
									<motion.div
										initial={{ opacity: 0, y: -10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -10 }}
										className="absolute z-10 w-full mt-2 py-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600"
									>
										{categories.map((category) => (
											<button
												key={category.tag}
												onClick={() => {
													setSelectedCategory(category.tag);
													setShowCategoryMenu(false);
												}}
												className={`w-full px-4 py-2 text-sm transition-colors duration-200
                                  hover:bg-gray-100 dark:hover:bg-gray-600
                                  ${
																		selectedCategory === category.tag
																			? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
																			: "text-gray-700 dark:text-gray-200"
																	}`}
											>
												<div className="text-left">
													<div className="font-medium">{category.label}</div>
													<div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
														{category.description}
													</div>
												</div>
											</button>
										))}
									</motion.div>
								)}
							</AnimatePresence>
						</div>

						<div className="relative mt-4">
							<Search
								className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
								size={18}
							/>
							<input
								type="text"
								placeholder="Pesquisar papers..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full pl-10 pr-4 py-2 text-sm rounded-lg 
                         border border-gray-200 dark:border-gray-600 
                         bg-gray-50 dark:bg-gray-700
                         text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         dark:focus:ring-blue-400 transition-colors duration-200
                         placeholder-gray-500 dark:placeholder-gray-400"
							/>
						</div>
					</div>

					<div className="flex-1 overflow-y-auto custom-scrollbar">
						{filteredPapers.length > 0 ? (
							<div className="divide-y divide-gray-200 dark:divide-gray-700">
								{filteredPapers.map((paper, index) => (
									<motion.button
										key={index}
										onClick={() => setSelectedPaper(paper)}
										className={`w-full p-4 text-left transition-all duration-200
                              hover:bg-gray-50 dark:hover:bg-gray-700/50
                              ${
																selectedPaper?.path === paper.path
																	? "bg-blue-50 dark:bg-blue-900/30 shadow-sm"
																	: ""
															}`}
										whileHover={{ scale: 1.0 }}
										whileTap={{ scale: 0.8 }}
									>
										<div className="flex items-center gap-3">
											<div
												className={`p-2 rounded-lg ${
													selectedPaper?.path === paper.path
														? "bg-blue-100 dark:bg-blue-900/50"
														: "bg-gray-100 dark:bg-gray-700"
												}`}
											>
												<FileText
													className={`h-5 w-5 ${
														selectedPaper?.path === paper.path
															? "text-blue-500 dark:text-blue-400"
															: "text-gray-500 dark:text-gray-400"
													}`}
												/>
											</div>
											<div>
												<span
													className={`font-medium ${
														selectedPaper?.path === paper.path
															? "text-blue-600 dark:text-blue-400"
															: "text-gray-700 dark:text-gray-200"
													}`}
												>
													{paper.name}
												</span>
												<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
													Clique para visualizar
												</p>
											</div>
										</div>
									</motion.button>
								))}
							</div>
						) : (
							<div className="p-4 text-center text-gray-500 dark:text-gray-400">
								Nenhum paper encontrado
							</div>
						)}
					</div>
				</div>
			</div>

			<div className="flex-1 flex flex-col h-full">
				<div className="mb-4 flex items-center justify-between">
					<button
						onClick={() => setIsSidebarOpen(!isSidebarOpen)}
						className="p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg
                     hover:bg-gray-100 dark:hover:bg-gray-700 
                     transition-colors duration-200 shadow-md
                     border border-gray-200 dark:border-gray-700"
						title={isSidebarOpen ? "Ocultar sidebar" : "Mostrar sidebar"}
					>
						<ChevronLeft
							className={`h-5 w-5 transition-transform duration-200 
                         ${!isSidebarOpen ? "rotate-180" : ""} 
                         text-gray-700 dark:text-gray-200`}
						/>
					</button>
					<h1 className="text-xl font-bold text-gray-700 dark:text-white">
						{selectedPaper?.name || "Selecione um paper"}
					</h1>
					<div className="w-8" />
				</div>

				{error && (
					<div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg mb-4">
						{error}
					</div>
				)}

				<div className="flex-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
					{selectedPaper ? (
						memoizedFile && (
							<PdfViewer
								file={memoizedFile}
								authToken={getAuthToken()}
							/>
						)
					) : (
						<div className="h-full flex items-center justify-center">
							<div className="text-center text-gray-500 dark:text-gray-400">
								<FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
								<p className="text-lg font-medium">
									Selecione um paper para visualizar
								</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
