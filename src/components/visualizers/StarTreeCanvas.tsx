import { useLocale } from '../../context/LocaleContext';
import { BEAM_TREE_DATA, type StarTreeNode } from '../../data/decodingData';
import { evaluateBeamSearch, type EvaluatedBeamPath } from '../../lib/decodingMath';

interface StarTreeCanvasProps {
  mode: 'greedy' | 'beam';
  step: 0 | 1 | 2 | 3;
  beamWidth: number;
}

interface PositionedNode {
  node: StarTreeNode;
  depth: 0 | 1 | 2 | 3;
  x: number;
  y: number;
  parentId?: string;
}

const NODE_COORDS: Record<string, { x: number; y: number; depth: 0 | 1 | 2 | 3 }> = {
  root: { x: 70, y: 215, depth: 0 },
  // Step 1
  'n-nothing': { x: 270, y: 95, depth: 1 },
  'n-a': { x: 270, y: 215, depth: 1 },
  'n-two': { x: 270, y: 315, depth: 1 },
  'n-earth': { x: 270, y: 390, depth: 1 },
  // Step 2
  'n-nothing-at': { x: 520, y: 60, depth: 2 },
  'n-nothing-but': { x: 520, y: 130, depth: 2 },
  'n-a-glowing': { x: 520, y: 195, depth: 2 },
  'n-a-distant': { x: 520, y: 260, depth: 2 },
  'n-two-binary': { x: 520, y: 325, depth: 2 },
  'n-earth-below': { x: 520, y: 390, depth: 2 },
  // Step 3
  'n-nothing-at-all': { x: 775, y: 60, depth: 3 },
  'n-nothing-but-dust': { x: 775, y: 130, depth: 3 },
  'n-a-glowing-nebula': { x: 775, y: 195, depth: 3 },
  'n-a-distant-comet': { x: 775, y: 260, depth: 3 },
  'n-two-binary-suns': { x: 775, y: 325, depth: 3 },
  'n-earth-below-shining': { x: 775, y: 390, depth: 3 },
};

function flattenTree(node: StarTreeNode, parentId?: string): PositionedNode[] {
  const coords = NODE_COORDS[node.id];
  const current: PositionedNode = {
    node,
    depth: coords.depth,
    x: coords.x,
    y: coords.y,
    parentId,
  };
  const children = (node.children ?? []).flatMap((c) => flattenTree(c, node.id));
  return [current, ...children];
}

const ALL_NODES = flattenTree(BEAM_TREE_DATA);

function getNodeState(
  nodeId: string,
  depth: number,
  currentStep: number,
  paths: EvaluatedBeamPath[]
): {
  status: 'unreached' | 'winner' | 'active' | 'pruned';
  cumulativeProb?: number;
} {
  if (depth === 0) return { status: 'winner' };
  if (depth > currentStep) return { status: 'unreached' };

  const matching = paths.filter((p) => p.nodeIds.includes(nodeId));
  if (matching.length === 0) return { status: 'unreached' };

  const winnerMatch = matching.find((p) => p.status === 'winner');
  if (winnerMatch) {
    return { status: 'winner', cumulativeProb: winnerMatch.cumulativeProb };
  }

  const activeMatch = matching.find((p) => p.status === 'active' || p.inTopK);
  if (activeMatch && (currentStep < 3 || depth < 3)) {
    return { status: 'active', cumulativeProb: activeMatch.cumulativeProb };
  }

  const bestMatch = matching[0];
  return { status: 'pruned', cumulativeProb: bestMatch.cumulativeProb };
}

export function StarTreeCanvas({ mode, step, beamWidth }: StarTreeCanvasProps) {
  const { t } = useLocale();
  const effectiveK = mode === 'greedy' ? 1 : beamWidth;
  const paths = evaluateBeamSearch(BEAM_TREE_DATA, effectiveK, step);
  const winningPath = paths.find((p) => p.status === 'winner');

  return (
    <div className="flex flex-col h-full justify-between gap-4">
      {/* Live Transmission Banner */}
      <div
        data-testid="live-transmission-banner"
        className="brutal-border-sm brutal-shadow-sm bg-[#FFFDF7] p-3.5 flex flex-wrap items-center justify-between gap-3"
      >
        <div>
          <span className="font-mono text-[10px] uppercase text-black/60 block">
            {t.ui.liveTransmission}
          </span>
          <div className="font-mono text-xs md:text-sm font-bold flex flex-wrap items-center gap-1.5 mt-0.5">
            <span>"{t.promptPrefix}</span>
            {winningPath && winningPath.tokens.length > 0 ? (
              <span className="inline-flex items-center gap-1 bg-[#FFE600] brutal-border-sm px-2 py-0.5">
                {winningPath.tokens.join(' ')}
              </span>
            ) : (
              <span className="text-black/40">[ ... ]</span>
            )}
            <span>"</span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs font-bold">
          <span
            data-testid="active-k-readout"
            className="bg-black text-[#FFE600] px-2.5 py-1 brutal-border-sm"
          >
            k = {effectiveK}
          </span>
          {winningPath && (
            <span
              className={`px-2.5 py-1 brutal-border-sm ${
                winningPath.cumulativeProb >= 0.2
                  ? 'bg-[#A7F3D0] text-black'
                  : 'bg-[#FF6B6B] text-black'
              }`}
            >
              P = {winningPath.cumulativeProb.toFixed(3)}
            </span>
          )}
        </div>
      </div>

      {/* SVG Star-Token Tree */}
      <div className="brutal-border-sm bg-[#FFFDF7]/95 p-2 overflow-x-auto">
        <svg
          viewBox="0 0 920 445"
          className="w-full h-auto min-w-[680px] select-none"
          role="img"
          aria-label="Star-Token Beam Search Tree"
        >
          {/* Step Column Headers */}
          {[
            { label: t.ui.rootLabel, x: 70 },
            { label: `${t.ui.stepLabel} 1`, x: 270 },
            { label: `${t.ui.stepLabel} 2`, x: 520 },
            { label: `${t.ui.stepLabel} 3`, x: 775 },
          ].map((col, idx) => (
            <g key={col.label}>
              <line
                x1={col.x}
                y1={28}
                x2={col.x}
                y2={425}
                stroke="#000000"
                strokeOpacity={0.12}
                strokeDasharray="4 4"
              />
              <rect
                x={col.x - 58}
                y={6}
                width={116}
                height={22}
                fill={idx <= step ? '#FFE600' : '#E5E7EB'}
                stroke="#000000"
                strokeWidth={2}
              />
              <text
                x={col.x}
                y={21}
                textAnchor="middle"
                className="font-mono text-[10px] font-bold fill-black"
              >
                {col.label}
              </text>
            </g>
          ))}

          {/* Connector Beams */}
          {ALL_NODES.filter((n) => n.parentId).map((item) => {
            const parent = NODE_COORDS[item.parentId!];
            const state = getNodeState(item.node.id, item.depth, step, paths);

            let stroke = '#9CA3AF';
            let strokeWidth = 2;
            let dashArray = '5 5';

            if (state.status === 'winner') {
              stroke = '#FF6B6B';
              strokeWidth = 4.5;
              dashArray = 'none';
            } else if (state.status === 'active') {
              stroke = '#000000';
              strokeWidth = 3;
              dashArray = 'none';
            } else if (state.status === 'pruned') {
              stroke = '#6B7280';
              strokeWidth = 2;
              dashArray = '4 4';
            }

            return (
              <path
                key={`edge-${item.node.id}`}
                d={`M ${parent.x + 56} ${parent.y} C ${(parent.x + item.x) / 2} ${parent.y}, ${(parent.x + item.x) / 2} ${item.y}, ${item.x - 68} ${item.y}`}
                fill="none"
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeDasharray={dashArray}
              />
            );
          })}

          {/* Star-Token Nodes */}
          {ALL_NODES.map((item) => {
            const state = getNodeState(item.node.id, item.depth, step, paths);
            const isRoot = item.depth === 0;

            let bg = '#FFFFFF';
            let textColor = '#000000';
            let badgeText = `p=${item.node.prob.toFixed(2)}`;

            if (isRoot) {
              bg = '#FFE600';
              badgeText = t.ui.promptBadge;
            } else if (state.status === 'winner') {
              bg = '#FF6B6B';
            } else if (state.status === 'active') {
              bg = '#A7F3D0';
            } else if (state.status === 'pruned') {
              bg = '#E5E7EB';
              textColor = '#6B7280';
            } else {
              bg = '#F3F4F6';
              textColor = '#9CA3AF';
            }

            const boxW = isRoot ? 105 : 136;
            const boxH = 46;

            return (
              <g
                key={item.node.id}
                transform={`translate(${item.x - boxW / 2}, ${item.y - boxH / 2})`}
              >
                {/* Hard Offset Shadow */}
                <rect
                  x={3}
                  y={3}
                  width={boxW}
                  height={boxH}
                  fill="#000000"
                  opacity={state.status === 'unreached' ? 0.2 : 1}
                />
                {/* Node Box */}
                <rect
                  x={0}
                  y={0}
                  width={boxW}
                  height={boxH}
                  fill={bg}
                  stroke="#000000"
                  strokeWidth={2.5}
                />
                {/* Token Label */}
                <text
                  x={boxW / 2}
                  y={19}
                  textAnchor="middle"
                  fill={textColor}
                  style={{
                    textDecoration: state.status === 'pruned' ? 'line-through' : 'none',
                  }}
                  className="font-mono text-[13px] font-bold"
                >
                  {state.status === 'winner' ? '★ ' : state.status === 'pruned' ? '✕ ' : '● '}
                  "{item.node.token}"
                </text>
                {/* Probability / Pruned Sub-Label */}
                <text
                  x={boxW / 2}
                  y={36}
                  textAnchor="middle"
                  fill={textColor}
                  className="font-mono text-[10px] font-bold"
                >
                  {badgeText}
                  {item.depth === 3 && state.cumulativeProb !== undefined
                    ? ` | Σ=${state.cumulativeProb.toFixed(3)}`
                    : ''}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono bg-[#FFFDF7] brutal-border-sm px-3 py-2">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <span className="w-3 h-3 bg-[#FF6B6B] brutal-border-sm inline-block" /> {t.ui.bestRoute}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-3 h-3 bg-[#A7F3D0] brutal-border-sm inline-block" /> {t.ui.activeBeam}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-3 h-3 bg-[#E5E7EB] brutal-border-sm inline-block" /> {t.ui.prunedStamp}
          </span>
        </div>
        {winningPath && (
          <span>
            {t.ui.sequenceProbability} <strong>{(winningPath.cumulativeProb * 100).toFixed(1)}%</strong>
          </span>
        )}
      </div>
    </div>
  );
}
