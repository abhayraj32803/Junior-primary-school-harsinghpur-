/**
 * Universal file download utility for downloading student documents, certificates, and ID cards.
 * Supports Base64 Data URLs, Blobs, Object URLs, and Remote HTTP/HTTPS URLs.
 */
export function downloadDocumentFile(fileUrl: string, fileName?: string): boolean {
  if (!fileUrl) {
    console.error('No file URL provided for download.');
    return false;
  }

  const cleanFileName = (fileName || 'document').replace(/[/\\?%*:|"<>]/g, '_');

  try {
    // 1. If it is already a Base64 data URL
    if (fileUrl.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = cleanFileName;
      link.target = '_self';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
      }, 200);
      return true;
    }

    // 2. If it is a Blob URL
    if (fileUrl.startsWith('blob:')) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = cleanFileName;
      link.target = '_self';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
      }, 200);
      return true;
    }

    // 3. For remote HTTP/HTTPS URLs: fetch as blob to avoid cross-origin navigation without download
    fetch(fileUrl, { mode: 'cors' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = cleanFileName;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
        }, 500);
      })
      .catch((err) => {
        console.warn('Fetch blob download failed, falling back to direct anchor link:', err);
        const link = document.createElement('a');
        link.href = fileUrl;
        link.target = '_blank';
        link.download = cleanFileName;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
        }, 300);
      });

    return true;
  } catch (error) {
    console.error('Failed to trigger download:', error);
    // Fallback: open in new tab
    window.open(fileUrl, '_blank');
    return false;
  }
}
