'use client';

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export default function TextReveal({
  text,
  tag = 'h2',
  className = '',
  delay = 0,
  stagger = 0.035,
  duration = 0.5,
  once = true,
  amount = 0.15,
  priority = false,
}) {
  const shouldReduceMotion = useReducedMotion();
  const Tag = tag;
  const isLcpPriority = priority || tag === 'h1';

  if (shouldReduceMotion) {
    return <Tag className={className}>{text}</Tag>;
  }

  const words = typeof text === 'string' ? text.split(' ') : [text];

  const containerVariants = {
    hidden: { opacity: isLcpPriority ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const wordVariants = {
    hidden: {
      y: isLcpPriority ? 0 : 16,
      opacity: isLcpPriority ? 1 : 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <Tag className={className}>
      <motion.span
        className="inline-block"
        variants={containerVariants}
        initial={isLcpPriority ? "visible" : "hidden"}
        animate={isLcpPriority ? "visible" : undefined}
        whileInView={isLcpPriority ? undefined : "visible"}
        viewport={isLcpPriority ? undefined : { once, amount: typeof amount === 'number' ? amount : 0.15 }}
      >
        {words.map((word, i) => (
          <span key={i} className="inline-block overflow-hidden mr-[0.25em] align-top">
            <motion.span className="inline-block" variants={wordVariants}>
              {word}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}
