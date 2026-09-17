import {db} from './db';

async function main() {
    const users = await db.orm.public.User
    .select("id", "email", "name", "role")
    .all();

    console.log(users)
    await db.close();
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
})