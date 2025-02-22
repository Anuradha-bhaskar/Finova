import { currentUser } from "@clerk/nextjs/server"
import { db } from "./prisma";

export const checkUser = async () => {


    try {
        const user = await currentUser();

        if (!user) {
            return null;
        }
        const loggedInUSer = await db.user.findUnique({
            where: {
                clerkUserId: user.id,
            }

        });

        if (loggedInUSer) {
            return loggedInUSer;
        }

        const name = `${user.firstName} ${user.lastName}`;
        const newUser = await db.user.create({
            data: {
                clerkUserId: user.id,
                email: user.emailAddresses[0].emailAddress,
                name,
                imageUrl: user.imageUrl,
            }
        });
        return newUser;
    } catch (error) {
        console.log(error.message);
    }
}