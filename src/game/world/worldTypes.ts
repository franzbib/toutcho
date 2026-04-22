export type RectArea = {
  id?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fillColor: number;
  alpha?: number;
  strokeColor?: number;
  strokeWidth?: number;
  depth?: number;
  shadowColor?: number;
  shadowAlpha?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
};

export type LocationDecoration =
  | ({
      kind: 'rect';
      label?: string;
      labelColor?: string;
      labelSize?: number;
      labelFontStyle?: string;
      labelBackgroundColor?: string;
      labelPaddingX?: number;
      labelPaddingY?: number;
      labelOffsetX?: number;
      labelOffsetY?: number;
    } & RectArea)
  | {
      kind: 'text';
      x: number;
      y: number;
      text: string;
      color?: string;
      fontSize?: number;
      fontStyle?: string;
      backgroundColor?: string;
      paddingX?: number;
      paddingY?: number;
      originX?: number;
      originY?: number;
      depth?: number;
    }
  | {
      kind: 'circle';
      x: number;
      y: number;
      radius: number;
      fillColor: number;
      alpha?: number;
      strokeColor?: number;
      strokeWidth?: number;
      depth?: number;
    }
  | {
      kind: 'line';
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      color: number;
      width: number;
      alpha?: number;
      depth?: number;
    };

export type WorldObjectKind =
  | 'npc'
  | 'board'
  | 'sign'
  | 'desk'
  | 'door'
  | 'resource'
  | 'locker'
  | 'counter'
  | 'kiosk'
  | 'message';

export type WorldObjectDefinition = {
  id: string;
  kind: WorldObjectKind;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  prompt: string;
  accentColor?: number;
  interactionId?: string;
  signageId?: string;
  rewardItemId?: string;
  requiredItemId?: string;
  missingItemText?: string;
  consumeItemOnSuccess?: boolean;
  portalMissionId?: string;
  lockedText?: string;
};

export type ReachZoneDefinition = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
};

export type LocationDefinition = {
  id: string;
  name: string;
  subtitle: string;
  width: number;
  height: number;
  backgroundColor: number;
  accentColor: number;
  playerSpawn: {
    x: number;
    y: number;
  };
  decorations: LocationDecoration[];
  colliders: RectArea[];
  objects: WorldObjectDefinition[];
  reachZones: ReachZoneDefinition[];
};
