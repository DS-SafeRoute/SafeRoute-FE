import TextField from '@components/inputField/TextField';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared/TextField',
  component: TextField,
  parameters: {
    layout: 'padded',
  },
  args: {
    label: '기본 상태',
    placeholder: '이메일을 입력하세요',
  },
} satisfies Meta<typeof TextField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const ReferenceSet: Story = {
  render: () => (
    <div
      style={{
        maxWidth: '1200px',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: '24px',
      }}
    >
      <TextField label="기본 상태" placeholder="이메일을 입력하세요" />
      <TextField
        label="에러 상태"
        defaultValue="잘못된 형식"
        errorMessage="이메일 형식을 확인해주세요"
      />
      <TextField label="비활성 상태" value="수정 불가" disabled readOnly />
      <TextField label="비밀번호" type="password" defaultValue="12345678" />
    </div>
  ),
};
