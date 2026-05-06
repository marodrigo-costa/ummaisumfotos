"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

const SERVICES = [
  { id: "all", name: "Todos" },
  { id: "casamento", name: "Casamentos" },
  { id: "gestante", name: "Gestantes" },
  { id: "newborn", name: "Newborn" },
  { id: "editorial", name: "Editorial" },
];

const GALLERY_ITEMS = [
  { id: 1, type: "casamento", size: "tall", src: "/images/hero.png" },
  { id: 2, type: "gestante", size: "square", src: "/images/owners.png" },
  { id: 3, type: "newborn", size: "wide", src: "/images/hero.png" },
  { id: 4, type: "editorial", size: "tall", src: "/images/owners.png" },
  { id: 5, type: "casamento", size: "square", src: "/images/hero.png" },
  { id: 6, type: "gestante", size: "wide", src: "/images/owners.png" },
];

export function StaggeredGallery() {
  const [filter, setFilter] = useState("all");

  const filteredItems = filter === "all" 
    ? GALLERY_ITEMS 
    : GALLERY_ITEMS.filter(item => item.type === filter);

  return (
    <div className="space-y-8">
      {/* Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-x-12 gap-y-2">
        {SERVICES.map((service) => (
          <button
            key={service.id}
            onClick={() => setFilter(service.id)}
            className={cn(
              "text-[10px] md:text-lg font-sans tracking-[0.2em] uppercase transition-all duration-300 pb-2 border-b-2",
              filter === service.id ? "text-primary border-secondary" : "text-secondary/40 border-transparent hover:text-secondary"
            )}
          >
            {service.name}
          </button>
        ))}
      </div>

      {/* Staggered Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 auto-rows-[200px] md:auto-rows-[300px]">
        {filteredItems.map((item, index) => (
          <motion.div
            layout
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={cn(
              "relative overflow-hidden group bg-cream-dark",
              item.size === "tall" && "row-span-2",
              item.size === "wide" && "col-span-2",
              // Efeito de desalinhamento orgânico
              index % 3 === 0 && "translate-y-4 md:translate-y-8",
              index % 3 === 2 && "-translate-y-4 md:-translate-y-8"
            )}
          >
            <Image
              src={item.src}
              alt="Galeria Um Mais Um"
              fill
              className="object-cover object-top transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
