import express, { response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { agent } from "./agent.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Heeeeyyyyyyy");
});

app.listen(process.env.PORT, () => {
  console.log("Server is running");
});

app.post("/api", async (req, res) => {
  const { message, thread_id } = req.body;
  const result = await agent.invoke(
    {
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    },
    { configurable: { thread_id } }
  );

  res.json(result.messages.at(-1)?.content);
});

app.get("/api", (req, res) => {
  res.send("Areee");
});
