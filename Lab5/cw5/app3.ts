import { Application, Router, Context } from "jsr:@oak/oak";
import { Eta } from "https://deno.land/x/eta/src/index.ts";

const students = [
    { fname: "Jan", lname: "Kowalski", faculty: "WI" },
    { fname: "Anna", lname: "Nowak", faculty: "WMS" },
    { fname: "Maria", lname: "Zięba", faculty: "WIET" },
    { fname: "Tomasz", lname: "Nowicki", faculty: "WIMiIP" },
];

const eta = new Eta({
    views: `${Deno.cwd()}/views`,
    ext: ".eta",
});

const router = new Router();

router.get("/", async (ctx: Context) => {
    const html = await eta.render("students", {
        students,
    });
    ctx.response.body = html ?? "Błąd renderowania.";
});

const app = new Application();

app.use(router.routes());
app.use(router.allowedMethods());

console.log("Serwer działa na http://localhost:8000");
await app.listen({ port: 8000 });