import { server } from "kitojs";
import { logger } from "../src/index";

const app = server();

app.use(logger());

app.get("/", ({ res }) => res.send("hello world!"));
app.get("/error", ({ res }) => res.status(500).send("Internal Server Error"));

app.listen(3000, () =>
  console.log("Basic logger example listening on localhost:3000"),
);
