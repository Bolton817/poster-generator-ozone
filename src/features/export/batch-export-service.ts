/**
 * Batch Poster Export Service
 *
 * Implements Stage 12 Weekly Batch Packaging:
 * - Coordinates sequential rasterization of multiple poster documents
 * - Emits real-time progress callbacks for responsive UI updates
 * - Employs unscaled 1080x1350 DOM isolation
 * - Packages resulting blobs into a dated ZIP archive
 */

import {
  BatchExportItem,
  BatchExportProgress,
  BatchExportResult,
  ExportFormat,
  ExportOptions,
  PosterExporter,
} from "./types";
import { generatePosterFileName, generateBatchZipFileName } from "./export-utils";
import { createPosterZipArchive, PosterFileEntry } from "./zip-bundler";
import { posterExporter as defaultExporter } from "./exporter-adapter";

export interface BatchRenderExecutor {
  renderDocument(item: BatchExportItem): Promise<HTMLElement>;
}

export interface RunBatchExportOptions {
  items: BatchExportItem[];
  format?: ExportFormat;
  quality?: number;
  exporter?: PosterExporter;
  executor: BatchRenderExecutor;
  onProgress?: (progress: BatchExportProgress) => void;
  signal?: AbortSignal;
}

/**
 * Runs sequential batch export across multiple poster documents.
 */
export async function runBatchExport({
  items,
  format = "png",
  quality = 0.95,
  exporter = defaultExporter,
  executor,
  onProgress,
  signal,
}: RunBatchExportOptions): Promise<BatchExportResult> {
  const startTime = typeof performance !== "undefined" ? performance.now() : Date.now();
  const total = items.length;

  if (total === 0) {
    throw new Error("No poster items provided for batch export");
  }

  const entries: PosterFileEntry[] = [];

  for (let i = 0; i < total; i++) {
    if (signal?.aborted) {
      throw new Error("Batch export was cancelled");
    }

    const item = items[i];
    const itemNumber = i + 1;

    // Report rendering phase
    onProgress?.({
      total,
      current: itemNumber,
      currentTitle: item.title,
      dayLabel: item.dayLabel,
      phase: "rendering",
      percent: Math.round(((itemNumber - 1) / total) * 85),
    });

    // 1. Render target document into isolation harness
    const element = await executor.renderDocument(item);

    // 2. Wait for DOM reflow
    await new Promise((resolve) => setTimeout(resolve, 60));

    // 3. Rasterize to blob
    const fileName = generatePosterFileName({
      day: item.dayLabel,
      templateName: item.templateId,
      eventTitle: item.title || "Poster",
      format,
    });

    const exportOpts: ExportOptions = {
      format,
      quality,
      fileName,
    };

    const result = await exporter.rasterize(element, exportOpts);
    entries.push({
      fileName: result.fileName,
      blob: result.blob,
    });
  }

  if (signal?.aborted) {
    throw new Error("Batch export was cancelled");
  }

  // Report zipping phase
  onProgress?.({
    total,
    current: total,
    currentTitle: "Packaging ZIP Archive",
    dayLabel: "All",
    phase: "zipping",
    percent: 92,
  });

  const zipBlob = await createPosterZipArchive(entries, {
    comment: `Ozone Lounge Weekly Posters — ${new Date().toISOString()}`,
  });

  const endTime = typeof performance !== "undefined" ? performance.now() : Date.now();
  const fileName = generateBatchZipFileName();

  // Report completion
  onProgress?.({
    total,
    current: total,
    currentTitle: "Export Complete",
    dayLabel: "All",
    phase: "complete",
    percent: 100,
  });

  return {
    zipBlob,
    fileName,
    totalFiles: entries.length,
    byteSize: zipBlob.size,
    durationMs: Math.round(endTime - startTime),
  };
}

/**
 * Generates batch export items for all 7 canonical weekly templates (Monday to Sunday).
 */
export async function getWeeklyTemplateBatchItems(): Promise<BatchExportItem[]> {
  const { ORDERED_TEMPLATE_IDS, TEMPLATES_REGISTRY } = await import("../templates/registry");
  return ORDERED_TEMPLATE_IDS.map((id) => {
    const tpl = TEMPLATES_REGISTRY[id];
    return {
      id: `template-${id}`,
      title: tpl.eventTitle || tpl.name,
      templateId: id,
      dayLabel: tpl.dayLabel,
      document: tpl.defaults,
    };
  });
}

/**
 * Loads full PosterDocument instances for a list of draft summaries.
 */
export async function loadDraftBatchItems(
  draftSummaries: { id: string; name: string; templateId: string }[]
): Promise<BatchExportItem[]> {
  const { getDraft } = await import("../drafts/drafts-client");
  const { TEMPLATES_REGISTRY } = await import("../templates/registry");
  const items: BatchExportItem[] = [];

  for (const s of draftSummaries) {
    try {
      const detail = await getDraft(s.id);
      const tpl = TEMPLATES_REGISTRY[detail.document.templateId];
      items.push({
        id: detail.id,
        title: detail.name,
        templateId: detail.document.templateId,
        dayLabel: tpl?.dayLabel || "Draft",
        document: detail.document,
      });
    } catch (err) {
      console.warn(`[loadDraftBatchItems] Could not load draft ${s.id}:`, err);
    }
  }

  return items;
}
