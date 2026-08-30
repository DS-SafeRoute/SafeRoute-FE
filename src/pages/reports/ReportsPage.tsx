import { useNavigate, useParams } from 'react-router';

import FileTextIcon from '@assets/icons/ic-filetext.svg?react';

import { Button } from '@components/Button';
import EmptyState from '@components/empty';

import { ROUTES } from '@constants/path';

import ReportDetail from './components/ReportDetail';
import * as styles from './ReportsPage.css';

const ReportsPage = () => {
  const navigate = useNavigate();
  const { reportId } = useParams<{ reportId: string }>();

  if (reportId) return <ReportDetail reportId={reportId} />;

  return (
    <div className={styles.container}>
      <EmptyState
        className={styles.pageState}
        icon={<FileTextIcon />}
        title="아직 생성된 보고서가 없습니다."
        description="훈련을 완료하면 시나리오 목록에서 분석 보고서를 확인할 수 있습니다."
        action={
          <Button type="button" onClick={() => navigate(ROUTES.SCENARIO_LIST)}>
            시나리오 목록 보기
          </Button>
        }
      />
    </div>
  );
};

export default ReportsPage;
