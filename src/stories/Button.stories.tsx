import ArrowRightIcon from '@assets/icons/ic-arrow-right.svg?react';
import DownloadIcon from '@assets/icons/ic-download.svg?react';
import EditIcon from '@assets/icons/ic-edit.svg?react';
import PlusIcon from '@assets/icons/ic-plus.svg?react';
import TrashIcon from '@assets/icons/ic-trash.svg?react';

import { Button } from '@components/Button';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Button> = {
  title: 'Shared/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '5 variants × 3 sizes · 기본 라디우스 8px\n\n피그마 디자인 시스템 참조.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'outlined', 'danger', 'dangerOutlined', 'ghost'],
      description: '버튼 스타일 변형',
      table: { defaultValue: { summary: 'primary' } },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'sm=32px / md=40px / lg=48px',
      table: { defaultValue: { summary: 'md' } },
    },
    isLoading: {
      control: 'boolean',
      description: '로딩 spinner 표시 및 클릭 비활성화',
    },
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean', description: '부모 너비 100%' },
    iconOnly: { control: 'boolean', description: '아이콘 전용 정사각형 버튼' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Variant: Story = {
  args: { variant: 'primary', size: 'md', children: '버튼' },
};

export const Loading: Story = {
  args: { variant: 'primary', size: 'md', children: '저장 중', isLoading: true },
};

export const FullWidth: Story = {
  args: { variant: 'primary', size: 'md', children: '로그인', fullWidth: true },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
};

export const AllVariants: Story = {
  name: '● All Variants',
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <Button variant="primary">기본 액션</Button>
      <Button variant="outlined">보조 액션</Button>
      <Button variant="danger">삭제</Button>
      <Button variant="dangerOutlined">삭제</Button>
      <Button variant="ghost">취소</Button>
      <Button variant="primary" disabled>
        Disabled
      </Button>
    </div>
  ),
};

export const AllSizes: Story = {
  name: '● All Sizes',
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button variant="primary" size="sm">
        소형
      </Button>
      <Button variant="primary" size="md">
        중형
      </Button>
      <Button variant="primary" size="lg">
        대형
      </Button>
    </div>
  ),
};

export const WithIcons: Story = {
  name: '● With Icons',
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <Button variant="primary" leftIcon={<PlusIcon />}>
        건물 추가
      </Button>
      <Button variant="outlined" rightIcon={<ArrowRightIcon />}>
        전체 보기
      </Button>
      <Button variant="ghost" leftIcon={<DownloadIcon />}>
        PDF 다운로드
      </Button>
      <Button variant="ghost" iconOnly aria-label="편집">
        <EditIcon />
      </Button>
      <Button variant="dangerOutlined" iconOnly aria-label="삭제">
        <TrashIcon />
      </Button>
    </div>
  ),
};
