import { ReactElement } from "react";
import Layout from "../components/layout";
import type { NextPageWithLayout } from "./_app";

const Home: NextPageWithLayout = () => {
  return <p>hello world</p>;
};

Home.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default Home;
