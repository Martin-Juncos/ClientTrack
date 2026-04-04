import app from "./app.js";
import { env } from "./config/env.js";
import { connectDb } from "./db/connectDb.js";

async function start() {
  await connectDb();

  app.listen(env.PORT, () => {
    console.log(`ClientTrack API lista en http://localhost:${env.PORT}`);
  });
}

start().catch((error) => {
  console.error("No se pudo iniciar la API local:", error);
  process.exit(1);
});
