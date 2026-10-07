'use client';

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export function StaggerContainer({
  children,
  stagger = 0.08,
  delay = 0,
  className = '',
  once = true,
  amount = 0.15,
  ...props
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div className={className} {...props}>
        {children}
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 'some' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = '',
  distance = 18,
  duration = 0.45,
  scale = 1,
  ...props
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div className={className} {...props}>
        {children}
      </div>
    );
  }

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: distance,
      scale: scale !== 1 ? scale : 1,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <motion.div
      variants={itemVariants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
