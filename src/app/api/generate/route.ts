import { NextRequest, NextResponse } from "next/server";
import { getCountryByCode, PRICING } from "@/lib/geo/countries";
import { validateProject, selectReferencePatternId, selectCadPatternIds } from "@/lib/rules/engine";
import { generatePlanDocument } from "@/lib/ai/plan-generator";
import { auditGoldenCompleteness } from "@/lib/plans/golden-standard";
import { generatePerspectiveImage, generateFacadeImage } from "@/lib/ai/image-generator";
import { buildSheetPreviews } from "@/lib/plans/sheet-preview";
import { createPlanId, savePlanDocument } from "@/lib/plans/store";
import { isGeminiConfigured } from "@/lib/ai/gemini";
import type { PlanOptions, ProjectInput, QuestionnaireInput, QuestionnaireUploads } from "@/lib/ai/types";
import type { DesignEditorState } from "@/lib/design/editor-types";
import { applyEditorToProject } from "@/lib/design/editor-state";
import { buildEditorExport } from "@/lib/design/export-documentation";

type GenerateStage = "render" | "plans" | "rough_preview";

function previewFromUploads(uploads?: QuestionnaireUploads) {
  if (!uploads) return null;
  const perspectiveUrl = uploads.frontView3d[0]?.dataUrl ?? "";
  const facadeUrl = uploads.elevationSection[0]?.dataUrl ?? "";
  const floorPlans = uploads.floorPlans.map((f) => f.dataUrl);
  if (!perspectiveUrl && !facadeUrl && floorPlans.length === 0) return null;
  return { perspectiveUrl, facadeUrl, floorPlans };
}

async function resolveRenderImages(mergedProject: ProjectInput, uploads?: QuestionnaireUploads) {
  const uploaded = previewFromUploads(uploads);
  const [perspectiveUrl, facadeUrl] = await Promise.all([
    uploaded?.perspectiveUrl
      ? Promise.resolve(uploaded.perspectiveUrl)
      : generatePerspectiveImage(mergedProject),
    uploaded?.facadeUrl ? Promise.resolve(uploaded.facadeUrl) : generateFacadeImage(mergedProject),
  ]);
  return { perspectiveUrl, facadeUrl };
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const project = body.project as ProjectInput;
  const countryCode = (body.countryCode as string) ?? "TH";
  const country = getCountryByCode(countryCode);
  const locale = (body.locale as import("@/lib/geo/countries").Locale | undefined) ?? country.defaultLocale;
  const stage = (body.stage as GenerateStage) ?? "render";
  const planOptions = body.planOptions as PlanOptions | undefined;
  const existingPlanId = body.planId as string | undefined;
  const questionnaire = body.questionnaire as QuestionnaireInput | undefined;
  const uploads = body.uploads as QuestionnaireUploads | undefined;
  const designEditor = body.designEditor as DesignEditorState | undefined;
  const mergedProject = designEditor ? applyEditorToProject(project, designEditor) : project;

  const validations = validateProject(mergedProject, country.buildingCode);
  const passed = validations.every((v) => v.passed);

  if (!passed) {
    return NextResponse.json(
      {
        status: "error",
        validations,
        message: "Validation failed — fix errors before generating",
      },
      { status: 422 },
    );
  }

  if (stage === "rough_preview") {
    const exportPayload = designEditor
      ? buildEditorExport(designEditor, mergedProject)
      : null;
    return NextResponse.json({
      status: "ready",
      stage: "rough_preview",
      preview: {
        mode: "wireframe",
        editorState: designEditor ?? null,
        materialEstimate: exportPayload?.materialEstimate ?? null,
        doorWindowSchedule: exportPayload?.doorWindowSchedule ?? [],
      },
      validations,
    });
  }

  if (stage === "render") {
    const { perspectiveUrl, facadeUrl } = await resolveRenderImages(mergedProject, uploads);
    return NextResponse.json({
      status: "ready",
      stage: "render",
      preview: {
        perspectiveUrl,
        facadeUrl,
        floorPlans: [],
        status: "ready",
        watermarked: false,
      },
      validations,
      aiMode: isGeminiConfigured() ? "gemini" : previewFromUploads(uploads) ? "user-upload" : "empty",
      questionnaire,
    });
  }

  const planId = existingPlanId ?? createPlanId();
  const options = planOptions ?? {
    wallMaterial: project.wallMaterial,
    floorMaterial: project.floorMaterial,
    roofMaterial: project.roofMaterial,
    includeElectrical: true,
    includePlumbing: true,
    includeStructural: true,
    evCharger: false,
  };
  const referencePatternId = selectReferencePatternId(project);
  const cadPatternIds = selectCadPatternIds(project, options);

  const planDocument = await generatePlanDocument(
    planId,
    mergedProject,
    options,
    referencePatternId,
    country.buildingCode,
    locale,
    designEditor,
  );
  await savePlanDocument(planDocument);

  const { perspectiveUrl, facadeUrl } = await resolveRenderImages(mergedProject, uploads);
  const sheetPreviews = buildSheetPreviews(planDocument);

  return NextResponse.json({
    status: "ready",
    stage: "plans",
    planId,
    preview: {
      perspectiveUrl,
      facadeUrl,
      floorPlans: [],
      sheetPreviews,
      status: "ready",
      watermarked: true,
    },
    referencePatternId,
    cadPatternIds: planDocument.cadPatternIds ?? cadPatternIds,
    planOptions: options,
    validations,
    sheetCount: planDocument.index.length,
    goldenStandard: auditGoldenCompleteness(options),
    aiMode: isGeminiConfigured() ? "gemini" : "fallback",
    materialEstimate: designEditor ? buildEditorExport(designEditor, mergedProject).materialEstimate : undefined,
    pricing: {
      pdf: PRICING.custom.pdf[project.floors === 1 ? "1" : "2"],
      cad: PRICING.custom.cad,
      currency: country.currency,
    },
  });
}
