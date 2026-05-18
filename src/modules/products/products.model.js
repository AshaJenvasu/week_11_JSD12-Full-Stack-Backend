import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    // ใน MongoDB จะมี _id ให้โดยอัตโนมัติอยู่แล้ว แต่ถ้าอยากใช้ id ที่กำหนดเอง
    // หรืออยากให้มีฟิลด์ custom id ก็สามารถใส่แบบนี้ได้
    productId: { type: String, required: true, unique: true },
    productName: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 }, // เปลี่ยนเป็น Number เพื่อให้คำนวณง่ายขึ้น
  },
  { timestamps: true }, // เผื่ออยากรู้ว่าสินค้าชิ้นไหนเพิ่มเข้ามาเมื่อไหร่
);

const Product = mongoose.model("Product", productSchema);

export default Product;
