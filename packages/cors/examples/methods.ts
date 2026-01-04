import { server } from "kitojs";
import { cors } from "../src/index";

const app = server();

app.use(
  cors({
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.get("/", ({ res }) => res.send("CORS with custom methods and headers!"));

app.listen(3000, () =>
  console.log("Methods and headers example listening on localhost:3000"),
);
