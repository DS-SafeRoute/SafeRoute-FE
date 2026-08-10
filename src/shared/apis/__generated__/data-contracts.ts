/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export type AnalyzeData = any;

export interface ApiResponseBuildingResponse {
  code?: string;
  isSuccess?: boolean;
  message?: string;
  result?: BuildingResponse;
}

export interface ApiResponseEvacuationRouteResponse {
  code?: string;
  isSuccess?: boolean;
  message?: string;
  result?: EvacuationRouteResponse;
}

export interface ApiResponseFloorGraphResponse {
  code?: string;
  isSuccess?: boolean;
  message?: string;
  result?: FloorGraphResponse;
}

export interface ApiResponseFloorResponse {
  code?: string;
  isSuccess?: boolean;
  message?: string;
  result?: FloorResponse;
}

export interface ApiResponseIoTLightResponse {
  code?: string;
  isSuccess?: boolean;
  message?: string;
  result?: IoTLightResponse;
}

export interface ApiResponseLightDirectionResponse {
  code?: string;
  isSuccess?: boolean;
  message?: string;
  result?: LightDirectionResponse;
}

export interface ApiResponseListBuildingResponse {
  code?: string;
  isSuccess?: boolean;
  message?: string;
  result?: BuildingResponse[];
}

export interface ApiResponseListFloorResponse {
  code?: string;
  isSuccess?: boolean;
  message?: string;
  result?: FloorResponse[];
}

export interface ApiResponseListIoTLightResponse {
  code?: string;
  isSuccess?: boolean;
  message?: string;
  result?: IoTLightResponse[];
}

export interface ApiResponseLoginResponse {
  code?: string;
  isSuccess?: boolean;
  message?: string;
  result?: LoginResponse;
}

export interface ApiResponseMapEdgeResponse {
  code?: string;
  isSuccess?: boolean;
  message?: string;
  result?: MapEdgeResponse;
}

export interface ApiResponseMapNodeResponse {
  code?: string;
  isSuccess?: boolean;
  message?: string;
  result?: MapNodeResponse;
}

export interface ApiResponseRouteRecalculationResponse {
  code?: string;
  isSuccess?: boolean;
  message?: string;
  result?: RouteRecalculationResponse;
}

export interface ApiResponseS3UploadResponse {
  code?: string;
  isSuccess?: boolean;
  message?: string;
  result?: S3UploadResponse;
}

export interface ApiResponseSignupResponse {
  code?: string;
  isSuccess?: boolean;
  message?: string;
  result?: SignupResponse;
}

export interface ApiResponseTrainingSessionResponse {
  code?: string;
  isSuccess?: boolean;
  message?: string;
  result?: TrainingSessionResponse;
}

export interface ApiResponseVoid {
  code?: string;
  isSuccess?: boolean;
  message?: string;
  result?: any;
}

export type ApproveData = ApiResponseRouteRecalculationResponse;

export interface BuildingResponse {
  address?: string;
  buildingType?: "CLASSROOM" | "CAFETERIA" | "LIBRARY" | "DORMITORY" | "GYM";
  /** @format date-time */
  createdAt?: string;
  /** @format uuid */
  id?: string;
  isActive?: boolean;
  /** @format date-time */
  lastTrainedAt?: string;
  name?: string;
  /** @format int32 */
  totalFloors?: number;
  /** @format date-time */
  updatedAt?: string;
}

export type ChangeDirectionData = ApiResponseLightDirectionResponse;

export interface ChangeLightDirectionRequest {
  direction: "LEFT" | "RIGHT" | "OFF";
}

export type ConfigureGuidanceData = ApiResponseIoTLightResponse;

export interface ConfigureGuidanceRequest {
  /** @format uuid */
  decisionNodeId: string;
  /** @format uuid */
  leftEdgeId: string;
  /** @format uuid */
  rightEdgeId: string;
}

export type CreateBuildingData = ApiResponseBuildingResponse;

export interface CreateBuildingRequest {
  /**
   * @minLength 8
   * @maxLength 100
   */
  address: string;
  buildingType: "CLASSROOM" | "CAFETERIA" | "LIBRARY" | "DORMITORY" | "GYM";
  /**
   * @minLength 2
   * @maxLength 20
   */
  name: string;
  /** @format int32 */
  totalFloors: number;
}

export type CreateEdgeData = ApiResponseMapEdgeResponse;

export type CreateFloorData = ApiResponseFloorResponse;

export interface CreateFloorRequest {
  /** @format int32 */
  floorNum: number;
}

export interface CreateIoTLightRequest {
  /** @format uuid */
  floorId: string;
  /** @minLength 1 */
  name: string;
  /** @format double */
  x: number;
  /** @format double */
  y: number;
}

export type CreateLightData = ApiResponseIoTLightResponse;

export interface CreateMapEdgeRequest {
  bidirectional: boolean;
  /** @format double */
  distance: number;
  /** @format uuid */
  fromNodeId: string;
  /** @format uuid */
  toNodeId: string;
}

export interface CreateMapNodeRequest {
  /** @minLength 1 */
  code: string;
  isExitTarget?: boolean;
  /** @minLength 1 */
  name: string;
  type: "STAIR" | "ROOM" | "HALLWAY" | "DOOR" | "EXIT" | "CUSTOM";
  /** @format double */
  x: number;
  /** @format double */
  y: number;
}

export type CreateNodeData = ApiResponseMapNodeResponse;

export type CreateReportData = ReportResponse;

export interface CreateReportRequest {
  /** @minLength 1 */
  aiRecommendations: string;
  /** @format int32 */
  avgEvacuationSec: number;
  grade: "A" | "B" | "C" | "D" | "F";
  /** @format int32 */
  participantCount: number;
  /** @minLength 1 */
  pdfUrl: string;
  /** @format double */
  riskIndex: number;
  survivalRate: number;
}

export type CreateScenarioData = ScenarioResponse;

export interface CreateScenarioRequest {
  /** @format uuid */
  adminId: string;
  /** @format uuid */
  buildingId: string;
  /** @format int32 */
  expectedParticipants: number;
  fireSpreadSpeed?: "SLOW" | "MEDIUM" | "FAST";
  isTemplate?: boolean;
  /**
   * @minLength 2
   * @maxLength 20
   */
  name: string;
  /** @format date-time */
  scheduledAt: string;
}

export interface CreateSessionRequest {
  /** @format uuid */
  adminId: string;
  /** @format date-time */
  startedAt: string;
  status:
    | "RUNNING"
    | "STOPPED"
    | "SCHEDULED"
    | "COMPLETED"
    | "FAILED"
    | "CANCELLED";
}

export type CreateTrainingSessionData = TrainingSessionResponse;

export interface DashboardStatsResponse {
  /** @format double */
  avgEvacuationSec?: number;
  /** @format double */
  avgSurvivalRate?: number;
  /** @format int64 */
  totalParticipants?: number;
  /** @format int64 */
  totalSessions?: number;
}

export type DeactivateBuildingData = ApiResponseVoid;

export type DeleteBuildingData = ApiResponseVoid;

export type DeleteEdgeData = ApiResponseVoid;

export type DeleteFloorData = ApiResponseVoid;

export type DeleteNodeData = ApiResponseVoid;

export type DeleteScenarioData = any;

export type DisableLightData = ApiResponseIoTLightResponse;

export type EnableLightData = ApiResponseIoTLightResponse;

export type EndTrainingSessionData = ApiResponseTrainingSessionResponse;

export interface EvacuationRouteResponse {
  path?: MapNodeResponse[];
  /** @format double */
  totalWeight?: number;
}

export interface FloorGraphResponse {
  edges?: MapEdgeResponse[];
  nodes?: MapNodeResponse[];
}

export interface FloorResponse {
  /** @format date-time */
  createdAt?: string;
  /** @format int32 */
  floorNum?: number;
  /** @format uuid */
  id?: string;
  mapImageKey?: string;
  /** @format date-time */
  processedAt?: string;
  segmentationStatus?: "PENDING" | "PROCESSING" | "DONE" | "FAILED";
  /** @format date-time */
  updatedAt?: string;
}

export type ForceEndTrainingSessionData = ApiResponseTrainingSessionResponse;

export type GetBuildingData = ApiResponseBuildingResponse;

export type GetBuildingsData = ApiResponseListBuildingResponse;

export type GetFloorData = ApiResponseFloorResponse;

export type GetFloorsData = ApiResponseListFloorResponse;

export type GetGraphData = ApiResponseFloorGraphResponse;

export type GetLightData = ApiResponseIoTLightResponse;

export type GetLightsData = ApiResponseListIoTLightResponse;

export type GetRecentReportsData = RecentTrainingReportResponse[];

export type GetScenarioData = ScenarioResponse;

export type GetScenariosData = ScenarioResponse[];

export type GetShortestRouteData = ApiResponseEvacuationRouteResponse;

export type GetStatsData = DashboardStatsResponse;

export type GetTrainingStatusData = TrainingStatusResponse;

export interface IoTLightResponse {
  code?: string;
  /** @format uuid */
  decisionNodeId?: string;
  enabled?: boolean;
  /** @format uuid */
  floorId?: string;
  guidanceConfigured?: boolean;
  /** @format uuid */
  id?: string;
  /** @format uuid */
  leftEdgeId?: string;
  name?: string;
  piEndpoint?: string;
  /** @format uuid */
  rightEdgeId?: string;
  /** @format double */
  x?: number;
  /** @format double */
  y?: number;
}

export interface LightDirectionResponse {
  direction?: "LEFT" | "RIGHT" | "OFF";
  /** @format uuid */
  lightId?: string;
  /** @format date-time */
  updatedAt?: string;
}

export type LoginData = ApiResponseLoginResponse;

export interface LoginRequest {
  /** @minLength 1 */
  email: string;
  /** @minLength 1 */
  password: string;
}

export interface LoginResponse {
  accessToken?: string;
  email?: string;
  /** @format int64 */
  expiresIn?: number;
  /** @format uuid */
  id?: string;
  role?: "MANAGER" | "NORMAL";
  schoolName?: string;
  tokenType?: string;
  username?: string;
}

export interface MapEdgeResponse {
  bidirectional?: boolean;
  /** @format double */
  distance?: number;
  /** @format uuid */
  fromNodeId?: string;
  /** @format uuid */
  id?: string;
  /** @format uuid */
  toNodeId?: string;
}

export interface MapNodeResponse {
  code?: string;
  /** @format uuid */
  id?: string;
  isExitTarget?: boolean;
  name?: string;
  type?: "STAIR" | "ROOM" | "HALLWAY" | "DOOR" | "EXIT" | "CUSTOM";
  /** @format double */
  x?: number;
  /** @format double */
  y?: number;
}

export interface RecentTrainingReportResponse {
  /** @format int32 */
  avgEvacuationSec?: number;
  grade?: "A" | "B" | "C" | "D" | "F";
  /** @format int32 */
  participantCount?: number;
  scenarioName?: string;
  /** @format date-time */
  startedAt?: string;
  survivalRate?: number;
}

export type RejectData = ApiResponseRouteRecalculationResponse;

export type ReportCongestionData = any;

export interface ReportCongestionRequest {
  s3ImageKey?: string;
  /** @format int32 */
  avgHeadcount: number;
  cctvCode?: string;
  congestionLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  /** @format uuid */
  edgeId: string;
  headcountValid?: boolean;
  /** @format int32 */
  peakHeadcount: number;
  /** @format int64 */
  windowEnd: number;
  /** @format int64 */
  windowStart: number;
  windowValid?: boolean;
}

export interface ReportResponse {
  aiRecommendations?: string;
  /** @format int32 */
  avgEvacuationSec?: number;
  grade?: "A" | "B" | "C" | "D" | "F";
  /** @format int32 */
  participantCount?: number;
  pdfUrl?: string;
  /** @format double */
  riskIndex?: number;
  survivalRate?: number;
}

export interface RouteRecalculationResponse {
  congestionLevel?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  /** @format uuid */
  id?: string;
  recalculatedNodeIds?: string[];
  /** @format date-time */
  requestedAt?: string;
  /** @format date-time */
  resolvedAt?: string;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  /** @format double */
  totalWeight?: number;
  /** @format uuid */
  trainingSessionId?: string;
  /** @format uuid */
  triggerEdgeId?: string;
}

export interface S3UploadResponse {
  s3Uri?: string;
  bucket?: string;
  contentType?: string;
  key?: string;
  /** @format int64 */
  size?: number;
}

export interface ScenarioResponse {
  /** @format uuid */
  adminId?: string;
  /** @format uuid */
  buildingId?: string;
  /** @format date-time */
  createdAt?: string;
  /** @format int32 */
  expectedParticipants?: number;
  fireSpreadSpeed?: "SLOW" | "MEDIUM" | "FAST";
  /** @format uuid */
  id?: string;
  isTemplate?: boolean;
  name?: string;
  /** @format date-time */
  scheduledAt?: string;
  /** @format date-time */
  updatedAt?: string;
}

export type SignupData = ApiResponseSignupResponse;

export interface SignupRequest {
  /** @minLength 1 */
  email: string;
  /**
   * @minLength 8
   * @maxLength 100
   */
  password: string;
  role?: "MANAGER" | "NORMAL";
  /**
   * @minLength 5
   * @maxLength 20
   */
  schoolName: string;
  /**
   * @minLength 2
   * @maxLength 20
   */
  username: string;
}

export interface SignupResponse {
  /** @format date-time */
  createdAt?: string;
  email?: string;
  /** @format uuid */
  id?: string;
  role?: "MANAGER" | "NORMAL";
  schoolName?: string;
  username?: string;
}

export type StartTrainingSessionData = ApiResponseTrainingSessionResponse;

export interface TrainingSessionResponse {
  adminName?: string;
  /** @format uuid */
  id?: string;
  scenarioName?: string;
  /** @format date-time */
  startedAt?: string;
  status?:
    | "RUNNING"
    | "STOPPED"
    | "SCHEDULED"
    | "COMPLETED"
    | "FAILED"
    | "CANCELLED";
}

export type TrainingStatusResponse = any;

export type UpdateBuildingData = ApiResponseBuildingResponse;

export interface UpdateBuildingRequest {
  /**
   * @minLength 8
   * @maxLength 100
   */
  address: string;
  buildingType: "CLASSROOM" | "CAFETERIA" | "LIBRARY" | "DORMITORY" | "GYM";
  /**
   * @minLength 2
   * @maxLength 20
   */
  name: string;
  /** @format int32 */
  totalFloors: number;
}

export interface UpdateIoTLightRequest {
  /** @minLength 1 */
  name: string;
  /** @format double */
  x: number;
  /** @format double */
  y: number;
}

export type UpdateLightData = ApiResponseIoTLightResponse;

export interface UpdateMapNodePositionRequest {
  /** @format double */
  x: number;
  /** @format double */
  y: number;
}

export type UpdateNodePositionData = ApiResponseMapNodeResponse;

export type UpdatePiEndpointData = ApiResponseIoTLightResponse;

export interface UpdatePiEndpointRequest {
  /** @minLength 1 */
  piEndpoint: string;
}

export type UpdateScenarioData = ScenarioResponse;

export interface UpdateScenarioRequest {
  /** @format int32 */
  expectedParticipants?: number;
  fireSpreadSpeed?: "SLOW" | "MEDIUM" | "FAST";
  isTemplate?: boolean;
  name?: string;
  /** @format date-time */
  scheduledAt?: string;
}

export type UploadData = ApiResponseS3UploadResponse;

export type UploadFloorData = ApiResponseFloorResponse;

export interface UploadFloorRequest {
  /** @format binary */
  file: File;
  /** @format int32 */
  floorNum: number;
  /** @format double */
  realHeight: number;
  /** @format double */
  realWidth: number;
}

export interface UploadPayload {
  /** @format binary */
  file: File;
}
