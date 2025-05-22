import { Application, Router, Context } from "jsr:@oak/oak";
import { Eta } from "https://deno.land/x/eta/src/index.ts";
import { MongoClient } from "npm:mongodb";

const client = new MongoClient("mongodb://localhost:27017");
await client.connect();

const db = client.db("AGH");
const studentsCollection = db.collection("students");

const eta = new Eta({
    views: `${Deno.cwd()}/views`,
    ext: ".eta",
});

const router = new Router();

router.get("/", async (ctx: Context) => {
    const students = await studentsCollection.find({}).toArray();
    console.log("Studenci z MongoDB:", students);

    const html = await eta.render("studentsA", { students });
    ctx.response.body = html ?? "Render error";
});

router.get("/:faculty", async (ctx: Context) => {
    const faculty = ctx.params.faculty?.toUpperCase();

    const students = await studentsCollection.find({
        faculty: { $regex: `^${faculty}$`, $options: "i" }
    }).toArray();

    const html = await eta.render("studentsA", { students });
    ctx.response.body = html ?? "Render error";
});

const app = new Application();

app.use(router.routes());
app.use(router.allowedMethods());

console.log("Serwer działa na http://localhost:8000");
await app.listen({ port: 8000 });