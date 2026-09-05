import React, { useRef, useState, useEffect } from 'react';
import { Palette, Trash2, Save, Sparkles, Paintbrush, Eraser } from 'lucide-react';
import { AudioEngine } from './AudioEngine';
import { Language } from '../types/game';
import { TRANSLATIONS } from '../data/questions';

interface DrawingCanvasProps {
  lang: Language;
  onActivityComplete: (starsEarned: number, badgeId?: string) => void;
}

const BRUSH_COLORS = [
  { value: '#ef4444', name: 'Cherry Red' },
  { value: '#f97316', name: 'Tiger Orange' },
  { value: '#eab308', name: 'Sun Yellow' },
  { value: '#22c55e', name: 'Lime Green' },
  { value: '#06b6d4', name: 'Sky Blue' },
  { value: '#6366f1', name: 'Indigo Dream' },
  { value: '#a855f7', name: 'Magic Purple' },
  { value: '#ec4899', name: 'Cotton Pink' },
  { value: '#0f172a', name: 'Shadow Black' }
];

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ lang, onActivityComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#ec4899'); // Default cotton pink
  const [brushSize, setBrushSize] = useState(12);
  const [isEraser, setIsEraser] = useState(false);
  const [gallery, setGallery] = useState<string[]>([]);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    // Load local saved art
    const saved = localStorage.getItem('kidquest_gallery');
    if (saved) {
      try {
        setGallery(JSON.parse(saved));
      } catch (e) {}
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Responsive Canvas dimensions
    canvas.width = canvas.parentElement?.clientWidth || 600;
    canvas.height = 360;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = brushColor;
    context.lineWidth = brushSize;
    contextRef.current = context;

    // Fill background with pristine white
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  // Update context when brush properties change
  useEffect(() => {
    if (!contextRef.current) return;
    contextRef.current.strokeStyle = isEraser ? '#ffffff' : brushColor;
    contextRef.current.lineWidth = brushSize;
  }, [brushColor, brushSize, isEraser]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    contextRef.current?.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    AudioEngine.playClick();
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
  };

  const saveToGallery = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL();
    const updatedGallery = [dataUrl, ...gallery.slice(0, 5)]; // keep max 6
    setGallery(updatedGallery);
    localStorage.setItem('kidquest_gallery', JSON.stringify(updatedGallery));

    AudioEngine.playSuccess();
    
    // Reward Picasso badge and 15 stars
    onActivityComplete(15, 'picasso');
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-gradient-to-r from-pink-100 to-amber-100 p-4 rounded-2xl border-2 border-slate-900 text-slate-800 text-center">
        <p className="font-bold flex items-center justify-center gap-2 text-base">
          <Palette className="w-5 h-5 text-pink-500 animate-bounce" />
          {t.drawingIntro}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Color Palette and Tool Panel */}
        <div className="cartoon-card p-4 flex flex-col justify-between gap-4 md:col-span-1 bg-amber-50/50">
          <div>
            <h4 className="font-bold text-sm text-slate-700 mb-2 uppercase tracking-wide flex items-center gap-1">
              <Paintbrush className="w-4 h-4 text-pink-500" /> Brush Colors
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {BRUSH_COLORS.map((col) => (
                <button
                  key={col.value}
                  onClick={() => {
                    AudioEngine.playClick();
                    setBrushColor(col.value);
                    setIsEraser(false);
                  }}
                  id={`brush-color-${col.value.replace('#', '')}`}
                  className={`w-10 h-10 rounded-full border-2 border-slate-900 cursor-pointer transition-transform ${
                    brushColor === col.value && !isEraser ? 'scale-110 shadow-md ring-2 ring-yellow-400' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: col.value }}
                  title={col.name}
                />
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm text-slate-700 mb-2 uppercase tracking-wide">
              Brush Options
            </h4>
            
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => {
                  AudioEngine.playClick();
                  setIsEraser(false);
                }}
                id="tool-brush"
                className={`flex-1 py-2 font-bold cartoon-btn text-xs ${
                  !isEraser ? 'bg-kid-pink text-white' : 'bg-white text-slate-800'
                }`}
              >
                Pen
              </button>
              <button
                onClick={() => {
                  AudioEngine.playClick();
                  setIsEraser(true);
                }}
                id="tool-eraser"
                className={`flex-1 py-2 font-bold cartoon-btn text-xs flex items-center justify-center gap-1 ${
                  isEraser ? 'bg-indigo-400 text-white' : 'bg-white text-slate-800'
                }`}
              >
                <Eraser className="w-3.5 h-3.5" /> Eraser
              </button>
            </div>

            <label className="block text-xs font-bold text-slate-600 mb-1">
              Brush Size: <span className="text-pink-500 text-sm">{brushSize}px</span>
            </label>
            <input
              type="range"
              min="4"
              max="40"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              id="brush-size-slider"
              className="w-full accent-pink-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t-2 border-slate-100">
            <button
              onClick={clearCanvas}
              id="clear-canvas-btn"
              className="w-full py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold cartoon-btn text-xs flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {t.clearCanvas}
            </button>

            <button
              onClick={saveToGallery}
              id="save-canvas-btn"
              className="w-full py-2 bg-emerald-400 hover:bg-emerald-500 text-slate-900 font-bold cartoon-btn text-xs flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {t.saveArtwork}
            </button>
          </div>
        </div>

        {/* Art Canvas Stage */}
        <div className="md:col-span-3 flex flex-col gap-4">
          <div className="border-4 border-slate-900 rounded-2xl overflow-hidden bg-white shadow-lg relative touch-none">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              id="art-studio-canvas"
              className="w-full cursor-crosshair block bg-white"
            />
          </div>

          {/* Local Art Gallery */}
          {gallery.length > 0 && (
            <div className="cartoon-card p-4 bg-white">
              <h4 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
                My Saved Masterpieces (Local Gallery)
              </h4>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {gallery.map((img, i) => (
                  <div
                    key={i}
                    className="border-2 border-slate-900 rounded-xl overflow-hidden shadow bg-slate-50 relative group"
                  >
                    <img
                      src={img}
                      alt={`Artwork ${i}`}
                      className="w-full aspect-[4/3] object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-[10px] text-white font-bold bg-slate-900 px-2 py-1 rounded">
                        Art #{i + 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
