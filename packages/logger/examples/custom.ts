import { server } from "kitojs";
import { logger } from "../src/index";

const app = server();

app.use(
  logger({
    format: (info) => {
      return `[${info.method}] ${info.url} - ${info.duration.toFixed(0)}ms`;
    },
    skip: (req) => req.url === "/health",
  }),
);

app.get("/", ({ res }) => res.send("custom format"));
app.get("/health", ({ res }) => res.send("OK")); // this won't be logged

app.listen(3000, () =>
  console.log("Custom logger example listening on localhost:3000"),
);
