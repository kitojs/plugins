import { server } from "kitojs";
import { cors } from "../src/index";

const app = server();

app.use(
  cors({
    origin: (origin) => {
      // custom logic: allow any subdomain of example.com
      return (
        origin.endsWith(".example.com") || origin === "https://example.com"
      );
    },
  }),
);

app.get("/", ({ res }) => res.send("CORS with custom function allowed!"));

app.listen(3000, () =>
  console.log("Custom function example listening on localhost:3000"),
);
