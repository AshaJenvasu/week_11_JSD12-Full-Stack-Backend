import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { users } from "./fakeData/fakeUsers.js";
import { products } from "./fakeData/fakeProducts.js";
import { router as apiRoutes } from "./routes/index.js";
import { connectDB } from "./config/mongodb.js";
import { connectSupabase } from "./config/supabase.js";

const app = express();

app.use(cors());

//change JSON to JS
app.use(express.json());

//ด่านสแกนกระเป๋าหาคุกกี้
app.use(cookieParser());

//月の門
app.use("/api", apiRoutes);

//HOME
app.get("/", (req, res) => {
  res.json({
    message: "Express Server is running! Please use React frontend to test.",
  });
});

// Centrailzed error handling middleware

app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal Server Error",
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    stack: error.stack,
  });
});

const PORT = 3000;

await connectDB();
await connectSupabase();

app.listen(PORT, () => {
  console.log(`Server running on PORT:${PORT} ❤️`);
});
