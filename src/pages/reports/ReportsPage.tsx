import { useParams } from 'react-router';

import ReportDetail from './components/ReportDetail';

const ReportsPage = () => {
  const { reportId } = useParams<{ reportId: string }>();

  return reportId ? <ReportDetail reportId={reportId} /> : null;
};

export default ReportsPage;
