import { useState } from 'react';

import { isAxiosError } from 'axios';

import { ApiError } from '@apis/errors/apiError';
import {
  useCreateFireOriginMutation,
  useScenarioFireOriginQuery,
} from '@apis/scenarios/fireZoneQueries';

import useToast from '@components/toast/useToast';

/**
 * 발화점(시나리오의 최초 화재 발생 지점) 지정 관련 상태·조회·등록 로직을 한 곳에 모은 훅.
 *
 * 발화점은 노드가 아니라 시나리오별 그리드 셀 단위로 지정하는 값(백엔드 POST
 * /scenarios/{scenarioId}/fire-zones 스펙 기준)이라, 지금은 도면관리상세 페이지의 도면
 * 캔버스를 빌려 지정하고 있지만 팀 논의 결과 추후 시나리오설정 페이지(캔버스가 더 큰 화면)로
 * 옮겨질 예정 — 그때 이 훅을 그대로 옮겨 쓸 수 있도록, 도면관리상세의 다른 배치 모드
 * (CCTV 등록·구역 추가 등)와 공유하는 "그리드 셀 클릭을 지금 어느 용도로 쓸지" 판단
 * (cctvGridCellsMode, activeDraftCellIds 등)은 의도적으로 이 훅 밖(호스트 페이지)에 남겨두고,
 * 발화점 자체의 상태만 다룬다.
 */
export const useFireOriginDesignation = () => {
  const { show } = useToast();

  // 시나리오를 고르는 모달 단계
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  // 도면에서 셀을 클릭해 지정하는 단계(=활성 모드) — 켜져 있는 동안 호스트 페이지가 그리드 셀
  // 클릭을 발화점 지정으로 소비하도록 연결해야 함. 지정 완료·취소 시 null로 돌아가 모드를 끔.
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  // 발화점은 다중 선택이 아니라 단일 셀만 고르므로 배열이 아닌 단일 값으로 관리
  const [draftCellId, setDraftCellId] = useState<string | null>(null);
  // 지정 완료 뒤(activeScenarioId가 null로 돌아간 뒤)에도 방금 지정한 발화점을 도면에 계속
  // 표시하고 체크리스트 등에 반영하기 위한 값 — activeScenarioId와 분리해두지 않으면 "완료" 즉시
  // 조회가 꺼져서 새로고침 전까지 반영되지 않는 문제가 생김
  const [statusScenarioId, setStatusScenarioId] = useState<string | null>(null);

  const originQuery = useScenarioFireOriginQuery(statusScenarioId ?? undefined);
  const existingOrigin = originQuery.data?.[0] ?? null;

  const mutation = useCreateFireOriginMutation();

  const openPicker = () => setIsPickerOpen(true);
  const closePicker = () => setIsPickerOpen(false);

  const cancel = () => {
    setActiveScenarioId(null);
    setDraftCellId(null);
  };

  // 발화점은 재등록 API가 없어 한 번 지정되면 다시 클릭해도 항상 실패(409)함 —
  // 이미 지정된 상태에서는 셀 선택 자체를 막는다. 같은 칸을 다시 누르면 선택 해제.
  const selectCell = (cellId: string) => {
    if (existingOrigin) return;
    setDraftCellId((prev) => (prev === cellId ? null : cellId));
  };

  const confirm = () => {
    if (!activeScenarioId || !draftCellId) return;
    mutation.mutate(
      { scenarioId: activeScenarioId, gridCellId: draftCellId },
      {
        onSuccess: () => {
          show({ title: '발화점이 지정되었습니다.', variant: 'success' });
          setActiveScenarioId(null);
          setDraftCellId(null);
        },
        onError: (error: unknown) => {
          // HTTP 4xx는 AxiosError로, 200 + isSuccess:false는 ApiError로 올라오므로 둘 다 봄
          // (CCTV 등록 실패 처리와 같은 패턴) — 409라고 전부 "이미 등록됨"은 아니라서
          // 서버가 내려준 code/message를 그대로 확인해서 보여줌
          const responseData = isAxiosError(error) ? error.response?.data : undefined;
          const body =
            responseData && typeof responseData === 'object'
              ? (responseData as { code?: unknown; message?: unknown })
              : undefined;
          const serverCode = error instanceof ApiError ? error.code : String(body?.code ?? '');
          const serverMessage =
            error instanceof ApiError ? error.message : String(body?.message ?? '');
          if (import.meta.env.DEV) {
            console.error('[발화점 지정 실패]', serverCode, responseData ?? error);
          }
          show({
            title: serverMessage || '발화점 지정에 실패했습니다. 다시 시도해주세요.',
            variant: 'error',
            duration: 8000,
          });
        },
      },
    );
  };

  return {
    isPickerOpen,
    openPicker,
    closePicker,
    activeScenarioId,
    setActiveScenarioId,
    draftCellId,
    statusScenarioId,
    setStatusScenarioId,
    existingOrigin,
    isStatusLoading: originQuery.isLoading,
    cancel,
    selectCell,
    confirm,
    isConfirming: mutation.isPending,
  };
};
