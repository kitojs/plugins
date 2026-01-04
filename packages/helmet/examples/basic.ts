import { server } from "kitojs";
import { helmet } from "../src/index";

const app = server();

app.use(helmet());

app.get("/", ({ res }) => {
  res.send("Secure headers set!");
});

app.listen(3000, () =>
  console.log("Basic helmet example listening on localhost:3000"),
);
