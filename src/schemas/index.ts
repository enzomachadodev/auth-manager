import z from "zod";

export const newPasswordSchema = z.object({
  password: z.string().min(6, {
    message: "Minimum of 6 characters required",
  }),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Email is required"),
});

export const loginSchema = z.object({
  email: z.string().email("Email is required"),
  password: z.string().min(1, {
    message: "Password is required",
  }),
  code: z.optional(z.string()),
});

export const registerSchema = z.object({
  name: z.string().min(2, {
    message: "Name is required",
  }),
  email: z.string().email("Email is required"),
  password: z.string().min(6, {
    message: "Min password lenght is 6 characters",
  }),
});
