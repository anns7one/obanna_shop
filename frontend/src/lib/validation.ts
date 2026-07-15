import { z } from "zod";
import { isValidCardNumber } from "@/lib/card";

const namePattern = /^[\p{L}\s'-]+$/u;
const unsafeCharsPattern = /[<>{}`;=\\]/;
const phonePattern = /^[0-9+()\-\s]{6,30}$/;

/** Letters (any language/script), spaces, hyphens and apostrophes only —
 * covers real names worldwide while rejecting digits and symbols. Mirrors
 * backend/app/validators.py::validate_name_characters. */
function nameField(label: string) {
  return z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .regex(namePattern, "Only letters, spaces, hyphens and apostrophes are allowed.");
}

/** Free-form fields (address, city, comments, ...) legitimately contain
 * almost any character, so this only blocks a small set of symbols with no
 * normal use in this kind of text, rather than restricting to an allowlist.
 * Mirrors backend/app/validators.py::validate_safe_text. */
function safeTextField(label: string) {
  return z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .refine((value) => !unsafeCharsPattern.test(value), "This field contains characters that aren't allowed.");
}

/** Not tied to any one country's dialing pattern — just a plausible
 * international shape (digits plus common separators). Mirrors
 * backend/app/validators.py::validate_phone_format. */
const phoneField = z.string().trim().regex(phonePattern, "Enter a valid phone number.");

const passwordPolicy = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .regex(/[A-Z]/, "Include at least one uppercase letter.")
  .regex(/[0-9]/, "Include at least one number.");

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
  rememberMe: z.boolean().optional(),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    firstName: nameField("First name"),
    lastName: nameField("Last name"),
    email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address."),
    phone: phoneField,
    password: passwordPolicy,
    confirmPassword: z.string().min(1, "Please confirm your password."),
    consent: z.boolean().refine((value) => value === true, "You must agree to the data processing policy."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
export type RegisterValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address."),
});
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address."),
    password: passwordPolicy,
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: passwordPolicy,
    confirmNewPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match.",
    path: ["confirmNewPassword"],
  });
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export const shippingSchema = z.object({
  fullName: nameField("Full name"),
  address: safeTextField("Address"),
  city: safeTextField("City"),
  postalCode: safeTextField("Postal code"),
  country: safeTextField("Country"),
  phone: phoneField,
});
export type ShippingValues = z.infer<typeof shippingSchema>;

/** The spec's actual "Оформление заказа" contact form — delivery address
 * and payment method are chosen separately (from saved Address Book /
 * Payment Methods entries), not typed here. */
export const checkoutContactSchema = z.object({
  fullName: nameField("Full name"),
  phone: phoneField,
  email: z.string().trim().email("Enter a valid email address.").optional().or(z.literal("")),
  comment: z.string().trim().max(1000, "Keep the comment under 1000 characters.").optional(),
  consent: z.boolean().refine((value) => value === true, "You must agree to the data processing policy."),
});
export type CheckoutContactValues = z.infer<typeof checkoutContactSchema>;

export const addressFormSchema = shippingSchema.extend({
  label: z.string().trim().min(1, "Give this address a label, like Home or Work."),
  isDefault: z.boolean(),
});
export type AddressFormValues = z.infer<typeof addressFormSchema>;

export const profileSchema = z.object({
  firstName: nameField("First name"),
  lastName: nameField("Last name"),
  phone: phoneField,
});
export type ProfileValues = z.infer<typeof profileSchema>;

/** Card number and CVC live only in this form's local state — see
 * components/account/PaymentMethodForm.tsx, which derives brand/last4 from
 * `cardNumber` and never includes cardNumber or cvc in the API request. */
export const cardFormSchema = z.object({
  cardName: z.string().trim().min(1, "Name on card is required."),
  cardNumber: z
    .string()
    .trim()
    .regex(/^[0-9\s]{12,23}$/, "Enter a valid card number.")
    .refine(isValidCardNumber, "That card number doesn't look right."),
  expiry: z
    .string()
    .trim()
    .regex(/^(0[1-9]|1[0-2])\/[0-9]{2}$/, "Use MM/YY format.")
    .refine((value) => {
      const [month, year] = value.split("/").map(Number);
      const expiry = new Date(2000 + year, month);
      return expiry > new Date();
    }, "This card has expired."),
  cvc: z.string().trim().regex(/^[0-9]{3,4}$/, "Enter a valid CVC."),
});
export type CardFormValues = z.infer<typeof cardFormSchema>;
