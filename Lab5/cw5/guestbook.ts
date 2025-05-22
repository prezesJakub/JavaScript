import { Application, Context, Router } from "jsr:@oak/oak";
import { Eta } from "https://deno.land/x/eta/src/index.ts";
import logger from "https://deno.land/x/oak_logger/mod.ts";

type GuestEntry = {
    name: string;
    message: string;
};

const DATA_FILE: string = "./data/entries.json";

const eta: Eta = new Eta({
  views: `${Deno.cwd()}/views`,
  ext: ".eta",
});

async function readEntries(): Promise<GuestEntry[]> {
    try {
        const data: string = await Deno.readTextFile(DATA_FILE);
        return JSON.parse(data) as GuestEntry[];
    } catch {
        return [];
    }
}

async function writeEntries(entries: GuestEntry[]): Promise<void> {
    await Deno.mkdir("data", { recursive: true });
    const json: string = JSON.stringify(entries, null, 2);
    await Deno.writeTextFile(DATA_FILE, json);
}

const router: Router = new Router();

router
    .get("/", async (ctx: Context): Promise<void> => {
        const entries: GuestEntry[] = await readEntries();
        const html: string | undefined = await eta.render("guestbook", {
            title: "Guestbook",
            entries,
        });
        ctx.response.body = html ?? "Render error";
    })
    .post("/", async (ctx: Context): Promise<void> => {
        const contentType = ctx.request.headers.get("content-type") || "";
        if (!contentType.includes("application/x-www-form-urlencoded")) {
            ctx.response.status = 400;
            ctx.response.body = "Unsupported content type.";
            return;
        }

        const rawBody = await ctx.request.body.text();
        const form = new URLSearchParams(rawBody);

        const name: string = form.get("name") ?? "Anonymous";
        const message: string = form.get("message") ?? "";

        const newEntry: GuestEntry = { name, message };

        const entries: GuestEntry[] = await readEntries();
        entries.push(newEntry);
        await writeEntries(entries);

        ctx.response.redirect("/");
    });

const app: Application = new Application();

app.use(logger.logger);
app.use(logger.responseTime);
app.use(router.routes());
app.use(router.allowedMethods());

console.log("Guestbook app running at http://localhost:8000/");
await app.listen({ port: 8000 });