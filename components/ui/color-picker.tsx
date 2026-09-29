"use client";

import { useState, useRef, useCallback } from "react";
import { Input } from "./input";
import { Label } from "./label";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  imageUrl?: string;
}

/** Common ceramic/terracotta palette for quick manual selection */
const PRESET_COLORS = [
  "#ffffff",
  "#f5f5f4",
  "#e7e5e4",
  "#d6d3d1",
  "#c2b5aa",
  "#b0a89e",
  "#a39183",
  "#8c7a6c",
  "#7a6555",
  "#6b5344",
  "#5c4333",
  "#4a3426",
  "#d4a574",
  "#c48b5c",
  "#b87333",
  "#a66b2f",
  "#e8c4a8",
  "#d4a97a",
  "#c68c53",
  "#b57d3a",
  "#8b4513",
  "#a0522d",
  "#cd853f",
  "#deb887",
  "#5c4033",
  "#6b4226",
  "#7a5230",
  "#8b6914",
  "#4a5568",
  "#2d3748",
  "#1a202c",
  "#744210",
];

export function ColorPicker({ value, onChange, label, imageUrl }: ColorPickerProps) {
  const [showPresets, setShowPresets] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleImageClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!imageRef.current || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const scaleX = imageRef.current.naturalWidth / rect.width;
      const scaleY = imageRef.current.naturalHeight / rect.height;
      const x = Math.floor((e.clientX - rect.left) * scaleX);
      const y = Math.floor((e.clientY - rect.top) * scaleY);

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
      onChange(hex);
      setShowImagePicker(false);
    },
    [onChange]
  );

  const handleImageLoad = useCallback((img: HTMLImageElement) => {
    imageRef.current = img;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);
  }, []);

  return (
    <div className="relative">
      {label && <Label>{label}</Label>}
      <div className="flex gap-2 mt-1">
        {/* Color preview + hex input */}
        <div className="relative flex-1">
          <div
            className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md border border-slate-300 dark:border-slate-600 pointer-events-none"
            style={{ backgroundColor: value || "#transparent" }}
          />
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#000000"
            className="pl-10 h-10"
          />
        </div>

        {/* Toggle presets */}
        <button
          type="button"
          onClick={() => {
            setShowPresets(!showPresets);
            setShowImagePicker(false);
          }}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
        >
          Paleta
        </button>

        {/* Toggle image picker */}
        {imageUrl && (
          <button
            type="button"
            onClick={() => {
              setShowImagePicker(!showImagePicker);
              setShowPresets(false);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            title="Pick color from image"
          >
            🖼 Color
          </button>
        )}
      </div>

      {/* Preset palette */}
      {showPresets && (
        <div className="absolute z-50 mt-2 p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">
          <div className="grid grid-cols-8 gap-1.5">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  onChange(c);
                  setShowPresets(false);
                }}
                className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-terracotta"
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
        </div>
      )}

      {/* Image-based color picker */}
      {showImagePicker && imageUrl && (
        <div className="absolute z-50 mt-2 p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            Haz clic en la imagen para extraer el color
          </p>
          <canvas
            ref={canvasRef}
            onClick={handleImageClick}
            className="max-w-full rounded-xl cursor-crosshair border border-slate-200 dark:border-slate-700"
            style={{ maxHeight: 200, objectFit: "contain" }}
          />
          <img
            src={imageUrl}
            ref={(img) => {
              if (img) handleImageLoad(img);
            }}
            alt="Color source"
            className="hidden"
            crossOrigin="anonymous"
          />
          <div className="mt-2 flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md border border-slate-300 dark:border-slate-600"
              style={{ backgroundColor: value }}
            />
            <span className="text-xs font-mono text-slate-600 dark:text-slate-400">{value}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}
