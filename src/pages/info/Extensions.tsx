import React, { useState, useEffect } from "react";
import { Search, NotebookTabs, Phone, User } from "lucide-react";
import { groupExtensions, shortcuts } from "../../data/extensionsData";
import { getAuthToken } from "../../services/authService";

interface Extension {
	extension: string;
	fullname: string;
}

export function ExtensionsPage() {
	const [searchTerm, setSearchTerm] = useState("");
	const [activeTab, setActiveTab] = useState("extensions");
	const [extensions, setExtensions] = useState<Extension[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (activeTab === "extensions") {
			fetchExtensions();
		}
	}, [activeTab]);

	const fetchExtensions = async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/extensions", {
				headers: {
					Authorization: `Bearer ${getAuthToken()}`,
				},
			});

			if (!response.ok) {
				throw new Error("Failed to fetch extensions");
			}

			const data = await response.json();
			setExtensions(data);
			setError(null);
		} catch (error) {
			console.error("Error:", error);
			setError("Failed to load extensions");
		} finally {
			setLoading(false);
		}
	};

	const filteredExtensions = extensions.filter(
		(ext) =>
			ext.extension.toLowerCase().includes(searchTerm.toLowerCase()) ||
			ext.fullname.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<div className="mr-2 ml-2 space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold text-gray-700 dark:text-white flex items-center gap-2">
					<NotebookTabs className="h-8 w-8" />
					Lista de Ramais
				</h1>

				{/* Tabs */}
				<div className="flex space-x-2">
					<button
						onClick={() => setActiveTab("extensions")}
						className={`px-4 py-2 rounded-lg transition-colors ${
							activeTab === "extensions"
								? "bg-blue-500 text-white"
								: "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
						}`}
					>
						Ramais
					</button>
					<button
						onClick={() => setActiveTab("groups")}
						className={`px-4 py-2 rounded-lg transition-colors ${
							activeTab === "groups"
								? "bg-blue-500 text-white"
								: "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
						}`}
					>
						Grupos
					</button>
					<button
						onClick={() => setActiveTab("shortcuts")}
						className={`px-4 py-2 rounded-lg transition-colors ${
							activeTab === "shortcuts"
								? "bg-blue-500 text-white"
								: "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
						}`}
					>
						Atalhos
					</button>
				</div>
			</div>

			{activeTab === "extensions" && (
				<>
					<div className="relative">
						<Search
							className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
							size={20}
						/>
						<input
							type="text"
							placeholder="Pesquisar por ramal ou nome..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
						/>
					</div>

					{loading ? (
						<div className="flex justify-center py-8">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
						</div>
					) : error ? (
						<div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-lg">
							{error}
						</div>
					) : (
						<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
							<div className="overflow-x-auto">
								<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
									<thead className="bg-gray-50 dark:bg-gray-900">
										<tr>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
												Ramal
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
												Nome
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-gray-200 dark:divide-gray-700">
										{filteredExtensions.map((ext, index) => (
											<tr
												key={index}
												className="hover:bg-gray-50 dark:hover:bg-gray-700"
											>
												<td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
													<div className="flex items-center">
														<Phone
															size={16}
															className="mr-2 text-gray-400"
														/>
														{ext.extension}
													</div>
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
													<div className="flex items-center">
														<User
															size={16}
															className="mr-2 text-gray-400"
														/>
														{ext.fullname}
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					)}
				</>
			)}

			{activeTab === "groups" && (
				<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
							<thead className="bg-gray-50 dark:bg-gray-900">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Ramal
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Grupo
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200 dark:divide-gray-700">
								{groupExtensions.map((item, index) => (
									<tr
										key={index}
										className="hover:bg-gray-50 dark:hover:bg-gray-700"
									>
										<td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
											<div className="flex items-center">
												<Phone
													size={16}
													className="mr-2 text-gray-400"
												/>
												{item.ramal}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
											{item.grupo}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{activeTab === "shortcuts" && (
				<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
							<thead className="bg-gray-50 dark:bg-gray-900">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Atalho
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Função
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200 dark:divide-gray-700">
								{shortcuts.map((item, index) => (
									<tr
										key={index}
										className="hover:bg-gray-50 dark:hover:bg-gray-700"
									>
										<td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100 font-mono">
											{item.code}
										</td>
										<td className="px-6 py-4 text-gray-900 dark:text-gray-100">
											{item.description}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</div>
	);
}
