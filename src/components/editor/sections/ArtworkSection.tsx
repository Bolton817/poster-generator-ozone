"use client";

import React, { useRef } from "react";
import { useEditor } from "@/features/editor/editor-context";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { Button } from "@/components/ui/Button";
import { Image as ImageIcon, Upload, Target, RefreshCw } from "lucide-react";
import { useImageUpload } from "@/features/assets/use-image-upload";

export function ArtworkSection() {
  const { state, setAsset, setFocalPoint, template } = useEditor();
  const { document } = state;

  const bgInputRef = useRef<HTMLInputElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  // Background uploader
  const {
    state: bgState,
    handleFileSelect: uploadBgFile,
    reset: resetBg,
  } = useImageUpload();

  // Logo uploader
  const {
    state: logoState,
    handleFileSelect: uploadLogoFile,
    reset: resetLogo,
  } = useImageUpload();

  const handleBgSelect = async (file: File) => {
    const asset = await uploadBgFile(file, "heroBackground");
    if (asset) {
      setAsset("background", asset.id);
    }
  };

  const handleLogoSelect = async (file: File) => {
    const asset = await uploadLogoFile(file, "logo");
    if (asset) {
      setAsset("logo", asset.id);
    }
  };

  const focalPoint = document.styling.focalPoints?.background || { x: 0.5, y: 0.5 };

  const handleFocalPointChange = (axis: "x" | "y", val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setFocalPoint("background", {
      ...focalPoint,
      [axis]: clamped,
    });
  };

  const bgPreviewUrl = bgState.objectUrl || bgState.durableUrl;
  const logoPreviewUrl = logoState.objectUrl || logoState.durableUrl;

  return (
    <CollapsibleSection
      title="Artwork & Imagery"
      subtitle={`${template.supportedImageSlots.join(", ")} slots`}
      icon={<ImageIcon className="w-4 h-4" />}
    >
      <div className="space-y-6 p-4">
        {/* Background / Hero Slot */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Hero / Background Image
            </span>
            <span className="text-[11px] text-slate-500 font-mono">Max 10MB (JPEG, PNG, WebP)</span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={bgInputRef}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleBgSelect(file);
              }}
            />

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={bgState.isUploading}
              onClick={() => bgInputRef.current?.click()}
              className="flex items-center gap-2"
            >
              {bgState.isUploading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" /> Select Background
                </>
              )}
            </Button>

            {document.assets.backgroundAssetId && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAsset("background", null);
                  resetBg();
                }}
                className="text-rose-400 hover:text-rose-300 text-xs"
              >
                Remove
              </Button>
            )}
          </div>

          {bgPreviewUrl && (
            <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-800 bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={bgPreviewUrl} alt="Background preview" className="w-full h-full object-cover" />
            </div>
          )}

          {bgState.error && <p className="text-xs text-rose-400">{bgState.error}</p>}

          {/* Focal Point Controls */}
          <div className="pt-2 space-y-2 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-amber-400" /> Focal Point Position
              </span>
              <button
                type="button"
                onClick={() => setFocalPoint("background", { x: 0.5, y: 0.5 })}
                className="text-[11px] text-amber-400 hover:underline"
              >
                Reset Center
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">
                  Horizontal: {Math.round(focalPoint.x * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={focalPoint.x}
                  onChange={(e) => handleFocalPointChange("x", parseFloat(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">
                  Vertical: {Math.round(focalPoint.y * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={focalPoint.y}
                  onChange={(e) => handleFocalPointChange("y", parseFloat(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Logo Slot */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Ozone Lounge Logo
            </span>
            <span className="text-[11px] text-slate-500 font-mono">Transparent PNG / WebP</span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={logoInputRef}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleLogoSelect(file);
              }}
            />

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={logoState.isUploading}
              onClick={() => logoInputRef.current?.click()}
              className="flex items-center gap-2"
            >
              {logoState.isUploading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" /> Upload Custom Logo
                </>
              )}
            </Button>

            {document.assets.logoAssetId && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAsset("logo", null);
                  resetLogo();
                }}
                className="text-rose-400 hover:text-rose-300 text-xs"
              >
                Reset Default
              </Button>
            )}
          </div>

          {logoPreviewUrl && (
            <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-800 bg-black/60 p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoPreviewUrl} alt="Logo preview" className="w-full h-full object-contain" />
            </div>
          )}

          {logoState.error && <p className="text-xs text-rose-400">{logoState.error}</p>}
        </div>
      </div>
    </CollapsibleSection>
  );
}
