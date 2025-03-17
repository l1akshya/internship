"use client";

import { useState, useEffect } from "react";
import "./home.css";

// Define a type for our task
type Task = {
  id: string;
  title: string;
  description: string;
  status: string;
  dueDate: string;
};

export default function TaskManager() {
  const [activeBoard, setActiveBoard] = useState("Dashboard");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch and parse CSV
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/tasks.csv');
      
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      
      const csvText = await response.text();
      const parsedTasks = parseCSV(csvText);
      setTasks(parsedTasks);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks. Please try again later.');
      setLoading(false);
    }
  };

  // Parse CSV text into task objects
  const parseCSV = (csvText: string): Task[] => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    
    return lines.slice(1).filter(line => line.trim() !== '').map((line, index) => {
      const values = line.split(',');
      const task: { [key: string]: string } = {};
      
      headers.forEach((header, i) => {
        task[header.trim()] = values[i] ? values[i].trim() : '';
      });
      
      return {
        id: task.id || String(index + 1),
        title: task.title || 'Untitled Task',
        description: task.description || '',
        status: task.status || 'Pending',
        dueDate: task.dueDate || 'No due date'
      };
    });
  };

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

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
            {activeBoard === "Dashboard" && (
              <div>
                <h2 className="dashboard-title">Welcome to the Dashboard!</h2>
                {loading ? (
                  <p className="loading">Loading tasks...</p>
                ) : error ? (
                  <p className="error">{error}</p>
                ) : (
                  <div className="task-summary">
                    <p>You have {tasks.length} task(s) in your list.</p>
                    <div className="task-preview">
                      {tasks.slice(0, 3).map((task) => (
                        <div key={task.id} className="task-item">
                          <h3>{task.title}</h3>
                          <p>{task.description}</p>
                          <div className="task-meta">
                            <span className={`status ${task.status.toLowerCase()}`}>{task.status}</span>
                            <span className="due-date">{task.dueDate}</span>
                          </div>
                        </div>
                      ))}
                      {tasks.length > 3 && (
                        <p className="more-tasks">
                          + {tasks.length - 3} more task(s)
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeBoard === "Task List" && (
              <div className="task-list-container">
                <h2>Task List</h2>
                {loading ? (
                  <p className="loading">Loading tasks...</p>
                ) : error ? (
                  <p className="error">{error}</p>
                ) : tasks.length === 0 ? (
                  <p>No tasks found.</p>
                ) : (
                  <div className="task-list">
                    {tasks.map((task) => (
                      <div key={task.id} className="task-item">
                        <h3>{task.title}</h3>
                        <p>{task.description}</p>
                        <div className="task-meta">
                          <span className={`status ${task.status.toLowerCase()}`}>{task.status}</span>
                          <span className="due-date">{task.dueDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {activeBoard === "Add Task" && <p>Add a new task here.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}