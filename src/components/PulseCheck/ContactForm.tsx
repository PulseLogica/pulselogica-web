"use client";

import { useFormik } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { contactSchema, CONTACT_INITIAL_VALUES, type ContactFormValues } from "./schema";

function Field({
  label,
  name,
  type = "text",
  optional,
  formik,
}: {
  label: string;
  name: keyof ContactFormValues;
  type?: string;
  optional?: boolean;
  formik: ReturnType<typeof useFormik<ContactFormValues>>;
}) {
  const error = formik.touched[name] && formik.errors[name];

  return (
    <div>
      <label htmlFor={name} className="annot mb-2 block" style={{ color: "var(--color-slate)" }}>
        {label}
        {optional && <span className="normal-case tracking-normal"> (optional)</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={formik.values[name]}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        className="w-full bg-white/[0.02] border rounded-[10px] px-[16px] py-[12px] text-[15px] text-cream outline-none transition"
        style={{ borderColor: error ? "#ef4444" : "rgba(148,163,184,0.25)" }}
      />
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
}

export default function ContactForm({
  onSubmit,
}: {
  onSubmit: (values: ContactFormValues) => void;
}) {
  const formik = useFormik<ContactFormValues>({
    initialValues: CONTACT_INITIAL_VALUES,
    validationSchema: toFormikValidationSchema(contactSchema),
    onSubmit: (values) => onSubmit(values),
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="annot mb-3.5" style={{ color: "var(--color-amber)" }}>
        Almost there
      </div>
      <div className="text-[22px] leading-[1.45] font-medium text-cream mb-7">
        Where should we send your results?
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="First Name" name="firstName" formik={formik} />
          <Field label="Last Name" name="lastName" formik={formik} />
        </div>
        <Field label="Email" name="email" type="email" formik={formik} />
        <Field label="Business Name" name="businessName" formik={formik} />
        <Field label="Website" name="website" optional formik={formik} />
        <Field label="Mobile Number" name="mobileNumber" optional formik={formik} />
      </div>

      <button
        type="submit"
        disabled={formik.isSubmitting}
        className="btn-primary block w-full text-black font-bold text-[15px] py-3.5 rounded-lg mt-7"
      >
        See My Results
      </button>
    </form>
  );
}
