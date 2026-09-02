import { useState } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import { ApiError } from '@apis/errors/apiError';
import type { FloorGridCell } from '@apis/floors/floorGridApi';
import { floorQueryKeys, useFloorGraphQuery } from '@apis/floors/floorQueries';
import { createMapNode } from '@apis/floors/mapGraphApi';

import useToast from '@components/toast/useToast';

/**
 * 시작 노드(START) 지정 관련 상태·조회·등록 로직을 한 곳에 모은 훅.
 *
 * 시작 노드는 시나리오가 아니라 "층" 기준 값이지만, 팀 논의 결과 지정 UI는 발화점과 마찬가지로
 * 시나리오설정 페이지(2. 화재 발생 조건 쪽 도면)에서 다루기로 함.
 *
 * 팀 전달사항(2026-09-03): 노드 생성/수정 API에서 한 층에 START 후보를 여러 개 만들 수 있도록
 * 바뀜 — 예전의 "이미 START가 있는 층엔 못 만든다"(FLOOR_START_NODE_ALREADY_EXISTS) 제약이
 * 없어졌음. START는 여전히 isExitTarget=false로 강제 저장되고, 시나리오가 그중 하나를
 * "실제 훈련 시작점"으로 고르는 건 이 훅/화면의 몫이 아님(이 캔버스는 후보만 만듦).
 *
 * draftCellId/selectCell/confirm 모양을 GridCellPickerCanvas에 그대로 꽂아 쓸 수 있게 함 —
 * 다만 시작 노드는 백엔드가 그리드 셀 id가 아니라 좌표(x, y 0~1)를 요구하는 노드 API라서
 * (CreateMapNodeRequest), 선택한 셀의 centerX/centerY를 그 좌표로 변환해서 보냄. 화면에서는
 * "셀을 고른다"는 경험이지만, 실제로 서버에 저장되는 값의 형태는 다르다는 걸 기억해둘 것.
 *
 * 캔버스 렌더링 자체는 호스트 페이지(또는 GridCellPickerCanvas)가 맡고, 이 훅은 시작 노드
 * 자체의 상태만 다룸.
 */
export const useStartNodeDesignation = (floorId?: string) => {
  const { show } = useToast();
  const queryClient = useQueryClient();

  // 이 층에 이미 있는 시작 후보들 — 여러 개 허용되므로 더 이상 선택을 막는 데 쓰지 않고,
  // "몇 개 있는지" 참고용 정보로만 씀
  const graphQuery = useFloorGraphQuery(floorId);
  const startNodes = graphQuery.data?.nodes.filter((n) => n.type === 'START') ?? [];

  // 그리드 셀 클릭으로 고르는 배치 모드 — 켜져 있는 동안 호스트 페이지가 도면 클릭을
  // selectCell로 연결해야 함(useFireOriginDesignation과 동일한 계약)
  const [isPlacing, setIsPlacing] = useState(false);
  const [draftCellId, setDraftCellId] = useState<string | null>(null);

  const beginPlacing = () => {
    setIsPlacing(true);
    setDraftCellId(null);
  };

  const cancel = () => {
    setIsPlacing(false);
    setDraftCellId(null);
  };

  // 같은 칸을 다시 누르면 선택 해제 — 한 층에 여러 개 허용되므로(팀 전달사항) 이미 있어도 막지 않음
  const selectCell = (cellId: string) => {
    setDraftCellId((prev) => (prev === cellId ? null : cellId));
  };

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
      const serverMessage = error instanceof ApiError ? error.message : String(body?.message ?? '');
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
    confirm: (name: string, gridCells: readonly FloorGridCell[]) =>
      mutation.mutate({ name, gridCells }),
    isConfirming: mutation.isPending,
  };
};
