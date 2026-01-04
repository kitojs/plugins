import { server } from "kitojs";
import { ratelimit } from "../src/index";

const app = server();

// apply to all routes
app.use(
  ratelimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  }),
);

app.get("/", ({ res }) => res.send("hello world!"));

app.listen(3000, () =>
  console.log("Basic ratelimit example listening on localhost:3000"),
);
