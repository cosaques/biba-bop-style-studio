
import html2canvas from 'html2canvas';

export const captureElementAsImage = async (element: HTMLElement): Promise<Blob> => {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#e5e7eb', // gray-200 background
      scale: 2, // Higher resolution
      allowTaint: true,
      useCORS: true,
      width: element.offsetWidth,
      height: element.offsetHeight,
    });

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/png', 0.9);
    });
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    throw new Error('Failed to capture screenshot');
  }
};
