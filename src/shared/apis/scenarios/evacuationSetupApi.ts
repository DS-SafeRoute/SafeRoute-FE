import { HTTP_METHOD, request } from '@apis/config/request';
import { API_ENDPOINTS } from '@apis/constants/endpoints';
import type { MapNodeType } from '@apis/floors/mapGraphApi';

// 발화점 등록(POST /scenarios/{scenarioId}/fire-zones)이 제거되면서 그 자리를 대신하는
// 엔드포인트(팀 전달사항, 2026-09-03 확인) — 발화점과 훈련 시작점을 한 요청으로 같이 저장함.
// api:generate로 자동 생성해야 정석이지만 .env의 SWAGGER_URL이 지금 swagger-ui HTML 페이지를
// 가리키고 있어(raw json이 아님) 생성기가 실패함 — 그래서 스웨거 원문을 보고 손으로 맞춰 씀.
// SWAGGER_URL을 .../v3/api-docs로 고치고 재생성하면 이 파일의 타입 부분은 __generated__로
// 옮겨도 됨

export interface EvacuationFireOrigin {
  fireZoneId: string;
  gridCellId: string;
  rowIndex: number;
  columnIndex: number;
  centerX: number;
  centerY: number;
}

export interface EvacuationStartNode {
  nodeId: string;
  code: string;
  name: string;
  type: MapNodeType;
  x: number;
  y: number;
}

export interface EvacuationSetup {
  scenarioId: string;
  buildingId: string;
  floorId: string;
  // 아직 설정 전이면 둘 다 null(스웨거: "아직 설정 전이면" 필드가 비어 내려옴)
  fireOrigin: EvacuationFireOrigin | null;
  startNode: EvacuationStartNode | null;
  configuredAt: string | null;
}

// 응답 원본 필드가 전부 optional로 내려올 수 있어(스웨거 스키마 기준) 안전하게 매핑
interface EvacuationFireOriginResponse {
  fireZoneId?: string;
  gridCellId?: string;
  rowIndex?: number;
  columnIndex?: number;
  centerX?: number;
  centerY?: number;
}

interface EvacuationStartNodeResponse {
  nodeId?: string;
  code?: string;
  name?: string;
  type?: MapNodeType;
  x?: number;
  y?: number;
}

interface EvacuationSetupResponse {
  scenarioId?: string;
  buildingId?: string;
  floorId?: string;
  fireOrigin?: EvacuationFireOriginResponse | null;
  startNode?: EvacuationStartNodeResponse | null;
  configuredAt?: string;
}

const toFireOrigin = (r?: EvacuationFireOriginResponse | null): EvacuationFireOrigin | null => {
  if (!r?.fireZoneId || !r.gridCellId) return null;
  return {
    fireZoneId: r.fireZoneId,
    gridCellId: r.gridCellId,
    rowIndex: r.rowIndex ?? 0,
    columnIndex: r.columnIndex ?? 0,
    centerX: r.centerX ?? 0,
    centerY: r.centerY ?? 0,
  };
};

const toStartNode = (r?: EvacuationStartNodeResponse | null): EvacuationStartNode | null => {
  if (!r?.nodeId || !r.type) return null;
  return {
    nodeId: r.nodeId,
    code: r.code ?? '',
    name: r.name ?? '',
    type: r.type,
    x: r.x ?? 0,
    y: r.y ?? 0,
  };
};

const toEvacuationSetup = (response: EvacuationSetupResponse): EvacuationSetup => {
  const { scenarioId, buildingId, floorId } = response;
  if (!scenarioId || !buildingId || !floorId) {
    throw new Error('발화점·시작점 설정 응답에 필수 필드가 누락되었습니다.');
  }
  return {
    scenarioId,
    buildingId,
    floorId,
    fireOrigin: toFireOrigin(response.fireOrigin),
    startNode: toStartNode(response.startNode),
    configuredAt: response.configuredAt ?? null,
  };
};

// 시나리오 설정 화면 재진입 시 발화점 + 훈련 시작점을 한 번에 조회(스웨거 설명 원문)
export const getScenarioEvacuationSetup = async (
  scenarioId: string,
  signal?: AbortSignal,
): Promise<EvacuationSetup> => {
  const response = await request<EvacuationSetupResponse>({
    method: HTTP_METHOD.GET,
    url: API_ENDPOINTS.SCENARIOS.EVACUATION_SETUP(scenarioId),
    signal,
    responseMode: 'raw',
  });
  return toEvacuationSetup(response);
};

export interface SetEvacuationSetupVariables {
  scenarioId: string;
  fireOriginGridCellId: string;
  startNodeId: string;
}

// 사용자가 고른 최초 발화점(fireOriginGridCellId)과 훈련 시작점(startNodeId)을 하나의 요청,
// 하나의 트랜잭션으로 함께 저장(스웨거 설명 원문) — 스키마상 둘 다 required라 하나만 보낼 수 없음
export const setScenarioEvacuationSetup = async ({
  scenarioId,
  fireOriginGridCellId,
  startNodeId,
}: SetEvacuationSetupVariables): Promise<EvacuationSetup> => {
  const response = await request<
    EvacuationSetupResponse,
    { fireOriginGridCellId: string; startNodeId: string }
  >({
    method: HTTP_METHOD.POST,
    url: API_ENDPOINTS.SCENARIOS.EVACUATION_SETUP(scenarioId),
    body: { fireOriginGridCellId, startNodeId },
    responseMode: 'raw',
  });
  return toEvacuationSetup(response);
};
