const ATX_H1 = /^#[ \t]+(.+?)(?:[ \t]+#+)?[ \t]*$/;

function normalizeTitle(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[\s.,;:!?…]+$/u, "")
    .trim();
}

export function stripLeadingTitle(markdown: string, title: string): string {
  const lines = markdown.split(/\r?\n/);
  const firstIndex = lines.findIndex((line) => line.trim() !== "");
  if (firstIndex === -1) return markdown;

  const match = ATX_H1.exec(lines[firstIndex]);
  if (!match || normalizeTitle(match[1]) !== normalizeTitle(title)) return markdown;

  let next = firstIndex + 1;
  while (next < lines.length && lines[next].trim() === "") next++;
  return lines.slice(next).join("\n");
}
