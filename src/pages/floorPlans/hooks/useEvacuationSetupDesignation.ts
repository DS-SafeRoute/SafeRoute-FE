import { useState } from 'react';

import { isAxiosError } from 'axios';

import { ApiError } from '@apis/errors/apiError';
import {
  useScenarioEvacuationSetupQuery,
  useSetEvacuationSetupMutation,
} from '@apis/scenarios/evacuationSetupQueries';

import useToast from '@components/toast/useToast';

/**
 * 발화점(최초 화재 발생 지점) + 훈련 시작점 지정 관련 상태·조회·등록 로직을 한 곳에 모은 훅.
 *
 * 예전의 useFireOriginDesignation을 대체함 — 발화점만 등록하던 POST
 * /scenarios/{scenarioId}/fire-zones가 백엔드에서 완전히 제거되고(팀 전달사항, 2026-09-03),
 * 대신 POST /scenarios/{scenarioId}/evacuation-setup으로 통합됨. 이 새 API는
 * fireOriginGridCellId와 startNodeId를 "하나의 요청, 하나의 트랜잭션"으로 함께 요구해서
 * (스웨거 확인, 둘 다 required) 발화점만 따로 등록할 방법이 이제 없음 — 그래서 이 훅은
 * 발화점 선택 + 시작점 선택을 같이 들고 있다가 한 번에 확정함.
 *
 * 시작 노드 "후보"를 새로 만드는 것(도면에 START 타입 노드 추가)은 이 훅의 역할이 아니고
 * useStartNodeDesignation의 역할임 — 그 훅이 만든 후보들 중 하나를 여기서 startNodeId로
 * 고르는 것뿐. 시나리오설정 화면에서는 보통 이 둘을 같이 씀:
 *   const startNode = useStartNodeDesignation(floorId);       // 후보 목록 조회·새로 만들기
 *   const evacuation = useEvacuationSetupDesignation(scenarioId); // 후보 중 하나 + 발화점 셀 확정
 *
 * 발화점 셀 선택은 useFireOriginDesignation과 동일하게 draftFireOriginCellId/selectFireOriginCell
 * 이름을 써서 GridCellPickerCanvas에 그대로 꽂을 수 있게 함(selectedCellId/onCellSelect 계약).
 */
export const useEvacuationSetupDesignation = (scenarioId?: string) => {
  const { show } = useToast();

  // 재진입 시 이미 설정된 값 — 스웨거 설명 그대로("시나리오 설정 화면 재진입 시 발화점과
  // 훈련 시작점을 한 번에 조회")
  const setupQuery = useScenarioEvacuationSetupQuery(scenarioId);
  const evacuationSetup = setupQuery.data ?? null;

  const [draftFireOriginCellId, setDraftFireOriginCellId] = useState<string | null>(null);
  const [draftStartNodeId, setDraftStartNodeId] = useState<string | null>(null);

  // 발화점은 다중 선택이 아니라 단일 셀만 고름 — 같은 칸을 다시 누르면 선택 해제
  const selectFireOriginCell = (cellId: string) =>
    setDraftFireOriginCellId((prev) => (prev === cellId ? null : cellId));

  const selectStartNode = (nodeId: string) =>
    setDraftStartNodeId((prev) => (prev === nodeId ? null : nodeId));

  const reset = () => {
    setDraftFireOriginCellId(null);
    setDraftStartNodeId(null);
  };

  const mutation = useSetEvacuationSetupMutation();

  const confirm = () => {
    if (!scenarioId || !draftFireOriginCellId || !draftStartNodeId) return;
    mutation.mutate(
      { scenarioId, fireOriginGridCellId: draftFireOriginCellId, startNodeId: draftStartNodeId },
      {
        onSuccess: () => {
          show({ title: '발화점과 훈련 시작점을 지정했습니다.', variant: 'success' });
          reset();
        },
        onError: (error: unknown) => {
          // HTTP 4xx는 AxiosError로, 200 + isSuccess:false는 ApiError로 올라오므로 둘 다 봄
          // (CCTV·시작 노드 등록 실패 처리와 같은 패턴)
          const responseData = isAxiosError(error) ? error.response?.data : undefined;
          const body =
            responseData && typeof responseData === 'object'
              ? (responseData as { message?: unknown })
              : undefined;
          const serverMessage =
            error instanceof ApiError ? error.message : String(body?.message ?? '');
          if (import.meta.env.DEV) {
            console.error('[발화점·시작점 지정 실패]', responseData ?? error);
          }
          show({
            title: serverMessage || '발화점·시작점 지정에 실패했습니다. 다시 시도해주세요.',
            variant: 'error',
            duration: 8000,
          });
        },
      },
    );
  };

  return {
    evacuationSetup,
    isLoading: setupQuery.isLoading,
    draftFireOriginCellId,
    selectFireOriginCell,
    draftStartNodeId,
    selectStartNode,
    reset,
    canConfirm: !!draftFireOriginCellId && !!draftStartNodeId,
    confirm,
    isConfirming: mutation.isPending,
  };
};
