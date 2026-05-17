"use client";

import { useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Upload, X, Loader2, Image as ImageIcon, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageUploaderProps {
  images: string[];
  onChange: (urls: string[]) => void;
  bucket?: string;
  path?: string;
  maxImages?: number;
  helpText?: string;
}

export function ImageUploader({ 
  images, 
  onChange, 
  bucket = "images", 
  path = "services",
  maxImages = 10,
  helpText
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newUrls = [...images];

    try {
      for (let i = 0; i < files.length; i++) {
        if (newUrls.length >= maxImages) break;

        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `${path}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        newUrls.push(publicUrl);
      }

      onChange(newUrls);
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Falha ao subir imagem. Verifique as permissões de Storage.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    const newUrls = images.filter((_, i) => i !== index);
    onChange(newUrls);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <AnimatePresence>
          {images.map((url, index) => (
            <motion.div
              key={url}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="group relative aspect-square rounded-2xl border border-[#f3eee7] overflow-hidden bg-[#fbf7f2]"
            >
              <img src={url} alt={`Upload ${index}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur shadow-sm rounded-full flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
              <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/40 backdrop-blur rounded text-[8px] text-white font-bold uppercase tracking-widest">
                Foto {index + 1}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {images.length < maxImages && (
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square rounded-2xl border-2 border-dashed border-[#d1ba8e]/30 flex flex-col items-center justify-center gap-2 text-[#97816a] hover:bg-[#fbf7f2] hover:border-[#97816a]/50 transition-all group"
          >
            {uploading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                <div className="w-10 h-10 bg-[#f3ede4] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus size={20} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Adicionar</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        multiple
        accept="image/*"
        className="hidden"
      />

      <p className="text-[10px] text-gray-400 italic">
        {helpText || (maxImages === 1 
          ? "* Selecione apenas uma imagem para a capa. Formatos aceitos: JPG, PNG, WEBP."
          : "* Você pode selecionar várias imagens de uma vez. Formatos aceitos: JPG, PNG, WEBP.")
        }
      </p>
    </div>
  );
}
