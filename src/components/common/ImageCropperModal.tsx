import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Crop,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Check,
  Sparkles,
  Grid,
  RefreshCw,
  Eye,
  Sliders,
  Move,
  Monitor,
  Smartphone,
  Layers,
  Info,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { 
  ASPECT_PRESETS, 
  AspectPreset, 
  CropArea, 
  CropResult, 
  performCanvasCrop, 
  loadImage 
} from '../../utils/cropUtils';
import { useSchool } from '../../context/SchoolContext';

interface ImageCropperModalProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
  onCropComplete: (result: CropResult) => void;
  title?: string;
  subtitle?: string;
  initialAspectRatio?: string; // '21:9' | '16:9' | '3:1' | '4:3' | '1:1' | 'free'
  allowRatioChange?: boolean;
  targetResolutionWidth?: number; // e.g. 1920
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  imageUrl,
  onClose,
  onCropComplete,
  title,
  subtitle,
  initialAspectRatio = '21:9',
  allowRatioChange = true,
  targetResolutionWidth = 1920,
}) => {
  const { settings, language } = useSchool();

  // Selected aspect preset
  const [selectedRatioId, setSelectedRatioId] = useState<string>(initialAspectRatio);
  
  // Image element & natural dimensions
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Transform states
  const [zoom, setZoom] = useState(1.0); // 0.5 to 3.5
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [fineRotation, setFineRotation] = useState(0); // -45 to 45
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // UI Guides & settings
  const [showGrid, setShowGrid] = useState(true);
  const [activeTab, setActiveTab] = useState<'crop' | 'preview'>('crop');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [targetWidth, setTargetWidth] = useState<number>(targetResolutionWidth);
  const [outputQuality, setOutputQuality] = useState<number>(0.92);
  const [isProcessing, setIsProcessing] = useState(false);

  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // Drag tracking
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Get active aspect preset
  const currentPreset: AspectPreset = 
    ASPECT_PRESETS.find(p => p.id === selectedRatioId) || ASPECT_PRESETS[0];

  // Load source image when imageUrl changes or modal opens
  useEffect(() => {
    if (!isOpen || !imageUrl) return;

    setIsLoadingImage(true);
    setLoadError(null);
    setZoom(1.0);
    setRotation(0);
    setFineRotation(0);
    setFlipH(false);
    setFlipV(false);
    setPanOffset({ x: 0, y: 0 });
    setSelectedRatioId(initialAspectRatio);
    setActiveTab('crop');

    loadImage(imageUrl)
      .then((img) => {
        setLoadedImage(img);
        setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
        setIsLoadingImage(false);
      })
      .catch((err) => {
        console.error('Cropper image load error:', err);
        setLoadError('Failed to load image for cropping. Please check image format.');
        setIsLoadingImage(false);
      });
  }, [isOpen, imageUrl, initialAspectRatio]);

  // Main Canvas Rendering Loop
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !loadedImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Viewport dimensions
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const viewW = Math.max(300, rect.width);
    const viewH = Math.max(300, rect.height);

    canvas.width = viewW * dpr;
    canvas.height = viewH * dpr;
    canvas.style.width = `${viewW}px`;
    canvas.style.height = `${viewH}px`;

    ctx.scale(dpr, dpr);

    // Clear background
    ctx.fillStyle = '#090d16'; // Deep slate background
    ctx.fillRect(0, 0, viewW, viewH);

    // Calculate crop rectangle in viewport space
    const targetRatio = currentPreset.ratio || (loadedImage.naturalWidth / loadedImage.naturalHeight);
    
    // Determine crop window size inside viewport (padded with margin)
    const padding = 40;
    const maxCropW = viewW - padding * 2;
    const maxCropH = viewH - padding * 2;
    
    let cropW = maxCropW;
    let cropH = cropW / targetRatio;

    if (cropH > maxCropH) {
      cropH = maxCropH;
      cropW = cropH * targetRatio;
    }

    const cropX = (viewW - cropW) / 2;
    const cropY = (viewH - cropH) / 2;

    // Calculate base scale to fill crop window
    const imgW = loadedImage.naturalWidth;
    const imgH = loadedImage.naturalHeight;
    
    const scaleX = cropW / imgW;
    const scaleY = cropH / imgH;
    // Cover mode: max scale factor
    const baseScale = Math.max(scaleX, scaleY);
    const currentScale = baseScale * zoom;

    const drawnW = imgW * currentScale;
    const drawnH = imgH * currentScale;

    // Center image in crop window + pan offset
    const imgCenterViewX = cropX + cropW / 2 + panOffset.x;
    const imgCenterViewY = cropY + cropH / 2 + panOffset.y;

    // 1. Draw transformed image
    ctx.save();
    ctx.translate(imgCenterViewX, imgCenterViewY);

    const totalRotation = rotation + fineRotation;
    if (totalRotation !== 0) {
      ctx.rotate((totalRotation * Math.PI) / 180);
    }
    if (flipH) ctx.scale(-1, 1);
    if (flipV) ctx.scale(1, -1);

    ctx.drawImage(
      loadedImage,
      -drawnW / 2,
      -drawnH / 2,
      drawnW,
      drawnH
    );
    ctx.restore();

    // 2. Draw Semi-transparent Dark Vignette/Mask outside crop box
    ctx.save();
    ctx.fillStyle = 'rgba(9, 13, 22, 0.75)';
    
    // Top mask
    ctx.fillRect(0, 0, viewW, cropY);
    // Bottom mask
    ctx.fillRect(0, cropY + cropH, viewW, viewH - (cropY + cropH));
    // Left mask
    ctx.fillRect(0, cropY, cropX, cropH);
    // Right mask
    ctx.fillRect(cropX + cropW, cropY, viewW - (cropX + cropW), cropH);
    ctx.restore();

    // 3. Draw Crisp Golden/Amber Crop Frame
    ctx.save();
    ctx.strokeStyle = '#f59e0b'; // Amber 500
    ctx.lineWidth = 2;
    ctx.strokeRect(cropX, cropY, cropW, cropH);

    // 4. Draw Rule-of-Thirds Grid if enabled
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      // Vertical grid lines
      ctx.beginPath();
      ctx.moveTo(cropX + cropW / 3, cropY);
      ctx.lineTo(cropX + cropW / 3, cropY + cropH);
      ctx.moveTo(cropX + (cropW * 2) / 3, cropY);
      ctx.lineTo(cropX + (cropW * 2) / 3, cropY + cropH);

      // Horizontal grid lines
      ctx.moveTo(cropX, cropY + cropH / 3);
      ctx.lineTo(cropX + cropW, cropY + cropH / 3);
      ctx.moveTo(cropX, cropY + (cropH * 2) / 3);
      ctx.lineTo(cropX + cropW, cropY + (cropH * 2) / 3);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 5. Draw Precision Corner Corner-Brackets (Corner Anchors)
    const bracketLen = Math.min(24, cropW / 4, cropH / 4);
    ctx.strokeStyle = '#fbbf24'; // Amber 400
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';

    // Top-Left
    ctx.beginPath();
    ctx.moveTo(cropX, cropY + bracketLen);
    ctx.lineTo(cropX, cropY);
    ctx.lineTo(cropX + bracketLen, cropY);
    ctx.stroke();

    // Top-Right
    ctx.beginPath();
    ctx.moveTo(cropX + cropW - bracketLen, cropY);
    ctx.lineTo(cropX + cropW, cropY);
    ctx.lineTo(cropX + cropW, cropY + bracketLen);
    ctx.stroke();

    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(cropX, cropY + cropH - bracketLen);
    ctx.lineTo(cropX, cropY + cropH);
    ctx.lineTo(cropX + bracketLen, cropY + cropH);
    ctx.stroke();

    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(cropX + cropW - bracketLen, cropY + cropH);
    ctx.lineTo(cropX + cropW, cropY + cropH);
    ctx.lineTo(cropX + cropW, cropY + cropH - bracketLen);
    ctx.stroke();

    // 6. Draw Center Crosshair indicator
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
    ctx.lineWidth = 1;
    const chSize = 8;
    const midX = cropX + cropW / 2;
    const midY = cropY + cropH / 2;
    ctx.beginPath();
    ctx.moveTo(midX - chSize, midY);
    ctx.lineTo(midX + chSize, midY);
    ctx.moveTo(midX, midY - chSize);
    ctx.lineTo(midX, midY + chSize);
    ctx.stroke();

    ctx.restore();
  }, [loadedImage, currentPreset, zoom, rotation, fineRotation, flipH, flipV, panOffset, showGrid]);

  // Redraw when state updates or window resizes
  useEffect(() => {
    renderCanvas();
    const handleResize = () => renderCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderCanvas]);

  // Mouse & Touch Pan Handling
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...panOffset };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPanOffset({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Scroll wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY * -0.0015;
    setZoom((prev) => Math.min(3.5, Math.max(0.6, prev + delta)));
  };

  // Quick Action Buttons
  const handleRotate90 = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleFlipHorizontal = () => {
    setFlipH((prev) => !prev);
  };

  const handleCenterImage = () => {
    setPanOffset({ x: 0, y: 0 });
  };

  const handleReset = () => {
    setZoom(1.0);
    setRotation(0);
    setFineRotation(0);
    setFlipH(false);
    setFlipV(false);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleFitCover = () => {
    setZoom(1.0);
    setPanOffset({ x: 0, y: 0 });
  };

  // Calculate Exact Source Crop Coordinates for high-resolution export
  const calculateSourceCropArea = (): CropArea => {
    if (!loadedImage || !containerRef.current) {
      return { x: 0, y: 0, width: 100, height: 100 };
    }

    const rect = containerRef.current.getBoundingClientRect();
    const viewW = Math.max(300, rect.width);
    const viewH = Math.max(300, rect.height);
    const targetRatio = currentPreset.ratio || (loadedImage.naturalWidth / loadedImage.naturalHeight);

    const padding = 40;
    const maxCropW = viewW - padding * 2;
    const maxCropH = viewH - padding * 2;

    let cropW = maxCropW;
    let cropH = cropW / targetRatio;
    if (cropH > maxCropH) {
      cropH = maxCropH;
      cropW = cropH * targetRatio;
    }

    const cropX = (viewW - cropW) / 2;
    const cropY = (viewH - cropH) / 2;

    const imgW = loadedImage.naturalWidth;
    const imgH = loadedImage.naturalHeight;

    const scaleX = cropW / imgW;
    const scaleY = cropH / imgH;
    const baseScale = Math.max(scaleX, scaleY);
    const currentScale = baseScale * zoom;

    // Viewport center of image
    const imgCenterViewX = cropX + cropW / 2 + panOffset.x;
    const imgCenterViewY = cropY + cropH / 2 + panOffset.y;

    // In image coordinate space
    const sourceCropW = cropW / currentScale;
    const sourceCropH = cropH / currentScale;

    // Top-left of crop in natural image space
    const sourceCropX = (cropX - (imgCenterViewX - (imgW * currentScale) / 2)) / currentScale;
    const sourceCropY = (cropY - (imgCenterViewY - (imgH * currentScale) / 2)) / currentScale;

    return {
      x: sourceCropX,
      y: sourceCropY,
      width: sourceCropW,
      height: sourceCropH,
    };
  };

  // Execute Crop and finalize
  const handleApplyCrop = async () => {
    if (!loadedImage) return;

    setIsProcessing(true);
    try {
      const cropArea = calculateSourceCropArea();
      const totalRotation = rotation + fineRotation;

      const result = await performCanvasCrop(
        loadedImage,
        cropArea,
        {
          rotation: totalRotation,
          flipH,
          flipV,
        },
        targetWidth,
        outputQuality,
        'image/jpeg'
      );

      setIsProcessing(false);
      onCropComplete(result);
      onClose();
    } catch (err) {
      console.error('Crop execution failed:', err);
      alert('Failed to process image crop. Please adjust settings and try again.');
      setIsProcessing(false);
    }
  };

  // Compute live output dimensions label
  const outputRatio = currentPreset.ratio || (loadedImage ? loadedImage.naturalWidth / loadedImage.naturalHeight : 2.33);
  const estimatedOutWidth = targetWidth;
  const estimatedOutHeight = Math.round(targetWidth / outputRatio);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-6xl max-h-[96vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-xs">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  {title || (language === 'hi' ? 'मुख्य बैनर इमेज क्रॉपर' : 'Hero Banner Image Cropper')}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold font-mono">
                  {currentPreset.id} ({currentPreset.isRecommendedForHero ? 'Hero Optimal' : 'Aspect Fit'})
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {subtitle || (language === 'hi' 
                  ? 'इमेज को मुख्य बैनर के सटीक आकार में क्रॉप व अलाइन करें ताकि हेडर में कोई भाग न कटे।' 
                  : 'Adjust, zoom, and frame your image to fit the homepage hero banner perfectly.')}
              </p>
            </div>
          </div>

          {/* View Mode Toggle & Close */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => setActiveTab('crop')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'crop' 
                    ? 'bg-amber-500 text-slate-950 shadow-xs' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'क्रॉप एडिटर' : 'Crop & Frame'}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'preview' 
                    ? 'bg-amber-500 text-slate-950 shadow-xs' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'लाइव बैनर सिमुलेटर' : 'Banner Simulation'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Aspect Ratio Selector Bar */}
        {allowRatioChange && (
          <div className="px-6 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-thin shrink-0">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              {language === 'hi' ? 'पहलू अनुपात:' : 'Aspect Ratio:'}
            </span>
            <div className="flex items-center gap-2">
              {ASPECT_PRESETS.map((preset) => {
                const isSelected = selectedRatioId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedRatioId(preset.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 shadow-sm ring-2 ring-amber-400/40'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                    }`}
                  >
                    <span>{language === 'hi' ? preset.labelHi : preset.labelEn}</span>
                    {preset.isRecommendedForHero && (
                      <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-black uppercase ${
                        isSelected ? 'bg-slate-950 text-amber-400' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {language === 'hi' ? 'सर्वश्रेष्ठ' : 'Best'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal Main Body */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row relative">
          
          {/* Main Visual Canvas Area */}
          <div className="flex-1 relative bg-slate-950 flex items-center justify-center min-h-[340px] sm:min-h-[420px] overflow-hidden select-none">
            
            {isLoadingImage ? (
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
                <span className="text-sm font-semibold">{language === 'hi' ? 'इमेज लोड हो रही है...' : 'Loading image for canvas...'}</span>
              </div>
            ) : loadError ? (
              <div className="p-6 text-center text-rose-400 max-w-md space-y-2">
                <p className="font-bold">{loadError}</p>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold"
                >
                  Close
                </button>
              </div>
            ) : activeTab === 'crop' ? (
              <div
                ref={containerRef}
                className="w-full h-full relative cursor-grab active:cursor-grabbing flex items-center justify-center"
              >
                <canvas
                  ref={canvasRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                  onWheel={handleWheel}
                  className="touch-none"
                />

                {/* Floating Interactive Guide Overlay */}
                <div className="absolute top-4 left-4 pointer-events-none flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-[11px] font-mono text-slate-300 flex items-center gap-2 shadow-lg">
                    <Move className="w-3.5 h-3.5 text-amber-400" />
                    <span>{language === 'hi' ? 'ड्रैग कर पैन करें • व्हील से ज़ूम करें' : 'Drag to pan • Scroll to zoom'}</span>
                  </div>
                </div>

                {/* Floating Output Badge */}
                <div className="absolute bottom-4 left-4 pointer-events-none">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-amber-500/40 text-[11px] font-bold font-mono text-amber-300 shadow-lg flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      {language === 'hi' ? 'अनुमानित आउटपुट:' : 'Target Output:'} {estimatedOutWidth} × {estimatedOutHeight} px ({currentPreset.id})
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Live Real-World Simulation Preview Tab */
              <div className="w-full h-full p-4 sm:p-6 overflow-y-auto flex flex-col items-center justify-center bg-slate-900/60 space-y-4">
                
                {/* Device Selector */}
                <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-2xl border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                      previewDevice === 'desktop' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Monitor className="w-4 h-4" />
                    <span>Desktop Portal Widescreen</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                      previewDevice === 'mobile' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Mobile Screen</span>
                  </button>
                </div>

                {/* Simulated Portal Hero Banner Container */}
                <div className={`w-full transition-all duration-300 ${previewDevice === 'desktop' ? 'max-w-4xl' : 'max-w-xs'}`}>
                  <div className="rounded-3xl border border-amber-500/30 overflow-hidden shadow-2xl bg-slate-950 relative group">
                    
                    {/* Simulated Canvas Render Inside Banner */}
                    <div className="relative w-full aspect-[21/9] sm:aspect-[21/9] overflow-hidden">
                      {loadedImage && (
                        <div className="w-full h-full relative overflow-hidden bg-slate-950">
                          <img
                            src={imageUrl}
                            alt="Banner Preview"
                            className="w-full h-full object-cover"
                            style={{
                              transform: `scale(${zoom}) rotate(${rotation + fineRotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                              transformOrigin: 'center center',
                            }}
                          />
                          {/* Simulated Dark Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent flex flex-col justify-center p-6 sm:p-8">
                            <div className="max-w-xl space-y-2 text-white">
                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                                  उत्तर प्रदेश शासन
                                </span>
                                <span className="text-[10px] font-mono text-amber-300">
                                  UDISE: {settings.schoolCode}
                                </span>
                              </div>
                              <h3 className="text-base sm:text-2xl font-black tracking-tight leading-tight text-white drop-shadow-md">
                                {language === 'hi' ? settings.schoolNameHi : settings.schoolName}
                              </h3>
                              <p className="text-[11px] sm:text-xs text-slate-300 line-clamp-2">
                                {language === 'hi' 
                                  ? `ग्राम: ${settings.villageHi || 'हरसिंहपुर गोवा'} • विकास खंड: ${settings.blockHi || 'शमसाबाद'} • जनपद: ${settings.districtHi || 'फर्रुखाबाद'}` 
                                  : `Village: ${settings.village || 'Harsinghpur Gova'} • Block: ${settings.block || 'Shamsabad'} • District: ${settings.district || 'Farrukhabad'}`}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Simulation footer tag */}
                    <div className="bg-slate-900 px-4 py-2 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-800">
                      <span>✓ Aspect Ratio Fitted ({currentPreset.id})</span>
                      <span className="text-emerald-400 font-bold">Live Simulation OK</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-400 text-center max-w-lg">
                  {language === 'hi' 
                    ? 'यह सिमुलेशन दिखाता है कि पोर्टल के होमपेज पर यह बैनर स्कूल के नाम और सरकारी बैज के साथ कैसा दिखाई देगा।' 
                    : 'This simulation previews how your cropped banner renders with live school branding and badges.'}
                </div>
              </div>
            )}
          </div>

          {/* Right Control Sidebar */}
          <div className="w-full lg:w-80 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 p-5 flex flex-col justify-between overflow-y-auto space-y-5 shrink-0">
            
            {/* Tool Sections */}
            <div className="space-y-5">
              
              {/* Zoom & Framing Controls */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
                    {language === 'hi' ? 'ज़ूम नियंत्रण (Zoom Level)' : 'Zoom Level'}
                  </span>
                  <span className="font-mono text-amber-400">{Math.round(zoom * 100)}%</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  
                  <input
                    type="range"
                    min="0.6"
                    max="3.0"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="flex-1 accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                  />

                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(3.0, z + 0.1))}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Rotation & Flip Controls */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                    {language === 'hi' ? 'रोटेशन व ओरिएंटेशन' : 'Rotation & Flip'}
                  </span>
                  <span className="font-mono text-slate-400">{rotation + fineRotation}°</span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={handleRotate90}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer"
                    title="Rotate 90°"
                  >
                    <RotateCw className="w-4 h-4 text-amber-400" />
                    <span className="text-[10px]">90°</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleFlipHorizontal}
                    className={`p-2.5 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      flipH ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                    title="Flip Horizontal"
                  >
                    <FlipHorizontal className="w-4 h-4" />
                    <span className="text-[10px]">Flip H</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCenterImage}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer"
                    title="Center Focal Point"
                  >
                    <Move className="w-4 h-4 text-amber-400" />
                    <span className="text-[10px]">Center</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer"
                    title="Reset All"
                  >
                    <RefreshCw className="w-4 h-4 text-slate-400" />
                    <span className="text-[10px]">Reset</span>
                  </button>
                </div>
              </div>

              {/* Composition Grid & Fit Helper */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Grid className="w-3.5 h-3.5 text-amber-400" />
                    {language === 'hi' ? 'कंपोजिशन ग्रिड (Rule of Thirds)' : 'Composition Grid'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowGrid(!showGrid)}
                    className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                      showGrid ? 'bg-amber-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-transform ${
                        showGrid ? 'left-4.5' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Target Export Resolution Selector */}
                <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
                  <label className="block text-[11px] font-bold text-slate-400">
                    {language === 'hi' ? 'लक्षित रिज़ॉल्यूशन (Output Width)' : 'Export Quality Resolution'}
                  </label>
                  <select
                    value={targetWidth}
                    onChange={(e) => setTargetWidth(parseInt(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 focus:outline-hidden focus:border-amber-500"
                  >
                    <option value={1920}>1920px Full HD Banner (Recommended)</option>
                    <option value={2560}>2560px 2K Ultra-Wide</option>
                    <option value={1280}>1280px Standard Web</option>
                    <option value={loadedImage ? loadedImage.naturalWidth : 1920}>
                      Native Source ({naturalSize.width}px)
                    </option>
                  </select>
                </div>
              </div>

              {/* Educational Aspect Guidance Box */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1 text-slate-300">
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <Info className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>{language === 'hi' ? '21:9 पैनोरमिक क्यों?' : 'Why 21:9 Aspect Ratio?'}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {language === 'hi'
                    ? '21:9 अनुपात में क्रॉप करने से वेबसाइट हेडर पर मुख्य विषय और चेहरे बिना कटे प्राकृतिक रूप से दिखते हैं।'
                    : '21:9 aspect ratio prevents unwanted cropping of faces and ensures banner elements align with navigation headers.'}
                </p>
              </div>
            </div>

            {/* Action Buttons: Cancel and Apply */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleApplyCrop}
                className="w-full py-3 px-5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing High-Res Crop...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{language === 'hi' ? 'क्रॉप लागू करें और सहेजें' : 'Apply Crop & Use Banner'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold text-center transition-colors cursor-pointer"
              >
                {language === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
