import { useRef, useState } from 'react';

import { useSearchParams } from 'react-router';

import { useGetBuildingsQuery } from '@pages/buildings/api/useBuildingsQuery';
import { useGetScenarioQuery } from '@pages/scenarioSettings/api/useScenariosQuery';

import { useMyProfileQuery } from '@apis/users/useMyProfileQuery';

import DownloadIcon from '@assets/icons/ic-download.svg?react';

import { Button } from '@components/Button';
import useToast from '@components/toast/useToast';

import { useTrainingReportQuery } from './api/useTrainingReportQuery';
import AiReportCard from './components/card/AiReportCard';
import GradeSummaryCard from './components/card/GradeSummaryCard';
import RecommendationsCard from './components/card/RecommendationsCard';
import ScoreBreakdownCard from './components/card/ScoreBreakdownCard';
import ReportCharts from './components/chart/ReportCharts';
import {
  evacuationAccumulation,
  recentEvacuationTimes,
  recommendations,
  reportNarrative,
  reportScores,
  reportSummary,
} from './mocks/reportData';
import * as styles from './ReportsPage.css';

const PDF_WIDTH_MM = 210;
const PDF_HEIGHT_MM = 297;
const PDF_MARGIN_MM = 10;

const getPdfFileName = (trainingName?: string) => {
  const date = new Date();
  const dateText = [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((value) => String(value).padStart(2, '0'))
    .join('');

  const safeTrainingName = trainingName?.replace(/[\\/:*?"<>|]/g, '').trim();
  return `SafeRoute_${safeTrainingName || '훈련분석보고서'}_${dateText}.pdf`;
};

const formatTrainingDate = (value?: string) => {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date);
};

const ReportsPage = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [searchParams] = useSearchParams();
  const { show } = useToast();
  const scenarioId = searchParams.get('scenarioId') ?? undefined;
  const reportId = searchParams.get('reportId') ?? undefined;
  const { data: scenario } = useGetScenarioQuery(scenarioId);
  const { data: buildings = [] } = useGetBuildingsQuery();
  const { data: currentUser } = useMyProfileQuery();
  const { data: report } = useTrainingReportQuery(reportId);
  const targetBuilding = buildings.find((building) => building.id === scenario?.buildingId);
  const participantCount = report?.participantCount ?? scenario?.expectedParticipants;
  const reportMeta = [
    { label: '학교명', value: currentUser?.schoolName || '-' },
    { label: '훈련명', value: scenario?.name || '-' },
    { label: '실행 날짜', value: formatTrainingDate(scenario?.scheduledAt) },
    { label: '대상 건물', value: targetBuilding?.name || '-' },
    {
      label: '총 참가 인원',
      value: participantCount === undefined ? '-' : `${participantCount}명`,
    },
  ];

  const handleDownloadPdf = async () => {
    const reportElement = reportRef.current;
    if (!reportElement || isExporting) return;

    setIsExporting(true);

    try {
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

      pdf.save(getPdfFileName(scenario?.name));
      show({ title: '분석 보고서 PDF를 저장했습니다.', variant: 'success' });
    } catch {
      show({ title: 'PDF 생성에 실패했습니다. 다시 시도해 주세요.', variant: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <Button
          type="button"
          variant="outlined"
          leftIcon={<DownloadIcon />}
          onClick={() => void handleDownloadPdf()}
          isLoading={isExporting}
        >
          PDF 다운로드
        </Button>
      </div>

      <div ref={reportRef} className={styles.reportContent}>
        <section className={styles.reportHeader} aria-labelledby="report-document-title">
          <div className={styles.reportTitleGroup}>
            <p className={styles.reportEyebrow}>SAFE ROUTE</p>
            <h2 id="report-document-title" className={styles.reportTitle}>
              훈련 분석 보고서
            </h2>
          </div>

          <dl className={styles.reportMetaGrid}>
            {reportMeta.map((item) => (
              <div key={item.label} className={styles.reportMetaItem}>
                <dt className={styles.reportMetaLabel}>{item.label}</dt>
                <dd className={styles.reportMetaValue}>{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className={styles.topGrid}>
          <GradeSummaryCard summary={reportSummary} />
          <ScoreBreakdownCard scores={reportScores} />
        </div>

        <ReportCharts
          evacuationAccumulation={evacuationAccumulation}
          recentEvacuationTimes={recentEvacuationTimes}
        />

        <div className={styles.bottomGrid}>
          <AiReportCard narrative={reportNarrative} />
          <RecommendationsCard items={recommendations} />
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
