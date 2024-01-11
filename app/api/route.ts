import { NextRequest, NextResponse } from "next/server";
import { JSDOM } from "jsdom";

export async function GET(req: NextRequest, res: NextResponse) {
  const searchParams = await req.nextUrl.searchParams;
  const queryUrl = await searchParams.get("url");

  const queryUrlResponse = await fetch(queryUrl);
  const body = await queryUrlResponse.text();
  //   const metadata = extractMetadata(body);
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
    // 'og:' が付いているかどうかをチェック
    const isOG = item.name.startsWith("og:");
    // 'og:' を取り除いた名前
    const baseName = isOG ? item.name.slice(3) : item.name;

    // 既に基本名が存在するかどうかをチェック
    const baseExists = acc.some((el) => el.name === baseName);
    // 'og:' 付きバージョンが存在するかどうかをチェック
    const ogExists = acc.some((el) => el.name === `og:${baseName}`);

    if (!isOG && !ogExists) {
      // 'og:' が付いていないバージョンで、'og:' 付きバージョンが存在しない場合
      acc.push(item);
    } else if (isOG && !baseExists) {
      // 'og:' が付いているバージョンで、基本バージョンが存在しない場合
      acc.push(item);
    }
    // それ以外の場合（どちらのバージョンも存在するか、'og:' が付いていないバージョンが既に存在する場合）は何もしない

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

  return NextResponse.json({ filterMetaData });
}

// function extractMetadata(html) {
//     // HTMLからメタデータを抽出するロジック
//     // 例: 正規表現を使用して<meta>タグを探す
//     return {/* 抽出したメタデータ */};
// }

// https://example.com/api/fetch-metadata?url=https%3A%2F%2Fwww.yahoo.co.jp%2F

// http://localhost:3000/api/?url=https%3A%2F%2Fwww.yahoo.co.jp%2F
