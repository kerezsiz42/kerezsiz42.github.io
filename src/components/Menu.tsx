import { identity } from "../signals";
import { Avatar } from "./Avatar";
import { Button } from "./Button";

type ProfileDropdownProps = {
  enabled: boolean;
  onEdit: () => void;
  onSignOut: () => void;
  onSave: () => void;
};

export const Menu = ({
  enabled,
  onEdit,
  onSave,
  onSignOut,
}: ProfileDropdownProps) => {
  return (
    <div className={`text-white p-2 w-full ${enabled ? "" : "hidden"}`}>
      <div className="flex justify-evenly items-center p-2">
        <div>
          <Avatar alt={identity.value?.displayName || ""} />
        </div>
        <span>Username: {identity.value?.displayName}</span>
      </div>
      <div className="flex flex-col justify-evenly py-3">
        <Button onClick={onEdit}>
          Edit <i className="fa-regular fa-pen-to-square"></i>
        </Button>
        <Button
          onClick={() => {
            if (Notification.permission === "default") {
              Notification.requestPermission();
            }
          }}
        >
          Enable notifications
        </Button>
        <Button onClick={onSignOut}>
          Sign out <i className="fa-solid fa-right-from-bracket"></i>
        </Button>
        <Button onClick={onSave}>
          Save identity <i className="fa-solid fa-download"></i>
        </Button>
      </div>
    </div>
  );
};
