import { server } from "kitojs";
import { helmet } from "../src/index";

const app = server();

app.use(
  helmet({
    contentSecurityPolicy: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "'unsafe-inline'", "https://trusted.cdn.com"],
      "style-src": ["'self'", "https://fonts.googleapis.com"],
    },
  }),
);

app.get("/", ({ res }) => {
  res.send("Custom CSP set!");
});

app.listen(3000, () =>
  console.log("CSP helmet example listening on localhost:3000"),
);
