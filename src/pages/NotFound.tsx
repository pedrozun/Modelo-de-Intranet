import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, AlertCircle } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-block p-6 bg-red-100 dark:bg-red-900/30 rounded-full"
        >
          <AlertCircle className="w-16 h-16 text-red-500 dark:text-red-400" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
            Página não encontrada
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            A página que você está procurando não existe ou foi movida.
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg
                    hover:bg-blue-600 transition-colors duration-200"
        >
          <Home className="w-5 h-5" />
          Voltar para o início
        </motion.button>
      </motion.div>
    </div>
  );
}