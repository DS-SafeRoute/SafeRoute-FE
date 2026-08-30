import type { ScenarioResponse } from '@apis/__generated__/data-contracts';

export type ScenarioStatus = NonNullable<ScenarioResponse['status']>;

export const SCENARIO_STATUS = {
  DRAFT: 'DRAFT',
  READY: 'READY',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  ERROR: 'ERROR',
} as const satisfies Record<string, ScenarioStatus>;

// DRAFT는 기본 정보가 비어 있을 수 있으므로 식별자와 상태만 필수로 좁힌다.
// 나머지 필드는 자동 생성 타입을 그대로 사용해 API 스키마와 중복 선언하지 않는다.
type ScenarioOptionalFields = Pick<
  ScenarioResponse,
  | 'name'
  | 'buildingId'
  | 'adminId'
  | 'startNodeId'
  | 'expectedParticipants'
  | 'scheduledAt'
  | 'isTemplate'
  | 'fireSpreadSpeed'
  | 'deletable'
  | 'reportId'
  | 'createdAt'
  | 'updatedAt'
>;

export type Scenario = Required<Pick<ScenarioResponse, 'id' | 'status'>> & ScenarioOptionalFields;
