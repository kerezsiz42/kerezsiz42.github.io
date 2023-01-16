import { Layout } from "../components/Layout";
import { selectedConversation } from "../stores/EntityStoreSignals";

export const Chat = () => (
  <Layout>
    <div className="flex items-center justify-between px-3 py-5 border-b border-gray-500 w-full">
      <div className="flex items-center">
        {/* <Image
        style="width: 3rem; border-radius: 50%"
        alt="user name"
        src="https://ui-avatars.com/api/?format=svg&name=User+name&background=random&bold=true"
        fallbackSrc="/"
      /> */}
        <h1 className="pl-4 font-bold">
          {selectedConversation.value?.displayName || "Loading..."}
        </h1>
      </div>
      <a href="/authenticated/conversations">
        <i className="fa-solid fa-chevron-right text-xl"></i>
      </a>
    </div>
    <div className="flex-1"></div>
    <div className="border-gray-500 flex items-center border-t py-4 px-2 w-full">
      <input
        className="bg-black border border-white focus:outline-none w-full px-3 py-2 rounded-[2rem]"
        type="text"
        placeholder="Type your message..."
      ></input>
      <i className="fa-solid fa-paper-plane py-2 text-2xl pr-3 pl-6"></i>
    </div>
  </Layout>
);
