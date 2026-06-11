import { useState } from 'react';

import Dropdown from '@components/dropdown';
import type { DropdownOption } from '@components/dropdown';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared/Dropdown',
  component: Dropdown,
  parameters: { layout: 'centered' },
  args: {
    options: [
      { label: '오늘', value: 'today' },
      { label: '최근 7일', value: '7d' },
      { label: '최근 30일', value: '30d' },
      { label: '이번 분기', value: 'quarter' },
      { label: '사용자 지정...', value: 'custom' },
    ],
    value: '7d',
    onChange: () => {},
    placeholder: '선택',
    disabled: false,
  },
  argTypes: {
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {},
  render: (args) => {
    const [value, setValue] = useState(args.value);
    return <Dropdown {...args} value={value} onChange={(v) => setValue(v as typeof value)} />;
  },
};

const periodOptions: DropdownOption[] = [
  { label: '오늘', value: 'today' },
  { label: '최근 7일', value: '7d' },
  { label: '최근 30일', value: '30d' },
  { label: '이번 분기', value: 'quarter' },
  { label: '사용자 지정...', value: 'custom' },
];

const sortOptions: DropdownOption[] = [
  { label: '최신순', value: 'newest' },
  { label: '오래된순', value: 'oldest' },
  { label: '이름순', value: 'name' },
];

const ReferenceCase = ({
  label,
  options,
  defaultValue,
  disabled,
}: {
  label: string;
  options: DropdownOption[];
  defaultValue: string;
  disabled?: boolean;
}) => {
  const [value, setValue] = useState(defaultValue);
  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      <span style={{ fontSize: '14px', color: '#4A5563' }}>{label}</span>
      <Dropdown options={options} value={value} onChange={setValue} disabled={disabled} />
    </div>
  );
};

export const ReferenceSet: Story = {
  args: {},
  render: () => (
    <div
      style={{
        width: '640px',
        padding: '48px',
        borderRadius: '32px',
        backgroundColor: '#FFFFFF',
        display: 'grid',
        gap: '48px',
      }}
    >
      <ReferenceCase label="기간 선택 (기본)" options={periodOptions} defaultValue="7d" />
      <ReferenceCase label="정렬 선택" options={sortOptions} defaultValue="newest" />
      <ReferenceCase label="비활성화" options={periodOptions} defaultValue="7d" disabled />
    </div>
  ),
};
