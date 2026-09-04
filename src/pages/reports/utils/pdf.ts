const PDF_WIDTH_MM = 210;
const PDF_HEIGHT_MM = 297;
const PDF_MARGIN_MM = 10;

export const downloadReportPdf = async (reportElement: HTMLElement, fileName: string) => {
  await document.fonts.ready;
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);
  const canvas = await html2canvas(reportElement, {
    backgroundColor: '#F3F4F6',
    scale: Math.min(window.devicePixelRatio || 1, 2),
    useCORS: true,
    logging: false,
  });

  const contentWidthMm = PDF_WIDTH_MM - PDF_MARGIN_MM * 2;
  const contentHeightMm = PDF_HEIGHT_MM - PDF_MARGIN_MM * 2;
  const pageHeightPx = Math.floor((canvas.width * contentHeightMm) / contentWidthMm);
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  let offsetY = 0;
  let pageIndex = 0;

  while (offsetY < canvas.height) {
    const sliceHeight = Math.min(pageHeightPx, canvas.height - offsetY);
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = canvas.width;
    pageCanvas.height = sliceHeight;
    const context = pageCanvas.getContext('2d');

    if (!context) throw new Error('PDF 캔버스를 생성할 수 없습니다.');

    context.drawImage(
      canvas,
      0,
      offsetY,
      canvas.width,
      sliceHeight,
      0,
      0,
      canvas.width,
      sliceHeight,
    );

    if (pageIndex > 0) pdf.addPage();

    const sliceHeightMm = (sliceHeight * contentWidthMm) / canvas.width;
    pdf.addImage(
      pageCanvas.toDataURL('image/jpeg', 0.95),
      'JPEG',
      PDF_MARGIN_MM,
      PDF_MARGIN_MM,
      contentWidthMm,
      sliceHeightMm,
    );

    offsetY += sliceHeight;
    pageIndex += 1;
  }

  pdf.save(fileName);
};
