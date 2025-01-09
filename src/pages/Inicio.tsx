import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';
import { welcomeMessage, getTimeBasedGreeting } from '../data/welcomeMessage';

export function Inicio() {
  const { user } = useAuth();
  const username = user?.username || 'Visitante';

  // Format username to capitalize first letter of each word
  const formattedName = username
    .split('.')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
      },
    },
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 overflow-hidden">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Greeting */}
        <motion.div variants={itemVariants} className="space-y-2">
          <h2 className="text-xl text-gray-600 dark:text-gray-400">
            {getTimeBasedGreeting()},
          </h2>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {formattedName}
          </h1>
        </motion.div>

        {/* Welcome Message */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 space-y-6" // Ajuste o padding
        >
          <h3 className="text-2xl font-semibold text-blue-600 dark:text-blue-400 leading-relaxed">
            {welcomeMessage.title}
          </h3>

          {welcomeMessage.paragraphs.map((paragraph, index) => (
            <motion.p
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    delay: 0.5 + index * 0.2,
                    duration: 0.8,
                  },
                },
              }}
              className="text-gray-600 dark:text-gray-300 leading-relaxed"
            >
              {paragraph}
            </motion.p>
          ))}

          <motion.div
            variants={{
              hidden: { opacity: 0, scale: 0.8 },
              visible: {
                opacity: 1,
                scale: 1,
                transition: { delay: 1.5, duration: 0.5 },
              },
            }}
            className="pt-6 border-t border-gray-200 dark:border-gray-700"
          >
            <p className="text-right text-gray-800 dark:text-gray-200 font-medium">
              {welcomeMessage.signature}
            </p>
          </motion.div>
        </motion.div>

        {/* Navigation Hint */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { delay: 2, duration: 0.5 },
            },
          }}
          className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Explore o menu lateral para acessar todos os recursos</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
