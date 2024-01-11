import Image from "next/image";

export default async function Home() {
  const res = await fetch("http://localhost:3000/api", {
    cache: "no-cache",
  });
  return (
    <>
      <div className="width-frame">
        <h1>テスト環境</h1>

        <p>api route test</p>
      </div>
    </>
  );
}
