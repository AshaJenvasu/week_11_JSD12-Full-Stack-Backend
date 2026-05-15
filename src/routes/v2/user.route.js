import { Router } from "express";
import User from "../../../src/modules/users/user.model.js";

export const router = Router();

const userResponse = (doc) => {
  const user = doc.toObject(); //translate to JS object
  delete user.password;
  return user;
};

router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    return res.status(400).json({ success: false, error: error });
  }
});

router.post("/", async (req, res) => {
  const { username, email, password, role } = req.body || {};

  if (!username || !email || !password) {
    const error = new Error("username, email, and password are required");

    error.name = "ValidationError";

    error.status = 400;

    return res.status(400).json({ success: false, error: error });
  }

  try {
    const doc = await User.create({ username, email, password, role }); //shorthand
    return res.status(201).json({ success: true, data: userResponse(doc) });
  } catch (error) {
    return res.status(400).json({ success: false, error: error });
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

router.put("/:id", async (req, res) => {
  const { username, email, password, role } = req.body || {};

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ success: false, error: "Missing username, email or password" });
  }

  try {
    const updateUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        username,
        email,
        password,
        role,
      },
      { new: true, runValidators: true },
    );

    if (!updateUser) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      success: true,
      data: userResponse(updateUser),
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  return res.status(200).json(user);
});

router.delete("/:id", async (req, res) => {
  try {
    // 1. ใช้ findByIdAndDelete เพื่อลบข้อมูลตาม ID
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    // 2. ถ้าไม่เจอ User ที่ต้องการลบ
    if (!deletedUser) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Delete successful!",
      deletedData: userResponse(deletedUser),
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});
