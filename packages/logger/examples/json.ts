import { server } from "kitojs";
import { logger } from "../src/index";

const app = server();

app.use(
  logger({
    format: "json",
  }),
);

app.get("/", ({ res }) => res.json({ message: "hello json" }));

app.listen(3000, () =>
  console.log("JSON logger example listening on localhost:3000"),
);
