
export interface FilterState {
  originalImage: string | null;
  editedImage: string | null;
  isLoading: boolean;
  error: string | null;
  selectedColor: string;
  colorName: string;
}

export const PRESET_COLORS = [
  { name: 'Vermelho Vibrante', hex: '#FF0000' },
  { name: 'Azul Industrial', hex: '#0000FF' },
  { name: 'Verde Máquina', hex: '#008000' },
  { name: 'Amarelo Segurança', hex: '#FFD700' },
  { name: 'Preto Fosco', hex: '#1A1A1A' },
  { name: 'Cinza Metálico', hex: '#808080' },
  { name: 'Laranja Cromo', hex: '#FF8C00' },
  { name: 'Branco Puro', hex: '#FFFFFF' },
];
