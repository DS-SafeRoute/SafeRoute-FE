import { useRef, useState } from 'react';

import useToast from '@components/toast/useToast';

import { downloadReportPdf } from '../utils/pdf';
import { getReportPdfFileName } from '../utils/report';

// PDF 다운로드
export const useReportPdf = (trainingName?: string) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { show } = useToast();

  const downloadPdf = async () => {
    if (!reportRef.current || isExporting) return;

    setIsExporting(true);

    try {
      await downloadReportPdf(reportRef.current, getReportPdfFileName(trainingName));
    } catch {
      show({ title: 'PDF 생성에 실패했습니다. 다시 시도해 주세요.', variant: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  return { reportRef, isExporting, downloadPdf };
};
