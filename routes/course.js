import express from "express";
import {
  create,
  getAllCourses,
  read,
  removeImage,
  uploadImage,
} from "../controllers/course";
import { isInstructor } from "../middleware";
const router = express.Router();

//image
router.post("/course/upload-image", uploadImage);
router.post("/course/remove-image", removeImage);
//course
router.get("/courses", getAllCourses);
router.post("/course", create);
router.get("/course/:id", read);
module.exports = router;

/**
 * event driven architecture
 * amazon --> cart -> display the card,
 *
 */
