import { Router } from "express";
import { users } from "../../fakeData/fakeUsers.js";
export const router = Router();

router.get("/", (req, res) => {
  res.json(users);
});

router.post("/", (req, res) => {
  const { username, email, password } = req.body || {};

  if (!username || !email) {
    return res.status(400).json({ message: "Missing username or email" });
  }

  //เริ่มต้นให้ max เป็น 0 นะ แล้วไปดู User ทุกคนในลิสต์... ใครมี ID มากกว่า max ปัจจุบัน ก็ให้คนนั้นเป็น max ตัวใหม่แทน... พอไล่ดูจนครบทุกคนแล้ว ได้เลขอะไรมา ก็เอามาบวกเพิ่มอีก 1 เพื่อใช้เป็น ID ใหม่ซะเลย!
  const nextId = String(
    (users.reduce(
      (max, user) =>
        //Number(u.id): แปลง ID ของ User (ซึ่งมักเป็น String) ให้เป็น "ตัวเลข" ก่อนเพื่อให้นำไปคำนวณได้
        Math.max(max, Number(user.id)),
      0,
    ) || 0) + 1,
  );

  //this is short hand version of username:username
  const newUser = { id: nextId, username, email, password };

  users.push(newUser);

  return res.status(201).json(newUser);
});

router.put("/:id", (req, res) => {
  const user = users.find((user) => {
    return user.id === req.params.id;
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const { username, email, password } = req.body || {}; //แกะเข้าไป

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ message: "Missing username, email or password" });
  }

  user.username = username;
  user.email = email;
  user.password = password;

  return res.status(200).json(user);
});

router.delete("/:id", (req, res) => {
  const targetId = req.params.id;

  const userIndex = users.findIndex((user) => user.id === String(targetId));

  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found! Cannot delete" });
  }

  const deletedUser = users.splice(userIndex, 1); //paraหลังคือจำนวนที่จะลบ
  return res.status(200).json({
    message: "Delete successful! ",
    deletedData: deletedUser[0],
  });
});
