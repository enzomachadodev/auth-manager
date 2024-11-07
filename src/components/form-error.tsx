import { RxExclamationTriangle } from "react-icons/rx";

interface FormErrorProps {
  message?: string;
}

export const FormError = ({ message }: FormErrorProps) => {
  if (!message) return null;

  return (
    <div className="flex items-center gap-x-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
      <RxExclamationTriangle />
      <p>{message}</p>
    </div>
  );
};
