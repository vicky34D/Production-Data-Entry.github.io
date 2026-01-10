import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Calendar, Plus, Edit2, Trash2, ArrowLeft, Save, X,
    Clock, Package, TrendingUp, AlertCircle, CheckCircle2,
    BarChart3, Users, Zap
} from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import './ProductionScheduler.css';
import './DarkMode.css';

const ProductionScheduler = () => {
    const navigate = useNavigate();
    const [schedules, setSchedules] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [selectedWeek, setSelectedWeek] = useState(new Date());
    const [capacityData, setCapacityData] = useState({
        dailyCapacity: 1000, // kg per day
        workingHours: 8,
        efficiency: 85, // percentage
        workers: 10
    });

    const [newSchedule, setNewSchedule] = useState({
        date: format(new Date(), 'yyyy-MM-dd'),
        item: '',
        targetQuantity: '',
        priority: 'medium',
        shift: 'day',
        assignedWorkers: '',
        notes: ''
    });

    useEffect(() => {
        loadSchedules();
    }, []);

    const loadSchedules = () => {
        const saved = JSON.parse(localStorage.getItem('productionSchedules') || '[]');
        setSchedules(saved);
    };

    const saveSchedules = (updatedSchedules) => {
        localStorage.setItem('productionSchedules', JSON.stringify(updatedSchedules));
        setSchedules(updatedSchedules);
    };

    const handleAddSchedule = () => {
        if (!newSchedule.item || !newSchedule.targetQuantity) {
            alert('Please fill in all required fields');
            return;
        }

        const schedule = {
            id: Date.now().toString(),
            ...newSchedule,
            targetQuantity: parseFloat(newSchedule.targetQuantity),
            assignedWorkers: parseInt(newSchedule.assignedWorkers) || 0,
            status: 'scheduled',
            createdAt: new Date().toISOString()
        };

        const updated = [...schedules, schedule];
        saveSchedules(updated);
        setShowAddModal(false);
        resetForm();
    };

    const handleUpdateSchedule = () => {
        const updated = schedules.map(s =>
            s.id === editingSchedule.id ? { ...editingSchedule } : s
        );
        saveSchedules(updated);
        setEditingSchedule(null);
    };

    const handleDeleteSchedule = (id) => {
        if (window.confirm('Are you sure you want to delete this schedule?')) {
            const updated = schedules.filter(s => s.id !== id);
            saveSchedules(updated);
        }
    };

    const resetForm = () => {
        setNewSchedule({
            date: format(new Date(), 'yyyy-MM-dd'),
            item: '',
            targetQuantity: '',
            priority: 'medium',
            shift: 'day',
            assignedWorkers: '',
            notes: ''
        });
    };

    // Calculate capacity utilization
    const getWeekDays = () => {
        const start = startOfWeek(selectedWeek, { weekStartsOn: 1 });
        const end = endOfWeek(selectedWeek, { weekStartsOn: 1 });
        return eachDayOfInterval({ start, end });
    };

    const getDailySchedules = (date) => {
        return schedules.filter(s => isSameDay(new Date(s.date), date));
    };

    const calculateDailyUtilization = (date) => {
        const daySchedules = getDailySchedules(date);
        const totalPlanned = daySchedules.reduce((sum, s) => sum + s.targetQuantity, 0);
        const utilization = (totalPlanned / capacityData.dailyCapacity) * 100;
        return {
            planned: totalPlanned,
            capacity: capacityData.dailyCapacity,
            utilization: Math.min(utilization, 100),
            overCapacity: utilization > 100
        };
    };

    const getWeeklyStats = () => {
        const weekDays = getWeekDays();
        let totalPlanned = 0;
        let totalCapacity = capacityData.dailyCapacity * 7;
        let daysOverCapacity = 0;

        weekDays.forEach(day => {
            const util = calculateDailyUtilization(day);
            totalPlanned += util.planned;
            if (util.overCapacity) daysOverCapacity++;
        });

        return {
            totalPlanned,
            totalCapacity,
            utilization: (totalPlanned / totalCapacity) * 100,
            daysOverCapacity,
            scheduledDays: weekDays.filter(d => getDailySchedules(d).length > 0).length
        };
    };

    const weeklyStats = getWeeklyStats();

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            case 'low': return '#10b981';
            default: return '#6b7280';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return '#10b981';
            case 'in-progress': return '#3b82f6';
            case 'scheduled': return '#6b7280';
            case 'delayed': return '#ef4444';
            default: return '#6b7280';
        }
    };

    return (
        <div className="production-scheduler-page">
            <header className="scheduler-header">
                <div className="header-left">
                    <button onClick={() => navigate('/plan')} className="back-btn">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1>Production Scheduler</h1>
                        <p>Advanced scheduling with capacity planning</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="action-btn" onClick={() => setShowAddModal(true)}>
                        <Plus size={18} /> New Schedule
                    </button>
                </div>
            </header>

            {/* Capacity Overview */}
            <div className="capacity-overview">
                <div className="capacity-card">
                    <div className="capacity-icon">
                        <Zap size={24} />
                    </div>
                    <div>
                        <span className="capacity-label">Daily Capacity</span>
                        <span className="capacity-value">{capacityData.dailyCapacity} kg</span>
                    </div>
                </div>
                <div className="capacity-card">
                    <div className="capacity-icon">
                        <Users size={24} />
                    </div>
                    <div>
                        <span className="capacity-label">Workers</span>
                        <span className="capacity-value">{capacityData.workers}</span>
                    </div>
                </div>
                <div className="capacity-card">
                    <div className="capacity-icon">
                        <Clock size={24} />
                    </div>
                    <div>
                        <span className="capacity-label">Working Hours</span>
                        <span className="capacity-value">{capacityData.workingHours}h</span>
                    </div>
                </div>
                <div className="capacity-card">
                    <div className="capacity-icon">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <span className="capacity-label">Efficiency</span>
                        <span className="capacity-value">{capacityData.efficiency}%</span>
                    </div>
                </div>
            </div>

            {/* Weekly Stats */}
            <div className="weekly-stats">
                <h2>Week of {format(startOfWeek(selectedWeek, { weekStartsOn: 1 }), 'MMM dd, yyyy')}</h2>
                <div className="stats-grid">
                    <div className="stat-item">
                        <span className="stat-label">Total Planned</span>
                        <span className="stat-value">{weeklyStats.totalPlanned.toFixed(0)} kg</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Weekly Capacity</span>
                        <span className="stat-value">{weeklyStats.totalCapacity} kg</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Utilization</span>
                        <span className={`stat-value ${weeklyStats.utilization > 90 ? 'warning' : ''}`}>
                            {weeklyStats.utilization.toFixed(1)}%
                        </span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Scheduled Days</span>
                        <span className="stat-value">{weeklyStats.scheduledDays}/7</span>
                    </div>
                </div>
            </div>

            {/* Calendar View */}
            <div className="calendar-view">
                <div className="calendar-header">
                    <button onClick={() => setSelectedWeek(addDays(selectedWeek, -7))}>
                        ← Previous Week
                    </button>
                    <h3>{format(selectedWeek, 'MMMM yyyy')}</h3>
                    <button onClick={() => setSelectedWeek(addDays(selectedWeek, 7))}>
                        Next Week →
                    </button>
                </div>

                <div className="calendar-grid">
                    {getWeekDays().map((day, idx) => {
                        const daySchedules = getDailySchedules(day);
                        const utilization = calculateDailyUtilization(day);

                        return (
                            <motion.div
                                key={idx}
                                className={`calendar-day ${utilization.overCapacity ? 'over-capacity' : ''}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <div className="day-header">
                                    <span className="day-name">{format(day, 'EEE')}</span>
                                    <span className="day-date">{format(day, 'dd')}</span>
                                </div>

                                <div className="day-utilization">
                                    <div className="utilization-bar">
                                        <div
                                            className="utilization-fill"
                                            style={{
                                                width: `${Math.min(utilization.utilization, 100)}%`,
                                                background: utilization.overCapacity ? '#ef4444' : '#6366f1'
                                            }}
                                        />
                                    </div>
                                    <span className="utilization-text">
                                        {utilization.planned.toFixed(0)}/{utilization.capacity} kg
                                    </span>
                                </div>

                                <div className="day-schedules">
                                    {daySchedules.map(schedule => (
                                        <div
                                            key={schedule.id}
                                            className="schedule-item"
                                            style={{ borderLeftColor: getPriorityColor(schedule.priority) }}
                                            onClick={() => setEditingSchedule({ ...schedule })}
                                        >
                                            <div className="schedule-item-header">
                                                <span className="schedule-item-name">{schedule.item}</span>
                                                <span className="schedule-item-qty">{schedule.targetQuantity} kg</span>
                                            </div>
                                            <div className="schedule-item-meta">
                                                <span className="schedule-shift">{schedule.shift}</span>
                                                <span className="schedule-workers">{schedule.assignedWorkers} workers</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Add Schedule Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <motion.div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                    >
                        <div className="modal-header">
                            <h2>New Production Schedule</h2>
                            <button onClick={() => setShowAddModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Date *</label>
                                    <input
                                        type="date"
                                        value={newSchedule.date}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, date: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Item *</label>
                                    <input
                                        type="text"
                                        placeholder="Product name"
                                        value={newSchedule.item}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, item: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Target Quantity (kg) *</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={newSchedule.targetQuantity}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, targetQuantity: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Assigned Workers</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={newSchedule.assignedWorkers}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, assignedWorkers: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Priority</label>
                                    <select
                                        value={newSchedule.priority}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, priority: e.target.value })}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Shift</label>
                                    <select
                                        value={newSchedule.shift}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, shift: e.target.value })}
                                    >
                                        <option value="day">Day Shift</option>
                                        <option value="night">Night Shift</option>
                                        <option value="both">Both Shifts</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Notes</label>
                                <textarea
                                    placeholder="Additional notes..."
                                    value={newSchedule.notes}
                                    onChange={(e) => setNewSchedule({ ...newSchedule, notes: e.target.value })}
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowAddModal(false)}>
                                Cancel
                            </button>
                            <button className="btn-primary" onClick={handleAddSchedule}>
                                <Save size={18} /> Save Schedule
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Edit Schedule Modal */}
            {editingSchedule && (
                <div className="modal-overlay" onClick={() => setEditingSchedule(null)}>
                    <motion.div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                    >
                        <div className="modal-header">
                            <h2>Edit Schedule</h2>
                            <button onClick={() => setEditingSchedule(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Date</label>
                                    <input
                                        type="date"
                                        value={editingSchedule.date}
                                        onChange={(e) => setEditingSchedule({ ...editingSchedule, date: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select
                                        value={editingSchedule.status}
                                        onChange={(e) => setEditingSchedule({ ...editingSchedule, status: e.target.value })}
                                    >
                                        <option value="scheduled">Scheduled</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                        <option value="delayed">Delayed</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Target Quantity (kg)</label>
                                    <input
                                        type="number"
                                        value={editingSchedule.targetQuantity}
                                        onChange={(e) => setEditingSchedule({ ...editingSchedule, targetQuantity: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Priority</label>
                                    <select
                                        value={editingSchedule.priority}
                                        onChange={(e) => setEditingSchedule({ ...editingSchedule, priority: e.target.value })}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Notes</label>
                                <textarea
                                    value={editingSchedule.notes}
                                    onChange={(e) => setEditingSchedule({ ...editingSchedule, notes: e.target.value })}
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-danger" onClick={() => handleDeleteSchedule(editingSchedule.id)}>
                                <Trash2 size={18} /> Delete
                            </button>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn-secondary" onClick={() => setEditingSchedule(null)}>
                                    Cancel
                                </button>
                                <button className="btn-primary" onClick={handleUpdateSchedule}>
                                    <Save size={18} /> Update
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default ProductionScheduler;
