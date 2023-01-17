import { Layout } from "../components/Layout";

export const Loading = () => {
  return (
    <Layout>
      <div className="text-white flex-1 flex justify-center items-center">
        <i className="fa-solid fa-circle-notch loading text-5xl"></i>
      </div>
    </Layout>
  );
};
