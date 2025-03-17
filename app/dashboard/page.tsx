"use client";

import { useState } from "react";
import "./home.css";

export default function TaskDashboard() {
  const [activeView, setActiveView] = useState("dashboard");
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Complete UI Design",
      description: "Finish the task management dashboard design",
      dueDate: "2025-03-20",
      status: "pending",
      completed: false,
      created: "2025-03-15",
      updated: "2025-03-16",
    },
    {
      id: 2,
      title: "User Research",
      description: "Conduct user interviews for new features",
      dueDate: "2025-03-25",
      status: "in-progress",
      completed: false,
      created: "2025-03-14",
      updated: "2025-03-17",
    },
    {
      id: 3,
      title: "Prototype Testing",
      description: "Test the new prototype with users",
      dueDate: "2025-03-18",
      status: "completed",
      completed: true,
      created: "2025-03-10",
      updated: "2025-03-17",
    },
  ]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
  });

  const handleTaskSelect = (task) => {
    setSelectedTask(task);
    setActiveView("detail");
  };

  const handleStatusChange = (id, status) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, status, completed: status === "completed" } : task
      )
    );
  };

  const handleDeleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
    setSelectedTask(null);
    setActiveView("dashboard");
  };

  const handleAddTask = () => {
    if (newTask.title) {
      const task = {
        id: tasks.length + 1,
        ...newTask,
        status: "pending",
        completed: false,
        created: new Date().toISOString().slice(0, 10),
        updated: new Date().toISOString().slice(0, 10),
      };
      setTasks([...tasks, task]);
      setNewTask({ title: "", description: "", dueDate: "" });
      setActiveView("dashboard");
    }
  };

  // Count totals for dashboard
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  return (
    <div className="page">
      <div className="dashboard-container">
        <h1>Task Management Dashboard</h1>

        {/* Navigation */}
        <nav className="dashboard-nav">
          <button
            className={activeView === "dashboard" ? "active" : ""}
            onClick={() => setActiveView("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={activeView === "list" ? "active" : ""}
            onClick={() => setActiveView("list")}
          >
            Task List
          </button>
          <button
            className={activeView === "add" ? "active" : ""}
            onClick={() => setActiveView("add")}
          >
            Add Task
          </button>
        </nav>

        {/* Dashboard Overview */}
        {activeView === "dashboard" && (
          <div className="dashboard-overview">
            <div className="task-stats">
              <div className="stat-box">
                <h3>Total Tasks</h3>
                <p>{totalTasks}</p>
              </div>
              <div className="stat-box completed">
                <h3>Completed</h3>
                <p>{completedTasks}</p>
              </div>
              <div className="stat-box pending">
                <h3>Pending</h3>
                <p>{pendingTasks}</p>
              </div>
            </div>
            <div className="progress-container">
              <h3>Progress</h3>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                />
              </div>
              <p>{Math.round((completedTasks / totalTasks) * 100)}% completed</p>
            </div>
            <div className="recent-tasks">
              <h3>Recent Tasks</h3>
              <ul>
                {tasks.slice(0, 3).map((task) => (
                  <li key={task.id} onClick={() => handleTaskSelect(task)}>
                    <span className={`status-dot ${task.status}`} />
                    <span className="task-title">{task.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Task List */}
        {activeView === "list" && (
          <div className="task-list">
            <h2>All Tasks</h2>
            <div className="task-list-container">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`task-item ${task.status}`}
                  onClick={() => handleTaskSelect(task)}
                >
                  <div className="task-header">
                    <h3>{task.title}</h3>
                    <span className={`status-badge ${task.status}`}>
                      {task.status.replace("-", " ")}
                    </span>
                  </div>
                  <p className="task-description">{task.description}</p>
                  <div className="task-meta">
                    {task.dueDate && <p>Due: {task.dueDate}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Task Detail */}
        {activeView === "detail" && selectedTask && (
          <div className="task-detail">
            <h2>{selectedTask.title}</h2>
            <div className="detail-content">
              <p className="description">{selectedTask.description}</p>
              <div className="meta-info">
                <p>
                  <strong>Status:</strong>{" "}
                  <select
                    value={selectedTask.status}
                    onChange={(e) => handleStatusChange(selectedTask.id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </p>
                <p>
                  <strong>Created:</strong> {selectedTask.created}
                </p>
                <p>
                  <strong>Updated:</strong> {selectedTask.updated}
                </p>
                {selectedTask.dueDate && (
                  <p>
                    <strong>Due Date:</strong> {selectedTask.dueDate}
                  </p>
                )}
              </div>
              <div className="task-actions">
                <button className="delete-btn" onClick={() => handleDeleteTask(selectedTask.id)}>
                  Delete Task
                </button>
                <button className="back-btn" onClick={() => setActiveView("list")}>
                  Back to List
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Task Form */}
        {activeView === "add" && (
          <div className="add-task-form">
            <h2>Add New Task</h2>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <label htmlFor="title">Title:</label>
                <input
                  type="text"
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description:</label>
                <textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="dueDate">Due Date (Optional):</label>
                <input
                  type="date"
                  id="dueDate"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={handleAddTask} className="add-btn">
                  Add Task
                </button>
                <button type="button" onClick={() => setActiveView("dashboard")} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}