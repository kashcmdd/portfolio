import React, { useId, useMemo } from 'react';
import type { Architecture, ArchNode } from '../types';

interface Layout {
  x: number;
  y: number;
  node: ArchNode;
}

/**
 * Fixed-coordinate layout instead of a measured one.
 *
 * The alternative is reading getBoundingClientRect after paint and redrawing,
 * which means the diagram is blank for a frame, jumps on every resize, and
 * cannot be rendered to a string for the static pages. Coordinates are computed
 * from the viewBox instead, so one pass produces a complete, deterministic
 * picture that scales with the container.
 */
const NODE_W = 176;
const NODE_H = 58;
const LAYER_H = 104;
const PAD_TOP = 14;
const EDGE_GAP = 30;

const layoutNodes = (arch: Architecture): Layout[] =>
  arch.nodes.map((node) => {
    const siblings = arch.nodes.filter((n) => n.layer === node.layer);
    const index = siblings.findIndex((n) => n.id === node.id);
    const count = siblings.length;
    // Widest row defines the usable width; narrower rows stay centred in it.
    const widest = Math.max(...arch.layers.map((_, layer) =>
      arch.nodes.filter((n) => n.layer === layer).length
    ));
    const rowWidth = widest * NODE_W + (widest - 1) * EDGE_GAP;
    const rowWidthHere = count * NODE_W + (count - 1) * EDGE_GAP;
    const startX = (rowWidth - rowWidthHere) / 2;
    return {
      node,
      x: startX + index * (NODE_W + EDGE_GAP) + NODE_W / 2,
      y: PAD_TOP + node.layer * LAYER_H + NODE_H / 2,
    };
  });

export const ArchitectureDiagram: React.FC<{ arch: Architecture }> = ({ arch }) => {
  const uid = useId().replace(/:/g, '');
  const layout = useMemo(() => layoutNodes(arch), [arch]);
  const byId = useMemo(() => new Map(layout.map((l) => [l.node.id, l])), [layout]);
  const width = Math.max(
    320,
    Math.max(...arch.layers.map((_, layer) =>
      arch.nodes.filter((n) => n.layer === layer).length
    )) * (NODE_W + EDGE_GAP) - EDGE_GAP + 32
  );
  const height = PAD_TOP * 2 + arch.layers.length * LAYER_H - (LAYER_H - NODE_H) + 8;

  return (
    <div className="w-full">
      {/*
        A row of five nodes is ~1000px wide. Scaling that into a phone-width
        modal renders the labels at about 4px, so the diagram keeps a legible
        minimum width and scrolls sideways instead. The scroll container is
        focusable so the same content is reachable without a pointer.
      */}
      <div
        className="overflow-x-auto pb-1 -mx-1 px-1"
        tabIndex={0}
        role="group"
        aria-label="Diagram, scrollable horizontally"
      >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto max-w-none"
        style={{ minWidth: Math.min(width, 640), width: '100%' }}
        role="img"
        aria-label={arch.summary}
      >
        <defs>
          <marker
            id={`arrow-${uid}`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 9 5 L 0 9 z" fill="currentColor" className="text-neutral-600" />
          </marker>
        </defs>

        {/* Layer bands sit behind everything so the eye reads top to bottom. */}
        {arch.layers.map((layer, i) => {
          const y = PAD_TOP + i * LAYER_H;
          return (
            <g key={layer.title}>
              <rect
                x={0}
                y={y}
                width={width}
                height={LAYER_H - 14}
                rx={10}
                className={i % 2 === 0 ? 'fill-white/[0.02]' : 'fill-transparent'}
              />
              <text
                x={10}
                y={y + 14}
                className="fill-neutral-500 font-body"
                style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}
              >
                {layer.title}
              </text>
            </g>
          );
        })}

        {/* Edges first so the node boxes paint over the arrowheads. */}
        <g>
          {arch.edges.map((edge) => {
            const from = byId.get(edge.from);
            const to = byId.get(edge.to);
            if (!from || !to) return null;
            const x1 = from.x;
            const y1 = from.y + NODE_H / 2;
            const x2 = to.x;
            const y2 = to.y - NODE_H / 2;
            /*
             * Orthogonal, with the bend in the gap directly under the source.
             *
             * A curve bending at the halfway point drifts sideways through the
             * layer below, and when it passes behind one of those boxes it
             * reads as if it connected to that box instead of the one it is
             * aimed at. Bending at y1 + 18 keeps the horizontal run inside the
             * 46px inter-layer gap, where there is nothing to cross, and the
             * rest of the route is a straight vertical. Every edge in the data
             * lands on an x that is either the target's own column or a gap
             * between columns, so no line passes through an unrelated node.
             */
            const bend = y1 + 18;
            return (
              <g key={`${edge.from}->${edge.to}`}>
                <path
                  d={`M ${x1} ${y1} L ${x1} ${bend} L ${x2} ${bend} L ${x2} ${y2}`}
                  fill="none"
                  strokeWidth={1.25}
                  className="stroke-neutral-700"
                  markerEnd={`url(#arrow-${uid})`}
                />
                {edge.label && (
                  <text
                    x={(x1 + x2) / 2}
                    y={bend - 5}
                    textAnchor="middle"
                    className="fill-neutral-500 font-body"
                    style={{ fontSize: 10 }}
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* Nodes */}
        <g>
          {layout.map(({ x, y, node }) => (
            <g key={node.id}>
              <rect
                x={x - NODE_W / 2}
                y={y - NODE_H / 2}
                width={NODE_W}
                height={NODE_H}
                rx={9}
                className="fill-[#150f22] stroke-white/15"
                strokeWidth={1}
              />
              <text
                x={x}
                y={node.detail ? y - 3 : y + 4}
                textAnchor="middle"
                className="fill-white font-body"
                style={{ fontSize: 12.5, fontWeight: 500 }}
              >
                {node.label}
              </text>
              {node.detail && (
                <text
                  x={x}
                  y={y + 14}
                  textAnchor="middle"
                  className="fill-neutral-500 font-body"
                  style={{ fontSize: 10.5 }}
                >
                  {node.detail}
                </text>
              )}
            </g>
          ))}
        </g>
      </svg>
      </div>

      {/*
        The same information as text. A diagram is the one thing on this site
        that cannot degrade gracefully, so the equivalent description is always
        present rather than hidden behind a hover.
      */}
      <details className="mt-4 group">
        <summary className="text-xs text-white/60 hover:text-white transition-colors cursor-pointer list-none inline-flex items-center gap-1.5">
          <span className="group-open:rotate-90 transition-transform" aria-hidden="true">
            &rsaquo;
          </span>
          Read as text
        </summary>
        <div className="mt-2.5 space-y-3 text-xs text-white/70 leading-relaxed">
          <p>{arch.summary}</p>
          <ol className="space-y-2">
            {arch.layers.map((layer, i) => {
              const nodes = arch.nodes.filter((n) => n.layer === i);
              if (nodes.length === 0) return null;
              return (
                <li key={layer.title}>
                  <span className="text-white/90 font-medium">{layer.title}</span>
                  <span className="text-white/50"> &mdash; </span>
                  {nodes.map((n, idx) => (
                    <React.Fragment key={n.id}>
                      {idx > 0 && <span className="text-white/50">, </span>}
                      {n.label}
                      {n.detail && <span className="text-white/50"> ({n.detail})</span>}
                    </React.Fragment>
                  ))}
                </li>
              );
            })}
          </ol>
          {arch.edges.length > 0 && (
            <p className="text-white/60">
              <span className="text-white/90">Flow: </span>
              {arch.edges
                .map((e) => {
                  const from = arch.nodes.find((n) => n.id === e.from)?.label ?? e.from;
                  const to = arch.nodes.find((n) => n.id === e.to)?.label ?? e.to;
                  return `${from} to ${to}${e.label ? ` (${e.label})` : ''}`;
                })
                .join('; ')}
              .
            </p>
          )}
        </div>
      </details>
    </div>
  );
};
