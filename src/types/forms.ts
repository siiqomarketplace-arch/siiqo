import { z } from "zod";
import { loginSchema } from "@/lib/Validation/LoginSchema";

export type LoginFormValues = z.infer<typeof loginSchema>;
