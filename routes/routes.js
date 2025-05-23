import express from "express";
import {
  AddExercise,
  AddUser,
  AllUsers,
  AllExercises,
} from "../controller/controller.js";

const router = express.Router();

// store users
router.post("/users", AddUser);

// get users
router.get("/users", AllUsers);

// exerices api
router.post("/users/:_id/exercises", AddExercise);

// exercise log
router.get("/users/:id/logs", AllExercises);

export default router;
