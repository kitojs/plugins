import { server } from "kitojs";
import { ratelimit } from "../../src/index";

import { RedisStore } from "./redis";

const app = server();

app.use(
  ratelimit({
    store: new RedisStore(),
    windowMs: 60 * 1000,
    max: 10,
  }),
);

app.get("/", ({ res }) => res.send("custom store example"));

app.listen(3000, () =>
  console.log("Custom store ratelimit example listening on localhost:3000"),
);
