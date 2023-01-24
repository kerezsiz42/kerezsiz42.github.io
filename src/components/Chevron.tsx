type ChecvronProps = {
  toggle: () => void;
  enabled: boolean;
};

export const Chevron = ({ toggle, enabled }: ChecvronProps) => {
  return (
    <button
      title="Show profile data"
      type="button"
      className="focus:outline-none p-2"
      onClick={toggle}
    >
      <i
        className={`text-3xl fa-solid ${
          enabled ? "fa-chevron-up" : "fa-chevron-down"
        }`}
      ></i>
    </button>
  );
};
