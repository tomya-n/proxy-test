import { NextRequest, NextResponse } from "next/server";
import { JSDOM } from "jsdom";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function GET(req: NextRequest, res: NextResponse) {
  const searchParams = await req.nextUrl.searchParams;
  const queryUrl = await searchParams.get("url");

  const queryUrlResponse = await fetch(queryUrl);
  const body = await queryUrlResponse.text();
  const dom = new JSDOM(body);
  const document = dom.window.document;
  const metaData = [];

  const metaElements = document.querySelectorAll("meta");
  metaElements.forEach((meta) => {
    const name = meta.getAttribute("name") || meta.getAttribute("property");
    const content = meta.getAttribute("content");
    if (name && content) {
      metaData.push({ name, content });
    }
  });

  const filteredMetaData = metaData.reduce((acc, item) => {
    const isOG = item.name.startsWith("og:");
    const baseName = isOG ? item.name.slice(3) : item.name;
    const baseExists = acc.some((el) => el.name === baseName);
    const ogExists = acc.some((el) => el.name === `og:${baseName}`);

    if (!isOG && !ogExists) {
      acc.push(item);
    } else if (isOG && !baseExists) {
      acc.push(item);
    }

    return acc;
  }, []);

  const filterMetaData = filteredMetaData
    .filter((item) => item.name === "title" || item.name === "og:title" || item.name === "url" || item.name === "og:url" || item.name === "description" || item.name === "og:description")
    .sort((a, b) => {
      const aIsOG = a.name.startsWith("og:");
      const bIsOG = b.name.startsWith("og:");
      return aIsOG === bIsOG ? 0 : aIsOG ? -1 : 1;
    });
  console.log(filterMetaData);

  return NextResponse.json({ filterMetaData }, { headers: corsHeaders });
}
