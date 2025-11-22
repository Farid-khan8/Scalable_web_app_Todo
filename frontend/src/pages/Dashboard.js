//
import { AuthContext } from "../context/AuthContext";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [search, setSearch] = useState("");
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDescription, setNewTaskDescription] = useState("");
    const [editingTask, setEditingTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const res = await axios.get("/api/tasks");
            setTasks(res.data);
        } catch (err) {
            setError("Failed to load tasks");
        } finally {
            setLoading(false);
        }
    };

    const filteredTasks = tasks.filter((task) =>
        task.title.toLowerCase().includes(search.toLowerCase())
    );

    const addTask = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        try {
            const res = await axios.post("/api/tasks", {
                title: newTaskTitle,
                description: newTaskDescription,
            });
            setTasks([...tasks, res.data]);
            setNewTaskTitle("");
            setNewTaskDescription("");
        } catch (err) {
            setError("Failed to add task");
        }
    };

    const updateTask = async (id, updates) => {
        try {
            const res = await axios.put(`/api/tasks/${id}`, updates);
            setTasks(tasks.map((task) => (task._id === id ? res.data : task)));
            setEditingTask(null);
        } catch (err) {
            setError("Failed to update task");
        }
    };

    const deleteTask = async (id) => {
        try {
            await axios.delete(`/api/tasks/${id}`);
            setTasks(tasks.filter((task) => task._id !== id));
        } catch (err) {
            setError("Failed to delete task");
        }
    };

    const toggleComplete = async (task) => {
        await updateTask(task._id, { completed: !task.completed });
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold">
                            Welcome, {user?.name}!
                        </h1>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {/* Add Task Form */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">Add New Task</h2>
                    <form onSubmit={addTask}>
                        <input
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            placeholder="Task title"
                            className="block w-full px-4 py-2 border rounded mb-2"
                            required
                        />
                        <textarea
                            value={newTaskDescription}
                            onChange={(e) =>
                                setNewTaskDescription(e.target.value)
                            }
                            placeholder="Task description (optional)"
                            className="block w-full px-4 py-2 border rounded mb-4"
                            rows="3"
                        />
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                        >
                            Add Task
                        </button>
                    </form>
                </div>

                {/* Search */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search tasks..."
                        className="w-full px-4 py-2 border rounded"
                    />
                </div>

                {/* Tasks List */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold mb-4">
                        Tasks ({filteredTasks.length})
                    </h2>
                    {loading ? (
                        <p>Loading tasks...</p>
                    ) : filteredTasks.length === 0 ? (
                        <p className="text-gray-500">No tasks found</p>
                    ) : (
                        <ul className="space-y-3">
                            {filteredTasks.map((task) => (
                                <li
                                    key={task._id}
                                    className="border rounded p-4 flex justify-between items-start"
                                >
                                    {editingTask === task._id ? (
                                        <div className="flex-1">
                                            <input
                                                defaultValue={task.title}
                                                onBlur={(e) =>
                                                    updateTask(task._id, {
                                                        title: e.target.value,
                                                    })
                                                }
                                                className="w-full px-2 py-1 border rounded mb-2"
                                            />
                                            <textarea
                                                defaultValue={task.description}
                                                onBlur={(e) =>
                                                    updateTask(task._id, {
                                                        description:
                                                            e.target.value,
                                                    })
                                                }
                                                className="w-full px-2 py-1 border rounded"
                                                rows="2"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex-1">
                                            <h3
                                                className={`font-semibold ${
                                                    task.completed
                                                        ? "line-through text-gray-500"
                                                        : ""
                                                }`}
                                            >
                                                {task.title}
                                            </h3>
                                            {task.description && (
                                                <p className="text-gray-600 text-sm mt-1">
                                                    {task.description}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    <div className="flex gap-2 ml-4">
                                        <button
                                            onClick={() => toggleComplete(task)}
                                            className={`px-3 py-1 rounded text-sm ${
                                                task.completed
                                                    ? "bg-gray-300"
                                                    : "bg-green-500 text-white"
                                            }`}
                                        >
                                            {task.completed
                                                ? "Undo"
                                                : "Complete"}
                                        </button>
                                        <button
                                            onClick={() =>
                                                setEditingTask(
                                                    editingTask === task._id
                                                        ? null
                                                        : task._id
                                                )
                                            }
                                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                                        >
                                            {editingTask === task._id
                                                ? "Done"
                                                : "Edit"}
                                        </button>
                                        <button
                                            onClick={() => deleteTask(task._id)}
                                            className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
