import { z } from "zod";
export const MAX_FILES = 3;
export const MAX_FILE_BYTES = 2 * 1024 * 1024;
export const MAX_TOTAL_FILE_BYTES = 5 * 1024 * 1024;
export const MAX_BODY_BYTES = 6 * 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const WORK_TYPES = [
  "Mosaic surfboard",
  "Mosaic artwork",
  "Coastal artwork",
  "Something else",
] as const;
export const BUDGETS = [
  "Under $500",
  "$500–$1,000",
  "$1,000–$2,000",
  "$2,000+",
  "I’d like to discuss",
] as const;
const text = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .refine(
      (s) => !/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(s),
      "Please remove special control characters.",
    );
export const inquirySchema = z.object({
  name: text(100)
    .pipe(z.string().min(2, "Please enter your name."))
    .refine((s) => !/[\r\n]/.test(s), "Please use a single line."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254)
    .pipe(z.email("Please enter a valid email address.")),
  workType: z.enum(WORK_TYPES, { error: "Please choose a type of work." }),
  idea: text(4000).pipe(
    z
      .string()
      .min(
        20,
        "Please share a little more about your idea (at least 20 characters).",
      ),
  ),
  colors: text(200).default(""),
  size: text(200).default(""),
  budget: z.union([z.enum(BUDGETS), z.literal("")]).default(""),
});
export type Inquiry = z.infer<typeof inquirySchema>;
export type InquiryErrors = Partial<
  Record<keyof Inquiry | "images" | "verification", string>
>;
export function validateFiles(files: File[]): string | undefined {
  if (files.length > MAX_FILES) return "Please choose no more than 3 images.";
  if (files.some((f) => !IMAGE_TYPES.includes(f.type)))
    return "Please use JPEG, PNG, or WebP images.";
  if (files.some((f) => f.size === 0 || f.size > MAX_FILE_BYTES))
    return "Each image must be between 1 byte and 2 MB.";
  if (
    files.reduce((total, file) => total + file.size, 0) > MAX_TOTAL_FILE_BYTES
  )
    return "Please keep the combined image size under 5 MB.";
}
export function fieldErrors(error: z.ZodError): InquiryErrors {
  const result: InquiryErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof Inquiry;
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}
export async function hasValidImageSignature(file: File): Promise<boolean> {
  const b = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (b.length < 12) return false;
  if (file.type === "image/jpeg")
    return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  if (file.type === "image/png")
    return [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => b[i] === v);
  if (file.type === "image/webp")
    return (
      String.fromCharCode(...b.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...b.slice(8, 12)) === "WEBP"
    );
  return false;
}
