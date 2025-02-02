"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const serializeTransaction = (obj) => {
    const serialized = {...obj};

    if(obj.balance){
        serialized.balance = obj.balance.toString();
    }
};

export async function createAccount(data){
    try{
        const { userId } = await auth();
        if(!userId){
            throw new Error("Unauthorized");
        }
        const user = await db.user.findUnique({
            where:{
                clerkUserId: userId,
            }
        });
        if(!user){
            throw new Error("User not found");
        }

        //convert balance to float
        const balanceFloat = parseFloat(data.balance);
        if(isNaN(balanceFloat)){
            throw new Error("Invalid balance amount");
        }
        
        //check if this is user's first account
        const existingAccounts = await db.account.findMany({
            where:{
                userId: user.id,
            }
        });

        //if no account exists, set this as default
        const shouldBeDefault = existingAccounts.length === 0? true : data.isDefault;

        // if this is default account, remove default status from other accounts
        if(shouldBeDefault){
            await db.account.updateMany({
                where:{
                    userId: user.id,
                },
                data:{
                    isDefault: false,
                }
            });
        }

        const account = await db.account.create({
            data:{
                ...data,
                balance: balanceFloat,
                isDefault: shouldBeDefault,
                userId: user.id,
            }
        });
        const serializedAccount = serializeTransaction(account);

        revalidatePath("/dashboard");
        return {success:true, data:serializedAccount};
    }
    catch(error){
        throw new Error(error.message);
    }
}