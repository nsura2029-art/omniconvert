import { Tool, TOOLS } from './tools';

export interface CadSeoPage {
  slug: string;
  toolId: number;
  primaryKeyword: string;
  secondaryKeywords: string[];
  searchIntent: string;
  title: string;
  metaDescription: string;
  h1: string;
  intro: string;
  steps: string[];
  useCases: string[];
  limitations: string[];
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  relatedSlugs: string[];
  schemaType: 'SoftwareApplication';
  tool: Tool;
}

interface CadSeoPageDefinition {
  slug: string;
  toolId: number;
  primaryKeyword: string;
  secondaryKeywords: string[];
  searchIntent: string;
  useCases: string[];
  limitations: string[];
  relatedSlugs: string[];
}

const cadSimulationLimit =
  'OmniConvert currently simulates CAD conversion results until production CAD engines are connected.';

const CAD_SEO_PAGE_DEFS: CadSeoPageDefinition[] = [
  {
    slug: 'dwg-to-dxf',
    toolId: 150,
    primaryKeyword: 'dwg to dxf',
    secondaryKeywords: ['convert dwg to dxf online', 'autocad dwg to dxf', 'dwg exchange file converter'],
    searchIntent: 'convert AutoCAD DWG drawings into interoperable DXF exchange files',
    useCases: ['Move AutoCAD drawings into CAM, CNC, and vendor review workflows.', 'Share editable drawing geometry with teams that prefer DXF.'],
    limitations: [cadSimulationLimit, 'Layer names, line weights, and custom AutoCAD objects should be checked after export.'],
    relatedSlugs: ['dxf-to-dwg', 'dwg-to-pdf', 'dwg-version-converter']
  },
  {
    slug: 'dxf-to-dwg',
    toolId: 153,
    primaryKeyword: 'dxf to dwg',
    secondaryKeywords: ['convert dxf to dwg online', 'dxf to autocad dwg', 'cad exchange to drawing converter'],
    searchIntent: 'convert DXF exchange files back into AutoCAD DWG drawing files',
    useCases: ['Bring vendor DXF files back into DWG-based drawing archives.', 'Standardize CNC or exchange drawings before internal review.'],
    limitations: [cadSimulationLimit, 'DXF entities unsupported by the target DWG version may need manual review.'],
    relatedSlugs: ['dwg-to-dxf', 'dwg-version-converter', 'dwg-to-pdf']
  },
  {
    slug: 'dwg-to-pdf',
    toolId: 151,
    primaryKeyword: 'dwg to pdf',
    secondaryKeywords: ['convert dwg to pdf online', 'autocad to pdf', 'dwg drawing to pdf'],
    searchIntent: 'render DWG and DXF drawings as shareable PDF review files',
    useCases: ['Send engineering or architecture drawings to reviewers without AutoCAD.', 'Create printable PDF packets from CAD layouts.'],
    limitations: [cadSimulationLimit, 'Always confirm scale, paper size, layout tabs, and line weights before release.'],
    relatedSlugs: ['dwg-to-image', 'dwg-to-svg', 'cad-file-viewer']
  },
  {
    slug: 'cad-file-viewer',
    toolId: 224,
    primaryKeyword: 'cad file viewer',
    secondaryKeywords: ['dwg viewer online', 'dxf viewer online', 'view cad without autocad'],
    searchIntent: 'preview CAD drawings and 3D model files online before converting',
    useCases: ['Check CAD file contents before choosing a conversion route.', 'Let non-CAD stakeholders preview drawings without installing desktop software.'],
    limitations: [cadSimulationLimit, 'Browser previews should not be treated as final measurement or manufacturing proof.'],
    relatedSlugs: ['dwg-to-pdf', 'dwg-to-image', '3d-model-converter']
  },
  {
    slug: 'pdf-to-dwg',
    toolId: 217,
    primaryKeyword: 'pdf to dwg',
    secondaryKeywords: ['convert pdf to dwg online', 'pdf to autocad', 'pdf drawing to cad'],
    searchIntent: 'turn PDF drawing references into editable DWG or DXF CAD files',
    useCases: ['Recover editable references from archived drawing PDFs.', 'Trace vendor or client PDF drawings into CAD workflows.'],
    limitations: [cadSimulationLimit, 'PDF to DWG can be lossy because PDFs may contain flattened vectors, raster scans, or missing layer data.'],
    relatedSlugs: ['dwg-to-pdf', 'dxf-to-dwg', 'cad-layer-extractor']
  },
  {
    slug: 'step-to-stl',
    toolId: 152,
    primaryKeyword: 'step to stl',
    secondaryKeywords: ['stp to stl', 'convert step to stl online', 'cad to 3d print converter'],
    searchIntent: 'convert STEP or STP solid models into STL meshes for 3D printing',
    useCases: ['Prepare mechanical CAD parts for slicers and rapid prototyping.', 'Share simplified mesh models with fabrication teams.'],
    limitations: [cadSimulationLimit, 'STL output is mesh-based and does not preserve editable parametric CAD features.'],
    relatedSlugs: ['stl-to-step', 'iges-to-stl', 'obj-to-stl']
  },
  {
    slug: 'dwg-version-converter',
    toolId: 223,
    primaryKeyword: 'dwg version converter',
    secondaryKeywords: ['autocad version converter', 'convert dwg version online', 'save dwg as older version'],
    searchIntent: 'convert DWG drawings between AutoCAD version targets for compatibility',
    useCases: ['Open newer DWG files in older CAD seats.', 'Standardize project archives around one DWG version.'],
    limitations: [cadSimulationLimit, 'Version downgrades can affect unsupported entities, proxy objects, and annotation behavior.'],
    relatedSlugs: ['dwg-to-dxf', 'dxf-to-dwg', 'dwg-to-pdf']
  },
  {
    slug: 'obj-to-stl',
    toolId: 225,
    primaryKeyword: 'obj to stl',
    secondaryKeywords: ['convert obj to stl online', '3d model to stl', 'obj mesh to 3d print file'],
    searchIntent: 'convert Wavefront OBJ models into STL meshes for 3D printing',
    useCases: ['Move visual 3D models into slicer-friendly STL format.', 'Prepare mesh assets for quick prototype checks.'],
    limitations: [cadSimulationLimit, 'Materials, textures, and scene data from OBJ are not represented in STL output.'],
    relatedSlugs: ['stl-to-obj', 'step-to-stl', '3d-model-converter']
  },
  {
    slug: '3d-model-converter',
    toolId: 228,
    primaryKeyword: '3d model converter',
    secondaryKeywords: ['convert 3d files online', 'obj fbx stl converter', 'cad model converter'],
    searchIntent: 'convert common 3D model formats for design, printing, and visualization',
    useCases: ['Switch assets between design, visualization, and fabrication tools.', 'Normalize mixed 3D model libraries into a preferred format.'],
    limitations: [cadSimulationLimit, 'Complex materials, animation, rigging, and CAD feature history may not transfer between formats.'],
    relatedSlugs: ['obj-to-stl', 'fbx-to-obj', 'stl-to-obj']
  },
  {
    slug: 'stl-to-step',
    toolId: 219,
    primaryKeyword: 'stl to step',
    secondaryKeywords: ['stl to stp', 'convert stl to step online', 'mesh to cad converter'],
    searchIntent: 'convert STL meshes back into STEP CAD interchange files',
    useCases: ['Bring scan or print meshes into CAD-adjacent review workflows.', 'Create exchange files for teams that cannot open STL directly.'],
    limitations: [cadSimulationLimit, 'STL to STEP is approximate because triangle meshes do not contain original parametric surfaces.'],
    relatedSlugs: ['step-to-stl', 'iges-to-step', '3d-model-converter']
  },
  {
    slug: 'iges-to-stl',
    toolId: 220,
    primaryKeyword: 'iges to stl',
    secondaryKeywords: ['igs to stl', 'convert iges to stl online', 'iges model to 3d print'],
    searchIntent: 'convert IGES or IGS CAD models into STL files for 3D printing',
    useCases: ['Prepare legacy IGES models for slicers.', 'Turn supplier CAD interchange files into prototype meshes.'],
    limitations: [cadSimulationLimit, 'Surface gaps or open shells in IGES files can affect STL mesh quality.'],
    relatedSlugs: ['iges-to-step', 'step-to-stl', 'stl-to-step']
  },
  {
    slug: 'dwg-to-svg',
    toolId: 221,
    primaryKeyword: 'dwg to svg',
    secondaryKeywords: ['convert dwg to svg online', 'autocad to svg', 'dwg vector graphic converter'],
    searchIntent: 'convert DWG or DXF drawings into browser-friendly SVG vector graphics',
    useCases: ['Publish simplified CAD diagrams on websites or documentation pages.', 'Create scalable vector previews from drawing files.'],
    limitations: [cadSimulationLimit, 'Very dense drawings may need cleanup before SVG output is readable in browsers.'],
    relatedSlugs: ['dxf-to-svg', 'dwg-to-pdf', 'dwg-to-image']
  },
  {
    slug: 'dxf-to-svg',
    toolId: 222,
    primaryKeyword: 'dxf to svg',
    secondaryKeywords: ['convert dxf to svg online', 'dxf vector converter', 'cad to svg converter'],
    searchIntent: 'convert DXF drawings into scalable SVG vector files',
    useCases: ['Move CAD exchange geometry into web, laser, or documentation workflows.', 'Create lightweight browser previews from DXF drawings.'],
    limitations: [cadSimulationLimit, 'Fonts, hatches, and unsupported DXF entities can render differently in SVG.'],
    relatedSlugs: ['dwg-to-svg', 'dwg-to-dxf', 'dwg-to-image']
  },
  {
    slug: 'stl-to-obj',
    toolId: 155,
    primaryKeyword: 'stl to obj',
    secondaryKeywords: ['convert stl to obj online', 'stl mesh to obj', '3d print file to obj'],
    searchIntent: 'convert STL rapid-prototyping meshes into OBJ model files',
    useCases: ['Move STL assets into modeling or visualization tools that prefer OBJ.', 'Prepare printable meshes for broader 3D asset workflows.'],
    limitations: [cadSimulationLimit, 'STL files do not include material data, so OBJ exports may be geometry-only.'],
    relatedSlugs: ['obj-to-stl', 'fbx-to-obj', '3d-model-converter']
  },
  {
    slug: 'fbx-to-obj',
    toolId: 227,
    primaryKeyword: 'fbx to obj',
    secondaryKeywords: ['convert fbx to obj online', 'autodesk fbx to wavefront obj', '3d asset converter'],
    searchIntent: 'convert Autodesk FBX assets into Wavefront OBJ model files',
    useCases: ['Move FBX models into tools that support simple OBJ geometry.', 'Simplify 3D assets for static visualization or review.'],
    limitations: [cadSimulationLimit, 'Animation, rigging, cameras, lights, and some materials may not survive FBX to OBJ conversion.'],
    relatedSlugs: ['stl-to-obj', 'obj-to-stl', '3d-model-converter']
  },
  {
    slug: 'cad-drawing-compress',
    toolId: 229,
    primaryKeyword: 'cad drawing compress',
    secondaryKeywords: ['compress dwg online', 'reduce dxf file size', 'cad file optimizer'],
    searchIntent: 'reduce DWG and DXF drawing file sizes while preserving drawing structure',
    useCases: ['Prepare CAD drawings for email, upload portals, and review packets.', 'Clean up heavy project files before sharing.'],
    limitations: [cadSimulationLimit, 'Compression choices should be checked against project standards before issuing drawings.'],
    relatedSlugs: ['cad-compress', 'cad-layer-extractor', 'dwg-version-converter']
  },
  {
    slug: 'cad-layer-extractor',
    toolId: 230,
    primaryKeyword: 'cad layer extractor',
    secondaryKeywords: ['extract dwg layers', 'export dxf layers', 'cad layer to pdf'],
    searchIntent: 'export selected layers from DWG or DXF drawings into CAD or PDF outputs',
    useCases: ['Share only relevant drawing layers with contractors or reviewers.', 'Create focused plan sheets without exposing full project drawings.'],
    limitations: [cadSimulationLimit, 'Layer extraction depends on clean layer naming and predictable drawing standards.'],
    relatedSlugs: ['pdf-to-dwg', 'cad-drawing-compress', 'dwg-to-pdf']
  },
  {
    slug: 'iges-to-step',
    toolId: 154,
    primaryKeyword: 'iges to step',
    secondaryKeywords: ['igs to step', 'convert iges to step online', 'legacy cad to step'],
    searchIntent: 'convert legacy IGES files into modern STEP mechanical interchange files',
    useCases: ['Update supplier IGES files for STEP-based CAD workflows.', 'Standardize old mechanical archives around STEP exchange.'],
    limitations: [cadSimulationLimit, 'Surface-only IGES models may not become fully watertight solids after conversion.'],
    relatedSlugs: ['iges-to-stl', 'stl-to-step', 'step-to-stl']
  },
  {
    slug: 'dwg-to-image',
    toolId: 156,
    primaryKeyword: 'dwg to image',
    secondaryKeywords: ['dwg to png', 'dwg to jpg', 'convert dwg drawing to image'],
    searchIntent: 'render DWG drawings as PNG or JPG images for quick review',
    useCases: ['Create lightweight drawing previews for tickets, chats, or documentation.', 'Share visual references when PDF is more than needed.'],
    limitations: [cadSimulationLimit, 'Raster image output is not suitable for measuring, editing, or preserving CAD layers.'],
    relatedSlugs: ['dwg-to-pdf', 'dwg-to-svg', 'cad-file-viewer']
  },
  {
    slug: '3ds-to-obj',
    toolId: 157,
    primaryKeyword: '3ds to obj',
    secondaryKeywords: ['convert 3ds to obj online', '3d studio to obj', 'legacy 3d model converter'],
    searchIntent: 'convert legacy 3D Studio files into Wavefront OBJ models',
    useCases: ['Move older 3DS assets into modern modeling or visualization tools.', 'Normalize legacy model libraries into an easier exchange format.'],
    limitations: [cadSimulationLimit, 'Legacy scene settings, materials, and animation data may need cleanup after export.'],
    relatedSlugs: ['fbx-to-obj', 'stl-to-obj', '3d-model-converter']
  },
  {
    slug: 'cad-compress',
    toolId: 158,
    primaryKeyword: 'cad compress',
    secondaryKeywords: ['compress cad files online', 'reduce 3d model file size', 'optimize cad mesh'],
    searchIntent: 'optimize CAD and 3D mesh files to reduce file size for sharing',
    useCases: ['Shrink heavy CAD or mesh files before uploads.', 'Prepare lighter model versions for review and collaboration.'],
    limitations: [cadSimulationLimit, 'Mesh simplification can affect surface detail and should be verified before manufacturing use.'],
    relatedSlugs: ['cad-drawing-compress', '3d-model-converter', 'obj-to-stl']
  }
];

const toolById = new Map(TOOLS.map(tool => [tool.id, tool]));

const buildFaqs = (tool: Tool, def: CadSeoPageDefinition) => [
  {
    question: `Can I ${def.primaryKeyword} online?`,
    answer: `Yes. This OmniConvert page is designed for ${def.searchIntent} using ${tool.input} source files and ${tool.output} outputs.`
  },
  {
    question: `What files does ${tool.name} support?`,
    answer: `${tool.name} is listed with ${tool.input} as the supported source format and ${tool.output} as the target format in the current CAD catalog.`
  },
  {
    question: 'Is this production CAD conversion yet?',
    answer: cadSimulationLimit
  }
];

const buildSteps = (tool: Tool) => [
  `Choose ${tool.name} from the CAD converter hub or this detail page.`,
  `Upload a ${tool.input} file from your computer, cloud storage, or a direct URL.`,
  `Review the target format, run the sandbox conversion, and download the ${tool.output} result.`
];

export const CAD_SEO_PAGES: CadSeoPage[] = CAD_SEO_PAGE_DEFS.map(def => {
  const tool = toolById.get(def.toolId);

  if (!tool) {
    throw new Error(`CAD SEO page ${def.slug} references missing tool id ${def.toolId}`);
  }

  return {
    ...def,
    schemaType: 'SoftwareApplication',
    tool,
    title: `${tool.name} Online | OmniConvert`,
    metaDescription: `Use OmniConvert to ${def.searchIntent}. Includes ${tool.input} to ${tool.output} details, FAQs, related CAD tools, and current limitations.`,
    h1: `${tool.name} Online`,
    intro: `Use this ${def.primaryKeyword} workspace to ${def.searchIntent}. It is part of OmniConvert's CAD converter catalog for engineering drawings, 3D models, sharing, review, and fabrication preparation.`,
    steps: buildSteps(tool),
    faqs: buildFaqs(tool, def)
  };
});

export const CAD_SEO_PAGE_BY_SLUG = new Map(CAD_SEO_PAGES.map(page => [page.slug, page]));
export const CAD_SEO_PAGE_BY_TOOL_ID = new Map(CAD_SEO_PAGES.map(page => [page.toolId, page]));

export const getCadSeoPageBySlug = (slug: string) => CAD_SEO_PAGE_BY_SLUG.get(slug);
export const getCadSeoPageByToolId = (toolId: number) => CAD_SEO_PAGE_BY_TOOL_ID.get(toolId);

export const CAD_SEO_CANONICAL_BASE_URL = 'https://omniconvert.app';
