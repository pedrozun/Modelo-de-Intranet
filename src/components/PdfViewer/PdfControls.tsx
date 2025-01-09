import React from "react";
import {
	ChevronLeft,
	ChevronRight,
	ZoomIn,
	ZoomOut,
	Download,
	RotateCw,
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { downloadFile } from "../../utils/downloadUtils";

interface PdfControlsProps {
	pageNumber: number;
	numPages: number;
	scale: number;
	rotation: number;
	file: string;
	authToken: string;
	onPreviousPage: () => void;
	onNextPage: () => void;
	onZoomIn: () => void;
	onZoomOut: () => void;
	onRotate: () => void;
}

export function PdfControls({
	pageNumber,
	numPages,
	scale,
	rotation,
	file,
	authToken,
	onPreviousPage,
	onNextPage,
	onZoomIn,
	onZoomOut,
	onRotate,
}: PdfControlsProps) {
	const { theme } = useTheme();
	const isDark = theme === "dark";

	const handleDownload = async () => {
		try {
			const filename = file.split("/").pop() || "document.pdf";
			await downloadFile(file, filename, authToken);
		} catch (error) {
			console.error("Download failed:", error);
		}
	};

	const buttonClass = `
    p-2 rounded-lg transition-colors
    ${
			isDark
				? "hover:bg-gray-700 disabled:opacity-50 disabled:hover:bg-transparent"
				: "hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
		}
  `;

	return (
		<div
			className={`
      flex items-center justify-between p-1 backdrop-blur-sm border-b
      ${
				isDark
					? "bg-gray-800/50 text-white border-gray-700"
					: "bg-white/80 text-gray-800 border-gray-200"
			}
    `}
		>
			<div className="flex items-center gap-2">
				<button
					onClick={onZoomOut}
					disabled={scale <= 0.5}
					className={buttonClass}
					title="Diminuir zoom"
				>
					<ZoomOut className="w-5 h-5" />
				</button>
				<span className="text-sm min-w-[4rem]">{Math.round(scale * 100)}%</span>
				<button
					onClick={onZoomIn}
					disabled={scale >= 2}
					className={buttonClass}
					title="Aumentar zoom"
				>
					<ZoomIn className="w-5 h-5" />
				</button>

				<div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-2" />

				<button
					onClick={onRotate}
					className={buttonClass}
					title="Rotacionar"
				>
					<RotateCw className="w-5 h-5" />
				</button>
				<span className="text-sm min-w-[4rem]">{rotation}°</span>

				<div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-2" />

				<button
					onClick={handleDownload}
					className={buttonClass}
					title="Baixar PDF"
				>
					<Download className="w-5 h-5" />
				</button>
			</div>
		</div>
	);
}
