// Format color tokens — every format gets a tinted badge. Reuses the
// project's existing palette (slate / blue / emerald / amber / rose /
// violet / cyan / orange) so the mega menu sits inside the Format OS
// light palette already documented in DOX.

export interface FormatColor {
  bg: string;        // tailwind bg-* class
  fg: string;        // tailwind text-* class
  border?: string;   // optional ring/border class
}

const TABLE: Record<string, FormatColor> = {
  // Documents
  PDF:  { bg: 'bg-rose-50',    fg: 'text-rose-700'    },
  DOC:  { bg: 'bg-blue-50',    fg: 'text-blue-700'    },
  DOCX: { bg: 'bg-blue-50',    fg: 'text-blue-700'    },
  TXT:  { bg: 'bg-amber-50',   fg: 'text-amber-700'   },
  HTML: { bg: 'bg-emerald-50', fg: 'text-emerald-700' },
  HTM:  { bg: 'bg-emerald-50', fg: 'text-emerald-700' },
  EPUB: { bg: 'bg-violet-50',  fg: 'text-violet-700'  },
  MD:   { bg: 'bg-orange-50',  fg: 'text-orange-700'  },
  RTF:  { bg: 'bg-cyan-50',    fg: 'text-cyan-700'    },
  ODT:  { bg: 'bg-blue-50',    fg: 'text-blue-700'    },

  // Spreadsheets
  XLS:  { bg: 'bg-emerald-50', fg: 'text-emerald-700' },
  XLSX: { bg: 'bg-emerald-50', fg: 'text-emerald-700' },
  CSV:  { bg: 'bg-cyan-50',    fg: 'text-cyan-700'    },
  TSV:  { bg: 'bg-cyan-50',    fg: 'text-cyan-700'    },
  ODS:  { bg: 'bg-emerald-50', fg: 'text-emerald-700' },

  // Presentations
  PPT:  { bg: 'bg-orange-50',  fg: 'text-orange-700'  },
  PPTX: { bg: 'bg-orange-50',  fg: 'text-orange-700'  },
  ODP:  { bg: 'bg-orange-50',  fg: 'text-orange-700'  },

  // Images
  JPG:  { bg: 'bg-orange-50',  fg: 'text-orange-700'  },
  JPEG: { bg: 'bg-orange-50',  fg: 'text-orange-700'  },
  PNG:  { bg: 'bg-emerald-50', fg: 'text-emerald-700' },
  WEBP: { bg: 'bg-cyan-50',    fg: 'text-cyan-700'    },
  SVG:  { bg: 'bg-violet-50',  fg: 'text-violet-700'  },
  HEIC: { bg: 'bg-pink-50',    fg: 'text-pink-700'    },
  GIF:  { bg: 'bg-violet-50',  fg: 'text-violet-700'  },
  BMP:  { bg: 'bg-slate-50',   fg: 'text-slate-700'   },
  TIFF: { bg: 'bg-slate-50',   fg: 'text-slate-700'   },
  TIF:  { bg: 'bg-slate-50',   fg: 'text-slate-700'   },
  AVIF: { bg: 'bg-cyan-50',    fg: 'text-cyan-700'    },
  ICO:  { bg: 'bg-slate-50',   fg: 'text-slate-700'   },

  // Audio
  MP3:  { bg: 'bg-amber-50',   fg: 'text-amber-700'   },
  WAV:  { bg: 'bg-emerald-50', fg: 'text-emerald-700' },
  FLAC: { bg: 'bg-rose-50',    fg: 'text-rose-700'    },
  AAC:  { bg: 'bg-amber-50',   fg: 'text-amber-700'   },
  M4A:  { bg: 'bg-violet-50',  fg: 'text-violet-700'  },
  OGG:  { bg: 'bg-cyan-50',    fg: 'text-cyan-700'    },
  WMA:  { bg: 'bg-cyan-50',    fg: 'text-cyan-700'    },
  OPUS: { bg: 'bg-orange-50',  fg: 'text-orange-700'  },
  AIFF: { bg: 'bg-slate-50',   fg: 'text-slate-700'   },

  // Video
  MP4:  { bg: 'bg-amber-50',   fg: 'text-amber-700'   },
  AVI:  { bg: 'bg-blue-50',    fg: 'text-blue-700'    },
  MOV:  { bg: 'bg-violet-50',  fg: 'text-violet-700'  },
  MKV:  { bg: 'bg-emerald-50', fg: 'text-emerald-700' },
  WEBM: { bg: 'bg-cyan-50',    fg: 'text-cyan-700'    },
  FLV:  { bg: 'bg-orange-50',  fg: 'text-orange-700'  },
  WMV:  { bg: 'bg-blue-50',    fg: 'text-blue-700'    },
  MPEG: { bg: 'bg-amber-50',   fg: 'text-amber-700'   },
  MPG:  { bg: 'bg-amber-50',   fg: 'text-amber-700'   },

  // Archives
  ZIP:  { bg: 'bg-emerald-50', fg: 'text-emerald-700' },
  RAR:  { bg: 'bg-amber-50',   fg: 'text-amber-700'   },
  '7Z': { bg: 'bg-blue-50',    fg: 'text-blue-700'    },
  TAR:  { bg: 'bg-emerald-50', fg: 'text-emerald-700' },
  GZ:   { bg: 'bg-amber-50',   fg: 'text-amber-700'   },
  BZ2:  { bg: 'bg-amber-50',   fg: 'text-amber-700'   },

  // Fonts
  TTF:  { bg: 'bg-rose-50',    fg: 'text-rose-700'    },
  OTF:  { bg: 'bg-cyan-50',    fg: 'text-cyan-700'    },
  WOFF: { bg: 'bg-violet-50',  fg: 'text-violet-700'  },
  WOFF2:{ bg: 'bg-violet-50',  fg: 'text-violet-700'  },
  EOT:  { bg: 'bg-slate-50',   fg: 'text-slate-700'   },

  // CAD / 3D
  DWG:  { bg: 'bg-blue-50',    fg: 'text-blue-700'    },
  DXF:  { bg: 'bg-amber-50',   fg: 'text-amber-700'   },
  STEP: { bg: 'bg-emerald-50', fg: 'text-emerald-700' },
  STP:  { bg: 'bg-emerald-50', fg: 'text-emerald-700' },
  IGES: { bg: 'bg-cyan-50',    fg: 'text-cyan-700'    },
  IGS:  { bg: 'bg-cyan-50',    fg: 'text-cyan-700'    },
  STL:  { bg: 'bg-emerald-50', fg: 'text-emerald-700' },
  OBJ:  { bg: 'bg-pink-50',    fg: 'text-pink-700'    },
  FBX:  { bg: 'bg-orange-50',  fg: 'text-orange-700'  },
  GLTF: { bg: 'bg-violet-50',  fg: 'text-violet-700'  },
  GLB:  { bg: 'bg-violet-50',  fg: 'text-violet-700'  },
  DAE:  { bg: 'bg-slate-50',   fg: 'text-slate-700'   },
  '3DS':{ bg: 'bg-slate-50',   fg: 'text-slate-700'   },

  // eBooks
  MOBI: { bg: 'bg-pink-50',    fg: 'text-pink-700'    },
  AZW3: { bg: 'bg-pink-50',    fg: 'text-pink-700'    },

  // Vectors
  EPS:  { bg: 'bg-cyan-50',    fg: 'text-cyan-700'    },
  AI:   { bg: 'bg-amber-50',   fg: 'text-amber-700'   },
  CDR:  { bg: 'bg-cyan-50',    fg: 'text-cyan-700'    },
  EMF:  { bg: 'bg-slate-50',   fg: 'text-slate-700'   },
  WMF:  { bg: 'bg-slate-50',   fg: 'text-slate-700'   },
};

const FALLBACK: FormatColor = { bg: 'bg-slate-100', fg: 'text-slate-700' };

export const colorForFormat = (fmt: string): FormatColor =>
  TABLE[fmt.toUpperCase()] ?? FALLBACK;

export const iconLetter = (fmt: string): string =>
  (fmt || '?').slice(0, 4).toUpperCase();