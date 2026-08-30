import { useRef, useState } from 'react';

import clsx from 'clsx';
import { Navigate, useNavigate, useParams } from 'react-router';

import AlertIcon from '@assets/icons/ic-alert.svg?react';
import ChevronRightIcon from '@assets/icons/ic-chevron-right.svg?react';

import EmptyState from '@components/empty';

import { getTrainingCameraFramesPath, getTrainingCamerasPath, ROUTES } from '@constants/path';

import CameraTabs from './components/CameraTabs/CameraTabs';
import SessionInfoCard from './components/SessionInfoCard/SessionInfoCard';
import {
  EVENT_SEVERITY_COLOR,
  EVENT_TYPE_LABEL,
  TRAINING_SESSION_STATUS_VIEW,
  VIEWABLE_SESSION_STATUSES,
} from './constants/trainingAnalysis';
import { mockCameras, mockEvents, mockFrames, mockSessions } from './mocks/trainingAnalysisData';
import * as styles from './TrainingCameraFramesPage.css';
import { CONGESTION_LEVEL_LABEL } from './types/trainingAnalysis';
import { formatCapturedTime, formatElapsedFromStart } from './utils/trainingAnalysis';

import type { CongestionLevel, TrainingSessionStatus } from './types/trainingAnalysis';

const isViewable = (status: TrainingSessionStatus) =>
  (VIEWABLE_SESSION_STATUSES as readonly TrainingSessionStatus[]).includes(status);

const NEEDS_ATTENTION: CongestionLevel[] = ['CROWDED', 'VERY_CROWDED'];

const TrainingCameraFramesPage = () => {
  const { sessionId, cctvId } = useParams<{ sessionId: string; cctvId: string }>();
  const navigate = useNavigate();
  const [frameIndex, setFrameIndex] = useState(0);
  const filmstripRef = useRef<HTMLDivElement>(null);

  // TODO(API 연동): mockSessions/mockCameras.find → 세션/카메라 조회, mockFrames →
  // useInfiniteQuery(getCameraFrames)로 커서 페이징, mockEvents → getSessionEvents(sessionId, cctvCode)
  const session = mockSessions.find((s) => s.sessionId === sessionId);
  const camera = mockCameras.find((c) => c.cctvId === cctvId);
  const frames = mockFrames;
  const events = mockEvents;

  if (!session || !camera || !isViewable(session.status)) {
    return <Navigate to={ROUTES.TRAINING_ANALYSIS} replace />;
  }

  const statusView = TRAINING_SESSION_STATUS_VIEW[session.status];
  const currentFrame = frames[frameIndex];
  const sessionStartedAtMs = new Date(session.startedAt).getTime();

  const goPrev = () => setFrameIndex((i) => Math.max(0, i - 1));
  const goNext = () => setFrameIndex((i) => Math.min(frames.length - 1, i + 1));
  const scrollFilmstrip = (direction: 1 | -1) => {
    filmstripRef.current?.scrollBy({ left: direction * 420, behavior: 'smooth' });
  };

  return (
    <div className={styles.container}>
      <SessionInfoCard
        sessionName={session.scenarioName}
        statusLabel={statusView.label}
        statusColor={statusView.color}
        meta={`${camera.location} · ${camera.code}`}
        notice={`훈련 중 5초 간격으로 수집된 CCTV 프레임입니다. 총 ${frames.length}개 프레임이 저장되었으며, 프레임과 프레임 사이의 상황은 확인할 수 없습니다.`}
        onBack={() => void navigate(getTrainingCamerasPath(session.sessionId))}
      />

      <CameraTabs
        cameras={mockCameras}
        activeCctvId={camera.cctvId}
        onSelect={(c) => void navigate(getTrainingCameraFramesPath(session.sessionId, c.cctvId))}
      />

      {frames.length === 0 || !currentFrame ? (
        <EmptyState title="저장된 프레임이 없습니다" />
      ) : (
        <div className={styles.mainGrid}>
          <div className={styles.leftCol}>
            <div className={styles.viewer}>
              <span className={styles.viewerTime}>
                촬영 시각 {formatCapturedTime(currentFrame.capturedAt)} ·{' '}
                {formatElapsedFromStart(currentFrame.capturedAt, sessionStartedAtMs)}
              </span>
              <span className={styles.viewerIndex}>
                {frameIndex + 1}/{frames.length}
              </span>

              <button
                type="button"
                className={styles.navBtn}
                style={{ left: '1.2rem' }}
                disabled={frameIndex === 0}
                aria-label="이전 프레임"
                onClick={goPrev}
              >
                <ChevronRightIcon width={16} height={16} className={styles.navIconPrev} />
              </button>
              <button
                type="button"
                className={styles.navBtn}
                style={{ right: '1.2rem' }}
                disabled={frameIndex === frames.length - 1}
                aria-label="다음 프레임"
                onClick={goNext}
              >
                <ChevronRightIcon width={16} height={16} />
              </button>
            </div>

            <div className={styles.filmstripSection}>
              <button
                type="button"
                className={styles.filmstripNavBtn}
                aria-label="프레임 목록 왼쪽으로"
                onClick={() => scrollFilmstrip(-1)}
              >
                <ChevronRightIcon width={14} height={14} className={styles.navIconPrev} />
              </button>

              <div className={styles.filmstrip} ref={filmstripRef}>
                {frames.map((frame, index) => (
                  <button
                    key={frame.frameId}
                    type="button"
                    className={clsx(
                      styles.filmstripItem,
                      index === frameIndex && styles.filmstripItemActive,
                    )}
                    onClick={() => setFrameIndex(index)}
                  >
                    <span className={styles.filmstripIndex}>{index + 1}</span>
                    {NEEDS_ATTENTION.includes(frame.congestionLevel) && (
                      <AlertIcon
                        width={14}
                        height={14}
                        className={clsx(
                          styles.filmstripAlert,
                          frame.congestionLevel === 'VERY_CROWDED' && styles.filmstripAlertDanger,
                        )}
                      />
                    )}
                    <span className={styles.filmstripTime}>
                      {formatCapturedTime(frame.capturedAt)}
                    </span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                className={styles.filmstripNavBtn}
                aria-label="프레임 목록 오른쪽으로"
                onClick={() => scrollFilmstrip(1)}
              >
                <ChevronRightIcon width={14} height={14} />
              </button>
            </div>

            <div className={styles.statRow}>
              <div className={styles.statBox}>
                <span className={styles.statLabel}>감지 인원</span>
                <span className={styles.statValue}>{currentFrame.headcount}명</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statLabel}>밀집도</span>
                <span className={styles.statValue}>{currentFrame.density.toFixed(1)}명/㎡</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statLabel}>혼잡 단계</span>
                <span className={styles.statValue}>
                  {CONGESTION_LEVEL_LABEL[currentFrame.congestionLevel]}
                </span>
                <span className={styles.statSub}>{currentFrame.congestionLevel}</span>
              </div>
            </div>
          </div>

          <div className={styles.rightCol}>
            <div className={styles.panel}>
              <span className={styles.panelTitle}>세션 정보</span>
              <div className={styles.infoRow}>
                <span className={styles.infoKey}>촬영 장소</span>
                <span className={styles.infoValue}>{camera.location}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoKey}>카메라</span>
                <span className={styles.infoValue}>{camera.code}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoKey}>저장 프레임 수</span>
                <span className={styles.infoValue}>{frames.length}개</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoKey}>저장 간격</span>
                <span className={styles.infoValue}>5초</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoKey}>훈련 상태</span>
                <span className={styles.infoValue}>{statusView.label}</span>
              </div>
            </div>

            <div className={styles.panel}>
              <span className={styles.panelTitle}>이벤트 타임라인</span>
              {events.length === 0 ? (
                <span className={styles.emptyEvents}>기록된 이벤트가 없습니다</span>
              ) : (
                <ul className={styles.timelineList}>
                  {events.map((event) => (
                    <li key={event.eventId} className={styles.timelineItem}>
                      <span
                        className={styles.timelineDot}
                        style={{ backgroundColor: EVENT_SEVERITY_COLOR[event.severity] }}
                      />
                      <div className={styles.timelineBody}>
                        <span className={styles.timelineLabel}>{event.message}</span>
                        <span className={styles.timelineMeta}>
                          {formatCapturedTime(event.occurredAt)} · {EVENT_TYPE_LABEL[event.type]}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingCameraFramesPage;
