//
const express = require("express");
const Task = require("../models/Task");
const auth = require("../middleware/auth");

const router = express.Router();

// Get all tasks for user
router.get("/", auth, async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user.id }).sort({
            createdAt: -1,
        });
        res.json(tasks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// Create task
router.post("/", auth, async (req, res) => {
    const { title, description } = req.body;

    if (!title || title.trim() === "") {
        return res.status(400).json({ msg: "Title is required" });
    }

    try {
        const task = new Task({
            title: title.trim(),
            description: description?.trim() || "",
            user: req.user.id,
        });
        await task.save();
        res.json(task);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// Update task
router.put("/:id", auth, async (req, res) => {
    try {
        // Check if task exists and belongs to user
        const task = await Task.findOne({
            _id: req.params.id,
            user: req.user.id,
        });

        if (!task) {
            return res.status(404).json({ msg: "Task not found" });
        }

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updatedTask);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// Delete task
router.delete("/:id", auth, async (req, res) => {
    try {
        // Check if task exists and belongs to user
        const task = await Task.findOne({
            _id: req.params.id,
            user: req.user.id,
        });

        if (!task) {
            return res.status(404).json({ msg: "Task not found" });
        }

        await Task.findByIdAndDelete(req.params.id);
        res.json({ msg: "Task deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

module.exports = router;
