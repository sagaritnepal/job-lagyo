export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function uniqueSlug(text: string): string {
  const base = slugify(text);
  const suffix = crypto.randomUUID().slice(0, 6);
  return `${base}-${suffix}`;
}
