import { ComplaintCategory, Priority } from "@prisma/client";

type Rule = {
  keywords: string[];
  category: ComplaintCategory;
  priority: Priority;
};

const rules: Rule[] = [
  { keywords: ["leak", "pipe", "water", "tap", "bathroom", "drain"], category: "PLUMBING", priority: "HIGH" },
  { keywords: ["spark", "power", "wire", "light", "electric", "short"], category: "ELECTRICAL", priority: "URGENT" },
  { keywords: ["guard", "theft", "visitor", "gate", "camera"], category: "SECURITY", priority: "HIGH" },
  { keywords: ["garbage", "trash", "smell", "clean", "sweep"], category: "CLEANING", priority: "MEDIUM" },
  { keywords: ["parking", "vehicle", "car", "bike"], category: "PARKING", priority: "MEDIUM" },
  { keywords: ["lift", "elevator", "stuck"], category: "ELEVATOR", priority: "URGENT" },
  { keywords: ["gym", "pool", "clubhouse", "garden"], category: "AMENITIES", priority: "LOW" },
];

export function suggestComplaint(input: string): { category: ComplaintCategory; priority: Priority } {
  const normalized = input.toLowerCase();
  const match = rules.find((rule) => rule.keywords.some((keyword) => normalized.includes(keyword)));

  return {
    category: match?.category ?? "OTHER",
    priority: match?.priority ?? "MEDIUM",
  };
}

export function similarityScore(a: string, b: string) {
  const aWords = new Set(a.toLowerCase().split(/\W+/).filter(Boolean));
  const bWords = new Set(b.toLowerCase().split(/\W+/).filter(Boolean));
  const intersection = [...aWords].filter((word) => bWords.has(word)).length;
  const union = new Set([...aWords, ...bWords]).size || 1;

  return intersection / union;
}
