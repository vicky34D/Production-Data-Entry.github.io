import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trash2, X, Plus } from 'lucide-react';
import './TodoList.css';

const TodoList = () => {
    const [tasks, setTasks] = useState(() => {
        const saved = localStorage.getItem('ajTodoTasks');
        return saved ? JSON.parse(saved) : [];
    });
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        localStorage.setItem('ajTodoTasks', JSON.stringify(tasks));
    }, [tasks]);

    const addTask = () => {
        if (inputValue.trim()) {
            setTasks([{ text: inputValue.trim(), completed: false }, ...tasks]);
            setInputValue('');
        }
    };

    const toggleTask = (index) => {
        const newTasks = [...tasks];
        newTasks[index].completed = !newTasks[index].completed;
        setTasks(newTasks);
    };

    const deleteTask = (index) => {
        const newTasks = [...tasks];
        newTasks.splice(index, 1);
        setTasks(newTasks);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') addTask();
    };

    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const todayDate = new Date().toLocaleDateString('en-US', dateOptions);

    return (
        <div className="todo-page">
            <header className="todo-header-nav">
                <Link to="/" className="brand-link">
                    <div className="brand-icon-box">AJ</div>
                    <h1 className="brand-title">Enterprise Hub</h1>
                </Link>
                <Link to="/" className="close-link">
                    <X size={18} /> Close
                </Link>
            </header>

            <div className="todo-container">
                <motion.div
                    className="todo-card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <div className="todo-header">
                        <h2>Schedule your day!</h2>
                        <p>{todayDate}</p>
                    </div>

                    <div className="input-group">
                        <input
                            type="text"
                            className="task-input"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="What needs to be done?"
                        />
                        <button className="btn-add" onClick={addTask}>
                            <Plus size={20} strokeWidth={3} />
                        </button>
                    </div>

                    <ul className="todo-list">
                        <AnimatePresence>
                            {tasks.map((task, index) => (
                                <motion.li
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className={`todo-item ${task.completed ? 'completed' : ''}`}
                                >
                                    <div
                                        className={`todo-checkbox ${task.completed ? 'checked' : ''}`}
                                        onClick={() => toggleTask(index)}
                                    >
                                        {task.completed && <Check size={14} color="white" strokeWidth={4} />}
                                    </div>
                                    <span className="task-text">{task.text}</span>
                                    <button
                                        className="btn-delete"
                                        onClick={() => deleteTask(index)}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </motion.li>
                            ))}
                        </AnimatePresence>
                        {tasks.length === 0 && (
                            <motion.div
                                className="empty-message"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <p>All caught up! No tasks for today.</p>
                            </motion.div>
                        )}
                    </ul>
                </motion.div>
            </div>
        </div>
    );
};

export default TodoList;
