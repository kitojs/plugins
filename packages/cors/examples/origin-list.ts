import { server } from "kitojs";
import { cors } from "../src/index";

const app = server();

app.use(
  cors({
    origin: ["http://localhost:8080", "https://example.com"],
  }),
);

app.get("/", ({ res }) => res.send("CORS allowed for specific origins!"));

app.listen(3000, () =>
  console.log("Origin list example listening on localhost:3000"),
);
