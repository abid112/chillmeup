import { Router, type IRouter } from "express";
import healthRouter from "./health";
import weatherRouter from "./weather";
import playlistImageRouter from "./playlistImage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(weatherRouter);
router.use(playlistImageRouter);

export default router;
