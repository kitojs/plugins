import { server } from "kitojs";
import { cors } from "../dist/index.mjs"; // plugin

const app = server();
app.use(cors()); // global!

// per-route!
app.get("/", cors(), ({ res }) => res.send("hello world!"));

app.listen(3000, () =>
  console.log("basic example listening on localhost:3000"),
);
