import Avatar from '@components/avatar';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared/Avatar',
  component: Avatar,
  parameters: { layout: 'centered' },
  args: {
    name: '김안전',
    size: 'md',
    role: '관리자',
    showNameGroup: false,
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    status: { control: 'inline-radio', options: ['online', 'away', 'offline'] },
    showNameGroup: { control: 'boolean' },
    role: { control: 'text' },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {},
};

const row = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
};

const label = {
  fontSize: '12px',
  letterSpacing: '0.08em',
  color: '#9CA3AF',
  width: '120px',
};

export const ReferenceSet: Story = {
  args: {},
  render: () => (
    <div
      style={{
        padding: '48px',
        borderRadius: '32px',
        backgroundColor: '#FFFFFF',
        display: 'grid',
        gap: '40px',
      }}
    >
      {/* Sizes */}
      <div style={row}>
        <span style={label}>SIZES</span>
        <Avatar name="김안전" size="sm" />
        <Avatar name="박지훈" size="md" />
        <Avatar name="이수진" size="lg" />
      </div>

      {/* With Status */}
      <div style={row}>
        <span style={label}>WITH STATUS</span>
        <Avatar name="김안전" size="md" status="online" />
        <Avatar name="박지훈" size="md" status="away" />
        <Avatar name="이수진" size="md" status="offline" />
      </div>

      {/* With Name & Role */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <span style={label}>WITH NAME & ROLE</span>
        <div style={row}>
          <Avatar name="김안전" size="sm" role="관리자" showNameGroup />
          <Avatar name="박지훈" size="sm" role="책임" showNameGroup />
        </div>
      </div>
    </div>
  ),
};
