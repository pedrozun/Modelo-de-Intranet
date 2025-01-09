import React from 'react';
import { AlertCircle } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 top-[-23px] rounded-2xl bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Confirmar Cancelamento
          </h3>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Tem certeza que deseja cancelar esta reunião? Esta ação não pode ser
          desfeita.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 
                     dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 
                     transition-colors"
          >
            Confirmar Cancelamento
          </button>
        </div>
      </div>
    </div>
  );
}
