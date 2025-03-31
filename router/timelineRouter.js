import express from "express";
import { postTimeline,deleteTimeline,getAllTimelines} from "../controllers/timelineController.js"
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/add", isAuthenticated, postTimeline)
router.delete("/delete/:id",isAuthenticated, deleteTimeline)

router.get("/getall",getAllTimelines)


export default router;