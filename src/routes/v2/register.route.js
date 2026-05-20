import bcrypt from "bcrypt";
import { Router } from "express";

export const router = Router();

const Database = {
  users: [],

  findUser: async (email) => {
    return Database.users.find((user) => user.email === email) || null;
  },
  save: async (userData) => {
    Database.users.push(userData);
    console.log("🌟 [Mock DB] บันทึกข้อมูลสำเร็จแล้วจ้า:", Database.users);
    return true;
  },
};

router.post("/", async (req, res) => {
  const email = req.body.email;
  const plainPassword = req.body.password;

  const userExists = await Database.findUser(email);

  if (userExists) {
    return res.status(400).json({ error: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(plainPassword, 12);

  await Database.save({
    email,
    password: hashedPassword,
  });

  return res.status(201).json({ success: true }, { message: "User created" });
});
