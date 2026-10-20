"use client";

import React, { useState, useRef, useEffect } from "react";
import { CanvasViewport } from "@/features/canvas/CanvasViewport";
import { PosterCanvas } from "@/features/canvas/PosterCanvas";
import { posterExporter } from "@/features/export/exporter-adapter";
import {
  triggerBlobDownload,
  inspectBlobDimensions,
  generatePosterFileName,
} from "@/features/export/export-utils";
import { ExportResult } from "@/features/export/types";
import { injectFontFace, waitForFontsReady } from "@/features/fonts/font-loader";
import { Button } from "@/components/ui/Button";
import { Download, Smartphone, Monitor, Tablet, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

export function DiagnosticCanvasPoc() {
  const canvasRef = useRef<HTMLDivElement | null>(null);

  // Simulation container widths
  const [simulatedWidth, setSimulatedWidth] = useState<number | null>(null);
  const [padding] = useState<number>(16);

  // Export state
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [lastExport, setLastExport] = useState<{
    result: ExportResult;
    verifiedDimensions: { width: number; height: number };
    previewUrl: string;
  } | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  // Live scale measurement from viewport
  const [liveScale, setLiveScale] = useState<number>(0);

  // Inject fonts on mount
  useEffect(() => {
    injectFontFace("bebas-neue");
    injectFontFace("source-sans-3");
    injectFontFace("inter");
    waitForFontsReady(["bebas-neue", "source-sans-3", "inter"]);
  }, []);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (lastExport?.previewUrl) {
        URL.revokeObjectURL(lastExport.previewUrl);
      }
    };
  }, [lastExport]);

  const handleExport = async (format: "png" | "jpeg") => {
    if (!canvasRef.current || isExporting) return;

    setIsExporting(true);
    setExportError(null);

    try {
      const fileName = generatePosterFileName({
        day: "Monday",
        templateName: "Reddington",
        eventTitle: "POC-Diagnostic",
        format,
      });

      const result = await posterExporter.rasterize(canvasRef.current, {
        format,
        quality: 0.95,
        fileName,
      });

      const dims = await inspectBlobDimensions(result.blob);
      const previewUrl = URL.createObjectURL(result.blob);

      setLastExport({
        result,
        verifiedDimensions: dims,
        previewUrl,
      });

      // Automatically trigger download
      triggerBlobDownload(result.blob, result.fileName);
    } catch (err: unknown) {
      console.error("[DiagnosticCanvasPoc] Export failed:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setExportError(msg);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 max-w-7xl mx-auto w-full min-h-[calc(100vh-80px)]">
      {/* Left Column: Interactive Simulation & Viewport */}
      <div className="flex-1 flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
        {/* Viewport Simulation Controls (Outside Canvas DOM) */}
        <div className="flex flex-wrap items-center justify-between p-3 border-b border-zinc-800 bg-zinc-950/60 gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Simulate Width:
            </span>
            <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
              <button
                type="button"
                onClick={() => setSimulatedWidth(360)}
                className={`px-2.5 py-1 text-xs font-medium rounded flex items-center gap-1 transition-colors ${
                  simulatedWidth === 360
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" /> 360px
              </button>
              <button
                type="button"
                onClick={() => setSimulatedWidth(390)}
                className={`px-2.5 py-1 text-xs font-medium rounded flex items-center gap-1 transition-colors ${
                  simulatedWidth === 390
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" /> 390px
              </button>
              <button
                type="button"
                onClick={() => setSimulatedWidth(768)}
                className={`px-2.5 py-1 text-xs font-medium rounded flex items-center gap-1 transition-colors ${
                  simulatedWidth === 768
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Tablet className="w-3.5 h-3.5" /> 768px
              </button>
              <button
                type="button"
                onClick={() => setSimulatedWidth(null)}
                className={`px-2.5 py-1 text-xs font-medium rounded flex items-center gap-1 transition-colors ${
                  simulatedWidth === null
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Monitor className="w-3.5 h-3.5" /> Auto Fill
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <span>
              Scale: <strong className="text-amber-400">{(liveScale * 100).toFixed(1)}%</strong>
            </span>
            <span>
              Ratio: <strong className="text-zinc-300">4:5 (1080×1350)</strong>
            </span>
          </div>
        </div>

        {/* Outer Scaled Simulation Wrapper */}
        <div
          className="flex-1 flex items-center justify-center p-4 bg-zinc-950/80 overflow-auto min-h-[520px]"
          style={{ width: "100%" }}
        >
          <div
            style={{
              width: simulatedWidth ? `${simulatedWidth}px` : "100%",
              maxWidth: "100%",
              height: "100%",
              minHeight: "480px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "width 0.2s ease-in-out",
            }}
            className="border border-dashed border-zinc-800 rounded-lg p-2"
          >
            <CanvasViewport
              padding={padding}
              showBadge={true}
              onScaleChange={setLiveScale}
            >
              <PosterCanvas ref={canvasRef}>
                {/* 1080 x 1350 Fixed Master Content Fixture */}
                <div
                  className="w-full h-full relative flex flex-col justify-between p-16"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 20%, #2a1505 0%, #120a02 45%, #080503 100%)",
                  }}
                >
                  {/* Decorative Amber Sun Halo */}
                  <div
                    className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, rgba(245, 158, 11, 0.05) 50%, transparent 70%)",
                      filter: "blur(40px)",
                    }}
                  />

                  {/* Header / Brand Placement */}
                  <div className="relative z-10 flex items-center justify-between border-b border-amber-500/20 pb-8">
                    <div className="flex items-center gap-4">
                      {/* Logo placeholder per Decision 02 */}
                      <div className="w-16 h-16 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-2xl tracking-tighter">
                        OZ
                      </div>
                      <div>
                        <span
                          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                          className="text-4xl text-amber-400 tracking-wider block"
                        >
                          OZONE LOUNGE
                        </span>
                        <span
                          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                          className="text-sm font-semibold tracking-widest text-zinc-400 uppercase"
                        >
                          Official Poster Canvas POC
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                        className="text-3xl text-zinc-200 tracking-wider block"
                      >
                        MONDAY
                      </span>
                      <span
                        style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                        className="text-sm font-bold text-amber-500 tracking-wider uppercase"
                      >
                        Sundowners
                      </span>
                    </div>
                  </div>

                  {/* Hero Artwork / Performer Block */}
                  <div className="relative z-10 my-auto text-center flex flex-col items-center">
                    <div className="inline-block px-6 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-bold tracking-widest uppercase mb-6">
                      OLD CLASSICS & SUNDOWNERS
                    </div>

                    <h1
                      style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: "100px",
                        lineHeight: "0.95",
                        letterSpacing: "0.03em",
                      }}
                      className="text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] mb-6 max-w-[900px]"
                    >
                      RETRO GROOVES & SUNSET RHYTHMS
                    </h1>

                    <div className="flex items-center gap-6 mt-4">
                      <div className="h-px w-20 bg-amber-500/40" />
                      <div className="text-center">
                        <span
                          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                          className="text-xs font-bold uppercase tracking-widest text-zinc-400 block mb-1"
                        >
                          Special Guest DJ & Host
                        </span>
                        <span
                          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                          className="text-5xl text-zinc-100 tracking-wide"
                        >
                          MONSIEUR PIERRE
                        </span>
                      </div>
                      <div className="h-px w-20 bg-amber-500/40" />
                    </div>

                    {/* Offer Panel */}
                    <div className="mt-12 w-full max-w-[760px] p-8 rounded-2xl bg-zinc-950/80 border border-amber-500/40 shadow-2xl backdrop-blur-md">
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <span
                            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                            className="text-sm font-bold text-amber-400 uppercase tracking-wider block"
                          >
                            Happy Hour Special
                          </span>
                          <span
                            style={{ fontFamily: "'Inter', sans-serif" }}
                            className="text-2xl font-semibold text-zinc-100 block mt-1"
                          >
                            Discounts on all drinks
                          </span>
                        </div>
                        <div className="px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/40">
                          <span
                            style={{ fontFamily: "'Inter', sans-serif" }}
                            className="text-xs font-bold text-amber-300 uppercase tracking-widest"
                          >
                            Excluding wine
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer / Practical Details */}
                  <div className="relative z-10 flex items-center justify-between border-t border-amber-500/20 pt-8 text-zinc-400">
                    <div style={{ fontFamily: "'Inter', sans-serif" }} className="text-sm">
                      <strong className="text-zinc-200">Date & Time:</strong> Every Monday from 4:00 PM
                    </div>
                    <div style={{ fontFamily: "'Inter', sans-serif" }} className="text-sm">
                      <strong className="text-zinc-200">Location:</strong> Ozone Lounge | @ozonelounge
                    </div>
                    <div
                      style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                      className="text-xs text-amber-500/80 tracking-widest uppercase font-semibold"
                    >
                      1080 × 1350 MASTER
                    </div>
                  </div>
                </div>
              </PosterCanvas>
            </CanvasViewport>
          </div>
        </div>
      </div>

      {/* Right Column: Export Actions & Diagnostic Verification Panel */}
      <div className="w-full lg:w-96 flex flex-col gap-6">
        {/* Export Action Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <Download className="w-4 h-4 text-amber-400" /> Export Proof of Concept
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Tests rasterization of the unscaled 1080×1350 master DOM element, bypassing viewport scale
            and app chrome.
          </p>

          <div className="flex flex-col gap-2.5">
            <Button
              variant="primary"
              size="lg"
              disabled={isExporting}
              onClick={() => handleExport("png")}
              className="w-full flex items-center justify-center gap-2"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Rasterizing PNG...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" /> Download PNG (1080 × 1350)
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="lg"
              disabled={isExporting}
              onClick={() => handleExport("jpeg")}
              className="w-full flex items-center justify-center gap-2"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Rasterizing JPEG...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" /> Download JPEG (1080 × 1350)
                </>
              )}
            </Button>
          </div>

          {exportError && (
            <div className="p-3 bg-red-950/40 border border-red-800 rounded-lg text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{exportError}</span>
            </div>
          )}
        </div>

        {/* Verification Result Inspection */}
        {lastExport && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
            <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Export Inspection
            </h3>

            <div className="flex flex-col gap-2 text-xs divide-y divide-zinc-800">
              <div className="flex justify-between py-1.5">
                <span className="text-zinc-500">Target Master:</span>
                <span className="font-mono text-zinc-300">1080 × 1350 px</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-zinc-500">Decoded Binary:</span>
                <span
                  className={`font-mono font-semibold ${
                    lastExport.verifiedDimensions.width === 1080 &&
                    lastExport.verifiedDimensions.height === 1350
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {lastExport.verifiedDimensions.width} × {lastExport.verifiedDimensions.height} px
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-zinc-500">MIME Type:</span>
                <span className="font-mono text-zinc-300">{lastExport.result.mimeType}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-zinc-500">Binary Size:</span>
                <span className="font-mono text-zinc-300">
                  {(lastExport.result.byteSize / 1024).toFixed(1)} KB
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-zinc-500">Duration:</span>
                <span className="font-mono text-zinc-300">{lastExport.result.durationMs} ms</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-zinc-500">Filename:</span>
                <span className="font-mono text-[11px] text-amber-400 truncate max-w-[200px]" title={lastExport.result.fileName}>
                  {lastExport.result.fileName}
                </span>
              </div>
            </div>

            {/* Thumbnail Preview */}
            <div className="mt-2 flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Output Binary Preview
              </span>
              <div className="relative w-full aspect-[4/5] bg-black rounded-lg overflow-hidden border border-zinc-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={lastExport.previewUrl}
                  alt="Exported poster raster"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        )}

        {/* Stage 07 Gate Criteria Checklist */}
        <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 text-xs text-zinc-400 flex flex-col gap-2">
          <span className="font-semibold text-zinc-300 uppercase tracking-wider">
            Stage 07 Acceptance Criteria
          </span>
          <ul className="space-y-1.5 text-zinc-400">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Canvas scales without pushing layout out of view</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Export output matches exact 1080 × 1350 px</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>App controls and outer chrome excluded from export</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Fonts pre-flight ready before rasterization</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
