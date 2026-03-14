import StarIcon from "@/assets/icons/StarIcon";
import { useScreen } from "@/contexts/ScreenContext";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities"; // Necessario per le trasformazioni
import { X } from "lucide-react";
import React from "react";

const SortableImg = ({ image, index, removeImg }) => {
  const { currentScreen } = useScreen();

  const {
    attributes,
    listeners,
    setNodeRef, // Riferimento al DOM
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: image.url, // L'ID deve corrispondere all'ID nell'array items di SortableContext
  });

  // 2. Applica le trasformazioni CSS per il trascinamento e l'animazione
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 99 : 1,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      key={index}
      // Collega il ref, lo stile, gli attributi e i listeners forniti da dnd-kit
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`aspect-square minw-[80px] w-25  2xl:w-40 2xl:h-40 relative group border-2 rounded-xl p-0 overflow-hidden flex-shrink-0 cursor-move 
                
		${image.name === "cover" ? "border-primary shadow-xl" : "border-gray-300"}
				`}
    >
      {image.name == "cover" && (
        <div className="absolute top-1 left-1 z-30">
          <div className="bg-primary font-bold p-1 rounded-full shadow-lg border-white gap-2 whitespace-nowrap tracking-tighter flex items-center justify-center">
            <div className="w-3 h-3">
              <StarIcon />
            </div>
          </div>
        </div>
      )}

      <div
        className="absolute top-1 2xl:top-2 right-1 2xl:right-2 p-1 2xl:p-1.5 rounded-full bg-text-2 hover:bg-text-2/80 transition-colors cursor-pointer text-white z-20 shadow-lg"
        onClick={(e) => {
          e.stopPropagation();
          removeImg(image);
        }}
        aria-label={`Rimuovi immagine ${index + 1}`}
      >
        <X size={currentScreen == "xs" ? 12 : 18} color={"#FFFFFF"} />
      </div>

      <img
        src={image.url}
        alt={`Anteprima immagine ${index + 1}`}
        className="w-full h-full object-cover transition-transform group-hover:scale-[1.02]"
      />
    </div>
  );
};

export default SortableImg;
