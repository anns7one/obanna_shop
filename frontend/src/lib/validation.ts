import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required."),
    lastName: z.string().trim().min(1, "Last name is required."),
    email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[A-Z]/, "Include at least one uppercase letter.")
      .regex(/[0-9]/, "Include at least one number."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
export type RegisterValues = z.infer<typeof registerSchema>;

export const shippingSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required."),
  address: z.string().trim().min(1, "Address is required."),
  city: z.string().trim().min(1, "City is required."),
  postalCode: z.string().trim().min(1, "Postal code is required."),
  country: z.string().trim().min(1, "Country is required."),
  phone: z
    .string()
    .trim()
    .min(6, "Enter a valid phone number.")
    .regex(/^[0-9+()\-\s]+$/, "Enter a valid phone number."),
});
export type ShippingValues = z.infer<typeof shippingSchema>;

export const paymentSchema = z.object({
  cardName: z.string().trim().min(1, "Name on card is required."),
  cardNumber: z
    .string()
    .trim()
    .regex(/^[0-9\s]{12,19}$/, "Enter a valid card number."),
  expiry: z
    .string()
    .trim()
    .regex(/^(0[1-9]|1[0-2])\/[0-9]{2}$/, "Use MM/YY format."),
  cvc: z.string().trim().regex(/^[0-9]{3,4}$/, "Enter a valid CVC."),
});
export type PaymentValues = z.infer<typeof paymentSchema>;

export const checkoutSchema = shippingSchema.merge(paymentSchema);
export type CheckoutValues = z.infer<typeof checkoutSchema>;
