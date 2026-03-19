import { useState, useCallback, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PdfViewerProps {
  url: string;
}

export function PdfViewer({ url }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setPageNumber(1);
    setNumPages(0);
  }, [url]);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setLoading(false);
    setError(null);
  }, []);

  const onDocumentLoadError = useCallback(() => {
    setLoading(false);
    setError("PDF 載入失敗，請稍後再試");
  }, []);

  const prevPage = () => setPageNumber(p => Math.max(1, p - 1));
  const nextPage = () => setPageNumber(p => Math.min(numPages, p + 1));

  return (
    <div
      className="w-full flex flex-col items-center"
      style={{ userSelect: "none", WebkitUserSelect: "none" }}
      onContextMenu={e => e.preventDefault()}
    >
      {error ? (
        <div className="w-full flex items-center justify-center bg-gray-50" style={{ height: "60vh" }}>
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <FileText className="w-10 h-10 text-gray-300" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      ) : (
        <>
          <div
            className="w-full overflow-auto bg-gray-100 flex justify-center"
            style={{ minHeight: "60vh", maxHeight: "70vh" }}
          >
            <Document
              file={url}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="w-full flex items-center justify-center bg-gray-50" style={{ height: "60vh" }}>
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <div className="w-8 h-8 border-2 border-tiffany border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">載入中...</span>
                  </div>
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="shadow-md"
              />
            </Document>
          </div>
          {!loading && numPages > 0 && (
            <div className="flex items-center gap-3 py-2 border-t border-gray-100 w-full justify-center bg-white">
              <button
                onClick={prevPage}
                disabled={pageNumber <= 1}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                data-testid="button-pdf-prev"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-muted-foreground" data-testid="text-pdf-page-info">
                {pageNumber} / {numPages}
              </span>
              <button
                onClick={nextPage}
                disabled={pageNumber >= numPages}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                data-testid="button-pdf-next"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
