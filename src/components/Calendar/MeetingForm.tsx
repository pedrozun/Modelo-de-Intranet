import React from 'react';
import { format } from 'date-fns';
import { X } from 'lucide-react';

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface MeetingFormProps {
  selectedDate: Date;
  formData: {
    startTime: string;
    endTime: string;
  };
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
  availableTimeSlots: TimeSlot[];
}

export function MeetingForm({
  selectedDate,
  formData,
  onSubmit,
  onChange,
  onClose,
  availableTimeSlots,
}: MeetingFormProps) {
  return (
    <div className="fixed inset-0 top-[-23px] rounded-2xl bg-black/50 rounded-2xl dark:bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Nova Reunião
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data
            </label>
            <input
              type="text"
              value={format(selectedDate, 'dd/MM/yyyy')}
              disabled
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hora Início
              </label>
              <select
                name="startTime"
                value={formData.startTime}
                onChange={onChange as any}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Selecione</option>
                {availableTimeSlots.map((slot, index) => (
                  <option key={index} value={slot.startTime}>
                    {slot.startTime}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hora Fim
              </label>
              <select
                name="endTime"
                value={formData.endTime}
                onChange={onChange as any}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Selecione</option>
                {availableTimeSlots
                  .filter((slot) => slot.startTime > formData.startTime)
                  .map((slot, index) => (
                    <option key={index} value={slot.endTime}>
                      {slot.endTime}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600
                       transition-colors duration-200 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              Agendar Reunião
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
