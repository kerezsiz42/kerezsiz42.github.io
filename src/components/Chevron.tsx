import { signal } from "@preact/signals";

export const profileViewEnabled = signal(false);

export const Chevron = () => {
  return (
    <button
      title="Show profile data"
      type="button"
      className="focus:outline-none p-2"
      onClick={() => (profileViewEnabled.value = !profileViewEnabled.value)}
    >
      <i
        className={`text-3xl fa-solid ${
          profileViewEnabled.value ? "fa-chevron-up" : "fa-chevron-down"
        }`}
      ></i>
    </button>
  );
};
