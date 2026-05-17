"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useEffect, useCallback, useMemo } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 0.95
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 0.95
  })
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export function SpecialtiesCarousel() {
  const [allServices, setAllServices] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [lightboxPhotos, setLightboxPhotos] = useState<any[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [[page, direction], setPage] = useState([0, 0]);
  
  const supabase = createClient();

  useEffect(() => {
    // Safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    async function fetchData() {
      try {
        const { data: servicesData, error } = await supabase
          .from("services")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (error) throw error;
        setAllServices(servicesData || []);

        const allPhotos: any[] = [];
        servicesData?.forEach(service => {
          if (service.images && Array.isArray(service.images)) {
            service.images.forEach((img: string, index: number) => {
              if (img && img.trim() !== "") {
                allPhotos.push({
                  id: `photo-${service.id}-${index}-${Math.random().toString(36).substr(2, 5)}`,
                  serviceId: service.id,
                  name: service.name,
                  description: service.description,
                  image: img
                });
              }
            });
          }
        });

        const shuffled = [...allPhotos].sort(() => Math.random() - 0.5);
        setPhotos(shuffled);
      } catch (error) {
        console.error("Erro ao buscar dados do carrossel:", error);
      } finally {
        setLoading(false);
        clearTimeout(safetyTimeout);
      }
    }
    fetchData();
    return () => clearTimeout(safetyTimeout);
  }, []);

  const filteredCarouselPhotos = useMemo(() => {
    if (activeCategory) {
      return photos.filter(p => p.serviceId === activeCategory);
    } else {
      const uniqueServices = new Set();
      return photos.filter(p => {
        if (!uniqueServices.has(p.serviceId)) {
          uniqueServices.add(p.serviceId);
          return true;
        }
        return false;
      });
    }
  }, [activeCategory, photos]);

  const paginate = useCallback((newDirection: number) => {
    if (selectedImageIndex === null || lightboxPhotos.length === 0) return;
    
    let nextIndex = selectedImageIndex + newDirection;
    if (nextIndex < 0) nextIndex = lightboxPhotos.length - 1;
    else if (nextIndex >= lightboxPhotos.length) nextIndex = 0;
    
    setSelectedImageIndex(nextIndex);
    setPage([page + newDirection, newDirection]);
  }, [selectedImageIndex, lightboxPhotos.length, page]);

  const openLightbox = (photo: any) => {
    const sameServicePhotos = photos.filter(p => p.serviceId === photo.serviceId);
    const indexInService = sameServicePhotos.findIndex(p => p.id === photo.id);
    
    setLightboxPhotos(sameServicePhotos);
    setSelectedImageIndex(indexInService !== -1 ? indexInService : 0);
    setPage([0, 0]);
  };

  const closeLightbox = () => setSelectedImageIndex(null);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-pulse flex space-x-4">
          {[1, 2, 3].map(i => <div key={i} className="rounded-sm bg-secondary/10 h-64 w-64" />)}
        </div>
      </div>
    );
  }

  if (allServices.length === 0) return null;

  const displayItems = filteredCarouselPhotos.length > 0 
    ? [...filteredCarouselPhotos, ...filteredCarouselPhotos, ...filteredCarouselPhotos]
    : [];

  return (
    <div className="relative overflow-hidden py-8">
      {/* Menu de Filtros */}
      <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-12 px-6">
        <button
          onClick={() => setActiveCategory(null)}
          className={`text-sm md:text-base font-sans tracking-[0.2em] uppercase transition-all duration-300 pb-2 border-b-2 ${
            activeCategory === null ? "border-primary text-primary" : "border-transparent text-secondary/50 hover:text-primary"
          }`}
        >
          Todas
        </button>
        {allServices.map((service) => (
          <button
            key={`filter-${service.id}`}
            onClick={() => setActiveCategory(service.id)}
            className={`text-sm md:text-base font-sans tracking-[0.2em] uppercase transition-all duration-300 pb-2 border-b-2 whitespace-nowrap ${
              activeCategory === service.id ? "border-primary text-primary" : "border-transparent text-secondary/50 hover:text-primary"
            }`}
          >
            {service.name}
          </button>
        ))}
      </div>

      {/* Track Container Principal */}
      <div className="relative mt-8">
        {filteredCarouselPhotos.length > 0 ? (
          <div 
            className="flex overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <motion.div
              key={activeCategory || "all"}
              className="flex gap-4 md:gap-8 px-4"
              animate={{ x: ["0%", "-33.33%"] }}
              transition={{
                duration: Math.max(filteredCarouselPhotos.length * (isHovered ? 20 : 10), 10),
                ease: "linear",
                repeat: Infinity,
              }}
            >
              {displayItems.map((item, idx) => (
                <motion.div
                  key={`${item.id}-${idx}`}
                  className="relative w-[280px] md:w-[450px] aspect-[3/4] flex-shrink-0 overflow-hidden rounded-sm cursor-pointer group shadow-xl"
                  onClick={() => openLightbox(item)}
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.4 }}
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 280px, 450px"
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  
                  {/* Faixa Bronze no Rodapé quando em "Todas" */}
                  {activeCategory === null && (
                    <div className="absolute inset-x-0 bottom-0 bg-[#A87C4F]/90 backdrop-blur-sm py-4 px-6 text-center transform transition-transform duration-500">
                      <motion.h3 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-white text-xs md:text-sm font-sans font-medium uppercase tracking-[0.4em] drop-shadow-sm"
                      >
                        {item.name}
                      </motion.h3>
                    </div>
                  )}

                  {/* Overlay sutil quando em categoria específica */}
                  {activeCategory !== null && (
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/5 transition-colors" />
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        ) : (
          <div className="h-[400px] flex items-center justify-center text-secondary/40 uppercase tracking-widest font-sans">
            Nenhuma foto disponível para esta categoria
          </div>
        )}
      </div>

      {/* Lightbox Editorial */}
      <AnimatePresence initial={false}>
        {selectedImageIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/98 backdrop-blur-2xl flex items-center justify-center overflow-hidden"
          >
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 md:top-10 md:right-10 text-primary p-3 hover:bg-secondary/10 rounded-full transition-all z-[110]"
            >
              <X size={32} />
            </button>

            <button
              onClick={() => paginate(-1)}
              className="absolute left-6 md:left-10 text-primary p-3 hover:bg-secondary/10 rounded-full transition-all z-[110] hidden md:block"
            >
              <ChevronLeft size={48} />
            </button>

            <div className="relative w-full h-full flex items-center justify-center">
              <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                  key={selectedImageIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={1}
                  onDragEnd={(e, { offset, velocity }) => {
                    const swipe = swipePower(offset.x, velocity.x);
                    if (swipe < -swipeConfidenceThreshold) {
                      paginate(1);
                    } else if (swipe > swipeConfidenceThreshold) {
                      paginate(-1);
                    }
                  }}
                  className="relative w-full h-full flex flex-col items-center justify-center p-4 md:p-12"
                >
                  <div className="relative w-full h-[55vh] md:h-[70vh]">
                    <Image
                      src={lightboxPhotos[selectedImageIndex]?.image || ""}
                      alt={lightboxPhotos[selectedImageIndex]?.name || ""}
                      fill
                      priority
                      className="object-contain pointer-events-none select-none" 
                    />
                  </div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 text-center max-w-2xl px-6"
                  >
                    <h4 className="text-2xl md:text-4xl font-serif text-primary italic uppercase tracking-widest">
                      {lightboxPhotos[selectedImageIndex]?.name}
                    </h4>
                    <p className="text-secondary/60 text-[10px] md:text-xs mt-2 uppercase tracking-[0.4em] font-sans leading-relaxed">
                      {lightboxPhotos[selectedImageIndex]?.description}
                    </p>
                    
                    <div className="mt-4 flex justify-center gap-1.5">
                      {lightboxPhotos.map((_, i) => (
                        <div 
                          key={i} 
                          className={`h-1 rounded-full transition-all duration-300 ${i === selectedImageIndex ? "w-6 bg-primary" : "w-1.5 bg-secondary/20"}`}
                        />
                      ))}
                    </div>

                    <div className="mt-8 md:hidden flex justify-center">
                      <div className="flex items-center gap-3 text-[9px] text-primary/40 font-sans tracking-[0.2em] uppercase">
                        <ChevronLeft size={12} className="animate-pulse" />
                        Deslize para navegar
                        <ChevronRight size={12} className="animate-pulse" />
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>

            <button
              onClick={() => paginate(1)}
              className="absolute right-6 md:right-10 text-primary p-3 hover:bg-secondary/10 rounded-full transition-all z-[110] hidden md:block"
            >
              <ChevronRight size={48} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
