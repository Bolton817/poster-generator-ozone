/**
 * ZIP Archive Packaging Engine
 *
 * Implements Stage 12 Batch Packaging:
 * - Packages multiple rendered poster blobs into a structured ZIP archive
 * - Supports custom filenames, folder prefixes, and optional comments
 * - Works in browser and Node environments via JSZip
 */

import JSZip from "jszip";

export interface PosterFileEntry {
  fileName: string;
  blob: Blob | Uint8Array | ArrayBuffer;
}

export interface ZipOptions {
  comment?: string;
  folderName?: string;
}

/**
 * Creates a ZIP archive containing the provided poster files.
 */
export async function createPosterZipArchive(
  files: PosterFileEntry[],
  options: ZipOptions = {}
): Promise<Blob> {
  const zip = new JSZip();

  const targetFolder = options.folderName ? zip.folder(options.folderName) ?? zip : zip;

  for (const file of files) {
    targetFolder.file(file.fileName, file.blob, { binary: true });
  }

  // Generate as Uint8Array then wrap in Blob with standard zip MIME type
  const zipUint8 = await zip.generateAsync({
    type: "uint8array",
    comment: options.comment,
    compression: "DEFLATE",
    compressionOptions: {
      level: 6,
    },
  });

  return new Blob([zipUint8 as unknown as BlobPart], { type: "application/zip" });
}

/**
 * Inspects a ZIP archive to return the list of internal entry paths.
 * Useful for verification and test suites.
 */
export async function inspectZipEntries(
  zipData: Blob | Uint8Array | ArrayBuffer
): Promise<string[]> {
  let buffer: Uint8Array | ArrayBuffer;

  if (typeof Blob !== "undefined" && zipData instanceof Blob) {
    buffer = await zipData.arrayBuffer();
  } else {
    buffer = zipData as Uint8Array | ArrayBuffer;
  }

  const zip = await JSZip.loadAsync(buffer);
  return Object.keys(zip.files).filter((name) => !zip.files[name].dir);
}
