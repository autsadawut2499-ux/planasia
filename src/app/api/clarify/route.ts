import { NextRequest, NextResponse } from "next/server";
import {
  analyzeClarificationNeeds,
  mergeClarificationAnswers,
} from "@/lib/clarification/engine";
import type {
  ClarificationAnswer,
  ProjectInput,
  QuestionnaireInput,
  QuestionnaireUploads,
} from "@/lib/ai/types";

export async function POST(request: NextRequest) {
  const body = await request.json();
  let project = body.project as ProjectInput;
  let questionnaire = body.questionnaire as QuestionnaireInput;
  const uploads = body.uploads as QuestionnaireUploads;
  const answers = (body.answers as ClarificationAnswer[]) ?? [];

  if (answers.length > 0) {
    const merged = mergeClarificationAnswers(project, questionnaire, answers);
    project = merged.project;
    questionnaire = merged.questionnaire;
  }

  const result = analyzeClarificationNeeds(project, questionnaire, uploads, answers);

  return NextResponse.json({
    ready: result.ready,
    nextQuestion: result.nextQuestion,
    pendingCount: result.issues.length,
    resolvedCount: result.resolvedCount,
    project,
    questionnaire,
    message: result.ready
      ? "All required information is clear — ready to generate"
      : "Clarification required before processing",
  });
}
