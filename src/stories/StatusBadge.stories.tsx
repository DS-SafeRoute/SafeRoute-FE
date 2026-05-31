import StatusBadge from '@components/chip/StatusBadge';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared/Chip/StatusBadge',
  component: StatusBadge,
  parameters: {
    layout: 'centered',
  },
  args: {
    label: '진행중',
    color: 'blue',
    dot: false,
  },
  argTypes: {
    color: {
      control: 'inline-radio',
      options: ['neutral', 'blue', 'green', 'yellow', 'red', 'purple'],
    },
  },
} satisfies Meta<typeof StatusBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const ReferenceSet: Story = {
  render: () => (
    <div
      style={{
        width: '1280px',
        padding: '48px',
        borderRadius: '32px',
        backgroundColor: '#FFFFFF',
        display: 'grid',
        gap: '32px',
      }}
    >
      <div style={{ display: 'grid', gap: '24px' }}>
        <span style={{ fontSize: '14px', color: '#4A5563' }}>SOLID BADGES</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
          <StatusBadge label="대기" color="neutral" />
          <StatusBadge label="진행중" color="blue" />
          <StatusBadge label="완료" color="green" />
          <StatusBadge label="주의" color="yellow" />
          <StatusBadge label="위험" color="red" />
          <StatusBadge label="CCTV" color="purple" />
        </div>
      </div>

      <div style={{ display: 'grid', gap: '24px' }}>
        <span style={{ fontSize: '14px', color: '#4A5563' }}>WITH DOT</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
          <StatusBadge label="정상 운영" color="green" dot />
          <StatusBadge label="점검 필요" color="yellow" dot />
          <StatusBadge label="오프라인" color="red" dot />
          <StatusBadge label="훈련중" color="blue" dot />
        </div>
      </div>
    </div>
  ),
};
