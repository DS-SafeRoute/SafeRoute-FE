import * as styles from './RequiredFieldText.css';

interface RequiredFieldTextProps {
  label: string;
}

// 라벨 문자열이 " *"로 끝나면 별표만 분리해 danger 색으로 렌더링. 필수 필드 표시는 항상 이 컴포넌트를 통해서만 할 것
// (TextField/FloorStepperField/CameraFormModal에서 각자 따로 구현했다가 새 필드에서 계속 빠뜨리는 문제가 있었음)
const RequiredFieldText = ({ label }: RequiredFieldTextProps) => {
  if (!label.includes(' *')) return <>{label}</>;

  return (
    <>
      {label.replace(' *', '')}
      <span className={styles.requiredMark} aria-hidden="true">
        {' '}
        *
      </span>
    </>
  );
};

export default RequiredFieldText;
