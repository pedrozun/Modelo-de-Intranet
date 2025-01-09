import { useState, useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { PdfControls } from "./PdfControls";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
	file: string;
	authToken: string;
  }
  
  export function PdfViewer({ file, authToken }: PdfViewerProps) {
	const [numPages, setNumPages] = useState<number>(0);
	const [pageNumber, setPageNumber] = useState<number>(1);
	const [scale, setScale] = useState<number>(2);
	const [rotation, setRotation] = useState<number>(0);

	const fileObject = useMemo(() => {
	  // Sempre incluir o token de autenticação, independente do ambiente
	  return {
		url: file,
		httpHeaders: {
		  Authorization: `Bearer ${authToken}`,
		},
		withCredentials: true
	  };
	}, [file, authToken]);

	function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
	  setNumPages(numPages);
	}

	const zoomIn = () => setScale((prev) => Math.min(prev + 0.1, 2));
	const zoomOut = () => setScale((prev) => Math.max(prev - 0.1, 0.5));

	const rotate = () => {
	  setRotation((prev) => (prev + 90) % 360);
	};

	const onNextPage = () => setPageNumber((prev) => Math.min(prev + 1, numPages));
	const onPreviousPage = () => setPageNumber((prev) => Math.max(prev - 1, 1));

	return (
	  <div className="flex flex-col h-full">
		<PdfControls
		  pageNumber={pageNumber}
		  numPages={numPages}
		  scale={scale}
		  rotation={rotation}
		  file={file}
		  authToken={authToken}
		  onZoomIn={zoomIn}
		  onZoomOut={zoomOut}
		  onRotate={rotate}
		  onNextPage={onNextPage}
		  onPreviousPage={onPreviousPage}
		/>
  
		<div className="flex-1 overflow-auto custom-scrollbar bg-gray-100 dark:bg-gray-900">
		  <div className="flex justify-center p-4 min-h-full">
			<Document
			  file={fileObject}
			  onLoadSuccess={onDocumentLoadSuccess}
			  className="max-w-full"
			  loading={
				<div className="flex justify-center py-8">
				  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
				</div>
			  }
			  error={
				<div className="text-red-500 dark:text-red-400 text-center p-4">
				  Erro ao carregar o PDF. Por favor, tente novamente.
				</div>
			  }
			>
			  <div className="space-y-4">
				{[...Array(numPages)].map((_, index) => (
				  <Page
					key={index}
					pageNumber={index + 1}
					scale={scale}
					rotate={rotation}
					className="shadow-lg"
					renderTextLayer={true}
					renderAnnotationLayer={true}
				  />
				))}
			  </div>
			</Document>
		  </div>
		</div>
	  </div>
	);
  }