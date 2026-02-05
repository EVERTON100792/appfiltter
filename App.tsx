
import React, { useState, useRef } from 'react';
import { Camera, Upload, Palette, Share2, Download, Trash2, RefreshCw, CheckCircle, Info, Plus } from 'lucide-react';
import { FilterState, PRESET_COLORS } from './types';
import { changeFilterColor } from './services/geminiService';
import { ColorGrid } from './components/ColorGrid';

const App: React.FC = () => {
  const [state, setState] = useState<FilterState>({
    originalImage: null,
    editedImage: null,
    isLoading: false,
    error: null,
    selectedColor: PRESET_COLORS[0].hex,
    colorName: PRESET_COLORS[0].name,
  });

  const [isCustomColor, setIsCustomColor] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setState(prev => ({
          ...prev,
          originalImage: e.target?.result as string,
          editedImage: null,
          error: null
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyColor = async () => {
    if (!state.originalImage) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const result = await changeFilterColor(
        state.originalImage,
        state.colorName,
        state.selectedColor
      );
      setState(prev => ({ ...prev, editedImage: result, isLoading: false }));
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: "Falha ao processar imagem. Verifique sua conexão ou tente outra foto." 
      }));
    }
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value.toUpperCase();
    setState(prev => ({
      ...prev,
      selectedColor: hex,
      colorName: `Personalizada (${hex})`
    }));
    setIsCustomColor(true);
  };

  const handlePresetSelect = (color: { name: string, hex: string }) => {
    setState(prev => ({
      ...prev,
      selectedColor: color.hex,
      colorName: color.name
    }));
    setIsCustomColor(false);
  };

  const handleDownload = () => {
    if (!state.editedImage) return;
    const link = document.createElement('a');
    link.href = state.editedImage;
    link.download = `filtro-${state.colorName.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.click();
  };

  const handleShare = async () => {
    if (!state.editedImage) return;
    try {
      const response = await fetch(state.editedImage);
      const blob = await response.blob();
      const file = new File([blob], 'filtro-personalizado.png', { type: 'image/png' });
      
      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: 'Filtro Personalizado',
          text: `Confira este filtro na cor ${state.colorName}`,
        });
      } else {
        alert('Compartilhamento não suportado neste navegador. Use o download.');
      }
    } catch (err) {
      console.error('Erro ao compartilhar:', err);
    }
  };

  const reset = () => {
    setState({
      originalImage: null,
      editedImage: null,
      isLoading: false,
      error: null,
      selectedColor: PRESET_COLORS[0].hex,
      colorName: PRESET_COLORS[0].name,
    });
    setIsCustomColor(false);
  };

  return (
    <div className="min-h-screen bg-grid flex flex-col items-center p-4 md:p-8">
      {/* Header */}
      <header className="w-full max-w-5xl flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-900/20">
            <Palette className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">FilterColor <span className="text-blue-500">Pro AI</span></h1>
            <p className="text-zinc-400 text-sm font-medium">Visualizador Industrial Premium</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {state.originalImage && (
            <button 
              onClick={reset}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center gap-2 text-sm transition-colors border border-zinc-700"
            >
              <Trash2 className="w-4 h-4" /> Novo Projeto
            </button>
          )}
        </div>
      </header>

      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Workspace - Left/Main Side */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {!state.originalImage ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="aspect-video w-full rounded-2xl border-2 border-dashed border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800/50 hover:border-blue-500/50 transition-all flex flex-col items-center justify-center cursor-pointer group p-8 text-center"
            >
              <div className="p-6 bg-zinc-800 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-12 h-12 text-zinc-400 group-hover:text-blue-400" />
              </div>
              <p className="text-xl font-medium text-zinc-300">Selecione ou Arraste a Foto do Filtro</p>
              <p className="text-zinc-500 mt-2 text-sm">Aceita fotos da galeria ou câmera do celular</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          ) : (
            <div className="relative w-full rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl min-h-[400px] flex items-center justify-center">
              <div className="absolute top-4 left-4 z-10 flex gap-2">
                <span className="px-3 py-1 bg-black/70 backdrop-blur-md text-[10px] uppercase font-bold tracking-widest rounded-full border border-white/10 text-white">
                  {state.editedImage ? 'Visualização IA' : 'Original'}
                </span>
                {state.editedImage && (
                   <span className="px-3 py-1 bg-blue-600/70 backdrop-blur-md text-[10px] uppercase font-bold tracking-widest rounded-full border border-white/10 text-white">
                    Cor: {state.colorName}
                   </span>
                )}
              </div>
              
              <img 
                src={state.editedImage || state.originalImage} 
                className={`w-full h-auto max-h-[700px] object-contain transition-opacity duration-500 ${state.isLoading ? 'opacity-30' : 'opacity-100'}`}
                alt="Filtro"
              />

              {state.isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-[4px]">
                  <div className="relative">
                    <RefreshCw className="w-16 h-16 text-blue-500 animate-spin mb-4" />
                    <Palette className="w-6 h-6 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-xl font-bold animate-pulse text-white">Pintura Digital em Curso...</p>
                  <p className="text-zinc-400 text-sm mt-2 max-w-[250px] text-center">A IA está reconstruindo as superfícies mantendo a integridade da peça.</p>
                </div>
              )}
            </div>
          )}

          {/* Comparative View Indicator */}
          {state.editedImage && !state.isLoading && (
            <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-xl flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1">
                <h4 className="text-sm font-semibold flex items-center gap-2 text-white">
                  <CheckCircle className="w-4 h-4 text-green-500" /> 
                  Peça Customizada com Sucesso
                </h4>
                <p className="text-xs text-zinc-400 mt-1">
                  A cor foi aplicada respeitando as rugosidades, brilhos e o acabamento industrial original da peça.
                </p>
              </div>
              <button 
                onClick={() => setState(s => ({ ...s, editedImage: null }))}
                className="w-full sm:w-auto px-4 py-2 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg border border-zinc-700 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3 h-3" /> Ver Original
              </button>
            </div>
          )}
        </div>

        {/* Sidebar - Controls */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl sticky top-8">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
              <Palette className="w-5 h-5 text-blue-500" />
              Customização
            </h3>

            <div className="space-y-8">
              {/* Preset Colors Section */}
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 block">Cores de Fábrica</label>
                <ColorGrid 
                  selectedColor={isCustomColor ? '' : state.selectedColor} 
                  onSelect={handlePresetSelect}
                  disabled={!state.originalImage || state.isLoading}
                />
              </div>

              {/* Custom Color Section */}
              <div className="pt-6 border-t border-zinc-800">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 block">Cor Personalizada</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => colorInputRef.current?.click()}
                    disabled={!state.originalImage || state.isLoading}
                    className={`relative w-12 h-12 rounded-xl border-2 transition-all flex items-center justify-center group overflow-hidden ${
                      isCustomColor ? 'border-blue-500 ring-4 ring-blue-500/20' : 'border-zinc-700'
                    } ${(!state.originalImage || state.isLoading) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                    style={{ backgroundColor: isCustomColor ? state.selectedColor : '#27272a' }}
                  >
                    {!isCustomColor && <Plus className="w-5 h-5 text-zinc-500 group-hover:text-zinc-300" />}
                    <input 
                      type="color" 
                      ref={colorInputRef}
                      onChange={handleCustomColorChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={!state.originalImage || state.isLoading}
                    />
                  </button>
                  <div className="flex flex-col">
                    <span className={`text-sm font-bold ${isCustomColor ? 'text-white' : 'text-zinc-500'}`}>
                      {isCustomColor ? 'Cor Selecionada' : 'Escolher Outra'}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {isCustomColor ? state.selectedColor : 'Clique para personalizar'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-8 border-t border-zinc-800 space-y-4">
                <button
                  disabled={!state.originalImage || state.isLoading}
                  onClick={handleApplyColor}
                  className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    !state.originalImage || state.isLoading
                      ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-zinc-700'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 active:scale-[0.98]'
                  }`}
                >
                  <RefreshCw className={`w-5 h-5 ${state.isLoading ? 'animate-spin' : ''}`} />
                  {state.isLoading ? 'Pintando...' : 'Gerar Peça Realista'}
                </button>
                
                <div className="flex gap-2 items-start bg-blue-500/5 p-3 rounded-lg border border-blue-500/10">
                  <Info className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
                  <p className="text-[10px] text-zinc-400 leading-relaxed">
                    Nossa IA mantém as características originais (textura, metalurgia e mesh) mudando apenas a pigmentação da superfície para um resultado autêntico.
                  </p>
                </div>
              </div>

              {state.editedImage && (
                <div className="grid grid-cols-2 gap-3 pt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <button
                    onClick={handleDownload}
                    className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all hover:border-zinc-500"
                  >
                    <Download className="w-4 h-4" /> Download
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all shadow-md active:scale-95"
                  >
                    <Share2 className="w-4 h-4" /> Compartilhar
                  </button>
                </div>
              )}
            </div>
          </div>

          {state.error && (
            <div className="bg-red-900/30 border border-red-500/50 p-4 rounded-xl text-red-200 text-sm flex gap-3 items-center animate-in fade-in duration-300">
               <div className="p-2 bg-red-500/20 rounded-lg">
                 <Info className="w-4 h-4" />
               </div>
               {state.error}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl border-t border-zinc-800 py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-500">
        <div className="text-[10px] uppercase tracking-[0.2em] font-bold">
           FilterColor <span className="text-blue-500">Pro AI</span> Studio
        </div>
        <div className="text-[10px] flex items-center gap-4 font-medium">
          <span>&copy; {new Date().getFullYear()} - Todos os direitos reservados</span>
          <span className="hidden md:inline text-zinc-800">|</span>
          <span>Powered by Gemini 2.5 Vision</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
