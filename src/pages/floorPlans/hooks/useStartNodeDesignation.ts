import { useCallback, useMemo, useState } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import { ApiError } from '@apis/errors/apiError';
import type { FloorGridCell } from '@apis/floors/floorGridApi';
import { floorQueryKeys, useFloorGraphQuery } from '@apis/floors/floorQueries';
import { createMapNode } from '@apis/floors/mapGraphApi';

import useToast from '@components/toast/useToast';

/**
 * 시작 후보(START) 노드 지정 관련 상태·조회·등록 로직을 한 곳에 모은 훅.
 *
 * 시작 후보는 시나리오가 아니라 "층" 기준 값 — 스웨거 재확인 결과 "특정 시나리오에 귀속되지
 * 않는, 층 단위로 등록해두는 훈련 시작점 후보"라, 만드는 것 자체는 도면을 다루는 도면편집
 * (FloorPlansDetailPage)에서 다른 구조 노드(문/계단/복도)와 같은 방식으로 함 — 처음에
 * 시나리오설정 쪽으로 옮겼다가, 이 확인 후 다시 도면편집으로 되돌림.
 *
 * 이 훅은 도면편집의 그 인라인 생성 흐름과 별개로, "이미 만들어진 후보를 조회"하거나(주로
 * 시나리오설정에서 고를 후보 목록을 보여줄 때) 필요하면 도면편집 밖에서도 새 후보를 바로
 * 만들 수 있게(beginPlacing/selectCell/confirm) 준비해둔 portable 버전임.
 *
 * 팀 전달사항(2026-09-03): 노드 생성/수정 API에서 한 층에 START 후보를 여러 개 만들 수 있도록
 * 바뀜 — 예전의 "이미 START가 있는 층엔 못 만든다"(FLOOR_START_NODE_ALREADY_EXISTS) 제약이
 * 없어졌음. START는 여전히 isExitTarget=false로 강제 저장되고, 시나리오가 그중 하나를
 * "실제 훈련 시작점"으로 고르는 건 이 훅의 몫이 아님(이 훅은 후보 조회·생성만 함) — 그건
 * useEvacuationSetupDesignation이 함(발화점 셀 + 이 훅이 반환하는 startNodes 중 하나의
 * nodeId를 같이 받아 POST /scenarios/{scenarioId}/evacuation-setup으로 확정). 시나리오설정
 * 화면에서는 보통 이 둘을 같이 씀:
 *   const startNode = useStartNodeDesignation(floorId);       // 후보 목록 조회(주 용도)
 *   const evacuation = useEvacuationSetupDesignation(scenarioId); // 후보 중 하나 + 발화점 셀 확정
 *
 * draftCellId/selectCell/confirm 모양을 GridCellPickerCanvas에 그대로 꽂아 쓸 수 있게 함 —
 * 다만 시작 후보는 백엔드가 그리드 셀 id가 아니라 좌표(x, y 0~1)를 요구하는 노드 API라서
 * (CreateMapNodeRequest), 선택한 셀의 centerX/centerY를 그 좌표로 변환해서 보냄. 화면에서는
 * "셀을 고른다"는 경험이지만, 실제로 서버에 저장되는 값의 형태는 다르다는 걸 기억해둘 것.
 *
 * 캔버스 렌더링 자체는 호스트 페이지(또는 GridCellPickerCanvas)가 맡고, 이 훅은 시작 후보
 * 자체의 상태만 다룸.
 */
export const useStartNodeDesignation = (floorId?: string) => {
  const { show } = useToast();
  const queryClient = useQueryClient();

  // 이 층에 이미 있는 시작 후보들 — 여러 개 허용되므로 더 이상 선택을 막는 데 쓰지 않고,
  // "몇 개 있는지" 참고용 정보로만 씀
  const graphQuery = useFloorGraphQuery(floorId);
  // filter 결과는 매 렌더 새 배열이라, 호출부가 이 값을 useEffect/useMemo 의존성에 넣으면 매번
  // 다시 실행됨 — graphQuery.data가 바뀔 때만 새로 계산하도록 메모(코드래빗 리뷰 반영)
  const startNodes = useMemo(
    () => graphQuery.data?.nodes.filter((n) => n.type === 'START') ?? [],
    [graphQuery.data],
  );

  // 그리드 셀 클릭으로 고르는 배치 모드 — 켜져 있는 동안 호스트 페이지가 도면 클릭을
  // selectCell로 연결해야 함(useEvacuationSetupDesignation과 동일한 계약)
  const [isPlacing, setIsPlacing] = useState(false);
  const [draftCellId, setDraftCellId] = useState<string | null>(null);

  // 아래 세 함수도 참조 안정성을 위해 useCallback으로 감쌈(코드래빗 리뷰 반영) — 의존성이 없어
  // 참조 자체는 훅 생애주기 동안 고정됨
  const beginPlacing = useCallback(() => {
    setIsPlacing(true);
    setDraftCellId(null);
  }, []);

  const cancel = useCallback(() => {
    setIsPlacing(false);
    setDraftCellId(null);
  }, []);

  // 같은 칸을 다시 누르면 선택 해제 — 한 층에 여러 개 허용되므로(팀 전달사항) 이미 있어도 막지 않음
  const selectCell = useCallback((cellId: string) => {
    setDraftCellId((prev) => (prev === cellId ? null : cellId));
  }, []);

  const mutation = useMutation({
    mutationFn: ({ name, gridCells }: { name: string; gridCells: readonly FloorGridCell[] }) => {
      const cell = gridCells.find((c) => c.id === draftCellId);
      if (!floorId || !cell) {
        return Promise.reject(new Error('시작 노드를 배치할 셀이 선택되지 않았습니다.'));
      }
      return createMapNode(floorId, {
        // code는 서버가 채번해주지 않는 값이라(도면관리상세의 door·stair·hallway 생성과 동일하게)
        // 클라이언트에서 만들어 보냄 — 화면에 노출되는 값이 아니라 유일성만 있으면 됨
        code: `START-${Date.now()}`,
        type: 'START',
        name,
        x: cell.centerX,
        y: cell.centerY,
      });
    },
    onSuccess: () => {
      if (floorId) {
        void queryClient.invalidateQueries({ queryKey: floorQueryKeys.graph(floorId) });
      }
      show({ title: '시작 노드를 지정했습니다.', variant: 'success' });
      setIsPlacing(false);
      setDraftCellId(null);
    },
    onError: (error: unknown) => {
      // HTTP 4xx는 AxiosError로, 200 + isSuccess:false는 ApiError로 올라오므로 둘 다 봄
      // (CCTV·발화점 등록 실패 처리와 같은 패턴)
      const responseData = isAxiosError(error) ? error.response?.data : undefined;
      const body =
        responseData && typeof responseData === 'object'
          ? (responseData as { message?: unknown })
          : undefined;
      // 서버가 아니라 로컬 검증(예: 셀 미선택)에서 던진 일반 Error는 body?.message가 없어
      // 여기서 빈 문자열이 되던 문제 — Error.message를 마지막 대체값으로 씀(코드래빗 리뷰 반영)
      const serverMessage =
        error instanceof ApiError
          ? error.message
          : String(body?.message ?? (error instanceof Error ? error.message : ''));
      if (import.meta.env.DEV) {
        console.error('[시작 노드 지정 실패]', responseData ?? error);
      }
      show({
        title: serverMessage || '시작 노드 지정에 실패했습니다. 다시 시도해주세요.',
        variant: 'error',
        duration: 8000,
      });
    },
  });

  return {
    hasStartNode: startNodes.length > 0,
    startNodes,
    isStartNodeLoading: graphQuery.isLoading,
    isPlacing,
    beginPlacing,
    cancel,
    draftCellId,
    selectCell,
    // gridCells를 여기서 넘기는 이유: 선택한 셀의 centerX/centerY를 구하는 데 필요한데,
    // 이 훅은 그리드 셀 목록을 직접 조회하지 않으므로(호스트가 이미 useFloorGridCellsQuery
    // 등으로 갖고 있을 값) 매번 인자로 받음 — 중복 조회를 피하기 위함
    confirm: useCallback(
      (name: string, gridCells: readonly FloorGridCell[]) => mutation.mutate({ name, gridCells }),
      // mutation.mutate는 react-query가 렌더마다 다시 만들지 않는 안정적 참조라 이것만으로 충분함
      // (mutation 객체 전체를 넣으면 매 렌더 새 참조라 메모이제이션 의미가 없어짐)
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [mutation.mutate],
    ),
    isConfirming: mutation.isPending,
  };
};
