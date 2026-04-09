import { useState, useCallback, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, FileText, ZoomIn, ZoomOut } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

const PDF_NATIVE_WIDTH = 595;
const ZOOM_STEP = 20;
const ZOOM_MIN = 50;
const ZOOM_MAX = 200;

interface PdfViewerProps {
  url: string;
}

export function PdfViewer({ url }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [zoomPct, setZoomPct] = useState<number>(75);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const computeFitZoom = useCallback((width: number) => {
    const fit = Math.round((width / PDF_NATIVE_WIDTH) * 100);
    return Math.max(ZOOM_MIN, Math.min(100, fit));
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      if (w > 0) {
        setContainerWidth(w);
        setZoomPct(prev => {
          if (prev === 75) return computeFitZoom(w);
          return prev;
        });
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [computeFitZoom]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setPageNumber(1);
    setNumPages(0);
    if (containerRef.current) {
      const w = containerRef.current.clientWidth;
      if (w > 0) setZoomPct(computeFitZoom(w));
    }
  }, [url, computeFitZoom]);

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
  const zoomIn = () => setZoomPct(p => Math.min(ZOOM_MAX, p + ZOOM_STEP));
  const zoomOut = () => setZoomPct(p => Math.max(ZOOM_MIN, p - ZOOM_STEP));

  const pageWidth = containerWidth > 0 ? Math.round((PDF_NATIVE_WIDTH * zoomPct) / 100) : undefined;

  return (
    <div
      ref={containerRef}
      className="w-full flex flex-col"
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
            style={{ minHeight: "60vh", maxHeight: "72vh" }}
            data-testid="div-pdf-scroll-area"
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
                width={pageWidth}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="shadow-md"
                data-testid="div-pdf-page"
              />
            </Document>
          </div>

          {!loading && numPages > 0 && (
            <div className="flex items-center gap-1 py-2 border-t border-gray-100 w-full justify-center bg-white flex-wrap">
              <button
                onClick={zoomOut}
                disabled={zoomPct <= ZOOM_MIN}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                data-testid="button-pdf-zoom-out"
                title="縮小"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span
                className="text-xs text-muted-foreground w-10 text-center tabular-nums"
                data-testid="text-pdf-zoom"
              >
                {zoomPct}%
              </span>
              <button
                onClick={zoomIn}
                disabled={zoomPct >= ZOOM_MAX}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                data-testid="button-pdf-zoom-in"
                title="放大"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <div className="w-px h-4 bg-gray-200 mx-1" />

              <button
                onClick={prevPage}
                disabled={pageNumber <= 1}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                data-testid="button-pdf-prev"
                title="上一頁"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-muted-foreground tabular-nums" data-testid="text-pdf-page-info">
                {pageNumber} / {numPages}
              </span>
              <button
                onClick={nextPage}
                disabled={pageNumber >= numPages}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                data-testid="button-pdf-next"
                title="下一頁"
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
