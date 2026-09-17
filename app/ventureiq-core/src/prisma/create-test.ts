import { Temporal } from "@js-temporal/polyfill";

(globalThis as any).Temporal = Temporal;

const { db } = await import("./db.js");
const User = db.orm.public!.User!;
async function main() {
  const now = Temporal.Now.instant();

  const user = await User.create({
    id: crypto.randomUUID(),
    email: "create-test@example.com",
    password: "test-password",
    name: "Create Test",
    role: "USER",
    createdAt: now,
    updatedAt: now,
  } as never);

  console.log("Created user:");
  console.log(user);

  await db.close();
}

main().catch(async (error) => {
  console.error("Create test failed:");
  console.error(error);

  await db.close();
  process.exit(1);
});