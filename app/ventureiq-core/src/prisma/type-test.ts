import { Temporal as PolyfillTemporal } from "@js-temporal/polyfill";

(globalThis as any).Temporal = PolyfillTemporal;

const { db } = await import("./db.js");

type UserModel = typeof db.orm.public.User;

type CreateMethod = UserModel["create"];

type FirstArgument<T> =
  T extends {
    (data: infer A, ...args: any[]): any;
    (...args: any[]): any;
  }
    ? A
    : never;

type UserCreateInput = FirstArgument<CreateMethod>;

const now = PolyfillTemporal.Now.instant() as unknown as Temporal.Instant;

const testInput: UserCreateInput = {
  id: crypto.randomUUID(),
  email: "type-test@example.com",
  password: "test-password",
  name: "Type Test",
  role: "USER",
  createdAt: now,
  updatedAt: now,
};

const user = await db.orm.public.User.create(testInput);

console.log("Create type + runtime test passed:");
console.log(user);

await db.close();