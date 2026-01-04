import { server } from "kitojs";
import { ratelimit } from "../src/index";

const app = server();

app.use(
  ratelimit({
    windowMs: 60 * 1000,
    max: 5,
    handler: ({ req, res, next, options }) => {
      res.status(429).json({
        error: "Too Many Requests",
        message: "You are being rate limited. Please try again later.",
      });
    },
  }),
);

app.get("/", ({ res }) => res.send("custom handler example"));

app.listen(3000, () =>
  console.log("Custom handler ratelimit example listening on localhost:3000"),
);
