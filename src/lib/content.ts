import fs from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";
import { z } from "zod";

const DaySchema = z.object({
  date: z.string(),
  focus: z.string(),
  warmup: z.string(),
  featuredDomain: z.string().optional(),
  featured: z.object({
    title: z.string(),
    href: z.string(),
  }),
  tags: z.array(z.string()).optional(),
});

export type DayEntry = z.infer<typeof DaySchema>;

const contentDir = path.join(process.cwd(), "content", "days");

const parseDayFile = async (filename: string) => {
  try {
    const filePath = path.join(contentDir, filename);
    const raw = await fs.readFile(filePath, "utf8");
    const { data } = matter(raw);
    const parsed = DaySchema.safeParse(data);

    if (!parsed.success) {
      console.error(
        `[content] Invalid frontmatter in ${filename}:`,
        parsed.error.flatten().fieldErrors
      );
      return null;
    }

    return parsed.data;
  } catch (error) {
    console.error(`[content] Failed to read ${filename}:`, error);
    return null;
  }
};

export const loadDayEntries = async () => {
  try {
    const files = await fs.readdir(contentDir);
    const markdownFiles = files.filter((file) => file.endsWith(".md"));
    const entries = await Promise.all(markdownFiles.map(parseDayFile));

    const validEntries = entries.filter(
      (entry): entry is DayEntry => Boolean(entry)
    );

    const sorted = validEntries.sort((a, b) => {
      const aTime = Date.parse(a.date);
      const bTime = Date.parse(b.date);
      return bTime - aTime;
    });

    return {
      latest: sorted[0] ?? null,
      recent: sorted.slice(1, 4),
    };
  } catch (error) {
    console.error("[content] Failed to load day entries:", error);
    return {
      latest: null,
      recent: [],
    };
  }
};
