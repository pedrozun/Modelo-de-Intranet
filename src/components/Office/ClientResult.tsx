import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface ClientResultProps {
  clientName: string;
  onClose: () => void;
}

export function ClientResult({ clientName, onClose }: ClientResultProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex top-[-23px] items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-sm overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-green-100 dark:border-green-900"
      >
        {/* Header with icon */}
        <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center gap-3">
          <div className="bg-green-100 dark:bg-green-900/50 rounded-full p-2">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
            Cliente cadastrado com sucesso
          </h3>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-600">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Cliente:
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {clientName}
            </span>
          </div>

          {/* Actions */}
          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-gray-50 to-gray-100 
                hover:from-gray-100 hover:to-gray-200 dark:from-gray-700 dark:to-gray-800 
                dark:hover:from-gray-600 dark:hover:to-gray-700 
                text-gray-700 dark:text-gray-200 font-medium rounded-lg 
                transition-all duration-200 border border-gray-200 dark:border-gray-600
                shadow-sm hover:shadow"
            >
              Fechar
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
