"use client";

import { motion, useAnimationControls } from "framer-motion";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const SPECIALTIES = [
  { id: 1, title: "Casamentos", category: "Casamentos", image: "/images/hero.png" },
  { id: 2, title: "Gestantes", category: "Gestantes", image: "/images/hero3.png" },
  { id: 3, title: "Newborn", category: "Newborn", image: "/images/owners.png" },
  { id: 4, title: "Editorial", category: "Editorial", image: "/images/owners_new.png" },
  { id: 5, title: "Família", category: "Família", image: "/images/hero.png" },
  { id: 6, title: "Infantil", category: "Infantil", image: "/images/hero3.png" },
];

const CATEGORIES = ["Casamentos", "Gestantes", "Newborn", "Editorial", "Família", "Infantil"];

export function SpecialtiesCarousel() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredSpecialties = activeCategory
    ? SPECIALTIES.filter((s) => s.category === activeCategory)
    : SPECIALTIES;

  // Duplicar para loop infinito fluido
  const displayItems = [...filteredSpecialties, ...filteredSpecialties, ...filteredSpecialties];

  const openLightbox = (index: number) => {
    setSelectedImage(index % filteredSpecialties.length);
  };

  const closeLightbox = () => setSelectedImage(null);

  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % filteredSpecialties.length);
    }
  };

  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage - 1 + filteredSpecialties.length) % filteredSpecialties.length);
    }
  };

  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    const swipe = Math.abs(offset.x) * velocity.x;
    if (swipe < -100) {
      nextImage();
    } else if (swipe > 100) {
      prevImage();
    }
  };

  return (
    <div className="relative overflow-hidden py-8">
      {/* Menu de Filtros */}
      <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-12 px-6">
        <button
          onClick={() => setActiveCategory(null)}
          className={`text-sm md:text-base font-sans tracking-[0.2em] uppercase transition-all duration-300 pb-2 border-b-2 ${
            activeCategory === null
              ? "border-primary text-primary"
              : "border-transparent text-secondary/50 hover:text-primary"
          }`}
        >
          Todas
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-sm md:text-base font-sans tracking-[0.2em] uppercase transition-all duration-300 pb-2 border-b-2 ${
              activeCategory === cat
                ? "border-primary text-primary"
                : "border-transparent text-secondary/50 hover:text-primary"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Track Container */}
      <div 
        className="flex overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          key={activeCategory || "all"} // Força re-render quando categoria muda
          className="flex gap-6 whitespace-nowrap"
          animate={{ x: ["0%", "-33.33%"] }}
          transition={{
            duration: filteredSpecialties.length * (isHovered ? 15 : 6),
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {displayItems.map((item, idx) => (
            <motion.div
              key={`${item.id}-${idx}`}
              className="relative w-[300px] md:w-[500px] aspect-[3/4] flex-shrink-0 group overflow-hidden rounded-sm cursor-pointer"
              onClick={() => openLightbox(idx)}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.5 }}
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Lightbox com Suporte a Swipe */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 overflow-hidden"
          >
            <button
              onClick={closeLightbox}
              className="absolute top-8 right-8 text-primary p-2 hover:bg-cream-dark rounded-full transition-colors z-50"
            >
              <X size={32} />
            </button>

            <button
              onClick={prevImage}
              className="absolute left-4 md:left-8 text-primary p-2 hover:bg-cream-dark rounded-full transition-colors z-50 hidden md:block"
            >
              <ChevronLeft size={48} />
            </button>

            <motion.div 
              className="relative w-full max-w-5xl aspect-[3/4] md:h-[80vh] cursor-grab active:cursor-grabbing"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.8}
              onDragEnd={handleDragEnd}
            >
              <Image
                src={filteredSpecialties[selectedImage].image}
                alt={filteredSpecialties[selectedImage].title}
                fill
                className="object-contain pointer-events-none" // pointer-events-none é essencial para o drag funcionar suave
              />
              <div className="absolute -bottom-12 left-0 right-0 text-center pointer-events-none">
                <h4 className="text-3xl font-serif text-primary italic">
                  {filteredSpecialties[selectedImage].title}
                </h4>
              </div>
            </motion.div>

            <button
              onClick={nextImage}
              className="absolute right-4 md:right-8 text-primary p-2 hover:bg-cream-dark rounded-full transition-colors z-50 hidden md:block"
            >
              <ChevronRight size={48} />
            </button>

            {/* Hint mobile */}
            <div className="absolute bottom-12 md:hidden text-secondary/50 text-xs font-sans tracking-widest uppercase flex gap-2 items-center">
              <ChevronLeft size={16} />
              Deslize para navegar
              <ChevronRight size={16} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
