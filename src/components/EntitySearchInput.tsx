export {};
/*
import { z } from "zod";
import { useCallback, useEffect, useState } from "preact/hooks";
import { useSignal } from "@preact/signals";

type EntitySearchInputProps = {};

export const EntitySearchInput = (props: EntitySearchInputProps) => {
  const [value, setValue] = useState("");
  const usersLoading = useSignal<boolean>(false);

  const onFetchUsers = useCallback(async () => {
    const res = await fetch(`/chats/users?search=${value.trim()}&limit=10`);
    const data = await res.json();
    const parseResult = z.array(userSchema).safeParse(data);
    if (!parseResult.success) {
      return;
    }
    usersLoading.value = false;
  }, [value]);

  useEffect(() => {
    if (value === "") {
      usersLoading.value = false;
      users.value = props.previousChats;
      return;
    }
    usersLoading.value = true;
    const timer = setTimeout(onFetchUsers, 500);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div class="flex items-stretch mb-5 bg-black border border-white rounded-2xl  px-3 py-1 w-full">
      <input
        class="outline-none bg-black w-full"
        type="text"
        placeholder="Find people..."
        value={value}
        onInput={({ target }) =>
          target instanceof HTMLInputElement && setValue(target.value)
        }
      ></input>
      {usersLoading.value ? (
        <div class="text-white flex-1 flex justify-center items-center">
          <i className="fa-solid fa-circle-notch loading text-xl"></i>
        </div>
      ) : null}
    </div>
  );
};*/
