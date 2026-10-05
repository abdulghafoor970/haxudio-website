import React, { useState } from 'react';
import { PROCESS_STEPS } from '../data/process';
import { CheckCircle2, Clock, Users } from 'lucide-react';

export default function ProcessTimeline() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const activeStep = PROCESS_STEPS[activeStepIndex];

  return (
    <div className="space-y-12">
      {/* Horizontal Step Tabs / Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 border-b border-[#121316]/10 pb-4">
        {PROCESS_STEPS.map((item, idx) => {
          const isSelected = activeStepIndex === idx;
          return (
            <button
              key={item.number}
              onClick={() => setActiveStepIndex(idx)}
              className={`text-left p-3 rounded-md transition-all duration-200 ${
                isSelected
                  ? 'bg-[#121316] text-[#FAF8F5] shadow-sm'
                  : 'bg-white hover:bg-neutral-100 text-[#121316] border border-neutral-200/80'
              }`}
            >
              <span className={`block font-mono text-xs font-semibold ${isSelected ? 'text-[#C25E34]' : 'text-[#666461]'}`}>
                {item.number}
              </span>
              <span className="block font-display text-sm font-bold truncate">
                {item.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Step Detailed Card */}
      <div className="bg-white border border-[#121316]/10 rounded-lg p-6 sm:p-10 shadow-sm transition-all duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Summary & Narrative (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs px-2.5 py-1 bg-[#121316] text-white rounded font-medium">
                Step {activeStep.number} of 07
              </span>
              <div className="flex items-center gap-1.5 text-xs text-[#666461]">
                <Clock className="w-3.5 h-3.5" />
                <span>Estimated Time: {activeStep.timeline}</span>
              </div>
            </div>

            <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#121316] tracking-tight">
              {activeStep.title}
            </h3>

            <p className="text-base text-[#121316] font-medium leading-relaxed">
              {activeStep.summary}
            </p>

            <p className="text-sm text-[#666461] leading-relaxed">
              {activeStep.details}
            </p>

            <div className="p-4 bg-[#FAF8F5] rounded-md border border-neutral-200 flex items-start gap-3">
              <Users className="w-4 h-4 text-[#C25E34] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-[#121316] mb-0.5">
                  Client Collaboration Role
                </p>
                <p className="text-xs text-[#666461] leading-relaxed">
                  {activeStep.clientRole}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Key Deliverables (5 cols) */}
          <div className="lg:col-span-5 bg-[#FAF8F5] border border-neutral-200 p-6 rounded-lg space-y-4">
            <h4 className="text-xs uppercase tracking-wider text-[#121316] font-semibold">
              Step {activeStep.number} Milestones & Deliverables
            </h4>
            <div className="space-y-3">
              {activeStep.deliverables.map((deliv) => (
                <div key={deliv} className="flex items-start gap-2.5 text-xs text-[#121316]">
                  <CheckCircle2 className="w-4 h-4 text-[#C25E34] shrink-0 mt-0.5" />
                  <span className="leading-snug">{deliv}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-neutral-200 flex items-center justify-between text-xs text-[#666461]">
              <span>Next Phase:</span>
              <span className="font-semibold text-[#121316]">
                {PROCESS_STEPS[(activeStepIndex + 1) % PROCESS_STEPS.length].name} →
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
