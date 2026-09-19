/**
 * Blueprint damage picker geometry (ported from the design canvas, board
 * "Damage picker" v11): a hatchback drawn as thin white line-art in three
 * views laid side by side at the same length — driver profile (left, rotated
 * so the roof faces the centre), top view (centre), passenger profile (right).
 *
 * Coordinates are in the composite viewBox (654 × 420); each view is a
 * transformed group. Every part is tappable in exactly one view: the profiles
 * own fenders, doors, quarters, windows, mirrors and wheels; the top view owns
 * bumpers, hood, glass, roof, tailgate and the four lights.
 */

export const PART_NAMES = {
  FB: "Front bumper",
  HOOD: "Hood",
  WS: "Windshield",
  ROOF: "Roof",
  RG: "Rear glass",
  TRUNK: "Tailgate",
  RB: "Rear bumper",
  LF: "Driver front fender",
  LFD: "Driver front door",
  LRD: "Driver rear door",
  LRF: "Driver rear quarter",
  RF: "Passenger front fender",
  RFD: "Passenger front door",
  RRD: "Passenger rear door",
  RRF: "Passenger rear quarter",
  LMIR: "Driver mirror",
  RMIR: "Passenger mirror",
  LFW: "Driver front window",
  LRW: "Driver rear window",
  RFW: "Passenger front window",
  RRW: "Passenger rear window",
  WFL: "Driver front wheel",
  WFR: "Passenger front wheel",
  WRL: "Driver rear wheel",
  WRR: "Passenger rear wheel",
  HLL: "Driver headlight",
  HLR: "Passenger headlight",
  TLL: "Driver taillight",
  TLR: "Passenger taillight",
} as const;

export type PartKey = keyof typeof PART_NAMES;

/** Composite viewBox. */
export const BLUEPRINT_VB = { w: 654, h: 420 };

/** Caption x-centres for DRIVER SIDE · TOP VIEW · PASSENGER SIDE (fractions of width). */
export const BLUEPRINT_CAPTIONS = [0.1735,0.5,0.8265];

export type LineShape =
  | { t: 'p'; d: string; s: string; w: number; f: string }
  | { t: 'r'; x: number; y: number; w: number; h: number; rx: number; s: string; sw: number; f: string }
  | { t: 'c'; cx: number; cy: number; r: number; s: string; sw: number; f: string };

export interface Region {
  key: PartKey;
  /** Polygon points (local view coordinates) … */
  points?: string;
  /** … or a circle [cx, cy, r] (wheels). */
  circle?: [number, number, number];
  cx: number;
  cy: number;
}

export interface ViewGroup {
  name: 'driver' | 'top' | 'passenger';
  transform: string;
  lines: LineShape[];
  regions: Region[];
}

export const BLUEPRINT_GROUPS: ViewGroup[] = [{"name":"driver","transform":"matrix(0 1.3681 -1.3681 0 233.9 -4.4)","lines":[{"t":"p","d":"M14 112 L12 90 Q13 80 24 76 L42 70 L94 60 L134 30 Q150 24 180 24 L232 26 Q250 28 266 46 L288 62 Q298 70 298 84 L298 112 Q298 124 286 124 L268 124 A30 30 0 0 0 208 124 L104 124 A30 30 0 0 0 44 124 L26 124 Q14 124 14 112 Z","s":"rgba(255,255,255,.92)","w":1.7,"f":"rgba(255,255,255,.035)"},{"t":"p","d":"M102 66 L138 36 L176 34 L176 66 Z","s":"rgba(255,255,255,.92)","w":1.1,"f":"rgba(255,255,255,.05)"},{"t":"p","d":"M182 34 L230 34 L256 60 L182 66 Z","s":"rgba(255,255,255,.92)","w":1.1,"f":"rgba(255,255,255,.05)"},{"t":"p","d":"M240 30 L268 48 L286 64 L262 62 Z","s":"rgba(255,255,255,.92)","w":1.1,"f":"rgba(255,255,255,.05)"},{"t":"p","d":"M94 60 L134 30","s":"rgba(255,255,255,.55)","w":1,"f":"none"},{"t":"p","d":"M108 66 L108 120 M176 34 L176 120 M234 34 L232 120","s":"rgba(255,255,255,.55)","w":1,"f":"none"},{"t":"p","d":"M24 76 L42 70 L94 60 L100 68 L32 84","s":"rgba(255,255,255,.32)","w":0.9,"f":"none"},{"t":"p","d":"M30 108 L286 108","s":"rgba(255,255,255,.32)","w":0.8,"f":"none"},{"t":"r","x":146,"y":80,"w":16,"h":5,"rx":2.5,"s":"rgba(255,255,255,.55)","sw":1,"f":"none"},{"t":"r","x":198,"y":80,"w":16,"h":5,"rx":2.5,"s":"rgba(255,255,255,.55)","sw":1,"f":"none"},{"t":"r","x":96,"y":54,"w":16,"h":11,"rx":3,"s":"rgba(255,255,255,.92)","sw":1.1,"f":"rgba(255,255,255,.035)"},{"t":"r","x":16,"y":80,"w":24,"h":14,"rx":6,"s":"rgba(255,255,255,.55)","sw":1,"f":"none"},{"t":"c","cx":28,"cy":87,"r":4,"s":"rgba(255,255,255,.32)","sw":0.8,"f":"none"},{"t":"r","x":282,"y":66,"w":12,"h":26,"rx":4,"s":"rgba(255,255,255,.55)","sw":1,"f":"none"},{"t":"c","cx":288,"cy":74,"r":3,"s":"rgba(255,255,255,.32)","sw":0.8,"f":"none"},{"t":"c","cx":288,"cy":84,"r":3,"s":"rgba(255,255,255,.32)","sw":0.8,"f":"none"},{"t":"c","cx":258,"cy":86,"r":4.5,"s":"rgba(255,255,255,.32)","sw":0.9,"f":"none"},{"t":"c","cx":74,"cy":124,"r":28,"s":"rgba(255,255,255,.92)","sw":1.6,"f":"#070b14"},{"t":"c","cx":74,"cy":124,"r":22,"s":"rgba(255,255,255,.92)","sw":1.1,"f":"none"},{"t":"c","cx":74,"cy":124,"r":16,"s":"rgba(255,255,255,.32)","sw":0.9,"f":"none"},{"t":"c","cx":74,"cy":124,"r":2.5,"s":"rgba(255,255,255,.55)","sw":1,"f":"none"},{"t":"c","cx":238,"cy":124,"r":28,"s":"rgba(255,255,255,.92)","sw":1.6,"f":"#070b14"},{"t":"c","cx":238,"cy":124,"r":22,"s":"rgba(255,255,255,.92)","sw":1.1,"f":"none"},{"t":"c","cx":238,"cy":124,"r":16,"s":"rgba(255,255,255,.32)","sw":0.9,"f":"none"},{"t":"c","cx":238,"cy":124,"r":2.5,"s":"rgba(255,255,255,.55)","sw":1,"f":"none"}],"regions":[{"key":"LF","points":"30,86 100,68 108,66 108,122 44,122 30,122","cx":68,"cy":100},{"key":"LFW","points":"102,66 138,36 176,34 176,66","cx":142,"cy":52},{"key":"LFD","points":"108,66 176,66 176,122 108,122","cx":142,"cy":96},{"key":"LRW","points":"182,34 230,34 256,60 182,66","cx":212,"cy":50},{"key":"LRD","points":"176,66 232,66 232,122 176,122","cx":204,"cy":96},{"key":"LRF","points":"232,66 256,60 262,62 286,64 286,122 232,122","cx":258,"cy":94},{"key":"LMIR","points":"96,54 112,54 112,65 96,65","cx":104,"cy":60},{"key":"WFL","circle":[74,124,28],"cx":74,"cy":124},{"key":"WRL","circle":[238,124,28],"cx":238,"cy":124}]},{"name":"top","transform":"translate(227 0)","lines":[{"t":"p","d":"M52 24 Q100 12 148 24 Q166 34 170 70 L173 150 L173 290 L170 372 Q160 400 100 404 Q40 400 30 372 L27 290 L27 150 L30 70 Q34 34 52 24 Z","s":"rgba(255,255,255,.92)","w":1.7,"f":"rgba(255,255,255,.035)"},{"t":"p","d":"M33 48 Q100 36 167 48","s":"rgba(255,255,255,.55)","w":1,"f":"none"},{"t":"p","d":"M44 132 Q100 122 156 132","s":"rgba(255,255,255,.55)","w":1,"f":"none"},{"t":"p","d":"M44 132 L58 180 L142 180 L156 132 Z","s":"rgba(255,255,255,.92)","w":1.2,"f":"rgba(255,255,255,.05)"},{"t":"p","d":"M58 180 L142 180 L146 300 L54 300 Z","s":"rgba(255,255,255,.55)","w":1,"f":"none"},{"t":"p","d":"M74 196 L126 196 L128 240 L72 240 Z","s":"rgba(255,255,255,.32)","w":0.9,"f":"none"},{"t":"p","d":"M54 300 L146 300 L154 344 L46 344 Z","s":"rgba(255,255,255,.92)","w":1.2,"f":"rgba(255,255,255,.05)"},{"t":"p","d":"M46 344 Q100 352 154 344","s":"rgba(255,255,255,.55)","w":1,"f":"none"},{"t":"p","d":"M38 382 Q100 392 162 382","s":"rgba(255,255,255,.55)","w":1,"f":"none"},{"t":"p","d":"M27 180 L58 180 M173 180 L142 180 M27 250 L54 250 M173 250 L146 250 M27 312 L52 312 M173 312 L148 312","s":"rgba(255,255,255,.55)","w":1,"f":"none"},{"t":"p","d":"M30 70 L44 132 M170 70 L156 132","s":"rgba(255,255,255,.32)","w":0.9,"f":"none"},{"t":"p","d":"M14 172 L27 168 L27 186 L14 182 Z M186 172 L173 168 L173 186 L186 182 Z","s":"rgba(255,255,255,.92)","w":1.1,"f":"rgba(255,255,255,.035)"},{"t":"r","x":34,"y":30,"w":26,"h":9,"rx":4,"s":"rgba(255,255,255,.55)","sw":1,"f":"none"},{"t":"r","x":140,"y":30,"w":26,"h":9,"rx":4,"s":"rgba(255,255,255,.55)","sw":1,"f":"none"},{"t":"r","x":31,"y":386,"w":22,"h":9,"rx":4,"s":"rgba(255,255,255,.55)","sw":1,"f":"none"},{"t":"r","x":147,"y":386,"w":22,"h":9,"rx":4,"s":"rgba(255,255,255,.55)","sw":1,"f":"none"},{"t":"p","d":"M92 88 Q100 80 108 88 Q100 96 92 88","s":"rgba(255,255,255,.32)","w":0.9,"f":"none"}],"regions":[{"key":"FB","points":"30,22 170,22 170,48 30,48","cx":100,"cy":36},{"key":"HLL","points":"34,30 60,30 60,39 34,39","cx":47,"cy":35},{"key":"HLR","points":"140,30 166,30 166,39 140,39","cx":153,"cy":35},{"key":"HOOD","points":"36,48 164,48 156,132 44,132","cx":100,"cy":92},{"key":"WS","points":"44,132 156,132 142,180 58,180","cx":100,"cy":156},{"key":"ROOF","points":"58,180 142,180 146,300 54,300","cx":100,"cy":270},{"key":"RG","points":"54,300 146,300 154,344 46,344","cx":100,"cy":322},{"key":"TRUNK","points":"46,344 154,344 162,382 38,382","cx":100,"cy":364},{"key":"RB","points":"30,382 170,382 160,402 100,406 40,402","cx":100,"cy":392},{"key":"TLL","points":"31,386 53,386 53,395 31,395","cx":42,"cy":391},{"key":"TLR","points":"147,386 169,386 169,395 147,395","cx":158,"cy":391}]},{"name":"passenger","transform":"matrix(0 1.3681 1.3681 0 420.2 -4.4)","lines":[{"t":"p","d":"M14 112 L12 90 Q13 80 24 76 L42 70 L94 60 L134 30 Q150 24 180 24 L232 26 Q250 28 266 46 L288 62 Q298 70 298 84 L298 112 Q298 124 286 124 L268 124 A30 30 0 0 0 208 124 L104 124 A30 30 0 0 0 44 124 L26 124 Q14 124 14 112 Z","s":"rgba(255,255,255,.92)","w":1.7,"f":"rgba(255,255,255,.035)"},{"t":"p","d":"M102 66 L138 36 L176 34 L176 66 Z","s":"rgba(255,255,255,.92)","w":1.1,"f":"rgba(255,255,255,.05)"},{"t":"p","d":"M182 34 L230 34 L256 60 L182 66 Z","s":"rgba(255,255,255,.92)","w":1.1,"f":"rgba(255,255,255,.05)"},{"t":"p","d":"M240 30 L268 48 L286 64 L262 62 Z","s":"rgba(255,255,255,.92)","w":1.1,"f":"rgba(255,255,255,.05)"},{"t":"p","d":"M94 60 L134 30","s":"rgba(255,255,255,.55)","w":1,"f":"none"},{"t":"p","d":"M108 66 L108 120 M176 34 L176 120 M234 34 L232 120","s":"rgba(255,255,255,.55)","w":1,"f":"none"},{"t":"p","d":"M24 76 L42 70 L94 60 L100 68 L32 84","s":"rgba(255,255,255,.32)","w":0.9,"f":"none"},{"t":"p","d":"M30 108 L286 108","s":"rgba(255,255,255,.32)","w":0.8,"f":"none"},{"t":"r","x":146,"y":80,"w":16,"h":5,"rx":2.5,"s":"rgba(255,255,255,.55)","sw":1,"f":"none"},{"t":"r","x":198,"y":80,"w":16,"h":5,"rx":2.5,"s":"rgba(255,255,255,.55)","sw":1,"f":"none"},{"t":"r","x":96,"y":54,"w":16,"h":11,"rx":3,"s":"rgba(255,255,255,.92)","sw":1.1,"f":"rgba(255,255,255,.035)"},{"t":"r","x":16,"y":80,"w":24,"h":14,"rx":6,"s":"rgba(255,255,255,.55)","sw":1,"f":"none"},{"t":"c","cx":28,"cy":87,"r":4,"s":"rgba(255,255,255,.32)","sw":0.8,"f":"none"},{"t":"r","x":282,"y":66,"w":12,"h":26,"rx":4,"s":"rgba(255,255,255,.55)","sw":1,"f":"none"},{"t":"c","cx":288,"cy":74,"r":3,"s":"rgba(255,255,255,.32)","sw":0.8,"f":"none"},{"t":"c","cx":288,"cy":84,"r":3,"s":"rgba(255,255,255,.32)","sw":0.8,"f":"none"},{"t":"c","cx":258,"cy":86,"r":4.5,"s":"rgba(255,255,255,.32)","sw":0.9,"f":"none"},{"t":"c","cx":74,"cy":124,"r":28,"s":"rgba(255,255,255,.92)","sw":1.6,"f":"#070b14"},{"t":"c","cx":74,"cy":124,"r":22,"s":"rgba(255,255,255,.92)","sw":1.1,"f":"none"},{"t":"c","cx":74,"cy":124,"r":16,"s":"rgba(255,255,255,.32)","sw":0.9,"f":"none"},{"t":"c","cx":74,"cy":124,"r":2.5,"s":"rgba(255,255,255,.55)","sw":1,"f":"none"},{"t":"c","cx":238,"cy":124,"r":28,"s":"rgba(255,255,255,.92)","sw":1.6,"f":"#070b14"},{"t":"c","cx":238,"cy":124,"r":22,"s":"rgba(255,255,255,.92)","sw":1.1,"f":"none"},{"t":"c","cx":238,"cy":124,"r":16,"s":"rgba(255,255,255,.32)","sw":0.9,"f":"none"},{"t":"c","cx":238,"cy":124,"r":2.5,"s":"rgba(255,255,255,.55)","sw":1,"f":"none"}],"regions":[{"key":"RF","points":"30,86 100,68 108,66 108,122 44,122 30,122","cx":68,"cy":100},{"key":"RFW","points":"102,66 138,36 176,34 176,66","cx":142,"cy":52},{"key":"RFD","points":"108,66 176,66 176,122 108,122","cx":142,"cy":96},{"key":"RRW","points":"182,34 230,34 256,60 182,66","cx":212,"cy":50},{"key":"RRD","points":"176,66 232,66 232,122 176,122","cx":204,"cy":96},{"key":"RRF","points":"232,66 256,60 262,62 286,64 286,122 232,122","cx":258,"cy":94},{"key":"RMIR","points":"96,54 112,54 112,65 96,65","cx":104,"cy":60},{"key":"WFR","circle":[74,124,28],"cx":74,"cy":124},{"key":"WRR","circle":[238,124,28],"cx":238,"cy":124}]}];

/** Marker centres per part in composite coordinates (for the pulsing rings). */
export const MARKERS: { key: PartKey; x: number; y: number }[] = [{"key":"LF","x":97.1,"y":88.6},{"key":"LFW","x":162.8,"y":189.8},{"key":"LFD","x":102.6,"y":189.8},{"key":"LRW","x":165.5,"y":285.6},{"key":"LRD","x":102.6,"y":274.7},{"key":"LRF","x":105.3,"y":348.5},{"key":"LMIR","x":151.9,"y":137.9},{"key":"WFL","x":64.3,"y":96.8},{"key":"WRL","x":64.3,"y":321.2},{"key":"FB","x":327,"y":36},{"key":"HLL","x":274,"y":35},{"key":"HLR","x":380,"y":35},{"key":"HOOD","x":327,"y":92},{"key":"WS","x":327,"y":156},{"key":"ROOF","x":327,"y":270},{"key":"RG","x":327,"y":322},{"key":"TRUNK","x":327,"y":364},{"key":"RB","x":327,"y":392},{"key":"TLL","x":269,"y":391},{"key":"TLR","x":385,"y":391},{"key":"RF","x":557.0,"y":88.6},{"key":"RFW","x":491.3,"y":189.8},{"key":"RFD","x":551.5,"y":189.8},{"key":"RRW","x":488.6,"y":285.6},{"key":"RRD","x":551.5,"y":274.7},{"key":"RRF","x":548.8,"y":348.5},{"key":"RMIR","x":502.2,"y":137.9},{"key":"WFR","x":589.8,"y":96.8},{"key":"WRR","x":589.8,"y":321.2}];
