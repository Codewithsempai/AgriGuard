import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon, Plus, CheckCircle2, Clock, AlertTriangle,
  Filter, Trash2, Edit2, Check
} from 'lucide-react';
import { api } from '../services/api';
import type { Task, Crop } from '../types';
import { Modal } from '../components/Modal';
import { EmptyState, LoadingSkeleton } from '../components/EmptyState';
import { useLanguage } from '../context/LanguageContext';

export const Calendar: React.FC = () => {
  const { t, language } = useLanguage();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form State
  const [cropId, setCropId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [taskType, setTaskType] = useState<'sowing' | 'irrigation' | 'fertilization' | 'pest_inspection' | 'harvesting' | 'other'>('irrigation');
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const taskTypes = [
    { value: 'sowing', label: 'Sowing / Planting (விதைப்பு)' },
    { value: 'irrigation', label: 'Irrigation (நீர்ப்பாசனம்)' },
    { value: 'fertilization', label: 'Fertilization (உரமிடல்)' },
    { value: 'pest_inspection', label: 'Pest & Disease Scouting (பூச்சி ஆய்வு)' },
    { value: 'harvesting', label: 'Harvesting (அறுவடை)' },
    { value: 'other', label: 'Maintenance / Other (பராமரிப்பு)' },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [taskRes, cropRes] = await Promise.all([
        api.getTasks(),
        api.getCrops(),
      ]);
      setTasks(taskRes.items);
      setCrops(cropRes.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingTask(null);
    setCropId(crops.length > 0 ? crops[0].id : '');
    setTitle('');
    setTaskType('irrigation');
    setDueDate(new Date().toISOString().slice(0, 10));
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (t: Task) => {
    setEditingTask(t);
    setCropId(t.crop_id || '');
    setTitle(t.title);
    setTaskType(t.task_type);
    setDueDate(t.due_date);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleToggle = async (id: number) => {
    try {
      await api.toggleTask(id);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    const payload = {
      crop_id: cropId ? Number(cropId) : null,
      title,
      task_type: taskType,
      due_date: dueDate,
      completed: editingTask ? editingTask.completed : false,
    };

    try {
      if (editingTask) {
        await api.updateTask(editingTask.id, payload);
      } else {
        await api.createTask(payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Failed to save task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Delete this scheduled activity?')) {
      try {
        await api.deleteTask(id);
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const todayStr = new Date().toISOString().slice(0, 10);

  const filteredTasks = tasks.filter((t) => {
    const isOverdue = !t.completed && t.due_date < todayStr;
    if (filterType !== 'all' && t.task_type !== filterType) return false;
    if (filterStatus === 'pending' && t.completed) return false;
    if (filterStatus === 'completed' && !t.completed) return false;
    if (filterStatus === 'overdue' && !isOverdue) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('nav_calendar')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {language === 'ta'
              ? 'விதைப்பு, பாசனம், உரமிடல் மற்றும் பூச்சி ஆய்வு பணிகளை திட்டமிடுங்கள்'
              : 'Organize and track critical farm operations, irrigation schedules, and pesticide sprays.'}
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 px-4 py-2.5 text-sm font-semibold shadow-sm transition self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>{language === 'ta' ? 'புதிய பணி சேர்க்க' : 'Schedule Farm Task'}</span>
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        {(['all', 'pending', 'overdue', 'completed'] as const).map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
              filterStatus === st
                ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                : 'border border-zinc-200 bg-white/80 text-zinc-600 hover:bg-zinc-100 dark:border-white/10 dark:bg-zinc-900/80 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            {st}
          </button>
        ))}

        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-zinc-500 dark:focus:border-zinc-400 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        >
          <option value="all">All Activity Types</option>
          {taskTypes.map((tt) => (
            <option key={tt.value} value={tt.value}>{tt.label}</option>
          ))}
        </select>
      </div>

      {/* Task List */}
      {loading ? (
        <LoadingSkeleton count={4} height="h-20" />
      ) : filteredTasks.length > 0 ? (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const crop = crops.find((c) => c.id === task.crop_id);
            const isOverdue = !task.completed && task.due_date < todayStr;

            return (
              <div
                key={task.id}
                className={`rounded-2xl border p-4 shadow-xs transition glass-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isOverdue
                    ? 'border-amber-300 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20'
                    : 'border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3">
                  <button
                    onClick={() => handleToggle(task.id)}
                    className={`mt-0.5 sm:mt-0 h-6 w-6 rounded-lg flex items-center justify-center border transition shrink-0 ${
                      task.completed
                        ? 'bg-zinc-950 border-zinc-950 text-white dark:bg-white dark:border-white dark:text-zinc-950'
                        : 'border-zinc-300 hover:border-zinc-600 text-transparent dark:border-zinc-700 dark:hover:border-zinc-400'
                    }`}
                    title={task.completed ? 'Mark pending' : 'Mark completed'}
                  >
                    <Check className="h-4 w-4" />
                  </button>

                  <div>
                    <h3 className={`text-sm font-bold ${task.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                      {task.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="h-3 w-3" />
                        Due {task.due_date}
                      </span>
                      {crop && (
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                          • {crop.name}
                        </span>
                      )}
                      <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.2 capitalize text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                        {task.task_type.replace('_', ' ')}
                      </span>
                      {isOverdue && (
                        <span className="rounded-md bg-amber-100 dark:bg-amber-950 px-2 py-0.2 text-[10px] font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Overdue</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => openEditModal(task)}
                    className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={CalendarIcon}
          title="No farm tasks found"
          description="Schedule irrigation cycles, spray windows, or harvest deadlines"
          actionText="Add Task"
          onAction={openAddModal}
        />
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Edit Farm Task' : 'Schedule New Farm Task'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Task Title / பணி *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-zinc-500 dark:focus:border-zinc-400 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              placeholder="e.g. Apply drip fertigation to tomato plot"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Activity Type *
            </label>
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value as any)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-zinc-500 dark:focus:border-zinc-400 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {taskTypes.map((tt) => (
                <option key={tt.value} value={tt.value}>{tt.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Linked Crop (Optional)
              </label>
              <select
                value={cropId}
                onChange={(e) => setCropId(e.target.value ? Number(e.target.value) : '')}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-zinc-500 dark:focus:border-zinc-400 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="">-- General Farm Task --</option>
                {crops.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Due Date *
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-zinc-500 dark:focus:border-zinc-400 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 px-4 py-2 text-sm font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Saving...' : 'Save Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
