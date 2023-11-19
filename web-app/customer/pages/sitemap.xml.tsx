import { components } from "../schemas/api-types";
import { getAllPractices } from "./api/practice/all";

type PracticeType = components["schemas"]["Practice"];

const EXTERNAL_DATA_URL = `${process.env.AUTH0_BASE_URL}practice`;

function generateSiteMap(practices: PracticeType[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     ${practices
       .map(({ slug }) => {
         return `
       <url>
           <loc>${`${EXTERNAL_DATA_URL}/${slug}`}</loc>
       </url>
     `;
       })
       .join("")}
   </urlset>
 `;
}

function SiteMap() {}

export async function getServerSideProps({ res }: { res: any }) {
  let practices: PracticeType[] = [];
  const { data } = await getAllPractices("page_size=10000");
  practices = data.results;
  const sitemap = generateSiteMap(practices);
  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default SiteMap;
