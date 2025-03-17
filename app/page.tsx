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
  
  // New form state
  const [newTask, setNewTask] = useState<Task>({
    id: "",
    title: "",
    description: "",
    status: "Pending",
    dueDate: ""
  });
  const [formMessage, setFormMessage] = useState<{ text: string; type: string } | null>(null);

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

  // Convert tasks array back to CSV format
  const tasksToCSV = (tasks: Task[]): string => {
    const headers = ['id', 'title', 'description', 'status', 'dueDate'];
    const headerRow = headers.join(',');
    const dataRows = tasks.map(task => {
      return [
        task.id,
        task.title,
        task.description.replace(/,/g, ';'), // Replace commas in description to avoid CSV issues
        task.status,
        task.dueDate
      ].join(',');
    });
    
    return [headerRow, ...dataRows].join('\n');
  };

  // Function to save tasks to CSV
  const saveTasks = async (updatedTasks: Task[]) => {
    try {
      const csvData = tasksToCSV(updatedTasks);
      
      // In a real application, you would send this to your server
      // For demonstration, we'll simulate success and update the state
      setTasks(updatedTasks);
      return true;
    } catch (err) {
      console.error('Error saving tasks:', err);
      return false;
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!newTask.title.trim()) {
      setFormMessage({ text: "Task title is required!", type: "error" });
      return;
    }
    
    try {
      // Generate a new ID (in a real app, this would be handled by the server)
      const newId = String(Math.max(0, ...tasks.map(t => parseInt(t.id))) + 1);
      const taskToAdd = { ...newTask, id: newId };
      
      // Add the new task to our tasks array
      const updatedTasks = [...tasks, taskToAdd];
      
      // Save to CSV
      const success = await saveTasks(updatedTasks);
      
      if (success) {
        setFormMessage({ text: "Task added successfully!", type: "success" });
        // Reset form
        setNewTask({
          id: "",
          title: "",
          description: "",
          status: "Pending",
          dueDate: ""
        });
        
        // Optionally redirect to task list
        setTimeout(() => {
          setActiveBoard("Task List");
          setFormMessage(null);
        }, 2000);
      } else {
        setFormMessage({ text: "Failed to add task. Please try again.", type: "error" });
      }
    } catch (err) {
      console.error('Error adding task:', err);
      setFormMessage({ text: "An error occurred while adding the task.", type: "error" });
    }
  };

  // Calculate task status counts
  const getTaskStatusCounts = () => {
    const completed = tasks.filter(task => 
      task.status.toLowerCase() === 'completed').length;
    const inProgress = tasks.filter(task => 
      task.status.toLowerCase() === 'in-progress' || 
      task.status.toLowerCase() === 'in progress').length;
    const pending = tasks.filter(task => 
      task.status.toLowerCase() === 'pending').length;
    
    return { completed, inProgress, pending, total: tasks.length };
  };

  // Calculate percentage for progress bars
  const calculatePercentage = (count: number, total: number) => {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Get status counts
  const statusCounts = getTaskStatusCounts();

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
                    <div className="status-summary">
                      <div className="status-item">
                        <span className="status-label">Total Tasks:</span>
                        <span className="status-count">{statusCounts.total}</span>
                      </div>
                      
                      <div className="status-item">
                        <span className="status-label">Completed:</span>
                        <span className="status-count">{statusCounts.completed}</span>
                        <div className="progress-bar-container">
                          <div 
                            className="progress-bar completed" 
                            style={{ width: `${calculatePercentage(statusCounts.completed, statusCounts.total)}%` }}
                          ></div>
                        </div>
                        <span className="percentage">
                          {calculatePercentage(statusCounts.completed, statusCounts.total)}%
                        </span>
                      </div>
                      
                      <div className="status-item">
                        <span className="status-label">In Progress:</span>
                        <span className="status-count">{statusCounts.inProgress}</span>
                        <div className="progress-bar-container">
                          <div 
                            className="progress-bar in-progress" 
                            style={{ width: `${calculatePercentage(statusCounts.inProgress, statusCounts.total)}%` }}
                          ></div>
                        </div>
                        <span className="percentage">
                          {calculatePercentage(statusCounts.inProgress, statusCounts.total)}%
                        </span>
                      </div>
                      
                      <div className="status-item">
                        <span className="status-label">Pending:</span>
                        <span className="status-count">{statusCounts.pending}</span>
                        <div className="progress-bar-container">
                          <div 
                            className="progress-bar pending" 
                            style={{ width: `${calculatePercentage(statusCounts.pending, statusCounts.total)}%` }}
                          ></div>
                        </div>
                        <span className="percentage">
                          {calculatePercentage(statusCounts.pending, statusCounts.total)}%
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="recent-tasks-title">Recent Tasks</h3>
                    <div className="task-preview">
                      {tasks.slice(0, 3).map((task) => (
                        <div key={task.id} className="task-item">
                          <h3>{task.title}</h3>
                          <p>{task.description}</p>
                          <div className="task-meta">
                            <span className={`status ${task.status.toLowerCase().replace(' ', '-')}`}>
                              {task.status}
                            </span>
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
                          <span className={`status ${task.status.toLowerCase().replace(' ', '-')}`}>
                            {task.status}
                          </span>
                          <span className="due-date">{task.dueDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {activeBoard === "Add Task" && (
              <div className="add-task-container">
                <h2>Add New Task</h2>
                
                {formMessage && (
                  <div className={`form-message ${formMessage.type}`}>
                    {formMessage.text}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="task-form">
                  <div className="form-group">
                    <label htmlFor="title">Task Title *</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={newTask.title}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter task title"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      value={newTask.description}
                      onChange={handleInputChange}
                      placeholder="Enter task description"
                      rows={4}
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="status">Status</label>
                      <select
                        id="status"
                        name="status"
                        value={newTask.status}
                        onChange={handleInputChange}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In-Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="dueDate">Due Date</label>
                      <input
                        type="date"
                        id="dueDate"
                        name="dueDate"
                        value={newTask.dueDate}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <button type="submit" className="submit-btn">Add Task</button>
                    <button 
                      type="button" 
                      className="cancel-btn"
                      onClick={() => {
                        setNewTask({
                          id: "",
                          title: "",
                          description: "",
                          status: "Pending",
                          dueDate: ""
                        });
                        setFormMessage(null);
                      }}
                    >
                      Clear Form
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}