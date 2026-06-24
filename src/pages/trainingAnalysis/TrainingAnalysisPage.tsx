import { useNavigate } from 'react-router';

import { Button } from '@components/Button';

import { ROUTES } from '@constants/path';

import AnalysisTabNav from './components/AnalysisTabNav/AnalysisTabNav';
import { mockAnalysisInfo, mockDetections, mockTimelineEvents } from './mocks/trainingAnalysisData';
import * as styles from './TrainingAnalysisPage.css';

import type { TimelineEventSeverity } from './types/trainingAnalysis';

const SEVERITY_COLOR: Record<TimelineEventSeverity, string> = {
  info: '#2563EB',
  warning: '#F59E0B',
  danger: '#EF4444',
  success: '#10B981',
};

const PROGRESS = 54; // mock: 02:14 / 04:08

const TrainingAnalysisPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <AnalysisTabNav />

      <div className={styles.body}>
        {/* 좌측: 비디오 플레이어 */}
        <div className={styles.videoSection}>
          <div className={styles.videoWrapper}>
            {/* 상단 배지 행 */}
            <div className={styles.videoBadgeRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div className={styles.liveBadge}>
                  <span className={styles.liveDot} />
                  LIVE
                </div>
                <span className={styles.cameraLabel}>CAM-A3-B2</span>
              </div>
              <span className={styles.yoloLabel}>YOLO v8 · 24fps · 0.18s</span>
            </div>

            {/* 군중 밀집 감지 레이블 */}
            <div className={styles.densityLabel}>군중 밀집 감지 · 6명/m²</div>

            {/* 바운딩박스 오버레이 */}
            <div className={styles.bboxOverlay}>
              {mockDetections.map((d) => (
                <div
                  key={d.id}
                  className={styles.bbox}
                  style={{
                    left: `${d.x}%`,
                    top: `${d.y}%`,
                    width: `${d.width}%`,
                    height: `${d.height}%`,
                  }}
                >
                  <span className={styles.bboxLabel}>{d.id}</span>
                </div>
              ))}
            </div>

            {/* 비디오 컨트롤 바 */}
            <div className={styles.videoControls}>
              <span className={styles.timeLabel}>02:14 / 04:08</span>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${PROGRESS}%` }} />
                <div className={styles.progressThumb} style={{ left: `${PROGRESS}%` }} />
              </div>
              <span className={styles.speedLabel}>1×</span>
            </div>
          </div>
        </div>

        {/* 우측 패널 */}
        <div className={styles.sidePanel}>
          {/* 분석 정보 */}
          <div className={styles.panel}>
            <span className={styles.panelTitle}>분석 정보</span>
            <div className={styles.divider} />
            <div className={styles.infoRow}>
              <span className={styles.infoKey}>원본 영상</span>
              <span className={styles.infoValue}>{mockAnalysisInfo.fileName}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoKey}>해상도</span>
              <span className={styles.infoValue}>{mockAnalysisInfo.resolution}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoKey}>길이</span>
              <span className={styles.infoValue}>{mockAnalysisInfo.duration}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoKey}>모델</span>
              <span className={styles.infoValue}>{mockAnalysisInfo.model}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoKey}>처리 시간</span>
              <span className={styles.infoValue}>{mockAnalysisInfo.processedSec}초</span>
            </div>
          </div>

          {/* 이벤트 타임라인 */}
          <div className={styles.panel}>
            <span className={styles.panelTitle}>이벤트 타임라인</span>
            <div className={styles.divider} />
            <ul className={styles.timelineList}>
              {mockTimelineEvents.map((event) => (
                <li key={event.time} className={styles.timelineItem}>
                  <span className={styles.timelineTime}>{event.time}</span>
                  <span
                    className={styles.timelineDot}
                    style={{ backgroundColor: SEVERITY_COLOR[event.severity] }}
                  />
                  <span className={styles.timelineLabel}>{event.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 액션 버튼 */}
          <div className={styles.actionRow}>
            <Button variant="outlined" size="md" fullWidth>
              영상 업로드
            </Button>
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={() => void navigate(ROUTES.TRAINING_MONITORING)}
            >
              AI 분석 시작
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingAnalysisPage;
