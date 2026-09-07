import { z } from "zod";

const tldRegex = /\.[a-z]{2,}$/i;
const websiteSchema = z
  .string()
  .trim()
  .refine((val) => tldRegex.test(val) || val.includes('localhost'), {
    message: "Website must include a valid top-level domain extension (e.g., .com, .co)",
  })
  .transform((val) => {
    if (val.length > 0 && !/^https?:\/\//i.test(val)) {
      return `https://${val}`;
    }
    return val;
  })
  .pipe(
    z.string().url({ message: "Invalid website format" })
  );

export const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  businessName: z.string().min(1, "Business name is required"),
  website: websiteSchema,
  mobileNumber: z.string().optional(),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

export const CONTACT_INITIAL_VALUES: ContactFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  businessName: "",
  website: "",
  mobileNumber: "",
};
