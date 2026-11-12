export interface StarTreeNode {
  id: string;
  token: string;
  prob: number;
  children?: StarTreeNode[];
}

export interface LogitCandidate {
  token: string;
  logit: number;
  category: 'safe' | 'creative' | 'tail';
}

export const BEAM_TREE_DATA: StarTreeNode = {
  id: 'root',
  token: 'saw',
  prob: 1.0,
  children: [
    {
      id: 'n-nothing',
      token: 'nothing',
      prob: 0.45,
      children: [
        {
          id: 'n-nothing-at',
          token: 'at',
          prob: 0.25,
          children: [
            {
              id: 'n-nothing-at-all',
              token: 'all.',
              prob: 0.40,
            },
          ],
        },
        {
          id: 'n-nothing-but',
          token: 'but',
          prob: 0.20,
          children: [
            {
              id: 'n-nothing-but-dust',
              token: 'dust.',
              prob: 0.50,
            },
          ],
        },
      ],
    },
    {
      id: 'n-a',
      token: 'a',
      prob: 0.40,
      children: [
        {
          id: 'n-a-glowing',
          token: 'glowing',
          prob: 0.85,
          children: [
            {
              id: 'n-a-glowing-nebula',
              token: 'nebula.',
              prob: 0.90,
            },
          ],
        },
        {
          id: 'n-a-distant',
          token: 'distant',
          prob: 0.10,
          children: [
            {
              id: 'n-a-distant-comet',
              token: 'comet.',
              prob: 0.60,
            },
          ],
        },
      ],
    },
    {
      id: 'n-two',
      token: 'two',
      prob: 0.10,
      children: [
        {
          id: 'n-two-binary',
          token: 'binary',
          prob: 0.80,
          children: [
            {
              id: 'n-two-binary-suns',
              token: 'suns.',
              prob: 0.85,
            },
          ],
        },
      ],
    },
    {
      id: 'n-earth',
      token: 'earth',
      prob: 0.05,
      children: [
        {
          id: 'n-earth-below',
          token: 'below',
          prob: 0.70,
          children: [
            {
              id: 'n-earth-below-shining',
              token: 'shining.',
              prob: 0.80,
            },
          ],
        },
      ],
    },
  ],
};

export const LOGIT_CANDIDATES: LogitCandidate[] = [
  { token: 'nebula', logit: 2.5, category: 'safe' },
  { token: 'star', logit: 2.0, category: 'safe' },
  { token: 'planet', logit: 1.6, category: 'safe' },
  { token: 'leviathan', logit: 1.35, category: 'creative' },
  { token: 'monolith', logit: 1.2, category: 'creative' },
  { token: 'cathedral', logit: 1.05, category: 'creative' },
  { token: 'banana', logit: 0.35, category: 'tail' },
  { token: '404_error', logit: -0.05, category: 'tail' },
];
