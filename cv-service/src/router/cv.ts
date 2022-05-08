import Router from "@koa/router";
import koaBody from "koa-body";
import { AppContext, AppState } from "../app-types";
import { CVController } from "../controllers/cv-controller";
import { auth } from "../middleware/auth";

const router = new Router<AppState, AppContext>();

router.get("/cv", async (ctx) => {
  const CVs = await new CVController().get({
    relations: {
      contacts: true,
      education: true,
      workExperience: true
    }
  });

  ctx.body = CVs;
  ctx.status = 200;
});

router.get("/cv/:id", async (ctx) => {
  const cv = await new CVController().get({
    where: {
      id: Number(ctx.params.id)
    }
  })[0];

  if (cv === undefined) {
    ctx.body = "Not found";
    ctx.status = 404;
    return;
  }

  ctx.body = cv;
  ctx.status = 200;
});

router.post("/cv", koaBody({ json: true }), async (ctx) => {
  const savedCV = await new CVController().create({
    ...ctx.request.body,
    owner: "root"
  });

  ctx.body = savedCV;
  ctx.status = 201;
});

router.put("/cv/:id", koaBody({ json: true }), async (ctx) => {
  const updatedCV = await new CVController().update(
    {
      where: {
        id: Number(ctx.params.id)
      }
    },
    ctx.request.body
  );

  ctx.body = updatedCV;
  ctx.status = 200;
});

router.delete("/cv/:id", async (ctx) => {
  await new CVController().delete({
    where: {
      id: Number(ctx.params.id)
    }
  });

  ctx.status = 200;
  ctx.body = "Deleted";
});

export default router;
