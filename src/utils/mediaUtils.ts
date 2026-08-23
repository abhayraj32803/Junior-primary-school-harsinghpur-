// Utility functions for media, video extraction, and thumbnail processing

export interface VideoInfo {
  type: 'youtube' | 'direct' | 'drive' | 'unknown';
  videoId?: string;
  embedUrl?: string;
  thumbnailUrl?: string;
  cleanUrl: string;
}

/**
 * Extracts YouTube ID from various YouTube URL formats
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  
  // Standard watch URL: youtube.com/watch?v=ID
  // Short URL: youtu.be/ID
  // Embed URL: youtube.com/embed/ID
  // Shorts URL: youtube.com/shorts/ID
  // Live URL: youtube.com/live/ID
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|live\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  return (match && match[2].length === 11) ? match[2] : null;
}

/**
 * Parses any video URL to determine its source and extract embed URL & thumbnail
 */
export function parseVideoUrl(url: string): VideoInfo {
  if (!url) {
    return { type: 'unknown', cleanUrl: '' };
  }

  const trimmed = url.trim();
  const ytId = extractYouTubeId(trimmed);

  if (ytId) {
    return {
      type: 'youtube',
      videoId: ytId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0`,
      thumbnailUrl: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
      cleanUrl: `https://www.youtube.com/watch?v=${ytId}`
    };
  }

  // Google Drive
  if (trimmed.includes('drive.google.com')) {
    const driveMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
    const fileId = driveMatch ? driveMatch[1] : null;
    return {
      type: 'drive',
      videoId: fileId || undefined,
      embedUrl: fileId ? `https://drive.google.com/file/d/${fileId}/preview` : trimmed,
      thumbnailUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80',
      cleanUrl: trimmed
    };
  }

  // Direct video file or base64 data
  if (
    trimmed.startsWith('data:video/') ||
    trimmed.endsWith('.mp4') ||
    trimmed.endsWith('.webm') ||
    trimmed.endsWith('.mov') ||
    trimmed.endsWith('.ogg') ||
    trimmed.includes('/video/')
  ) {
    return {
      type: 'direct',
      embedUrl: trimmed,
      thumbnailUrl: '',
      cleanUrl: trimmed
    };
  }

  return {
    type: 'unknown',
    cleanUrl: trimmed
  };
}

/**
 * Generates a video snapshot/thumbnail using an offscreen video element and canvas
 */
export function captureVideoFrame(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;

      const fileUrl = URL.createObjectURL(file);
      video.src = fileUrl;

      video.onloadedmetadata = () => {
        // Seek to 1 second (or 0.5s if shorter)
        const seekTime = Math.min(1.0, video.duration > 1 ? 1.0 : video.duration / 2);
        video.currentTime = seekTime;
      };

      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 360;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            URL.revokeObjectURL(fileUrl);
            resolve(dataUrl);
          } else {
            URL.revokeObjectURL(fileUrl);
            resolve('');
          }
        } catch (err) {
          URL.revokeObjectURL(fileUrl);
          resolve('');
        }
      };

      video.onerror = () => {
        URL.revokeObjectURL(fileUrl);
        resolve('');
      };

      // Fallback timeout
      setTimeout(() => {
        URL.revokeObjectURL(fileUrl);
        resolve('');
      }, 5000);
    } catch (e) {
      resolve('');
    }
  });
}
