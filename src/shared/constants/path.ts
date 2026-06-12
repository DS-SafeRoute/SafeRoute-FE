export const ROUTES = {
  HOME: '/',
  SCENARIO_SETTINGS: '/scenarioSettings',
  MANAGEMENT: '/management',
  BUILDINGS: '/buildings',
  FLOOR_PLANS: '/floorPlans',
  FLOOR_PLANS_DETAIL: '/floorPlans/:buildingId/:floorId',
  CAMERAS: '/cameras',
  TRAINING_ANALYSIS: '/trainingAnalysis',
  REPORTS: '/reports',
} as const;
