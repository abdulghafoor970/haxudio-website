'use client';

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export default function ImageReveal({
  src,
  alt = '',
  className = '',
  containerClassName = '',
  aspectRatio = '',
  delay = 0,
  duration = 0.65,
  once = true,
  amount = 0.15,
  loading = 'lazy',
  children,
  ...props
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div className={`overflow-hidden relative ${containerClassName} ${aspectRatio}`} {...props}>
        <img src={src} alt={alt} className={className} loading={loading} />
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once, amount: typeof amount === 'number' ? amount : 0.15 }}
      transition={{ duration: 0.45, delay }}
      className={`overflow-hidden relative group ${containerClassName} ${aspectRatio}`}
      {...props}
    >
      <motion.img
        src={src}
        alt={alt}
        loading={loading}
        initial={{ scale: 1.08, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once, amount: typeof amount === 'number' ? amount : 0.15 }}
        transition={{
          duration,
          delay: delay + 0.05,
          ease: [0.16, 1, 0.3, 1],
        }}
        className={`w-full h-full object-cover transform-gpu ${className}`}
      />
      {children}
    </motion.div>
  );
}
