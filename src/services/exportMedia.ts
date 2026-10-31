import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Captures an HTML element and triggers a download as a crisp PNG image file.
 */
export async function downloadElementAsImage(
  element: HTMLElement,
  filename: string
): Promise<string> {
  const canvas = await html2canvas(element, {
    scale: 2, // High DPI for crisp Thai typography
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false
  });

  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return dataUrl;
}

/**
 * Captures an HTML element and generates an official single-page A4 PDF document.
 */
export async function downloadElementAsPDF(
  element: HTMLElement,
  filename: string
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const margin = 10;
  const usableWidth = pdfWidth - margin * 2;
  const usableHeight = pdfHeight - margin * 2;

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  const ratio = canvasWidth / canvasHeight;
  let printWidth = usableWidth;
  let printHeight = usableWidth / ratio;

  if (printHeight > usableHeight) {
    printHeight = usableHeight;
    printWidth = usableHeight * ratio;
  }

  const xOffset = margin + (usableWidth - printWidth) / 2;
  const yOffset = margin;

  pdf.addImage(imgData, 'PNG', xOffset, yOffset, printWidth, printHeight);
  pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}

/**
 * Captures multiple page elements and compiles them into a clean multi-page A4 PDF document.
 * Exactly matches official multi-page dormitory PDF reports (Page 1: Floor 1-2, Page 2: Floor 3, etc.)
 */
export async function downloadMultiPagePDF(
  pageElements: HTMLElement[],
  filename: string
): Promise<void> {
  if (pageElements.length === 0) return;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const usableWidth = pdfWidth - margin * 2;
  const usableHeight = pdfHeight - margin * 2;

  for (let i = 0; i < pageElements.length; i++) {
    if (i > 0) {
      pdf.addPage('a4', 'portrait');
    }

    const canvas = await html2canvas(pageElements[i], {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    const ratio = canvas.width / canvas.height;
    let printWidth = usableWidth;
    let printHeight = usableWidth / ratio;

    if (printHeight > usableHeight) {
      printHeight = usableHeight;
      printWidth = usableHeight * ratio;
    }

    const xOffset = margin + (usableWidth - printWidth) / 2;
    const yOffset = margin;

    pdf.addImage(imgData, 'PNG', xOffset, yOffset, printWidth, printHeight);
  }

  pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}

/**
 * Copies the rendered element image directly to the user's clipboard for pasting into Line/Chat
 */
export async function copyElementImageToClipboard(element: HTMLElement): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        reject(new Error('Failed to generate image blob'));
        return;
      }
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        resolve();
      } catch (err) {
        reject(err);
      }
    }, 'image/png');
  });
}
