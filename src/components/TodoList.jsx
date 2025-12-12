import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trash2, X } from 'lucide-react';

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
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'var(--bg-color)' }}>
            <header style={{
                width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)',
                borderBottom: '1px solid var(--border-color)', padding: '1rem 2rem', position: 'sticky', top: 0, zIndex: 50,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <Link to="/" className="brand" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit' }}>
                    <div className="brand-icon" style={{
                        width: '32px', height: '32px', background: 'linear-gradient(135deg, var(--primary-orange), #fb923c)',
                        borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white'
                    }}>AJ</div>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Enterprise Hub</h1>
                </Link>
                <Link to="/" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <X size={18} /> Close
                </Link>
            </header>

            <div className="container" style={{ maxWidth: '600px', width: '100%', padding: '2rem 1rem', marginTop: '2rem' }}>
                <motion.div
                    className="todo-card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                        background: 'var(--card-bg)', borderRadius: '16px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        padding: '2rem', border: '1px solid var(--border-color)'
                    }}
                >
                    <div className="todo-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontFamily: "'Kalam', cursive", fontSize: '2.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Schedule your day!</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{todayDate}</p>
                    </div>

                    <div className="input-group" style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="What needs to be done?"
                            style={{
                                flex: 1, padding: '1rem', border: '2px solid var(--border-color)', borderRadius: '12px',
                                fontSize: '1rem', fontFamily: "'Inter', sans-serif"
                            }}
                        />
                        <button
                            onClick={addTask}
                            style={{
                                backgroundColor: 'var(--primary-orange)', color: 'white', border: 'none', padding: '0 1.5rem',
                                borderRadius: '12px', fontWeight: 600, cursor: 'pointer'
                            }}
                        >
                            Add
                        </button>
                    </div>

                    <ul className="todo-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        <AnimatePresence>
                            {tasks.map((task, index) => (
                                <motion.li
                                    key={index} // Ideally use unique ID, but index is okay for simple list
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className={`todo-item ${task.completed ? 'completed' : ''}`}
                                    style={{
                                        display: 'flex', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--border-color)',
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    <div
                                        className="todo-checkbox"
                                        onClick={() => toggleTask(index)}
                                        style={{
                                            width: '24px', height: '24px', border: '2px solid var(--border-color)', borderRadius: '6px',
                                            marginRight: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0, backgroundColor: task.completed ? 'var(--accent-success)' : 'transparent',
                                            borderColor: task.completed ? 'var(--accent-success)' : 'var(--border-color)'
                                        }}
                                    >
                                        {task.completed && <Check size={14} color="white" strokeWidth={4} />}
                                    </div>
                                    <span style={{
                                        flex: 1, fontSize: '1.05rem',
                                        textDecoration: task.completed ? 'line-through' : 'none',
                                        color: task.completed ? 'var(--text-secondary)' : 'var(--text-primary)'
                                    }}>
                                        {task.text}
                                    </span>
                                    <button
                                        onClick={() => deleteTask(index)}
                                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '5px' }}
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </motion.li>
                            ))}
                        </AnimatePresence>
                        {tasks.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}
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
