interface Props {
  title: string;
  description: string;
}

export const ToastContent = ({ title, description }: Props) => (
  <>
    <p>
      <strong>{title}</strong>
    </p>
    <p>{description}</p>
  </>
);
