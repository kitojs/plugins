import { server } from "kitojs";
import { cors } from "../src/index";

const app = server();

app.use(
  cors({
    origin: "http://localhost:8080",
    credentials: true,
  }),
);

app.get("/", ({ res }) => res.send("CORS with credentials allowed!"));

app.listen(3000, () =>
  console.log("Credentials example listening on localhost:3000"),
);
