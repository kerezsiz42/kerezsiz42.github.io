import { FunctionComponent } from "preact";

export const Layout: FunctionComponent = (props) => {
  return (
    <div className="w-full h-screen bg-black flex justify-center text-white">
      <div className="max-w-md flex flex-col justify-center items-center flex-1">
        {props.children}
      </div>
    </div>
  );
};
