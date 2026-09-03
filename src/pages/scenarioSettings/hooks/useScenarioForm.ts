import { useState } from 'react';

import {
  FIRE_SPREAD_LABEL,
  FIRE_SPREAD_VALUE,
} from '@pages/scenarioSettings/constants/scenarioSettings';
import type { FireSpreadLabel } from '@pages/scenarioSettings/constants/scenarioSettings';
import type { Scenario } from '@pages/scenarioSettings/types/scenarioList';
import type { BasicInfo } from '@pages/scenarioSettings/types/scenarioSettings';
import { getInitialBasicInfo, toScheduledAt } from '@pages/scenarioSettings/utils/scenarioSettings';

import type { UpdateScenarioRequest } from '@apis/__generated__/data-contracts';

interface UseScenarioFormParams {
  scenario?: Scenario;
  defaultBuildingId?: string;
}

type ScenarioFormPayload = Required<
  Pick<UpdateScenarioRequest, 'name' | 'expectedParticipants' | 'scheduledAt' | 'fireSpreadSpeed'>
>;

const isFireSpreadLabel = (value: string): value is FireSpreadLabel => value in FIRE_SPREAD_VALUE;

export const useScenarioForm = ({ scenario, defaultBuildingId }: UseScenarioFormParams) => {
  const [basicInfo, setBasicInfo] = useState<BasicInfo>(() => getInitialBasicInfo(scenario));
  const [fireSpreadLabel, setFireSpreadLabel] = useState<FireSpreadLabel>(
    scenario ? FIRE_SPREAD_LABEL[scenario.fireSpreadSpeed] : FIRE_SPREAD_LABEL.MEDIUM,
  );
  const selectedBuildingId = basicInfo.targetBuilding || defaultBuildingId || '';

  const handleBasicInfoChange = (key: keyof BasicInfo, value: string) => {
    setBasicInfo((current) => ({ ...current, [key]: value }));
  };

  const handleFireSpreadChange = (value: string) => {
    if (isFireSpreadLabel(value)) setFireSpreadLabel(value);
  };

  const getPayload = (): ScenarioFormPayload | null => {
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
    getPayload,
    handleBasicInfoChange,
    handleFireSpreadChange,
  };
};
