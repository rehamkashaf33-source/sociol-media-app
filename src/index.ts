// import express from "express";
// import dotenv from "dotenv";
// import connectDB from "./config/db";
// import authRoutes from "./routes/auth.routes";

// dotenv.config();

// const app = express();

// app.use(express.json());

// app.use("/api/auth", authRoutes);

// const PORT = process.env.PORT || 3000;

// connectDB().then(() => {
//   app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//   });
// });
import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";
import authRoutes from "./routes/auth.routes";
import postRoutes from "./routes/post.routes";
import friendRoutes from "./routes/friend.routes";
import searchRoutes from "./routes/search.routes";
dotenv.config();
const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/search", searchRoutes);
const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});