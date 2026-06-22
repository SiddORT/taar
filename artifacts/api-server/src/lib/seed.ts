// import { eq } from "drizzle-orm";
import { db, usersTable, eq} from "@workspace/db";
import { hashPassword } from "./auth";
import { logger } from "./logger";

const USERS = [
  {
    username: "admin",
    email: "admin@zarierp.com",
    password: "Admin@123",
    role: "admin",
  },
  {
    username: "root",
    email: "root@zarierp.com",
    password: "Root@123",
    role: "admin",
  },
];

export async function seedAdminUser(): Promise<void> {
  for (const u of USERS) {
    const [existing] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, u.email));

    if (existing) continue;

    await db.insert(usersTable).values({
      username: u.username,
      email: u.email,
      hashedPassword: hashPassword(u.password),
      role: u.role,
      isActive: true,
    });

    logger.info(`Default user created: ${u.email}`);
  }
}
