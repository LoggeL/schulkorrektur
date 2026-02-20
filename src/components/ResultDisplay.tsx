"use client";

export default function ResultDisplay({ result }: { result: string }) {
  const sections = parseSections(result);

  return (
    <div className="space-y-4">
      {sections.map((section, i) => (
        <div
          key={i}
          className={`rounded-lg border p-5 ${section.style}`}
        >
          <h3 className="font-semibold text-lg mb-2">
            {section.icon} {section.title}
          </h3>
          <div
            className="prose prose-sm max-w-none whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: formatContent(section.content) }}
          />
        </div>
      ))}

      {sections.length === 0 && (
        <div className="bg-white rounded-lg border p-5">
          <div
            className="prose prose-sm max-w-none whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: formatContent(result) }}
          />
        </div>
      )}
    </div>
  );
}

interface Section {
  icon: string;
  title: string;
  content: string;
  style: string;
}

function parseSections(text: string): Section[] {
  const sections: Section[] = [];

  const patterns: {
    pattern: RegExp;
    icon: string;
    title: string;
    style: string;
  }[] = [
    {
      pattern: /\*\*Was gut gelungen ist[:\s]*\*\*/i,
      icon: "✅",
      title: "Was gut gelungen ist",
      style: "bg-green-50 border-green-200",
    },
    {
      pattern: /\*\*Fehler[:\s]*\*\*/i,
      icon: "❌",
      title: "Fehler",
      style: "bg-red-50 border-red-200",
    },
    {
      pattern: /\*\*Verbesserungsvorschläge[:\s]*\*\*/i,
      icon: "💡",
      title: "Verbesserungsvorschläge",
      style: "bg-yellow-50 border-yellow-200",
    },
    {
      pattern: /\*\*Notenvorschlag[:\s]*\*\*/i,
      icon: "📊",
      title: "Notenvorschlag",
      style: "bg-blue-50 border-blue-200",
    },
  ];

  const indices: { index: number; patternIdx: number }[] = [];
  for (let pi = 0; pi < patterns.length; pi++) {
    const match = patterns[pi].pattern.exec(text);
    if (match) {
      indices.push({ index: match.index, patternIdx: pi });
    }
  }
  indices.sort((a, b) => a.index - b.index);

  for (let i = 0; i < indices.length; i++) {
    const { patternIdx } = indices[i];
    const p = patterns[patternIdx];
    const match = p.pattern.exec(text)!;
    const start = match.index + match[0].length;
    const end = i + 1 < indices.length ? indices[i + 1].index : text.length;
    const content = text.slice(start, end).trim();
    sections.push({
      icon: p.icon,
      title: p.title,
      content,
      style: p.style,
    });
  }

  return sections;
}

function formatContent(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/^[-•]\s/gm, "• ")
    .replace(/\n/g, "<br>");
}
