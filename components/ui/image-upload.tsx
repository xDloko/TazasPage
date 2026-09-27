'use client';

import { useRef, useState, useCallback } from 'react';
import { useSupabase } from '@/components/providers/supabase-provider';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, ImageOff } from 'lucide-react';

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  bucket?: string;
  label?: string;
}

function randomName(ext: string) {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
}

export function ImageUpload({
  value,
  onChange,
  bucket = 'productos',
  label = 'Imagen',
}: ImageUploadProps) {
  const sb = useSupabase();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value ?? null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file) return;
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = randomName(ext);
      setUploading(true);
      try {
        const { error: upErr } = await sb.storage.from(bucket).upload(path, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || 'image/*',
        });
        if (upErr) throw upErr;

        const { data } = sb.storage.from(bucket).getPublicUrl(path);
        const url = data?.publicUrl ?? null;
        onChange(url);
        setPreview(url);
        toast({ title: 'Imagen subida', description: 'La imagen se guardó correctamente.' });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error al subir imagen';
        toast({ variant: 'destructive', title: 'Error', description: msg });
      } finally {
        setUploading(false);
      }
    },
    [sb, bucket, onChange, toast]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleClear = () => {
    onChange(null);
    setPreview(null);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {preview ? (
        <div className="relative mx-auto aspect-square w-full max-w-[240px] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt={label} className="h-full w-full object-cover" />
          <div className="absolute bottom-2 right-2 flex gap-1">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => inputRef.current?.click()}
              className="h-8 w-8 p-0"
              disabled={uploading}
            >
              <Upload className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={handleClear}
              className="h-8 w-8 p-0"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mx-auto flex h-40 w-full max-w-[240px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 transition-colors hover:border-terracotta hover:bg-terracotta/5 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400"
          disabled={uploading}
        >
          {uploading ? (
            <span className="text-sm">Subiendo...</span>
          ) : (
            <>
              <ImageOff className="mb-2 h-8 w-8" />
              <span className="text-sm font-medium">Subir imagen</span>
              <span className="mt-1 text-xs">JPG, PNG, WebP</span>
            </>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
