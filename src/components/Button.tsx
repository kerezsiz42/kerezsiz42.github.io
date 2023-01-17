import { ComponentChildren } from "preact";

type ButtonProps = {
  onClick: () => void | Promise<void>;
  children: ComponentChildren;
};

export const Button = ({ onClick, children }: ButtonProps) => {
  return (
    <button
      type="button"
      className="font-bold border rounded border-white p-1 m-2"
      onClick={onClick}
    >
      {children}
    </button>
  );
};
