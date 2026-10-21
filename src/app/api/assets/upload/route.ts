import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { storageService } from "@/lib/storage";
import { db } from "@/lib/db";
import { ALLOWED_MIME_TYPES, MAX_UPLOAD_SIZE_BYTES } from "@/features/assets/slot-policy";
import { validateImageMagicBytes, sanitizeFilename } from "@/features/assets/upload-sanitizer";
import { imageSize } from "image-size";

export async function POST(request: NextRequest) {
  // 1. Enforce Authentication
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be signed in as an authorized operator to upload assets.",
        },
      },
      { status: 401 }
    );
  }

  try {
    // 2. Parse Multipart Form Data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file || typeof file === "string") {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "BAD_REQUEST",
            message: "Missing 'file' field in multipart form data upload.",
          },
        },
        { status: 400 }
      );
    }

    // 3. Validate MIME Type Whitelist
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "UNSUPPORTED_MEDIA_TYPE",
            message: `Unsupported file type "${file.type}". Allowed formats: JPEG, PNG, WebP. SVG and executable uploads are rejected.`,
          },
        },
        { status: 415 }
      );
    }

    // 4. Validate File Size
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "PAYLOAD_TOO_LARGE",
            message: `File exceeds maximum upload size of 10 MB (provided: ${sizeMb} MB).`,
          },
        },
        { status: 413 }
      );
    }

    // 5. Read Buffer and Validate Magic Bytes
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!validateImageMagicBytes(buffer, file.type)) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "INVALID_IMAGE_SIGNATURE",
            message: `File content does not match the signature for declared MIME type "${file.type}".`,
          },
        },
        { status: 400 }
      );
    }

    // 6. Extract Image Dimensions
    let width: number | null = null;
    let height: number | null = null;

    try {
      const dimensions = imageSize(buffer);
      width = dimensions.width ?? null;
      height = dimensions.height ?? null;
    } catch (dimErr) {
      console.warn("[Upload] Could not decode image dimensions:", dimErr);
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "CORRUPTED_IMAGE",
            message: "The uploaded file could not be parsed as a valid image.",
          },
        },
        { status: 400 }
      );
    }

    // 7. Sanitize Filename
    const sanitizedFileName = sanitizeFilename(file.name);

    // 8. Write binary via Storage Service
    const uploadResult = await storageService.upload(
      buffer,
      sanitizedFileName,
      file.type,
      user.id
    );

    // 9. Persist Metadata in PostgreSQL
    const mediaAsset = await db.mediaAsset.create({
      data: {
        storageKey: uploadResult.storageKey,
        publicUrl: uploadResult.publicUrl,
        fileName: sanitizedFileName,
        mimeType: file.type,
        fileSize: uploadResult.byteSize,
        width,
        height,
        userId: user.id,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        data: mediaAsset,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Upload] Internal asset upload error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to store media asset. Please try again.",
        },
      },
      { status: 500 }
    );
  }
}
