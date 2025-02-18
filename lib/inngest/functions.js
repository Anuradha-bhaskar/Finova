import { db } from "../prisma";
import { inngest } from "./client";


export const triggerRecurringTransactions = inngest.createFunction({
    id: "trigger-recurring-transactions",
    name: "Trigger Recurring Transactions",

}, { cron: "0 0 * * *" }, // Run every day at midnight

    async ({ step }) => {
        //1. Fetch all recurring transactions that need to be processed
        const recurringTransactions = await step.run(
            "fetch-recurring-transactions",
            async () => {
                return await db.transaction.findMany({
                    where: {
                        isRecurring: true,
                        status: "COMPLETED",
                        OR: [
                            { lastProcessed: null },
                            {
                                nextRecurringDate: {
                                    lte: new Date(),
                                },
                            },
                        ],
                    },
                });
            }
        );

        //2. Create events for each transaction
        if (recurringTransactions.length >= 0) {
            const events = recurringTransactions.map((transaction) => ({
                name: "transaction.recurring.process",
                data: {
                    transactionId: transaction.id,
                    userId: transaction.userId,
                },
            }));
            //3. Send the events to the Inngest
            await inngest.send(events);
        }
        return { triggered: recurringTransactions.length };
    });


export const processRecurringTransaction = inngest.createFunction({
    id: "process-recurring-transaction",
    throttle: {
        limit: 10, // 10 transactions per minute
        period: "1m", // 1 minute
        key: "event.data.userId", //per user
    },
}, {
    event: "transaction.recurring.process",
},
    async ({ event, step }) => {
        if (!event?.data?.transactionId || !event?.data?.userId) {
            console.error("Invalid event data", event);
            return { error: "Missing required data" };
        }
        await step.run("process-transaction", async () => {
            const transaction = await db.transaction.findUnique({
                where: {
                    id: event.data.transactionId,
                    userId: event.data.userId,
                },
                include: {
                    account: true,
                },
            });

            if (!transaction || !isTransactionDue(transaction)) return;

            // Create new transaction and update account balance in a transaction
            await db.$transaction(async (tx) => {
                // Create new transaction
                await tx.transaction.create({
                    data: {
                        type: transaction.type,
                        amount: transaction.amount,
                        description: `${transaction.description} (Recurring)`,
                        date: new Date(),
                        category: transaction.category,
                        userId: transaction.userId,
                        accountId: transaction.accountId,
                        isRecurring: false,
                    },
                });

                // Update account balance
                const balanceChange =
                    transaction.type === "EXPENSE"
                        ? -transaction.amount.toNumber()
                        : transaction.amount.toNumber();

                await tx.account.update({
                    where: { id: transaction.accountId },
                    data: { balance: { increment: balanceChange } },
                });

                // Update last processed date and next recurring date
                await tx.transaction.update({
                    where: { id: transaction.id },
                    data: {
                        lastProcessed: new Date(),
                        nextRecurringDate: calculateNextRecurringDate(
                            new Date(),
                            transaction.recurringInterval
                        ),
                    },
                });

            });

        }
        );

    });

// Utility functions
function isTransactionDue(transaction) {
    // If no lastProcessed date, transaction is due
    if (!transaction.lastProcessed) return true;

    const today = new Date();
    const nextDue = new Date(transaction.nextRecurringDate);

    // Compare with nextDue date
    return nextDue <= today;
}

function calculateNextRecurringDate(date, interval) {
    const next = new Date(date);
    switch (interval) {
        case "DAILY":
            next.setDate(next.getDate() + 1);
            break;
        case "WEEKLY":
            next.setDate(next.getDate() + 7);
            break;
        case "MONTHLY":
            next.setMonth(next.getMonth() + 1);
            break;
        case "YEARLY":
            next.setFullYear(next.getFullYear() + 1);
            break;
    }
    return next;
}
