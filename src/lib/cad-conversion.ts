// Browser-side CAD conversion + minimal ZIP writer.
//
// Phase 1 ships STL <-> OBJ and OBJ <-> STL for real. Anything else
// (PDF, DOCX, JPG, MP4, ...) is a placeholder in Phase 1 — the user
// still gets a downloadable file with the right extension, but the
// bytes are a header comment. Phase 2 wires a real backend.
//
// All functions are pure (no React, no state). They take a File or
// string, return either a string (text format) or Uint8Array (binary).

// ─── ASCII STL ────────────────────────────────────────────────

export interface StlTriangle {
  normal: [number, number, number];
  v: [number, number, number][];
}

export const parseAsciiStl = (text: string): { triangles: StlTriangle[] } => {
  const triangles: StlTriangle[] = [];
  const lines = text.split(/\r?\n/);
  let i = 0;
  let cur: StlTriangle | null = null;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (line.startsWith('solid') || line.startsWith('endsolid')) { i++; continue; }
    if (line.startsWith('facet normal')) {
      const p = line.split(/\s+/);
      cur = { normal: [parseFloat(p[2]), parseFloat(p[3]), parseFloat(p[4])], v: [] };
    } else if (line.startsWith('vertex')) {
      const p = line.split(/\s+/);
      cur!.v.push([parseFloat(p[1]), parseFloat(p[2]), parseFloat(p[3])]);
    } else if (line.startsWith('endfacet')) {
      if (cur) triangles.push(cur);
      cur = null;
    }
    i++;
  }
  return { triangles };
};

export const writeAsciiStl = (triangles: StlTriangle[]): string => {
  let out = 'solid omniconvert_converted\n';
  for (const t of triangles) {
    out += `  facet normal ${t.normal[0]} ${t.normal[1]} ${t.normal[2]}\n`;
    out += '    outer loop\n';
    for (const v of t.v) out += `      vertex ${v[0]} ${v[1]} ${v[2]}\n`;
    out += '    endloop\n  endfacet\n';
  }
  return out + 'endsolid omniconvert_converted\n';
};

// ─── OBJ ──────────────────────────────────────────────────────

export const parseObj = (text: string): { vertices: [number, number, number][]; triangles: [number, number, number][] } => {
  const vertices: [number, number, number][] = [];
  const triangles: [number, number, number][] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const p = line.split(/\s+/);
    if (p[0] === 'v' && p.length >= 4) {
      vertices.push([parseFloat(p[1]), parseFloat(p[2]), parseFloat(p[3])]);
    } else if (p[0] === 'f' && p.length >= 4) {
      const faceIdx = p.slice(1).map(tok => {
        const vSpec = tok.split('/')[0];
        const idx = parseInt(vSpec, 10);
        return idx < 0 ? vertices.length + idx + 1 : idx;
      });
      // Fan-triangulate n-gons.
      for (let k = 1; k < faceIdx.length - 1; k++) {
        triangles.push([faceIdx[0] - 1, faceIdx[k] - 1, faceIdx[k + 1] - 1]);
      }
    }
  }
  return { vertices, triangles };
};

export const writeObj = (vertices: [number, number, number][], triangles: [number, number, number][]): string => {
  let out = '# Converted by OmniConvert\n';
  out += 'o OmniConvert_Output\n';
  for (const v of vertices) out += `v ${v[0]} ${v[1]} ${v[2]}\n`;
  for (const t of triangles) out += `f ${t[0] + 1} ${t[1] + 1} ${t[2] + 1}\n`;
  return out;
};

// ─── STL <-> OBJ ──────────────────────────────────────────────

export const stlToObj = (stlText: string): string => {
  const { triangles } = parseAsciiStl(stlText);
  const vertMap = new Map<string, number>();
  const vertices: [number, number, number][] = [];
  const outTris: [number, number, number][] = [];
  for (const t of triangles) {
    const idx: [number, number, number] = t.v.map(v => {
      const key = v.map(n => n.toFixed(6)).join(',');
      let i = vertMap.get(key);
      if (i === undefined) { i = vertices.length; vertices.push(v); vertMap.set(key, i); }
      return i;
    }) as [number, number, number];
    outTris.push(idx);
  }
  return writeObj(vertices, outTris);
};

export const objToStl = (objText: string): string => {
  const { vertices, triangles } = parseObj(objText);
  const out = triangles.map(t => {
    const [a, b, c] = t.map(i => vertices[i]);
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
    const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const L = Math.hypot(nx, ny, nz) || 1;
    return { normal: [nx / L, ny / L, nz / L] as [number, number, number], v: [a, b, c] as [number, number, number][] };
  });
  return writeAsciiStl(out);
};

// ─── Async File -> Blob (real CAD output) ─────────────────────

export const buildRealCadOutput = async (file: File, fromExt: 'stl' | 'obj'): Promise<Blob> => {
  const text = await file.text();
  if (fromExt === 'stl') {
    return new Blob([stlToObj(text)], { type: 'model/obj' });
  }
  return new Blob([objToStl(text)], { type: 'model/stl' });
};

// ─── Minimal ZIP STORE writer ────────────────────────────────

const crc32Table = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c >>> 0;
  }
  return t;
})();

const crc32 = (data: Uint8Array): number => {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) c = crc32Table[(c ^ data[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
};

export const buildZip = (files: Array<{ name: string; data: Uint8Array }>): Uint8Array => {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const crc = crc32(file.data);
    const size = file.data.length;

    const local = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(6, 0, true);
    lv.setUint16(8, 0, true);
    lv.setUint16(10, 0, true);
    lv.setUint16(12, 0x21, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, size, true);
    lv.setUint32(22, size, true);
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true);
    local.set(nameBytes, 30);
    localParts.push(local, file.data);

    const central = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, 0, true);
    cv.setUint16(14, 0x21, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, size, true);
    cv.setUint32(24, size, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true);
    cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true);
    cv.setUint16(36, 0, true);
    cv.setUint32(38, 0, true);
    cv.setUint32(42, offset, true);
    central.set(nameBytes, 46);
    centralParts.push(central);

    offset += local.length + file.data.length;
  }

  const centralStart = offset;
  let centralSize = 0;
  for (const part of centralParts) centralSize += part.length;

  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, centralStart, true);
  ev.setUint16(20, 0, true);

  const total = offset + centralSize + eocd.length;
  const out = new Uint8Array(total);
  let pos = 0;
  for (const p of localParts) { out.set(p, pos); pos += p.length; }
  for (const p of centralParts) { out.set(p, pos); pos += p.length; }
  out.set(eocd, pos);
  return out;
};
