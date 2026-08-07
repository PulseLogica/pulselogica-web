import { z } from "zod";

export const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  businessName: z.string().min(1, "Business name is required"),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
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
