import { styled } from '@linaria/react';

const StyledScene = styled.svg`
  display: block;
  height: 100%;
  inset: 0;
  pointer-events: none;
  position: absolute;
  width: 100%;

  .road-light {
    animation: bruna-road 7s linear infinite;
    stroke-dasharray: 42 240;
  }

  .road-light-slow {
    animation: bruna-road 12s linear infinite;
    stroke-dasharray: 16 280;
  }

  .node {
    animation: bruna-node 2.8s ease-in-out infinite;
    transform-box: fill-box;
    transform-origin: center;
  }

  .window {
    animation: bruna-window 3.6s ease-in-out infinite;
  }

  .headlight {
    offset-rotate: auto;
    animation: bruna-drive 9s linear infinite;
  }

  .headlight-return {
    offset-rotate: auto;
    animation: bruna-drive 13s linear infinite reverse;
  }

  @keyframes bruna-road {
    to {
      stroke-dashoffset: -564;
    }
  }

  @keyframes bruna-node {
    0%,
    100% {
      opacity: 0.4;
    }
    50% {
      opacity: 1;
    }
  }

  @keyframes bruna-window {
    0%,
    100% {
      opacity: 0.45;
    }
    50% {
      opacity: 1;
    }
  }

  @keyframes bruna-drive {
    to {
      offset-distance: 100%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .road-light,
    .road-light-slow,
    .node,
    .window,
    .headlight,
    .headlight-return {
      animation: none;
    }
  }
`;

const NODES = [
  [140, 220],
  [280, 150],
  [390, 280],
  [210, 390],
  [90, 520],
  [360, 480],
  [520, 360],
  [690, 210],
  [860, 150],
  [1040, 190],
  [1180, 130],
  [1320, 240],
  [1120, 360],
  [1280, 470],
  [1040, 560],
  [900, 430],
] as const;

const LINKS: Array<[number, number]> = [
  [0, 1],
  [1, 2],
  [0, 3],
  [3, 4],
  [3, 5],
  [2, 5],
  [2, 6],
  [6, 7],
  [1, 7],
  [7, 8],
  [8, 9],
  [9, 10],
  [10, 11],
  [9, 12],
  [12, 13],
  [12, 14],
  [14, 15],
  [6, 15],
  [11, 13],
];

export const BrunaLoginScene = () => {
  return (
    <StyledScene
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <linearGradient id="bruna-sky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#041226" />
          <stop offset="48%" stopColor="#0b2d52" />
          <stop offset="100%" stopColor="#07101f" />
        </linearGradient>
        <radialGradient id="bruna-glow-spot" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#1a4e86" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#1a4e86" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bruna-gold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fff6d0" stopOpacity="0" />
          <stop offset="45%" stopColor="#ffe7a3" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="bruna-node" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e9fbff" />
          <stop offset="40%" stopColor="#49d2ff" />
          <stop offset="100%" stopColor="#49d2ff" stopOpacity="0" />
        </radialGradient>
        <filter id="bruna-soft" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <path id="bruna-left-road" d="M-80 820 C 220 690, 480 500, 760 390" />
        <path id="bruna-right-road" d="M1540 700 C 1220 590, 980 470, 760 390" />
      </defs>

      <rect width="1440" height="900" fill="url(#bruna-sky)" />
      <ellipse cx="720" cy="280" rx="520" ry="240" fill="url(#bruna-glow-spot)" />

      <use href="#bruna-left-road" stroke="#102848" strokeWidth="46" fill="none" />
      <use href="#bruna-right-road" stroke="#102848" strokeWidth="36" fill="none" />
      <use
        href="#bruna-left-road"
        stroke="#7ecfff"
        strokeWidth="1"
        fill="none"
        opacity="0.35"
      />
      <use
        className="road-light"
        href="#bruna-left-road"
        stroke="url(#bruna-gold)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        filter="url(#bruna-soft)"
      />
      <use
        className="road-light-slow"
        href="#bruna-right-road"
        stroke="#ff8b78"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        filter="url(#bruna-soft)"
      />

      <circle
        className="headlight"
        r="3"
        fill="#fff4c8"
        style={{ offsetPath: "path('M -80 820 C 220 690, 480 500, 760 390')" }}
      />
      <circle
        className="headlight-return"
        r="2.5"
        fill="#ffd0c8"
        style={{ offsetPath: "path('M 1540 700 C 1220 590, 980 470, 760 390')" }}
      />

      <g>
        <path d="M1088 248 L1288 312 L1276 468 L1064 410 Z" fill="#0d213b" />
        <path d="M1106 270 L1264 322 L1256 430 L1090 384 Z" fill="#17375c" />
        <path d="M1106 270 L1264 322 L1184 292 Z" fill="#1d446e" />
        <rect className="window" x="1136" y="330" width="34" height="16" rx="2" fill="#f6d78a" />
        <rect className="window" x="1182" y="342" width="34" height="16" rx="2" fill="#ffe7ad" />
        <rect className="window" x="1226" y="354" width="24" height="14" rx="2" fill="#f6d78a" />
      </g>

      {LINKS.map(([from, to]) => (
        <line
          key={`${from}-${to}`}
          x1={NODES[from][0]}
          y1={NODES[from][1]}
          x2={NODES[to][0]}
          y2={NODES[to][1]}
          stroke="#8adfff"
          strokeWidth="1.1"
          opacity="0.4"
        />
      ))}
      {NODES.map(([x, y], index) => (
        <g
          key={`${x}-${y}`}
          className="node"
          style={{ animationDelay: `${index * 0.16}s` }}
        >
          <circle cx={x} cy={y} r="11" fill="url(#bruna-node)" />
          <circle cx={x} cy={y} r="2.3" fill="#f3fdff" />
        </g>
      ))}
    </StyledScene>
  );
};
