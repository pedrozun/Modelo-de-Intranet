import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getAuthToken } from '../../services/authService';

interface TasksData {
  tasks: string[];
  completedTasks: string[];
  isWeekend: boolean;
  dayName: string;
}

export function TasksPage() {
  const [tasksData, setTasksData] = useState<TasksData | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks/today', {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();
      setTasksData(data);
    } catch (error) {
      setError('Failed to load tasks. Please try again later.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskSelection = (task: string) => {
    setSelectedTasks(prev =>
      prev.includes(task)
        ? prev.filter(t => t !== task)
        : [...prev, task]
    );
  };

  const handleSelectAll = () => {
    if (!tasksData) return;
    
    const incompleteTasks = tasksData.tasks.filter(
      task => !tasksData.completedTasks.includes(task)
    );
    
    setSelectedTasks(
      selectedTasks.length === incompleteTasks.length ? [] : incompleteTasks
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTasks.length === 0) {
      setError('Please select at least one task to mark as completed.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/tasks/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ tasks: selectedTasks }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete tasks');
      }

      // Update local state
      setTasksData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          completedTasks: [...prev.completedTasks, ...selectedTasks],
        };
      });
      setSelectedTasks([]);
    } catch (error) {
      setError('Failed to mark tasks as completed. Please try again.');
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const allTasksCompleted = tasksData?.tasks.every(task =>
    tasksData.completedTasks.includes(task)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-700 dark:text-white flex items-center gap-2">
          <ClipboardList className="h-8 w-8" />
          Tarefas de Hoje
        </h1>
        <h2 className="text-xl font-medium text-gray-600 dark:text-gray-300">
          {tasksData?.dayName}
        </h2>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg flex items-center gap-2"
        >
          <AlertCircle className="h-5 w-5" />
          {error}
        </motion.div>
      )}

      {tasksData?.isWeekend ? (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
          <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300">
            Final de semana: sem tarefas programadas.
          </h2>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {!allTasksCompleted && tasksData?.tasks.length > 0 && (
            <button
              type="button"
              onClick={handleSelectAll}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg
                       hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {selectedTasks.length === tasksData?.tasks.filter(
                task => !tasksData.completedTasks.includes(task)
              ).length
                ? 'Desmarcar todas as tarefas'
                : 'Marcar todas as tarefas'}
            </button>
          )}

          <div className="space-y-2">
            {tasksData?.tasks.map((task, index) => {
              const isCompleted = tasksData.completedTasks.includes(task);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg transition-all ${
                    isCompleted
                      ? 'bg-green-50 dark:bg-green-900/30'
                      : 'bg-white dark:bg-gray-800'
                  }`}
                >
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isCompleted || selectedTasks.includes(task)}
                      onChange={() => handleTaskSelection(task)}
                      disabled={isCompleted}
                      className="form-checkbox h-5 w-5 text-blue-600 transition duration-150 ease-in-out"
                    />
                    <span
                      className={`flex-1 ${
                        isCompleted
                          ? 'text-green-700 dark:text-green-400'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {task}
                    </span>
                    {isCompleted && (
                      <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                        <CheckCircle2 className="h-5 w-5" />
                        Concluída
                      </span>
                    )}
                  </label>
                </motion.div>
              );
            })}
          </div>

          {!allTasksCompleted && tasksData?.tasks.length > 0 && (
            <motion.button
              type="submit"
              disabled={submitting || selectedTasks.length === 0}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200
                       ${
                         submitting || selectedTasks.length === 0
                           ? 'bg-gray-400 dark:bg-gray-700 cursor-not-allowed'
                           : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
                       }
                       text-white shadow-lg`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {submitting ? 'Enviando...' : 'Marcar como concluídas'}
            </motion.button>
          )}

          {allTasksCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-50 dark:bg-green-900/30 p-6 rounded-lg text-center"
            >
              <h2 className="text-xl font-medium text-green-700 dark:text-green-400 flex items-center justify-center gap-2">
                <CheckCircle2 className="h-6 w-6" />
                Todas as tarefas estão concluídas!
              </h2>
            </motion.div>
          )}
        </form>
      )}
    </div>
  );
}