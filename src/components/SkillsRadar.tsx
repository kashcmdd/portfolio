import React, { useId } from 'react';
import { motion } from 'motion/react';
import type { TechSkill } from '../types';

// Self-assessed levels are ordinal words, not numbers, so the chart needs one
// explicit mapping to have anything to plot. These weights are the only place
// that judgement lives; everything else reads off the real skill records.
const LEVEL_SCORE: Record<string, number> = {
  Expert: 92,
  Advanced: 72,
  Proficient: 52,
};

export { LEVEL_SCORE };

export interface RadarAxis {
  label: string;
  score: number;
  total: number;
}

export const categoryScores = (skills: TechSkill[]): RadarAxis[] =>
  Array.from(new Set(skills.map((s) => s.category))).map((category) => {
    const inCategory = skills.filter((s) => s.category === category);
    const total = inCategory.length;
    const sum = inCategory.reduce(
      (acc, s) => acc + (LEVEL_SCORE[s.level] ?? 0),
      0
    );
    return { label: category, score: total ? Math.round(sum / total) : 0, total };
  });

const SIZE = 320;
const CENTER = SIZE / 2;
const MAX_R = 118;

const angleFor = (index: number, count: number) =>
  (Math.PI * 2 * index) / count - Math.PI / 2;

const pointFor = (index: number, count: number, radius: number) => {
  const angle = angleFor(index, count);
  return {
    x: CENTER + radius * Math.cos(angle),
    y: CENTER + radius * Math.sin(angle),
  };
};

const ringPath = (count: number, ratio: number) =>
  Array.from({ length: count }, (_, i) => {
    const p = pointFor(i, count, MAX_R * ratio);
    return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
  }).join(' ');

const SkillsRadar: React.FC<{ skills: TechSkill[] }> = ({ skills }) => {
  const titleId = useId();
  const descId = useId();

  const axes = categoryScores(skills);
  const count = axes.length;

  const dataPath = axes
    .map((axis, i) => {
      const p = pointFor(i, count, (axis.score / 100) * MAX_R);
      return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
    })
    .join(' ');

  const summary = axes
    .map((a) => `${a.label} ${a.score} out of 100 across ${a.total} tools`)
    .join(', ');

  return (
    <div className="liquid-glass rounded-3xl border border-white/10 p-5 sm:p-6 mb-8">
      <h3 className="text-xs font-body uppercase tracking-[0.25em] text-neutral-400 mb-1">
        Proficiency index
      </h3>
      <p className="text-xs font-body text-neutral-500 mb-4 max-w-md">
        Each axis is the average self-assessed level of that category, weighted
        by how many tools it holds.
      </p>

      <div className="flex justify-center">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="w-full max-w-[340px] h-auto overflow-visible"
          role="img"
          aria-labelledby={`${titleId} ${descId}`}
        >
          <title id={titleId}>Proficiency index by technology category</title>
          <desc id={descId}>{summary}.</desc>

          {/* Grid rings at 25/50/75/100% */}
          {[0.25, 0.5, 0.75, 1].map((ratio) => (
            <polygon
              key={ratio}
              points={ringPath(count, ratio)}
              fill="none"
              stroke="currentColor"
              className="text-white/10"
              strokeWidth={1}
            />
          ))}

          {/* Spokes */}
          {axes.map((axis, i) => {
            const p = pointFor(i, count, MAX_R);
            return (
              <line
                key={axis.label}
                x1={CENTER}
                y1={CENTER}
                x2={p.x}
                y2={p.y}
                stroke="currentColor"
                className="text-white/10"
                strokeWidth={1}
              />
            );
          })}

          {/* The plotted shape. Scaling from the centre is what makes it read as
              growing out of the middle rather than sliding in from a corner. */}
          <motion.polygon
            points={dataPath}
            fill="rgba(137, 170, 204, 0.18)"
            stroke="#89AACC"
            strokeWidth={2}
            strokeLinejoin="round"
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}
          />

          {axes.map((axis, i) => {
            const p = pointFor(i, count, (axis.score / 100) * MAX_R);
            return (
              <motion.circle
                key={axis.label}
                cx={p.x}
                cy={p.y}
                r={3.5}
                fill="#89AACC"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.08 }}
              />
            );
          })}

          {/* Axis labels. They sit outside the viewBox via overflow-visible, so
              the chart can stay a predictable square. */}
          {axes.map((axis, i) => {
            const p = pointFor(i, count, MAX_R + 26);
            const anchor =
              Math.abs(p.x - CENTER) < 6 ? 'middle' : p.x > CENTER ? 'start' : 'end';
            return (
              <text
                key={axis.label}
                x={p.x}
                y={p.y}
                textAnchor={anchor}
                dominantBaseline="middle"
                className="fill-neutral-400 font-body"
                style={{ fontSize: 11 }}
              >
                {axis.label}
                <tspan x={p.x} dy={13} className="fill-[#89AACC]">
                  {axis.score}
                </tspan>
              </text>
            );
          })}
        </svg>
      </div>

      {/* The same numbers as text. A radar shape is meaningless to a screen
          reader, so the data is not left to the drawing. */}
      <table className="sr-only">
        <caption>Proficiency index by technology category</caption>
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col">Index</th>
            <th scope="col">Tools</th>
          </tr>
        </thead>
        <tbody>
          {axes.map((axis) => (
            <tr key={axis.label}>
              <th scope="row">{axis.label}</th>
              <td>{axis.score}</td>
              <td>{axis.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SkillsRadar;
