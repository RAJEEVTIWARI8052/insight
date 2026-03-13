deleteQuestion,
    upvoteQuestion,
    downvoteQuestion,
    deleteAnswer,
    checkDuplicate
} from "../controllers/questionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllQuestions);
router.get("/check-duplicate", protect, checkDuplicate);
router.post("/", protect, createQuestion);
router.put("/:id/respond", protect, addExpertResponse);
router.delete("/:id", protect, deleteQuestion);
router.put("/:id/upvote", protect, upvoteQuestion);
router.put("/:id/downvote", protect, downvoteQuestion);
router.delete("/:questionId/answers/:answerId", protect, deleteAnswer);

export default router;