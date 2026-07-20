import type { PlanOptions, ProjectInput } from "@/lib/ai/types";
import type { DesignEditorState } from "@/lib/design/editor-types";
import { buildEditorExport } from "@/lib/design/export-documentation";
import type { Locale } from "@/lib/geo/countries";
import { aiRespondInLocale } from "@/lib/i18n/localized-text";
import { TEMPLATE_POLICY } from "@/lib/templates/policy";
import { buildCadReferenceContext, selectCadReferencePatterns } from "@/lib/templates/cad-catalog";
import { buildPlanDocument } from "@/lib/plans/build-document";
import { applyGoldenStandard, buildGoldenStandardContext } from "@/lib/plans/golden-standard";
import type { HousePlanDocument } from "@/lib/plans/schema";
import { getTextModel, isGeminiConfigured } from "./gemini";

const PLAN_JSON_SCHEMA = `Return JSON matching this structure (partial fields OK — server fills defaults):
{
  "sitePlan": { "plotWidth", "plotDepth", "building": {x,y,width,depth}, "setbacks": {front,rear,left,right}, "roadSide", "entrance" },
  "floorPlans": [{ "level", "label", "labelTh", "scale", "rooms": [{id,name,nameTh,width,depth,x,y}], "grossArea" }],
  "roofPlan": { "type", "slope", "drainage": [], "material" },
  "elevations": [{ "side", "label", "labelTh", "height", "finishNotes": [] }],
  "sections": [{ "id", "label", "labelTh", "cutDirection", "floorLevels": [{name,elevation}], "notes": [] }],
  "architecturalDetails": [{ "id", "title", "titleTh", "items": [{label,value}] }],
  "structural": { "foundationType", "elements": [], "beamSpans": [], "calculationSummary": [] },
  "sanitary": [{ "floor", "fixtures": [], "septicTank", "greaseTrap", "rainwater" }],
  "electrical": [{ "floor", "lighting": [], "switches": [], "outlets": [], "powerLoads": [], "consumerUnit", "singleLineDiagram": [] }]
}`;

/** Generate plan document — Gemini when configured, deterministic fallback otherwise */
export async function generatePlanDocument(
  id: string,
  project: ProjectInput,
  planOptions: PlanOptions,
  referencePatternId: string,
  buildingCode: string,
  locale: Locale = "en",
  designEditor?: DesignEditorState,
): Promise<HousePlanDocument> {
  const cadPatterns = selectCadReferencePatterns(project, planOptions);
  const cadContext = buildCadReferenceContext(cadPatterns);
  const goldenContext = buildGoldenStandardContext();
  let fallback = buildPlanDocument(id, project, planOptions, referencePatternId, buildingCode, designEditor);
  fallback.cadPatternIds = cadPatterns.map((p) => p.id);
  fallback = applyGoldenStandard(fallback, planOptions);

  if (!isGeminiConfigured()) return fallback;

  const model = getTextModel();
  if (!model) return fallback;

  try {
    const prompt = `${TEMPLATE_POLICY.en}

You are an architect AI generating ORIGINAL building permit drawing data for a user-designed house.
Reference pattern ID "${referencePatternId}" is for layout guidance ONLY — do not copy government templates.

${cadContext}

${goldenContext}

Follow Smart A TYPE E golden standard sheet structure for permit-ready completeness.

Project:
${JSON.stringify(project, null, 2)}

Plan options:
${JSON.stringify(planOptions, null, 2)}

${designEditor ? `User-edited parametric layout (MUST respect room sizes and openings):\n${JSON.stringify(buildEditorExport(designEditor, project), null, 2)}\n` : ""}
Building code: ${buildingCode}

${aiRespondInLocale(locale)}
Use natural ${locale === "th" ? "Thai" : locale === "hi" ? "Hindi" : locale === "vi" ? "Vietnamese" : "English"} room and sheet labels in the primary label fields. Keep labelTh for Thai where applicable.

Generate complete drawing data for categories A (architectural), S (structural), SN (sanitary), E (electrical).
Include realistic room layouts, dimensions in meters.

${PLAN_JSON_SCHEMA}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text) as Partial<HousePlanDocument>;

    return applyGoldenStandard(
      {
        ...fallback,
        ...parsed,
        id,
        createdAt: fallback.createdAt,
        project,
        planOptions,
        referencePatternId,
        buildingCode,
        cadPatternIds: cadPatterns.map((p) => p.id),
        floorPlans: parsed.floorPlans?.length ? parsed.floorPlans : fallback.floorPlans,
        index: fallback.index,
      },
      planOptions,
    );
  } catch {
    return fallback;
  }
}
