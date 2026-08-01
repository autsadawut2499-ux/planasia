export type {
  TitleBlockFieldKey,
  TitleBlockFieldValues,
  TitleBlockFieldSlot,
  TitleBlockGeometry,
  TitleBlockLabel,
  TitleBlockMetadata,
  TitleBlockTemplate,
} from "@/lib/pdf/title-block/schema";

export {
  getTitleBlockTemplate,
  loadTitleBlockTemplate,
  reloadTitleBlockTemplate,
  titleBlockHeightPt,
  getTitleBlockDwgPath,
  getTitleBlockPltPath,
  TITAN_BOX_DWG_FILENAME,
  TITAN_BOX_PLT_FILENAME,
} from "@/lib/pdf/title-block/template-loader";

export {
  getTitleBlockPdfReferenceInfo,
  listRegisteredTitleBlockReferences,
  TITLE_BLOCK_REFERENCES,
  reloadTitleBlockReferenceCache,
} from "@/lib/pdf/title-block/references";
export type {
  TitleBlockReferenceAsset,
  TitleBlockPdfReferenceInfo,
  TitleBlockReferenceRole,
} from "@/lib/pdf/title-block/references";

export {
  buildDefaultTitleBlockMetadata,
  buildTitleBlockAiContext,
  mergeTitleBlockMetadata,
  resolveTitleBlockFields,
} from "@/lib/pdf/title-block/fields";

export { drawTitleBlockFromTemplate } from "@/lib/pdf/title-block/renderer";
export { renderTitleBlockSvg, wrapSheetWithTitleBlock } from "@/lib/pdf/title-block/svg";
