export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  LANDING: '/landing',
  SCENARIO_LIST: '/scenarioSettings',
  SCENARIO_CREATE: '/scenarioSettings/new',
  SCENARIO_DETAIL: '/scenarioSettings/:scenarioId',
  BUILDINGS: '/buildings',
  FLOOR_PLANS: '/floorPlans',
  FLOOR_PLANS_DETAIL: '/floorPlans/:buildingId/:floorId',
  TRAINING_ANALYSIS: '/trainingAnalysis',
  TRAINING_MONITORING: '/trainingAnalysis/monitoring',
  REPORTS: '/reports',
} as const;

export const getScenarioDetailPath = (scenarioId: string) =>
  ROUTES.SCENARIO_DETAIL.replace(':scenarioId', encodeURIComponent(scenarioId));
