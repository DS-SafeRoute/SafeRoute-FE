import DownloadIcon from '@assets/icons/ic-download.svg?react';

import { Button } from '@components/Button';
import EmptyState from '@components/empty';
import LoadingState from '@components/loadingState';

import { useReportDetailData } from '../hooks/useReportDetailData';
import { useReportPdf } from '../hooks/useReportPdf';
import * as styles from '../ReportsPage.css';
import AiReportCard from './card/AiReportCard';
import GradeSummaryCard from './card/GradeSummaryCard';
import RecommendationsCard from './card/RecommendationsCard';
import ScoreBreakdownCard from './card/ScoreBreakdownCard';
import ReportCharts from './chart/ReportCharts';
import ReportHeader from './ReportHeader';

interface ReportDetailProps {
  reportId: string;
}

const ReportDetail = ({ reportId }: ReportDetailProps) => {
  const { content, isPending, isError, refetchReport } = useReportDetailData(reportId);
  const { reportRef, isExporting, downloadPdf } = useReportPdf(content?.trainingName);

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <Button
          type="button"
          variant="outlined"
          leftIcon={<DownloadIcon />}
          onClick={() => void downloadPdf()}
          isLoading={isExporting}
          disabled={isPending || !content}
        >
          PDF 다운로드
        </Button>
      </div>

      {isPending ? (
        <LoadingState message="분석 보고서를 불러오는 중..." />
      ) : isError || !content ? (
        <EmptyState
          className={styles.pageState}
          title="분석 보고서를 불러오지 못했습니다."
          action={
            <Button type="button" variant="ghost" onClick={() => void refetchReport()}>
              다시 시도
            </Button>
          }
        />
      ) : (
        <div ref={reportRef} className={styles.reportContent}>
          <ReportHeader meta={content.meta} />

          <div className={styles.topGrid}>
            <GradeSummaryCard summary={content.summary} />
            <ScoreBreakdownCard scores={content.scores} />
          </div>

          <ReportCharts
            evacuationAccumulation={content.evacuationAccumulation}
            recentEvacuationTimes={content.recentEvacuationTimes}
          />

          <div className={styles.bottomGrid}>
            <AiReportCard summaryText={content.report.summaryText} />
            <RecommendationsCard items={content.recommendations} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportDetail;
