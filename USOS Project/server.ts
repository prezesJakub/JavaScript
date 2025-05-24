import { Application, Router, Context, send } from "https://deno.land/x/oak@v10.0.0/mod.ts";
import { ensureDir } from "https://deno.land/std/fs/mod.ts";
import { renderFile } from "https://deno.land/x/eta@v2.2.0/mod.ts";
import { configure } from "https://deno.land/x/eta@v2.2.0/mod.ts";
import { basename, extname, join } from "https://deno.land/std/path/mod.ts";
import { MongoClient, Database, Bson } from "https://deno.land/x/mongo@v0.31.1/mod.ts";
import { Student, Ocena } from "./public/types.d.ts";

configure({
    views: `${Deno.cwd()}/views`,
    autoExtension: true,
    cache: false,
    debug: true,
});
const publicPath = join(Deno.cwd(), "public");
const uploadsPath = join(Deno.cwd(), "uploads");

await ensureDir(uploadsPath);

const client = new MongoClient();
await client.connect("mongodb://127.0.0.1:27017");
const db: Database = client.database("usos");
const studentsCollection = db.collection<StudentSchema>("students");

interface StudentSchema {
    _id: Bson.ObjectId;
    imie: string;
    nazwisko: string;
    zdjecie: string;
    oceny: Ocena[];
}

const router = new Router();

router
    .get("/", async (ctx: Context) => {
        const students = await studentsCollection.find({}).toArray();
        const mappedStudents = students.map(({ _id, ...rest }) => ({
            id: _id.toString(),
            ...rest,
        }));


        try {
            const html = await renderFile("index.eta", {
                title: "USOS - Wydział Informatyki",
                students: mappedStudents,
            });

            if (!html) {
                ctx.response.status = 500;
                ctx.response.body = "Błąd renderowania szablonu";
                return;
            }

            ctx.response.headers.set("Content-Type", "text/html");
            ctx.response.body = html;
        } catch (err) {
            console.error("Błąd renderowania:", err);
        }
    })

    .get("/usos", async (ctx: Context) => {
        const students = await studentsCollection.find({}).toArray();
        const mappedStudents = students.map(({ _id, ...rest }) => ({
            id: _id.toString(),
            ...rest,
        }));

        try {
            const html = await renderFile("usos.eta", {
                title: "USOS - System ocen",
                students: mappedStudents,
            });

            if (!html) {
                ctx.response.status = 500;
                ctx.response.body = "Błąd renderowania szablonu";
                return;
            }

            ctx.response.headers.set("Content-Type", "text/html");
            ctx.response.body = html;
        } catch (err) {
            console.error("Błąd renderowania:", err);
            ctx.response.status = 500;
            ctx.response.body = "Błąd serwera";
        } 
    })

    .get("/students", async (ctx: Context) => {
        const students = await studentsCollection.find({}).toArray();
        const result = students.map(({ _id, ...rest }) => ({
            id: _id.toString(),
            ...rest,
        }));
        ctx.response.body = result;
    })

    .post("/add-student", async (ctx: Context) => { 
        try {
            const contentType = ctx.request.headers.get("content-type") || "";
            if (!contentType.startsWith("multipart/form-data")) {
                ctx.response.status = 400;
                ctx.response.body = "Nieprawidłowy typ zawartości, oczekiwano multipart/form-data";
                return;
            }
            const body = ctx.request.body();
            if (body.type !== "form-data") {
                ctx.response.status = 400;
                ctx.response.body = "Nieprawidłowy typ zawartości, oczekiwano multipart/form-data";
                return;
            }
            const formData = await body.value.read();
            console.log("FormData:", formData);

            const imie = formData.fields.imie?.trim() || "";
            const nazwisko = formData.fields.nazwisko?.trim() || "";

            const file = formData.files?.[0];

            if (!imie || !nazwisko) {
                ctx.response.status = 400;
                ctx.response.body = "Imię i nazwisko są wymagane";
                return;
            }

            if (!file || !file?.filename) {
                ctx.response.status = 400;
                ctx.response.body = "Brak zdjęcia";
                return;
            }

            const tempFilePath = file.filename;
            const fileContent = await Deno.readFile(tempFilePath);

            const originalName = basename(file.originalName);
            const uniqueName = `${crypto.randomUUID()}_${originalName}`;
            const filepath = join(uploadsPath, uniqueName);

            await Deno.writeFile(filepath, fileContent);

            const newStudent: StudentSchema = {
                _id: new Bson.ObjectId(),
                imie,
                nazwisko,
                zdjecie: uniqueName,
                oceny: [],
            };

            const result = await studentsCollection.insertOne(newStudent);

            ctx.response.status = 201;
            ctx.response.body = "Student dodany";
        } catch (error) {
            console.error("Błąd podczas przetwarzania formularza:", error);
            ctx.response.status = 500;
            ctx.response.body = "Błąd serwera podczas dodawania studenta";
        }
    })

    .post("/add-grade", async (ctx) => {
        const contentType = ctx.request.headers.get("content-type") || "";
        if (!contentType.includes("multipart/form-data")) {
            ctx.response.status = 400;
            ctx.response.body = "Nieprawidłowy typ zawartości, oczekiwano multipart/form-data";
            return;
        }
        const body = ctx.request.body({ type: "form-data" });
        const form = await body.value.read();

        const studentId = form.fields.studentId?.trim();
        const przedmiot = form.fields.przedmiot?.trim();
        const ocena = parseFloat(form.fields.ocena || "");

        if(!studentId || !przedmiot || isNaN(ocena)) {
            ctx.response.status = 400;
            ctx.response.body = "Nieprawidłowe dane";
            return;
        }

        const _id = new Bson.ObjectId(studentId);
        const student = await studentsCollection.findOne({ _id });

        if (!student) {
            ctx.response.status = 404;
            ctx.response.body = "Nie znaleziono studenta";
            return;
        }

        student.oceny.push({ przedmiot, ocena });
        await studentsCollection.updateOne({ _id }, { $set: { oceny: student.oceny } });

        ctx.response.body = "Ocena dodana";
    })

    .post("/delete-grade", async (ctx: Context) => {
        const { studentId, gradeIndex } = await ctx.request.body({ type: "json" }).value;

        if (!studentId || isNaN(gradeIndex)) {
            ctx.response.status = 400;
            ctx.response.body = "Nieprawidłowe dane";
            return;
        }

        const _id = new Bson.ObjectId(studentId);
        const student = await studentsCollection.findOne({ _id });

        if (!student || !student.oceny[gradeIndex]) {
            ctx.response.status = 404;
            ctx.response.body = "Nie znaleziono oceny";
            return;
        }

        student.oceny.splice(gradeIndex, 1);
        await studentsCollection.updateOne({ _id }, { $set: { oceny: student.oceny } });

        ctx.response.body = "Ocena usunięta";
    })

    .post("/edit-grade", async (ctx: Context) => {
        const { studentId, gradeIndex, przedmiot, ocena } = await ctx.request.body({ type: "json" }).value;

        if (!studentId || isNaN(gradeIndex) || !przedmiot || isNaN(ocena)) {
            ctx.response.status = 400;
            ctx.response.body = "Nieprawidłowe dane";
            return;
        }

        const _id = new Bson.ObjectId(studentId);
        const student = await studentsCollection.findOne({ _id });

        if (!student || !student.oceny[gradeIndex]) {
            ctx.response.status = 404;
            ctx.response.body = "Nie znaleziono oceny";
            return;
        }

        student.oceny[gradeIndex] = { przedmiot, ocena: parseFloat(ocena) };
        await studentsCollection.updateOne({ _id }, { $set: { oceny: student.oceny } });

        ctx.response.body = "Ocena zmodyfikowana";
    })

    .get("/uploads/:filename", async (ctx: Context) => {
        const params = ctx.request.url.pathname.split("/");
        const filename = params[params.length - 1];

        if (!filename) {
            ctx.response.status = 400;
            ctx.response.body = "Brak nazwy pliku w ścieżce URL";
            return;
        }

        const filePath = join(uploadsPath, basename(filename));
        
        try {
            const ext = extname(filename);
            const mime = {
                ".jpg": "image/jpeg",
                ".jpeg": "image/jpeg",
                ".png": "image/png",
                ".gif": "image/gif"
            }[ext] || "application/octet-stream";

            ctx.response.headers.set("Content-Type", mime);
            await send(ctx, filePath, { root: "" });
        } catch {
            ctx.response.status = 404;
            ctx.response.body = "Nie znaleziono obrazka";
        }
    });

const app = new Application();

app.use(async (ctx, next) => {
    try {
        await send(ctx, ctx.request.url.pathname, {
            root: publicPath,
            index: "index.html",
        });
    } catch {
        await next();
    }
});
app.use(async (ctx, next) => {
    if (ctx.request.url.pathname.startsWith("/uploads/")) {
        const filename = ctx.request.url.pathname.replace("/uploads/", "");
        try {
            await send(ctx, filename, { root: uploadsPath });
        } catch {
            ctx.response.status = 404;
            ctx.response.body = "Nie znaleziono obrazka";
        }
    } else {
        await next();
    }
});
app.use(router.routes());
app.use(router.allowedMethods());

console.log("Server running on http://localhost:3000");
await app.listen({ port: 3000 });