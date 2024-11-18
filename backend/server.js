import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import connectMongoDB from "./db/connectMongoDB.js";

dotenv.config()

const app = express();
const PORT = process.env.PORT || 5000;

app.use(morgan('dev'));

app.use("/api/auth", authRoutes);

app.listen(8000, () => {
    console.log(`Server is running on port ${PORT}`);
    connectMongoDB();
})