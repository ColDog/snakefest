import * as Koa from "koa";
import * as Router from "koa-router";
import * as BodyParser from "koa-bodyparser";
import * as serve from "koa-static";
import { FileStore, evaluate } from "./store";

const router = new Router();
const app = new Koa();
const store = new FileStore();
const port = process.env.PORT || 4000;

app.use(
  BodyParser({
    enableTypes: ["json", "text"]
  })
);

router.get("/apps/:id/ping", async ctx => {
  try {
    await store.load(ctx.params.id);
  } catch (e) {
    console.error(e);
    ctx.status = 500;
    ctx.body = { error: "NoApp" };
  }
});

router.post("/apps/:id/move", async ctx => {
  try {
    const js = await store.load(ctx.params.id);
    ctx.body = { move: evaluate(js, "move", ctx.body) };
  } catch (e) {
    console.error(e);
    ctx.status = 500;
    ctx.body = { error: "NoApp" };
  }
});

router.post("/apps/:id/save", async ctx => {
  try {
    await store.save(ctx.params.id, ctx.request.rawBody);
    ctx.body = { status: "saved" };
  } catch (e) {
    console.error(e);
    ctx.status = 500;
    ctx.body = { error: "SaveFailed" };
  }
});

app.use(router.routes());
app.use(router.allowedMethods());
app.use(serve("public"));

console.log("listening on", port);
const server = app.listen(port);

function shutdown() {
  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
