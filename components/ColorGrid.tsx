
import React from 'react';
import { PRESET_COLORS } from '../types';

interface ColorGridProps {
  selectedColor: string;
  onSelect: (color: { name: string, hex: string }) => void;
  disabled?: boolean;
}

export const ColorGrid: React.FC<ColorGridProps> = ({ selectedColor, onSelect, disabled }) => {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
      {PRESET_COLORS.map((color) => (
        <button
          key={color.hex}
          onClick={() => onSelect(color)}
          disabled={disabled}
          className={`group relative flex flex-col items-center transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
        >
          <div
            className={`w-10 h-10 rounded-full border-2 shadow-lg transition-all ${
              selectedColor === color.hex ? 'border-white scale-125 ring-4 ring-blue-500/50' : 'border-zinc-700'
            }`}
            style={{ backgroundColor: color.hex }}
          />
          <span className="mt-2 text-[10px] text-zinc-400 font-medium group-hover:text-white truncate w-full text-center">
            {color.name}
          </span>
        </button>
      ))}
    </div>
  );
};
