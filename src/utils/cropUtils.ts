// Lightweight Canvas-based Image Cropping Utilities & Preset Math

export interface CropArea {
  x: number; // in pixels relative to natural image
  y: number;
  width: number;
  height: number;
}

export interface AspectPreset {
  id: string;
  labelEn: string;
  labelHi: string;
  ratio: number | null; // width / height, null for freeform
  descriptionEn: string;
  descriptionHi: string;
  isRecommendedForHero?: boolean;
}

export const ASPECT_PRESETS: AspectPreset[] = [
  {
    id: '21:9',
    labelEn: '21:9 Hero Panoramic',
    labelHi: '21:9 मुख्य पैनोरमिक बैनर',
    ratio: 21 / 9, // 2.333
    descriptionEn: 'Optimal for wide desktop portal headers & full-bleed hero banners',
    descriptionHi: 'पोर्टल के मुख्य पृष्ठ के चौड़े पैनोरमिक हेडर बैनर के लिए सर्वश्रेष्ठ',
    isRecommendedForHero: true,
  },
  {
    id: '16:9',
    labelEn: '16:9 Widescreen Banner',
    labelHi: '16:9 वाइडस्क्रीन बैनर',
    ratio: 16 / 9, // 1.778
    descriptionEn: 'Standard widescreen display for video spotlights and presentation cards',
    descriptionHi: 'वीडियो व मानक वाइडस्क्रीन डिस्प्ले के लिए उपयुक्त',
  },
  {
    id: '3:1',
    labelEn: '3:1 Header Ribbon',
    labelHi: '3:1 हेडर रिबन स्ट्रिप',
    ratio: 3 / 1, // 3.0
    descriptionEn: 'Ultra-wide slim strip for compact institutional headers',
    descriptionHi: 'कॉम्पैक्ट हेडर स्ट्रिप के लिए अल्ट्रा-वाइड अनुपात',
  },
  {
    id: '4:3',
    labelEn: '4:3 Standard Photo',
    labelHi: '4:3 मानक फोटो',
    ratio: 4 / 3, // 1.333
    descriptionEn: 'Classic photography format for classroom & activity galleries',
    descriptionHi: 'कक्षा गतिविधियों और सामान्य फोटोग्राफी के लिए',
  },
  {
    id: '1:1',
    labelEn: '1:1 Square',
    labelHi: '1:1 वर्गाकार',
    ratio: 1, // 1.0
    descriptionEn: 'Square format for badges, logos, and profile cards',
    descriptionHi: 'लोगो, बैज और प्रोफाइल कार्ड के लिए',
  },
  {
    id: 'free',
    labelEn: 'Freeform / Custom',
    labelHi: 'स्वतंत्र अनुपात (कस्टम)',
    ratio: null,
    descriptionEn: 'Adjust width and height freely without ratio constraints',
    descriptionHi: 'अपनी इच्छानुसार किसी भी आकार में क्रॉप करें',
  },
];

export interface CropResult {
  dataUrl: string;
  blob?: Blob;
  width: number;
  height: number;
  aspectRatio: string;
  aspectRatioValue: number;
  sizeBytes?: number;
}

export interface CropTransform {
  scale: number; // 0.5 to 4.0
  rotation: number; // degrees: 0, 90, 180, 270 or fine degrees
  flipH: boolean;
  flipV: boolean;
  offsetX: number; // Pan offset in canvas space
  offsetY: number;
}

/**
 * Loads an image from a data URL or URL into an HTMLImageElement
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Failed to load image for cropping'));
    img.src = src;
  });
}

/**
 * Executes high-precision canvas crop with rotation, flip, scaling, and export
 */
export async function performCanvasCrop(
  image: HTMLImageElement,
  cropArea: CropArea,
  transform: { rotation: number; flipH: boolean; flipV: boolean },
  targetWidth?: number,
  quality = 0.92,
  format: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg'
): Promise<CropResult> {
  // Ensure valid crop dimensions
  const cw = Math.max(10, Math.round(cropArea.width));
  const ch = Math.max(10, Math.round(cropArea.height));
  
  // Calculate output dimensions
  let outW = cw;
  let outH = ch;
  
  if (targetWidth && targetWidth > 0 && targetWidth !== cw) {
    const scaleFactor = targetWidth / cw;
    outW = Math.round(targetWidth);
    outH = Math.round(ch * scaleFactor);
  }

  // Create high-resolution export canvas
  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d', { alpha: format === 'image/png' });

  if (!ctx) {
    throw new Error('Canvas 2D context unavailable');
  }

  // High quality smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Fill with dark background for JPEG if transparency occurs
  if (format === 'image/jpeg') {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, outW, outH);
  }

  // Save state for matrix transformations
  ctx.save();

  // Scale context to target output resolution
  ctx.scale(outW / cw, outH / ch);

  // Apply translation to crop origin
  ctx.translate(-cropArea.x, -cropArea.y);

  // Handle rotation & flips if applied
  const rotRad = (transform.rotation * Math.PI) / 180;
  if (transform.rotation !== 0 || transform.flipH || transform.flipV) {
    // Find image center for rotation
    const cx = image.naturalWidth / 2;
    const cy = image.naturalHeight / 2;
    ctx.translate(cx, cy);
    if (transform.rotation !== 0) ctx.rotate(rotRad);
    if (transform.flipH) ctx.scale(-1, 1);
    if (transform.flipV) ctx.scale(1, -1);
    ctx.translate(-cx, -cy);
  }

  // Draw source image
  ctx.drawImage(image, 0, 0);
  ctx.restore();

  // Export to Data URL & Blob
  const dataUrl = canvas.toDataURL(format, quality);

  const blob: Blob | undefined = await new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b || undefined), format, quality);
  });

  const ratioVal = outW / outH;
  let ratioName = 'custom';
  if (Math.abs(ratioVal - 21 / 9) < 0.08) ratioName = '21:9';
  else if (Math.abs(ratioVal - 16 / 9) < 0.05) ratioName = '16:9';
  else if (Math.abs(ratioVal - 3 / 1) < 0.08) ratioName = '3:1';
  else if (Math.abs(ratioVal - 4 / 3) < 0.05) ratioName = '4:3';
  else if (Math.abs(ratioVal - 1) < 0.05) ratioName = '1:1';

  return {
    dataUrl,
    blob,
    width: outW,
    height: outH,
    aspectRatio: ratioName,
    aspectRatioValue: ratioVal,
    sizeBytes: blob?.size || Math.round(dataUrl.length * 0.75),
  };
}

/**
 * Curated high-resolution stock school hero banners for instant administrative selection
 */
export interface SchoolPresetBanner {
  id: string;
  titleHi: string;
  titleEn: string;
  category: string;
  url: string;
  thumbnail: string;
  suggestedRatio: string;
}

export const PRESET_HERO_BANNERS: SchoolPresetBanner[] = [
  {
    id: 'banner-campus-front',
    titleHi: 'कायाकल्प विद्यालय मुख्य भवन एवं प्रांगण',
    titleEn: 'Operation Kayakalp School Building & Campus',
    category: 'Campus',
    url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=400&q=80',
    suggestedRatio: '21:9',
  },
  {
    id: 'banner-assembly-prayer',
    titleHi: 'प्रातःकालीन प्रार्थना सभा एवं राष्ट्रीय ध्वज',
    titleEn: 'Morning Prayer Assembly & National Flag',
    category: 'Assembly',
    url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=400&q=80',
    suggestedRatio: '21:9',
  },
  {
    id: 'banner-smart-classroom',
    titleHi: 'निपुण भारत FLN एवं बाल-सुलभ शिक्षण कक्ष',
    titleEn: 'NIPUN Bharat FLN & Joyful Classroom',
    category: 'Classroom',
    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=400&q=80',
    suggestedRatio: '21:9',
  },
  {
    id: 'banner-mdm-dining',
    titleHi: 'पीएम पोषण (मध्याह्न भोजन) एवं पंक्तिबद्ध भोजन',
    titleEn: 'PM POSHAN Nutritious Mid-Day Meal',
    category: 'Nutrition',
    url: 'https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?auto=format&fit=crop&w=400&q=80',
    suggestedRatio: '21:9',
  },
  {
    id: 'banner-sports-day',
    titleHi: 'वार्षिक खेलकूद प्रतियोगिता एवं बाल क्रीड़ांगन',
    titleEn: 'Annual Sports Day & Playground Athletics',
    category: 'Sports',
    url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=400&q=80',
    suggestedRatio: '21:9',
  },
  {
    id: 'banner-library-reading',
    titleHi: 'पढ़े भारत बढ़े भारत - बाल पुस्तकालय एवं रीडिंग कॉर्नर',
    titleEn: 'Padhe Bharat Badhe Bharat - Library & Reading',
    category: 'Library',
    url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=400&q=80',
    suggestedRatio: '21:9',
  },
  {
    id: 'banner-national-festival',
    titleHi: 'गणतंत्र दिवस / स्वतंत्रता दिवस राष्ट्रीय पर्व',
    titleEn: 'Independence & Republic Day Celebrations',
    category: 'National',
    url: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=400&q=80',
    suggestedRatio: '21:9',
  },
  {
    id: 'banner-science-lab',
    titleHi: 'विज्ञान नवाचार एवं गणितीय टीएलएम प्रयोगशाला',
    titleEn: 'Science Innovation & Mathematics TLM Lab',
    category: 'Lab',
    url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=400&q=80',
    suggestedRatio: '21:9',
  },
  {
    id: 'banner-bala-murals',
    titleHi: 'बाला (BaLA) पेंटिंग एवं ज्ञानवर्धक शिक्षण दीवारें',
    titleEn: 'BaLA Learning Walls & Interactive Murals',
    category: 'Art',
    url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=400&q=80',
    suggestedRatio: '21:9',
  },
  {
    id: 'banner-ict-smartclass',
    titleHi: 'डिजिटल स्मार्ट क्लास एवं आईसीटी कंप्यूटर लैब',
    titleEn: 'ICT Smart Classroom & Digital Pedagogy',
    category: 'Classroom',
    url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80',
    suggestedRatio: '21:9',
  },
  {
    id: 'banner-eco-club',
    titleHi: 'हरित विद्यालय पर्यावरण एवं वृक्षारोपण अभियान',
    titleEn: 'Green Campus & Tree Plantation Drive',
    category: 'Environment',
    url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=80',
    suggestedRatio: '21:9',
  }
];
