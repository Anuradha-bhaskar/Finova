import { z } from "zod";

export const accountSchema = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.enum(["CURRENT", "SAVINGS"]),
    balance: z.string().min(1, "Balance is required"),
    isDefault: z.boolean().default(false),
});

export const transactionSchema = z.object({
    date: z.date({ required_error: "Date is required" }),
    amount: z.string().min(1, "Amount is required"),
    type: z.enum(["INCOME", "EXPENSE"]),
    description: z.string().optional(),
    accountId: z.string().min(1, "Account is required"),
    category: z.string().min(1, "Category is required"),
    isRecurring: z.boolean().default(false),
    recurringInterval: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]).optional(),
}).superRefine((data, ctx) => {
    if (data.isRecurring && !data.recurringInterval) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Recurring interval is required for recurring transactions",
            path: ["recurringInterval"],
        });
    }
});


