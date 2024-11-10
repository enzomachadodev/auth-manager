import z from "zod";

export const resetPasswordSchema = z.object({
  email: z.string().email("Email is required"),
});

export const loginSchema = z.object({
  email: z.string().email("Email is required"),
  password: z.string().min(1, {
    message: "Password is required",
  }),
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
