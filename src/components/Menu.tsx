import { useLocation } from "wouter-preact";
import { IDENTITY_STORAGE_NAME } from "../functions";
import { identity } from "../stores/IdentityStoreSignals";
import { Avatar } from "./Avatar";
import { Button } from "./Button";
import { profileViewEnabled } from "./Chevron";

type ProfileDropdownProps = {};

export const Menu = (props: ProfileDropdownProps) => {
  const [_, setLocation] = useLocation();

  return (
    <div
      className={`text-white p-2 w-full ${
        profileViewEnabled.value ? "" : "hidden"
      }`}
    >
      <div className="flex justify-evenly items-center p-2">
        <div>
          <Avatar alt={identity.value?.displayName || ""} />
        </div>
        <span>Username: {identity.value?.displayName}</span>
      </div>
      <div className="flex flex-col justify-evenly py-3">
        <Button onClick={() => console.log("edit")}>
          Edit <i className="fa-regular fa-pen-to-square"></i>
        </Button>
        <Button
          onClick={() => {
            localStorage.removeItem(IDENTITY_STORAGE_NAME);
            identity.value = undefined;
            setLocation("/");
          }}
        >
          Sign out <i className="fa-solid fa-right-from-bracket"></i>
        </Button>
        <Button
          onClick={() => {
            const a = document.createElement("a");
            a.setAttribute(
              "href",
              `data:text/plain;charset=utf-8,${encodeURIComponent(
                localStorage.getItem(IDENTITY_STORAGE_NAME) || ""
              )}`
            );
            a.setAttribute("download", `${crypto.randomUUID()}.json`);
            a.click();
          }}
        >
          Save identity
        </Button>
      </div>
    </div>
  );
};
