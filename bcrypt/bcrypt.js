import bcrypt from "bcrypt";

async function hashPassword(string) {
  const hashedPassword = await bcrypt.hash(string, 12);
  return hashedPassword;
}

// const password = await hashPassword("OMG!");
// console.log(password);

console.log(
  await bcrypt.compare(
    "OMG!",
    "$2b$12$4OA94TAJ3Q2masWW.TzCou21/RnIhOQ6x9JupqNEOtcaCnEVj7Eyi",
  ),
);

export default hashPassword;
