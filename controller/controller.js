import { nanoid } from "nanoid";

// Initialize usersMap as an array of user objects
let usersMap = [];

// add the user info
export const AddUser = async (req, res) => {
  try {
    const { username } = req.body;

    // Handle missing username
    if (!username) {
      return res.status(400).json({ error: "username is required" });
    }

    // Generate a unique ID for the user
    const uniqueId = nanoid();

    // Create a new user object with an empty exercises array
    const newUser = { _id: uniqueId, username, log: [], count: 0 };

    // Store the new user info
    usersMap.push(newUser);

    // Send the response
    res.status(200).json({ username: newUser.username, _id: newUser._id });
  } catch (error) {
    console.error("Error adding user:", error);
    return res
      .status(500)
      .json({ message: "Internal server error.", details: error.message });
  }
};

// return all users info
export const AllUsers = async (req, res) => {
  try {
    if (usersMap.length === 0) {
      return res.status(200).json([]); // Return an empty array if no users
    }
    // Send all users
    res
      .status(200)
      .json(
        usersMap.map((user) => ({ username: user.username, _id: user._id }))
      );
  } catch (error) {
    console.error("Error getting all users:", error);
    return res
      .status(500)
      .json({ message: "Internal server error.", details: error.message });
  }
};

// add exercise info
export const AddExercise = async (req, res) => {
  try {
    // get the id from the params
    const { _id: id } = req.params;

    // extract the info from the body
    const { description, duration, date } = req.body;

    // Handle missing fields
    if (!description || !duration) {
      return res
        .status(400)
        .json({ error: "description and duration are required" });
    }

    // Convert duration to a number
    const parsedDuration = parseInt(duration);
    if (isNaN(parsedDuration)) {
      return res.status(400).json({ error: "duration must be a number" });
    }

    // Format the date
    const dateObj = date ? new Date(date) : new Date();
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }
    const formattedDate = dateObj.toDateString();

    // Find the user by ID
    const userIndex = usersMap.findIndex((item) => item._id === id);

    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = usersMap[userIndex];

    // Create the exercise object
    const newExercise = {
      description,
      duration: parsedDuration,
      date: formattedDate,
    };

    // Add the exercise to the user's log
    user.log.push(newExercise);
    user.count = user.log.length; // Update the exercise count

    // Update the user in the usersMap (no need to push again)
    usersMap[userIndex] = user;

    // Send the response with the updated user object, including username, _id, and the new exercise
    res.status(200).json({
      _id: user._id,
      username: user.username,
      date: newExercise.date,
      duration: newExercise.duration,
      description: newExercise.description,
    });
  } catch (error) {
    console.error("Error adding exercise:", error);
    return res
      .status(500)
      .json({ message: "Internal server error.", details: error.message });
  }
};

// get exercise log
export const AllExercises = async (req, res) => {
  try {
    const { id } = req.params;
    const { from, to, limit } = req.query;

    const user = usersMap.find((item) => item._id === id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let filteredLog = [...user.log]; // Create a shallow copy to filter

    // Apply date filters if provided
    if (from) {
      const fromDate = new Date(from);
      filteredLog = filteredLog.filter((exercise) => {
        const exerciseDate = new Date(exercise.date);
        return exerciseDate >= fromDate;
      });
    }

    if (to) {
      const toDate = new Date(to);
      filteredLog = filteredLog.filter((exercise) => {
        const exerciseDate = new Date(exercise.date);
        return exerciseDate <= toDate;
      });
    }

    // Apply limit if provided
    if (limit) {
      const parsedLimit = parseInt(limit);
      if (!isNaN(parsedLimit)) {
        filteredLog = filteredLog.slice(0, parsedLimit);
      }
    }

    // Send the response with the user and their filtered exercise log
    res.status(200).json({
      _id: user._id,
      username: user.username,
      count: filteredLog.length,
      log: filteredLog,
    });
  } catch (error) {
    console.error("Error getting exercise log:", error);
    return res
      .status(500)
      .json({ message: "Internal server error.", details: error.message });
  }
};
