import { useEffect, useMemo, useRef, useState } from 'react';

import clsx from 'clsx';
import { Navigate, useNavigate, useParams } from 'react-router';

import { extractApiError } from '@apis/errors/apiError';

import AlertIcon from '@assets/icons/ic-alert.svg?react';
import ChevronRightIcon from '@assets/icons/ic-chevron-right.svg?react';

import EmptyState from '@components/empty';
import LoadingState from '@components/loadingState';

import { getTrainingCameraFramesPath, getTrainingCamerasPath, ROUTES } from '@constants/path';

import { useCameraFramesQuery } from './api/useCameraFramesQuery';
import { useSessionCamerasQuery } from './api/useSessionCamerasQuery';
import { useSessionEventsQuery } from './api/useSessionEventsQuery';
import { useTrainingSessionQuery } from './api/useViewableTrainingSessionsQuery';
import CameraSidebar from './components/CameraSidebar/CameraSidebar';
import SessionInfoCard from './components/SessionInfoCard/SessionInfoCard';
import {
  EVENT_SEVERITY_COLOR,
  EVENT_TYPE_LABEL,
  isLiveSessionStatus,
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
  // 사용자가 과거 프레임을 보고 있는 동안엔(마지막=최신 프레임에서 벗어나 있으면) 새 프레임이
  // 들어와도 보던 위치를 유지하고, 최신 프레임을 보고 있을 때만 새 프레임이 들어오는 대로 계속
  // 따라가게 함(라이브 방송의 "최신으로 이동" 개념과 동일)
  const stickToLatestRef = useRef(true);

  // 사이드바에서 cctvId만 바뀌면 프레임 목록도 카메라별로 새로 조회되므로,
  // 이전 카메라의 frameIndex가 남아 새 카메라의 프레임 수를 넘어가지 않도록 초기화하고
  // 최신 프레임 추적도 다시 켬
  useEffect(() => {
    setFrameIndex(0);
    stickToLatestRef.current = true;
  }, [cctvId, sessionId]);

  const {
    session,
    isLoading: isSessionLoading,
    isError: isSessionError,
  } = useTrainingSessionQuery(sessionId);
  // 진행 중 훈련이면 카메라·프레임·이벤트를 주기적으로 다시 조회해 최신 프레임을 반영
  const isLive = isLiveSessionStatus(session?.status);
  const {
    data: cameras = [],
    isLoading: isCamerasLoading,
    isError: isCamerasError,
    error: camerasError,
  } = useSessionCamerasQuery(sessionId, { live: isLive });
  const camera = cameras.find((c) => c.cctvId === cctvId);

  const {
    data: framePages,
    isLoading: isFramesLoading,
    isError: isFramesError,
    error: framesError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useCameraFramesQuery(sessionId, cctvId, { live: isLive });
  // API는 최신순(newest-first) 커서 페이지네이션이라(다음 페이지 = 더 과거) 그대로 쓰면
  // 필름스트립이 최신→과거 순으로 놓여서 "다음 프레임"(→)을 누를 때마다 과거로 가는 이상한
  // 경험이 됐음(실측으로 확인한 버그). 화면에서는 시간순(과거→최신, 왼쪽→오른쪽)으로 뒤집어서
  // 씀 — "다음"이 항상 미래, "이전"이 항상 과거를 가리키게
  const frames = useMemo(
    () => [...(framePages?.pages.flatMap((page) => page.frames) ?? [])].reverse(),
    [framePages],
  );
  const lastFrameIndex = frames.length - 1;

  // 새 프레임이 들어오면(최초 로드 포함) 최신 추적 중일 때만 마지막(최신) 프레임으로 따라감
  useEffect(() => {
    if (frames.length > 0 && stickToLatestRef.current) {
      setFrameIndex(frames.length - 1);
    }
  }, [frames.length]);

  const { data: events = [] } = useSessionEventsQuery(sessionId, camera?.code, { live: isLive });

  // 배열이 시간순으로 뒤집혀서, "다음 페이지(더 과거 프레임)"가 필요해지는 시점도 배열
  // 앞쪽(오래된 쪽, 인덱스 0 근처)임 — 그쪽 근처까지 보면 미리 불러와서 ‹로 넘길 때 끊기지 않게 함
  useEffect(() => {
    if (frameIndex <= PREFETCH_THRESHOLD - 1 && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [frameIndex, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 최신 프레임이 필름스트립 맨 오른쪽에 있어서(시간순으로 뒤집었으니) 프레임이 많으면
  // 화면 밖으로 벗어날 수 있음 — 선택된 프레임이 바뀔 때마다 보이는 위치로 스크롤해줌
  useEffect(() => {
    const container = filmstripRef.current;
    const activeEl = container?.children[frameIndex];
    if (activeEl instanceof HTMLElement) {
      activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [frameIndex]);

  if (!isSessionLoading && !isSessionError && (!session || !isViewable(session.status))) {
    return <Navigate to={ROUTES.TRAINING_ANALYSIS} replace />;
  }

  if (isSessionError || isCamerasError) {
    return (
      <div className={styles.container}>
        <EmptyState
          title="훈련 정보를 불러오지 못했습니다"
          description={extractApiError(camerasError).message || '잠시 후 다시 시도해주세요'}
        />
      </div>
    );
  }

  if (isSessionLoading || isCamerasLoading || !session) {
    return (
      <div className={styles.container}>
        <LoadingState />
      </div>
    );
  }

  // 카메라 조회가 끝났는데 cctvId와 일치하는 카메라가 없으면(잘못된 URL·삭제된 카메라)
  // 무한 로딩 대신 카메라 목록으로 돌려보냄
  if (!camera) {
    return <Navigate to={getTrainingCamerasPath(session.sessionId)} replace />;
  }

  const statusView = TRAINING_SESSION_STATUS_VIEW[session.status];
  const currentFrame = frames[frameIndex];
  const sessionStartedAtMs = new Date(session.startedAt).getTime();

  // 프레임을 어떤 경로로든(이전/다음 버튼, 필름스트립 클릭) 옮길 땐 항상 이걸 거침 —
  // 최신(마지막) 프레임으로 옮기면 다시 최신 추적을 켜고, 그 외로 옮기면 끔
  const selectFrame = (index: number) => {
    setFrameIndex(index);
    stickToLatestRef.current = index >= lastFrameIndex;
  };
  const goPrev = () => selectFrame(Math.max(0, frameIndex - 1));
  const goNext = () => selectFrame(Math.min(lastFrameIndex, frameIndex + 1));
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
        notice={
          isLive
            ? '실시간 모니터링 중 · 5초 간격으로 최신 CCTV 프레임이 수신됩니다.'
            : '훈련 중 5초 간격으로 수집된 CCTV 프레임 기록입니다. 프레임 사이 구간은 기록되지 않습니다.'
        }
        live={isLive}
        onBack={() => void navigate(getTrainingCamerasPath(session.sessionId))}
      />

      {isFramesLoading && <LoadingState size="md" message="프레임을 불러오는 중..." />}

      {!isFramesLoading && isFramesError && (
        <EmptyState
          title="프레임을 불러오지 못했습니다"
          description={extractApiError(framesError).message || '잠시 후 다시 시도해주세요'}
        />
      )}

      {!isFramesLoading && !isFramesError && (
        <div className={styles.consolePanel}>
          <CameraSidebar
            cameras={cameras}
            activeCctvId={camera.cctvId}
            onSelect={(c) =>
              void navigate(getTrainingCameraFramesPath(session.sessionId, c.cctvId))
            }
          />

          <div className={styles.viewerCol}>
            {frames.length === 0 || !currentFrame ? (
              // EmptyState는 밝은 화면 기준 색이라(짙은 글자) 어두운 뷰어 위에서는 거의 안 보임 —
              // 뷰어와 같은 어두운 박스 안에 옅은 색 글자로 직접 띄움
              <div className={styles.viewer}>
                <span className={styles.viewerEmpty}>저장된 프레임이 없습니다</span>
              </div>
            ) : (
              <>
                <div className={styles.viewer}>
                  {currentFrame.imageUrl ? (
                    <img
                      className={styles.viewerImg}
                      src={currentFrame.imageUrl}
                      alt={`${camera.code} ${formatCapturedTime(currentFrame.capturedAt)} 프레임`}
                    />
                  ) : (
                    <span className={styles.viewerEmpty}>이미지 준비 중…</span>
                  )}

                  <span className={styles.viewerTime}>
                    촬영 시각 {formatCapturedTime(currentFrame.capturedAt)} ·{' '}
                    {formatElapsedFromStart(currentFrame.capturedAt, sessionStartedAtMs)}
                  </span>
                  <span className={styles.viewerIndex}>
                    {frameIndex + 1}/{frames.length}
                    {hasNextPage ? '+' : ''}
                  </span>
                  {isLive && frameIndex === lastFrameIndex && (
                    <span className={styles.liveBadge}>
                      <span className={styles.liveDot} aria-hidden="true" />
                      LIVE
                    </span>
                  )}

                  <button
                    type="button"
                    className={styles.navBtn}
                    style={{ left: '1.2rem' }}
                    disabled={frameIndex === 0 && !hasNextPage}
                    aria-label="이전 프레임"
                    onClick={goPrev}
                  >
                    <ChevronRightIcon width={16} height={16} className={styles.navIconPrev} />
                  </button>
                  <button
                    type="button"
                    className={styles.navBtn}
                    style={{ right: '1.2rem' }}
                    disabled={frameIndex === lastFrameIndex}
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
                        onClick={() => selectFrame(index)}
                      >
                        {frame.imageUrl && (
                          <img className={styles.filmstripThumb} src={frame.imageUrl} alt="" />
                        )}
                        <span className={styles.filmstripIndex}>{index + 1}</span>
                        {NEEDS_ATTENTION.includes(frame.congestionLevel) && (
                          <AlertIcon
                            width={14}
                            height={14}
                            className={clsx(
                              styles.filmstripAlert,
                              frame.congestionLevel === 'VERY_CROWDED' &&
                                styles.filmstripAlertDanger,
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
              </>
            )}
          </div>

          <div className={styles.rightCol}>
            <div className={styles.panel}>
              <span className={styles.panelTitle}>세션 정보</span>
              {/* 촬영 장소·카메라 코드는 위 세션 정보 카드(SessionInfoCard)의 meta 줄에
                  이미 나와 있어서 중복 표시하지 않음 */}
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
