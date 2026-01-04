import { server } from "kitojs";
import { helmet } from "../src/index";

const app = server();

app.use(
  helmet({
    contentSecurityPolicy: false, // disable CSP
    xssFilter: false, // disable XSS filter
  }),
);

app.get("/", ({ res }) => {
  res.send("Some headers disabled!");
});

app.listen(3000, () =>
  console.log("Disabled headers helmet example listening on localhost:3000"),
);
