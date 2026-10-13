import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "사진 출처" };

// public/images/products/CREDITS.md 의 표를 읽어서 보여줌
async function loadCredits() {
  const md = await readFile(path.join(process.cwd(), "public/images/products/CREDITS.md"), "utf8");
  return md
    .split("\n")
    .filter((line) => line.startsWith("| ") && !line.startsWith("| File") && !line.startsWith("|---"))
    .map((line) => {
      const [file, source, author, license] = line.split("|").slice(1, -1).map((c) => c.trim());
      const link = source.match(/\[(.+?)\]\((.+?)\)/);
      const lic = license.match(/^(.+?)\s*\((.+?)\)$/);
      return {
        file,
        title: link?.[1] ?? source,
        url: link?.[2],
        author,
        license: lic?.[1] ?? license,
        licenseUrl: lic?.[2],
      };
    });
}

export default async function CreditsPage() {
  const credits = await loadCredits();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold">사진 출처</h1>
      <p className="mt-2 text-sm text-muted">
        상품 사진은 Wikimedia Commons의 자유 라이선스 사진을 크기만 줄여 사용했습니다.
      </p>
      <div className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[600px] text-sm">
          <thead className="border-b border-line bg-brand-soft text-left">
            <tr>
              <th className="px-3 py-2">파일</th>
              <th className="px-3 py-2">원본</th>
              <th className="px-3 py-2">저작자</th>
              <th className="px-3 py-2">라이선스</th>
            </tr>
          </thead>
          <tbody>
            {credits.map((c) => (
              <tr key={c.file} className="border-b border-line last:border-0">
                <td className="px-3 py-2">{c.file}</td>
                <td className="px-3 py-2">
                  {c.url ? (
                    <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-brand underline">
                      {c.title}
                    </a>
                  ) : (
                    c.title
                  )}
                </td>
                <td className="px-3 py-2">{c.author}</td>
                <td className="px-3 py-2">
                  {c.licenseUrl ? (
                    <a href={c.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline">
                      {c.license}
                    </a>
                  ) : (
                    c.license
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
