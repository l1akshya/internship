"use client";

import { useState } from "react";
import "./home.css";

export default function TaskManager() {
  const [activeBoard, setActiveBoard] = useState("Dashboard");

  return (
    <div className="page">
      <h1 className="title">Welcome to Task Manager</h1>
      <div className="dashboard-container">
        <div className="dashboard-box">
          <div className="dashboard-buttons">
            <button onClick={() => setActiveBoard("Dashboard")}>Dashboard</button>
            <button onClick={() => setActiveBoard("Task List")}>Task List</button>
            <button onClick={() => setActiveBoard("Add Task")}>Add Task</button>
          </div>

          <div className="dashboard-content">
            {activeBoard === "Dashboard" && <p>Welcome to the Dashboard!</p>}
            {activeBoard === "Task List" && <p>Here is your Task List.</p>}
            {activeBoard === "Add Task" && <p>Add a new task here.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
