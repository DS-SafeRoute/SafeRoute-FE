import { useEffect, useMemo, useRef, useState } from 'react';

import clsx from 'clsx';
import { Navigate, useNavigate, useParams } from 'react-router';

import AlertIcon from '@assets/icons/ic-alert.svg?react';
import ChevronRightIcon from '@assets/icons/ic-chevron-right.svg?react';

import EmptyState from '@components/empty';

import { getTrainingCameraFramesPath, getTrainingCamerasPath, ROUTES } from '@constants/path';

import { useCameraFramesQuery } from './api/useCameraFramesQuery';
import { useSessionCamerasQuery } from './api/useSessionCamerasQuery';
import { useSessionEventsQuery } from './api/useSessionEventsQuery';
import { useTrainingSessionQuery } from './api/useViewableTrainingSessionsQuery';
import CameraTabs from './components/CameraTabs/CameraTabs';
import SessionInfoCard from './components/SessionInfoCard/SessionInfoCard';
import {
  EVENT_SEVERITY_COLOR,
  EVENT_TYPE_LABEL,
  TRAINING_SESSION_STATUS_VIEW,
  VIEWABLE_SESSION_STATUSES,
} from './constants/trainingAnalysis';
import * as styles from './TrainingCameraFramesPage.css';
import { CONGESTION_LEVEL_LABEL } from './types/trainingAnalysis';
import { formatCapturedTime, formatElapsedFromStart } from './utils/trainingAnalysis';

import type { CongestionLevel, TrainingSessionStatus } from './types/trainingAnalysis';

const isViewable = (status: TrainingSessionStatus) =>
  (VIEWABLE_SESSION_STATUSES as readonly TrainingSessionStatus[]).includes(status);

const NEEDS_ATTENTION: CongestionLevel[] = ['CROWDED', 'VERY_CROWDED'];

// 프레임 끝에서 이만큼 남았을 때 다음 페이지를 미리 불러옴
const PREFETCH_THRESHOLD = 3;

const TrainingCameraFramesPage = () => {
  const { sessionId, cctvId } = useParams<{ sessionId: string; cctvId: string }>();
  const navigate = useNavigate();
  const [frameIndex, setFrameIndex] = useState(0);
  const filmstripRef = useRef<HTMLDivElement>(null);

  const {
    session,
    isLoading: isSessionLoading,
    isError: isSessionError,
  } = useTrainingSessionQuery(sessionId);
  const { data: cameras = [] } = useSessionCamerasQuery(sessionId);
  const camera = cameras.find((c) => c.cctvId === cctvId);

  const {
    data: framePages,
    isLoading: isFramesLoading,
    isError: isFramesError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useCameraFramesQuery(sessionId, cctvId);
  const frames = useMemo(
    () => framePages?.pages.flatMap((page) => page.frames) ?? [],
    [framePages],
  );

  const { data: events = [] } = useSessionEventsQuery(sessionId, camera?.code);

  // 마지막 프레임 근처까지 보면 다음 페이지를 미리 불러와서, ›로 넘길 때 끊기지 않게 함
  useEffect(() => {
    if (frameIndex >= frames.length - PREFETCH_THRESHOLD && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [frameIndex, frames.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (!isSessionLoading && !isSessionError && (!session || !isViewable(session.status))) {
    return <Navigate to={ROUTES.TRAINING_ANALYSIS} replace />;
  }

  if (isSessionLoading || !session || !camera) {
    return (
      <div className={styles.container}>
        <p className={styles.stateMessage}>
          {isSessionError ? '불러오지 못했습니다' : '불러오는 중...'}
        </p>
      </div>
    );
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
        notice={`훈련 중 5초 간격으로 수집된 CCTV 프레임입니다. 프레임과 프레임 사이의 상황은 확인할 수 없습니다.`}
        onBack={() => void navigate(getTrainingCamerasPath(session.sessionId))}
      />

      <CameraTabs
        cameras={cameras}
        activeCctvId={camera.cctvId}
        onSelect={(c) => void navigate(getTrainingCameraFramesPath(session.sessionId, c.cctvId))}
      />

      {isFramesLoading && <p className={styles.stateMessage}>프레임을 불러오는 중...</p>}

      {!isFramesLoading && isFramesError && (
        <EmptyState title="프레임을 불러오지 못했습니다" description="잠시 후 다시 시도해주세요" />
      )}

      {!isFramesLoading && !isFramesError && (frames.length === 0 || !currentFrame) && (
        <EmptyState title="저장된 프레임이 없습니다" />
      )}

      {!isFramesLoading && !isFramesError && frames.length > 0 && currentFrame && (
        <div className={styles.mainGrid}>
          <div className={styles.leftCol}>
            <div className={styles.viewer}>
              <span className={styles.viewerTime}>
                촬영 시각 {formatCapturedTime(currentFrame.capturedAt)} ·{' '}
                {formatElapsedFromStart(currentFrame.capturedAt, sessionStartedAtMs)}
              </span>
              <span className={styles.viewerIndex}>
                {frameIndex + 1}/{frames.length}
                {hasNextPage ? '+' : ''}
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
                disabled={frameIndex === frames.length - 1 && !hasNextPage}
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
                <span className={styles.infoValue}>
                  {frames.length}개{hasNextPage ? '+' : ''}
                </span>
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
