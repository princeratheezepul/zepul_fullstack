import express from "express";
import { savescorecard,getscorecard,updatescorecard,emailforanotherround,} from "../controllers/scorecard.controller.js";

const router = express.Router();

router.post("/save-scorecard", savescorecard);
router.get("/get-scorecard", getscorecard);
router.patch("/update/:id", updatescorecard);
router.post("/reqanotherround", emailforanotherround);

export default router;
