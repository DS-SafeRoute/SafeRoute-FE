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

export interface ApiResponseCctvRegistrationResponse {
  code?: string;
  isSuccess?: boolean;
  message?: string;
  result?: CctvRegistrationResponse;
}

export interface ApiResponseCctvResponse {
  code?: string;
  isSuccess?: boolean;
  message?: string;
  result?: CctvResponse;
}

export interface ApiResponseCongestionImageUrlResponse {
  code?: string;
  isSuccess?: boolean;
  message?: string;
  result?: CongestionImageUrlResponse;
}

export interface ApiResponseDeviceTokenIssueResponse {
  code?: string;
  isSuccess?: boolean;
  message?: string;
  result?: DeviceTokenIssueResponse;
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

export interface ApiResponseFloorGridCellPageResponse {
  code?: string;
  isSuccess?: boolean;
  message?: string;
  result?: FloorGridCellPageResponse;
}

export interface ApiResponseFloorGridResponse {
  code?: string;
  isSuccess?: boolean;
  message?: string;
  result?: FloorGridResponse;
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

export interface ApiResponseListCctvResponse {
  code?: string;
  isSuccess?: boolean;
  message?: string;
  result?: CctvResponse[];
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

export interface ApiResponseListRouteRecalculationSummaryResponse {
  code?: string;
  isSuccess?: boolean;
  message?: string;
  result?: RouteRecalculationSummaryResponse[];
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

export interface ApiResponseRouteRecalculationDetailResponse {
  code?: string;
  isSuccess?: boolean;
  message?: string;
  result?: RouteRecalculationDetailResponse;
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

export interface ApiResponseUserProfileResponse {
  code?: string;
  isSuccess?: boolean;
  message?: string;
  result?: UserProfileResponse;
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

export interface CctvGridCellResponse {
  /** @format double */
  centerX?: number;
  /** @format double */
  centerY?: number;
  /** @format int32 */
  columnIndex?: number;
  /** @format uuid */
  id?: string;
  /** @format int32 */
  rowIndex?: number;
  walkable?: boolean;
}

export interface CctvRegistrationResponse {
  cctv?: CctvResponse;
  deviceToken?: string;
}

export interface CctvResponse {
  /** @format double */
  monitoredAreaM2?: number;
  code?: string;
  /** @format uuid */
  customNodeId?: string;
  enabled?: boolean;
  /** @format uuid */
  floorId?: string;
  /** @format double */
  gridCellSizeMeter?: number;
  gridCells?: CctvGridCellResponse[];
  /** @format uuid */
  id?: string;
  /** @format int32 */
  monitoredGridCellCount?: number;
  name?: string;
  /** @format double */
  x?: number;
  /** @format double */
  y?: number;
}

export type ChangeDirectionData = ApiResponseLightDirectionResponse;

export interface ChangeLightDirectionRequest {
  direction: "LEFT" | "RIGHT" | "OFF";
}

export interface ConfigureCctvGridCellsRequest {
  /** @minItems 1 */
  gridCellIds: string[];
}

export type ConfigureGridCellsData = ApiResponseCctvResponse;

export type ConfigureGuidanceData = ApiResponseIoTLightResponse;

export interface ConfigureGuidanceRequest {
  /** @format uuid */
  decisionNodeId: string;
  /** @format uuid */
  leftEdgeId: string;
  /** @format uuid */
  rightEdgeId: string;
}

export interface CongestionConfigQueryResponse {
  /** @format double */
  monitoredAreaM2?: number;
  cctvCode?: string;
  /** @format int64 */
  configVersion?: number;
  congestionThresholds?: CongestionThresholdsResponse;
  eventDetection?: EventDetectionResponse;
  /** @format int32 */
  snapshotIntervalSec?: number;
  /** @format int32 */
  targetInferenceFps?: number;
  trainingActive?: boolean;
  trainingSessionId?: string;
}

export interface CongestionEventResponse {
  cctvCode?: string;
  /** @format int64 */
  configVersion?: number;
  congestionLevel?: "NORMAL" | "CAUTION" | "CROWDED" | "VERY_CROWDED";
  /** @format double */
  density?: number;
  /** @format int64 */
  detectedAt?: number;
  eventId?: string;
  eventImageKey?: string;
  eventStatus?: "RECEIVED" | "PROCESSING" | "PROCESSED" | "FAILED";
  eventType?: "CONGESTION_STARTED" | "CONGESTION_LEVEL_UP" | "CONGESTION_ENDED";
  /** @format int32 */
  headcount?: number;
  imageUploadStatus?: "PENDING" | "COMPLETED" | "FAILED" | "UPLOADED";
  localCongestionLevel?: "NORMAL" | "CAUTION" | "CROWDED" | "VERY_CROWDED";
  /** @format double */
  localDensity?: number;
  trainingSessionId?: string;
}

export interface CongestionImageUrlResponse {
  /** @format date-time */
  expiresAt?: string;
  imageUrl?: string;
}

export interface CongestionThresholdsResponse {
  /** @format double */
  CAUTION_FROM?: number;
  /** @format double */
  CROWDED_FROM?: number;
  /** @format double */
  VERY_CROWDED_FROM?: number;
}

export type ConnectEventImageData = any;

export interface ConnectEventImageRequest {
  /** @minLength 1 */
  eventImageKey: string;
  /** @format int64 */
  uploadedAt: number;
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

export type CreateCctvData = ApiResponseCctvRegistrationResponse;

export interface CreateCctvRequest {
  /** @format uuid */
  floorId: string;
  /** @minItems 1 */
  gridCellIds: string[];
  /**
   * @minLength 0
   * @maxLength 100
   */
  name: string;
  /**
   * @format double
   * @min 0
   * @max 1
   */
  x: number;
  /**
   * @format double
   * @min 0
   * @max 1
   */
  y: number;
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

export type CreateOrRegenerateGridData = ApiResponseFloorGridResponse;

export interface CreateOrUpdateFloorGridRequest {
  /** @format double */
  cellSizeMeter?: number;
}

export interface CreatePresignedImageUrlRequest {
  /** @format int64 */
  capturedAt: number;
  /**
   * @minLength 1
   * @pattern [A-Za-z0-9_-]+
   */
  cctvCode: string;
  /**
   * @minLength 1
   * @pattern image/jpeg
   */
  contentType: string;
  imageType: "MONITORING" | "CONGESTION_EVENT";
  /** @format uuid */
  referenceId: string;
  /** @format uuid */
  requestId: string;
  /** @format uuid */
  trainingSessionId: string;
}

export type CreatePresignedUrlData = PresignedImageUrlResponse;

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

export interface DeviceTokenIssueResponse {
  deviceToken?: string;
}

export type DisableCctvData = ApiResponseCctvResponse;

export type DisableLightData = ApiResponseIoTLightResponse;

export type EnableCctvData = ApiResponseCctvResponse;

export type EnableLightData = ApiResponseIoTLightResponse;

export type EndTrainingSessionData = ApiResponseTrainingSessionResponse;

export interface EvacuationRouteResponse {
  path?: MapNodeResponse[];
  /** @format double */
  totalWeight?: number;
}

export interface EventDetectionResponse {
  /** @format int32 */
  cooldownSec?: number;
  /** @format int32 */
  recoveryConsecutiveFrames?: number;
  /** @format int32 */
  requiredConsecutiveFrames?: number;
}

export interface FloorGraphResponse {
  edges?: MapEdgeResponse[];
  nodes?: MapNodeResponse[];
}

export interface FloorGridCellPageResponse {
  content?: FloorGridCellResponse[];
  first?: boolean;
  last?: boolean;
  /** @format int32 */
  page?: number;
  /** @format int32 */
  size?: number;
  /** @format int64 */
  totalElements?: number;
  /** @format int32 */
  totalPages?: number;
}

export interface FloorGridCellResponse {
  /** @format double */
  centerX?: number;
  /** @format double */
  centerY?: number;
  /** @format int32 */
  columnIndex?: number;
  fired?: boolean;
  /** @format uuid */
  id?: string;
  /** @format int32 */
  rowIndex?: number;
  walkable?: boolean;
}

export interface FloorGridResponse {
  /** @format double */
  cellSizeMeter?: number;
  /** @format int32 */
  columns?: number;
  /** @format uuid */
  floorId?: string;
  /** @format int32 */
  rows?: number;
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

export type GetCctvData = ApiResponseCctvResponse;

export type GetCctvsData = ApiResponseListCctvResponse;

export type GetConfigData = CongestionConfigQueryResponse;

export type GetEventImageUrlData = ApiResponseCongestionImageUrlResponse;

export type GetFloorData = ApiResponseFloorResponse;

export type GetFloorsData = ApiResponseListFloorResponse;

export type GetGraphData = ApiResponseFloorGraphResponse;

export type GetGridCells1Data = ApiResponseFloorGridCellPageResponse;

export type GetGridCellsData = ApiResponseCctvResponse;

export type GetLightData = ApiResponseIoTLightResponse;

export type GetLightsData = ApiResponseListIoTLightResponse;

export type GetMyProfileData = ApiResponseUserProfileResponse;

export type GetObservationImageUrlData = ApiResponseCongestionImageUrlResponse;

export type GetRecalculationDetailData =
  ApiResponseRouteRecalculationDetailResponse;

export type GetRecalculationsData =
  ApiResponseListRouteRecalculationSummaryResponse;

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

export type IssueDeviceTokenData = ApiResponseDeviceTokenIssueResponse;

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
  phoneNumber?: string;
  role?: "MANAGER" | "NORMAL";
  schoolName?: string;
  tokenType?: string;
  username?: string;
}

export type LogoutData = ApiResponseVoid;

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

export interface ObservationResponse {
  /** @format double */
  avgHeadcount?: number;
  /** @format int64 */
  capturedAt?: number;
  cctvCode?: string;
  /** @format int64 */
  configVersion?: number;
  congestionLevel?: "NORMAL" | "CAUTION" | "CROWDED" | "VERY_CROWDED";
  /** @format double */
  density?: number;
  eventId?: string;
  /** @format int64 */
  expiresAt?: number;
  monitoringImageKey?: string;
  /** @format int32 */
  peakHeadcount?: number;
  /** @format int32 */
  sampleCount?: number;
  trainingSessionId?: string;
  /** @format int64 */
  windowEnd?: number;
  /** @format int64 */
  windowStart?: number;
}

export interface PresignedImageUrlResponse {
  /** @format int64 */
  expiresAt?: number;
  objectKey?: string;
  uploadUrl?: string;
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

export interface RejectRouteRecalculationRequest {
  reason?: string;
}

export type ReportCongestionEventData = CongestionEventResponse;

export interface ReportCongestionEventRequest {
  /** @minLength 1 */
  cctvCode: string;
  /** @format int64 */
  configVersion: number;
  /** @format int64 */
  detectedAt: number;
  /** @format uuid */
  eventId: string;
  eventType: "CONGESTION_STARTED" | "CONGESTION_LEVEL_UP" | "CONGESTION_ENDED";
  /** @format int32 */
  headcount: number;
  localCongestionLevel: "NORMAL" | "CAUTION" | "CROWDED" | "VERY_CROWDED";
  /** @format double */
  localDensity: number;
  /** @format uuid */
  trainingSessionId: string;
}

export type ReportObservationData = ObservationResponse;

export interface ReportObservationRequest {
  /** @format double */
  avgHeadcount: number;
  /** @format int64 */
  capturedAt: number;
  capturedAtValid?: boolean;
  /** @minLength 1 */
  cctvCode: string;
  /** @format int64 */
  configVersion: number;
  /** @format uuid */
  eventId: string;
  headcountValid?: boolean;
  monitoringImageKey?: string;
  /** @format int32 */
  peakHeadcount: number;
  /** @format int32 */
  sampleCount: number;
  /** @format uuid */
  trainingSessionId: string;
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

export interface RouteRecalculationDetailResponse {
  cancelReason?: string;
  candidateRoute?: RouteSegment;
  cctvCode?: string;
  congestionLevel?: "NORMAL" | "CAUTION" | "CROWDED" | "VERY_CROWDED";
  /** @format double */
  density?: number;
  previousRoute?: RouteSegment;
  /** @format uuid */
  recalculationId?: string;
  rejectReason?: string;
  /** @format date-time */
  requestedAt?: string;
  /** @format date-time */
  resolvedAt?: string;
  resolvedBy?: string;
  status?: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  /** @format uuid */
  trainingSessionId?: string;
  /** @format uuid */
  triggerEdgeId?: string;
  triggerType?: "STARTED" | "LEVEL_UP" | "ENDED";
}

export interface RouteRecalculationResponse {
  congestionLevel?: "NORMAL" | "CAUTION" | "CROWDED" | "VERY_CROWDED";
  /** @format uuid */
  id?: string;
  recalculatedNodeIds?: string[];
  rejectReason?: string;
  /** @format date-time */
  requestedAt?: string;
  /** @format date-time */
  resolvedAt?: string;
  resolvedBy?: string;
  status?: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  /** @format double */
  totalWeight?: number;
  /** @format uuid */
  trainingSessionId?: string;
  /** @format uuid */
  triggerEdgeId?: string;
}

export interface RouteRecalculationSummaryResponse {
  cctvCode?: string;
  congestionLevel?: "NORMAL" | "CAUTION" | "CROWDED" | "VERY_CROWDED";
  /** @format double */
  density?: number;
  /** @format uuid */
  recalculationId?: string;
  /** @format date-time */
  requestedAt?: string;
  status?: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  /** @format uuid */
  trainingSessionId?: string;
  /** @format uuid */
  triggerEdgeId?: string;
  triggerType?: "STARTED" | "LEVEL_UP" | "ENDED";
}

export interface RouteSegment {
  nodeIds?: string[];
  /** @format double */
  totalWeight?: number;
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
  deletable?: boolean;
  /** @format int32 */
  expectedParticipants?: number;
  fireSpreadSpeed?: "SLOW" | "MEDIUM" | "FAST";
  /** @format uuid */
  id?: string;
  isTemplate?: boolean;
  name?: string;
  /** @format date-time */
  scheduledAt?: string;
  status?: "DRAFT" | "READY" | "IN_PROGRESS" | "COMPLETED" | "ERROR";
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
  /** @pattern ^$|^[0-9-]{9,20}$ */
  phoneNumber?: string;
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
  phoneNumber?: string;
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

export type UpdateFloorData = ApiResponseFloorResponse;

export interface UpdateFloorRequest {
  /** @format int32 */
  floorNum: number;
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

export type UpdateMyProfileData = ApiResponseUserProfileResponse;

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

export interface UpdateUserProfileRequest {
  /**
   * @minLength 1
   * @maxLength 255
   */
  email?: string;
  /** @pattern ^$|^[0-9-]{9,20}$ */
  phoneNumber?: string;
  /**
   * @minLength 5
   * @maxLength 20
   */
  schoolName?: string;
  /**
   * @minLength 2
   * @maxLength 20
   */
  username?: string;
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

export interface UserProfileResponse {
  email?: string;
  /** @format uuid */
  id?: string;
  phoneNumber?: string;
  role?: "MANAGER" | "NORMAL";
  schoolName?: string;
  username?: string;
}
