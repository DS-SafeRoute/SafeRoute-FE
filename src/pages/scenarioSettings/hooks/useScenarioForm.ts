import { useState } from 'react';

import {
  FIRE_SPREAD_LABEL,
  FIRE_SPREAD_VALUE,
} from '@pages/scenarioSettings/constants/scenarioSettings';
import type { FireSpreadLabel } from '@pages/scenarioSettings/constants/scenarioSettings';
import type { Scenario } from '@apis/scenarios/scenarioTypes';
import type { BasicInfo } from '@pages/scenarioSettings/types/scenarioSettings';
import { getInitialBasicInfo, toScheduledAt } from '@pages/scenarioSettings/utils/scenarioSettings';

import type {
  CreateScenarioDraftRequest,
  UpdateScenarioRequest,
} from '@apis/__generated__/data-contracts';

interface UseScenarioFormParams {
  scenario?: Scenario;
  defaultBuildingId?: string;
}

export type ReadyScenarioFormPayload = Required<
  Pick<UpdateScenarioRequest, 'name' | 'expectedParticipants' | 'scheduledAt' | 'fireSpreadSpeed'>
> &
  Required<Pick<UpdateScenarioRequest, 'buildingId'>>;

const isFireSpreadLabel = (value: string): value is FireSpreadLabel => value in FIRE_SPREAD_VALUE;

export const useScenarioForm = ({ scenario, defaultBuildingId }: UseScenarioFormParams) => {
  const [basicInfo, setBasicInfo] = useState<BasicInfo>(() => getInitialBasicInfo(scenario));
  const [fireSpreadLabel, setFireSpreadLabel] = useState<FireSpreadLabel>(
    scenario?.fireSpreadSpeed
      ? FIRE_SPREAD_LABEL[scenario.fireSpreadSpeed]
      : FIRE_SPREAD_LABEL.MEDIUM,
  );
  const selectedBuildingId = basicInfo.targetBuilding || defaultBuildingId || '';

  const handleBasicInfoChange = (key: keyof BasicInfo, value: string) => {
    setBasicInfo((current) => ({ ...current, [key]: value }));
  };

  const handleFireSpreadChange = (value: string) => {
    if (isFireSpreadLabel(value)) setFireSpreadLabel(value);
  };

  const getDraftPayload = (): CreateScenarioDraftRequest => {
    const name = basicInfo.scenarioName.trim();
    const participants = Number(basicInfo.expectedParticipants);
    const scheduledAt = basicInfo.scheduledAt ? toScheduledAt(basicInfo.scheduledAt) : null;

    return {
      ...(name && { name }),
      ...(selectedBuildingId && { buildingId: selectedBuildingId }),
      ...(Number.isInteger(participants) &&
        participants > 0 && {
          expectedParticipants: participants,
        }),
      ...(scheduledAt && { scheduledAt }),
      fireSpreadSpeed: FIRE_SPREAD_VALUE[fireSpreadLabel],
    };
  };

  const getReadyPayload = (): ReadyScenarioFormPayload | null => {
    const name = basicInfo.scenarioName.trim();
    const expectedParticipants = Number(basicInfo.expectedParticipants);
    const scheduledAt = toScheduledAt(basicInfo.scheduledAt);

    if (
      !name ||
      !selectedBuildingId ||
      !Number.isInteger(expectedParticipants) ||
      expectedParticipants < 1 ||
      !scheduledAt
    ) {
      return null;
    }

    return {
      name,
      buildingId: selectedBuildingId,
      expectedParticipants,
      scheduledAt,
      fireSpreadSpeed: FIRE_SPREAD_VALUE[fireSpreadLabel],
    };
  };

  return {
    value: {
      basicInfo: { ...basicInfo, targetBuilding: selectedBuildingId },
      fireSpreadLabel,
    },
    selectedBuildingId,
    getDraftPayload,
    getReadyPayload,
    handleBasicInfoChange,
    handleFireSpreadChange,
  };
};
