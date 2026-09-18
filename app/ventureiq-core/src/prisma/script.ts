import { db } from "./db.js";

async function main() {
  const plan = await db.sql.public.users
    .select("id", "email", "name")
    .limit(2)
    .build();

  const rows = await db.runtime().query(plan);
  console.log(rows);
  await db.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
