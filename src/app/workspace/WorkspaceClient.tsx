"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Header } from "@/components/layout/Header";
import { DEFAULT_PROJECT, EMPTY_UPLOADS, DEFAULT_QUESTIONNAIRE, DEFAULT_PLAN_OPTIONS } from "@/lib/ai/types";
import { QuestionnairePanel } from "@/components/workspace/QuestionnairePanel";
import { ClarificationPanel } from "@/components/workspace/ClarificationPanel";
import { PreviewCanvas } from "@/components/workspace/PreviewCanvas";
import { SheetPreviewScroll } from "@/components/workspace/SheetPreviewScroll";
import { DesignEditor } from "@/components/workspace/DesignEditor";
import { RoughPreviewModal } from "@/components/workspace/RoughPreviewModal";
import { WorkspaceMainStage } from "@/components/workspace/WorkspaceMainStage";
import {
  MobileQuestionnaireFab,
  MobileQuestionnaireSheet,
} from "@/components/workspace/MobileQuestionnaireSheet";
import { PlanOptionsModal } from "@/components/workspace/PlanOptionsModal";
import { PaymentModal } from "@/components/workspace/PaymentModal";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import { useUserId } from "@/lib/user/id";
import { viewerHeaders } from "@/lib/user/identity";
import { applyClarificationAnswer } from "@/lib/clarification/engine";
import type { ClarificationIssue } from "@/lib/clarification/engine";
import { planOptionsFromQuestionnaire } from "@/lib/design/plan-options-from-questionnaire";
import { createEditorStateFromProject, applyEditorToProject } from "@/lib/design/editor-state";
import { DRAFT_STORAGE_KEY } from "@/lib/design/draft-constants";
import type { DesignEditorState } from "@/lib/design/editor-types";
import {
  budgetTargetsFromProject,
  syncProjectBudgetFields,
  type BudgetTargets,
} from "@/lib/design/budget-targets";
import type {
  ClarificationAnswer,
  AiPreviewView,
  DesignPreview,
  PaymentState,
  PlanOptions,
  ProjectInput,
  QuestionnaireInput,
  QuestionnaireUploads,
  WorkflowStage,
} from "@/lib/ai/types";
import { PRICING } from "@/lib/geo/countries";

export default function WorkspacePage() {
  const { country, locale, translate } = useApp();
  const { loading: toastLoading, update: toastUpdate, error: toastError, success: toastSuccess } = useToast();
  const { data: session } = useSession();
  const localUserId = useUserId();
  const userId = session?.user?.id ?? localUserId ?? undefined;
  const identityHeaders = useCallback(
    (): HeadersInit =>
      localUserId
        ? viewerHeaders({ browserId: localUserId, sessionUserId: session?.user?.id })
        : {},
    [localUserId, session?.user?.id],
  );
  const searchParams = useSearchParams();
  const sessionId = useMemo(() => crypto.randomUUID(), []);

  const [project, setProject] = useState<ProjectInput>(DEFAULT_PROJECT);
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireInput>(DEFAULT_QUESTIONNAIRE);
  const [uploads, setUploads] = useState<QuestionnaireUploads>(() => EMPTY_UPLOADS());
  const [clarificationAnswers, setClarificationAnswers] = useState<ClarificationAnswer[]>([]);
  const [clarifyQueue, setClarifyQueue] = useState<ClarificationIssue[]>([]);
  const [clarifyIndex, setClarifyIndex] = useState(0);

  const [planOptions, setPlanOptions] = useState<PlanOptions>(DEFAULT_PLAN_OPTIONS);
  const [planId, setPlanId] = useState<string | null>(null);
  const [stage, setStage] = useState<WorkflowStage>("input");
  const [activeView, setActiveView] = useState<AiPreviewView>("render3d");
  const [generating, setGenerating] = useState(false);
  const [checking, setChecking] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [listedOnStore, setListedOnStore] = useState(false);
  const [paymentModal, setPaymentModal] = useState<"pdf" | "cad" | null>(null);
  const [payment, setPayment] = useState<PaymentState>({ pdfPaid: false, cadPaid: false });
  const [downloadTokens, setDownloadTokens] = useState<{ pdf?: string; cad?: string }>({});
  const [preview, setPreview] = useState<DesignPreview>({
    perspectiveUrl: "",
    facadeUrl: "",
    floorPlans: [],
    status: "idle",
    watermarked: false,
  });
  const [editorState, setEditorState] = useState<DesignEditorState | null>(null);
  const [budgetTargets, setBudgetTargets] = useState<BudgetTargets>(() =>
    budgetTargetsFromProject(DEFAULT_PROJECT),
  );
  const [editorMode, setEditorMode] = useState(false);
  const [roughPreviewOpen, setRoughPreviewOpen] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [questionnaireOpen, setQuestionnaireOpen] = useState(false);

  const handleProjectChange = useCallback((updates: Partial<ProjectInput>) => {
    setProject((p) => ({ ...p, ...updates }));
  }, []);

  const payload = useCallback(
    () => ({
      project: editorState ? applyEditorToProject(project, editorState) : project,
      questionnaire,
      uploads,
      answers: clarificationAnswers,
      countryCode: country.code,
      locale,
      designEditor: editorState ?? undefined,
    }),
    [project, questionnaire, uploads, clarificationAnswers, country.code, locale, editorState],
  );

  const handleSaveDraft = useCallback(async () => {
    if (!editorState || !localUserId) return;
    setSavingDraft(true);
    const toastId = toastLoading(translate("editor.saving"));
    try {
      const record = {
        project,
        editorState,
        workspaceSessionId: sessionId,
        previewUrl: preview.perspectiveUrl,
        ownerKey: localUserId,
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(record));
      await fetch("/api/design/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...identityHeaders() },
        body: JSON.stringify(record),
      });
      toastUpdate(toastId, translate("editor.draftSaved"), "success");
    } catch {
      toastUpdate(toastId, translate("toast.error"), "error");
    } finally {
      setSavingDraft(false);
    }
  }, [
    editorState,
    localUserId,
    project,
    sessionId,
    preview.perspectiveUrl,
    identityHeaders,
    toastLoading,
    toastUpdate,
    translate,
  ]);

  useEffect(() => {
    setBudgetTargets((prev) => {
      const next = budgetTargetsFromProject(project);
      if (
        prev.maxBudgetThb === next.maxBudgetThb &&
        prev.targetAreaSqm === next.targetAreaSqm &&
        prev.costTier === next.costTier
      ) {
        return prev;
      }
      return next;
    });
  }, [project.maxBudgetThb, project.targetAreaSqm, project.costTier, project.budget, project.floors, project.bedrooms]);

  const handleBudgetTargetsChange = useCallback((targets: BudgetTargets) => {
    setBudgetTargets(targets);
    setProject((p) => syncProjectBudgetFields(p, targets));
  }, []);

  useEffect(() => {
    if (!localUserId) return;
    const loadDraft = async () => {
      try {
        const local = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (local) {
          const parsed = JSON.parse(local) as {
            editorState: DesignEditorState;
            project: ProjectInput;
          };
          if (parsed.editorState && parsed.project) {
            setEditorState(parsed.editorState);
            setProject(parsed.project);
            return;
          }
        }
        const res = await fetch("/api/design/draft", { headers: identityHeaders() });
        if (res.ok) {
          const data = await res.json();
          if (data.draft?.editorState) {
            setEditorState(data.draft.editorState);
            setProject(data.draft.project);
          }
        }
      } catch {
        /* ignore draft load errors */
      }
    };
    void loadDraft();
  }, [localUserId, identityHeaders]);

  const runGenerateRender = useCallback(async () => {
    setGenerating(true);
    setPreview((prev) => ({ ...prev, status: "generating" }));
    const toastId = toastLoading(translate("toast.processingRender"));

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...identityHeaders() },
        body: JSON.stringify({ stage: "render", workspaceSessionId: sessionId, ...payload() }),
      });

      if (!res.ok) {
        setPreview((prev) => ({ ...prev, status: "error" }));
        toastUpdate(toastId, translate("toast.error"), "error");
        return;
      }

      const data = await res.json();
      setPreview({
        perspectiveUrl: data.preview.perspectiveUrl ?? "",
        facadeUrl: data.preview.facadeUrl ?? "",
        floorPlans: data.preview.floorPlans ?? [],
        status: "ready",
        watermarked: false,
      });
      setStage("render_ready");
      setActiveView("render3d");
      setEditorState(createEditorStateFromProject(project, sessionId));
      toastUpdate(toastId, translate("toast.renderReady"), "success");
    } catch {
      setPreview((prev) => ({ ...prev, status: "error" }));
      toastUpdate(toastId, translate("toast.error"), "error");
    } finally {
      setGenerating(false);
    }
  }, [payload, toastLoading, toastUpdate, translate, identityHeaders, project, sessionId]);

  const handleQuestionnaireSubmit = useCallback(async () => {
    setChecking(true);
    const toastId = toastLoading(translate("toast.checking"));
    try {
      const res = await fetch("/api/clarify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload()),
      });
      const data = await res.json();

      if (data.project) setProject(data.project);
      if (data.questionnaire) setQuestionnaire(data.questionnaire);

      if (data.ready) {
        setClarifyQueue([]);
        setStage("input");
        toastUpdate(toastId, translate("toast.processingRender"), "loading");
        await runGenerateRender();
        return;
      }

      if (data.nextQuestion) {
        setClarifyQueue([data.nextQuestion]);
        setClarifyIndex(0);
        setStage("clarifying");
        toastUpdate(toastId, translate("toast.clarifyNeeded"), "info");
      }
    } catch {
      toastUpdate(toastId, translate("toast.error"), "error");
    } finally {
      setChecking(false);
    }
  }, [payload, runGenerateRender, toastLoading, toastUpdate, translate]);

  const handleClarificationAnswer = useCallback(
    async (value: string) => {
      const current = clarifyQueue[clarifyIndex];
      if (!current) return;

      const nextAnswers = applyClarificationAnswer(
        clarificationAnswers,
        current.id,
        value,
        current.field,
      );
      setClarificationAnswers(nextAnswers);

      const res = await fetch("/api/clarify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload(), answers: nextAnswers }),
      });
      const data = await res.json();

      if (data.project) setProject(data.project);
      if (data.questionnaire) setQuestionnaire(data.questionnaire);

      if (data.ready) {
        setClarifyQueue([]);
        setStage("input");
        await runGenerateRender();
        return;
      }

      if (data.nextQuestion) {
        setClarifyQueue([data.nextQuestion]);
        setClarifyIndex(0);
      }
    },
    [clarifyQueue, clarifyIndex, clarificationAnswers, payload, runGenerateRender],
  );

  const handleGeneratePlans = useCallback(
    async (options: PlanOptions) => {
      setPlanOptions(options);
      setOptionsOpen(false);
      setGenerating(true);
      setStage("plans_generating");
      setPreview((prev) => ({ ...prev, status: "generating", sheetPreviews: undefined }));
      const toastId = toastLoading(translate("toast.processingPlans"));

      try {
        const mergedProject = editorState
          ? applyEditorToProject(
              {
                ...project,
                wallMaterial: options.wallMaterial,
                floorMaterial: options.floorMaterial,
                roofMaterial: options.roofMaterial,
              },
              editorState,
            )
          : {
              ...project,
              wallMaterial: options.wallMaterial,
              floorMaterial: options.floorMaterial,
              roofMaterial: options.roofMaterial,
            };

        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...identityHeaders() },
          body: JSON.stringify({
            stage: "plans",
            workspaceSessionId: sessionId,
            ...payload(),
            project: mergedProject,
            planOptions: options,
            planId: planId ?? undefined,
            designEditor: editorState ?? undefined,
          }),
        });

        if (!res.ok) {
          setPreview((prev) => ({ ...prev, status: "error" }));
          setStage("render_ready");
          toastUpdate(toastId, translate("toast.error"), "error");
          return;
        }

        const data = await res.json();
        setPlanId(data.planId);
        setPreview({
          perspectiveUrl: data.preview.perspectiveUrl ?? "",
          facadeUrl: data.preview.facadeUrl ?? "",
          floorPlans: data.preview.floorPlans ?? [],
          sheetPreviews: data.preview.sheetPreviews,
          status: "ready",
          watermarked: true,
        });
        setStage("plans_preview");
        setActiveView("render3d");
        toastUpdate(toastId, translate("workflow.plansReadyPaywall"), "success");
      } catch {
        setPreview((prev) => ({ ...prev, status: "error" }));
        setStage("render_ready");
        toastError(translate("toast.error"));
      } finally {
        setGenerating(false);
      }
    },
    [project, payload, sessionId, planId, identityHeaders, toastLoading, toastUpdate, toastError, translate, editorState],
  );

  const handleConfirmRender = useCallback(() => {
    setRoughPreviewOpen(false);
    const options = planOptionsFromQuestionnaire(questionnaire, {
      ...DEFAULT_PLAN_OPTIONS,
      wallMaterial: editorState?.rooms[0]?.wallMaterial ?? project.wallMaterial,
      floorMaterial: editorState?.rooms[0]?.floorMaterial ?? project.floorMaterial,
      roofMaterial: editorState?.roofMaterial ?? project.roofMaterial,
    });
    void handleGeneratePlans(options);
  }, [questionnaire, editorState, project, handleGeneratePlans]);

  const publishToStore = useCallback(
    async (pid: string, image: string, floorPlanUrls: string[]) => {
      if (!localUserId) return;
      await fetch("/api/store", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...identityHeaders() },
        body: JSON.stringify({
          workspaceSessionId: sessionId,
          project,
          planOptions,
          image,
          floorPlanUrls,
          planId: pid,
          countryCode: country.code,
          locale,
        }),
      });
      setListedOnStore(true);
      toastSuccess(translate("store.autoPublished"));
    },
    [localUserId, identityHeaders, sessionId, project, planOptions, country.code, locale, toastSuccess, translate],
  );

  const unlockAfterPayment = useCallback(
    async (format: "pdf" | "cad", downloadToken: string, pid: string) => {
      setPayment((prev) => ({
        ...prev,
        pdfPaid: format === "pdf" ? true : prev.pdfPaid,
        cadPaid: format === "cad" ? true : prev.cadPaid,
      }));
      setDownloadTokens((prev) => ({ ...prev, [format]: downloadToken }));
      setPaymentModal(null);
      setStage("unlocked");
      setPreview((prev) => {
        void publishToStore(pid, prev.perspectiveUrl, prev.floorPlans);
        return { ...prev, watermarked: false };
      });
    },
    [publishToStore],
  );

  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    const returnPlanId = searchParams.get("planId");
    const format = searchParams.get("format") as "pdf" | "cad" | null;
    const stripeSessionId = searchParams.get("session_id");

    if (paymentStatus !== "success" || !returnPlanId || !format) return;

    const confirmPayment = async () => {
      if (stripeSessionId) {
        const res = await fetch(`/api/payment/confirm?session_id=${stripeSessionId}`);
        const data = await res.json();
        if (data.downloadToken) {
          setPlanId(returnPlanId);
          void unlockAfterPayment(format, data.downloadToken, returnPlanId);
        }
      }
    };

    void confirmPayment();
  }, [searchParams, unlockAfterPayment]);


  const handlePaymentSuccess = useCallback(
    (format: "pdf" | "cad", downloadToken: string) => {
      if (!planId) return;
      void unlockAfterPayment(format, downloadToken, planId);
    },
    [planId, unlockAfterPayment],
  );

  const pdfPrice = PRICING.custom.pdf[String(project.floors) as "1" | "2"];
  const cadPrice = PRICING.custom.cad;
  const showQuestionnaire = stage === "input" || stage === "clarifying";

  const showEditor =
    editorMode && editorState && (stage === "render_ready" || stage === "plans_preview");
  const canUseEditor = stage === "render_ready" && editorState !== null;

  const showSheetPreview =
    stage === "plans_preview" || stage === "plans_generating" || stage === "unlocked";

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0a0a0c]">
      <Header variant="workspace" />

      <div className="flex min-h-0 flex-1">
        <div className="hidden shrink-0 lg:block">
          {showQuestionnaire ? (
            <QuestionnairePanel
              project={project}
              questionnaire={questionnaire}
              uploads={uploads}
              onProjectChange={handleProjectChange}
              onQuestionnaireChange={(u) => setQuestionnaire((q) => ({ ...q, ...u }))}
              onUploadsChange={(u) => setUploads((prev) => ({ ...prev, ...u }))}
              onSubmit={handleQuestionnaireSubmit}
              submitting={checking || generating}
            />
          ) : (
            <QuestionnairePanel
              project={project}
              questionnaire={questionnaire}
              uploads={uploads}
              onProjectChange={handleProjectChange}
              onQuestionnaireChange={(u) => setQuestionnaire((q) => ({ ...q, ...u }))}
              onUploadsChange={(u) => setUploads((prev) => ({ ...prev, ...u }))}
              onSubmit={() => setStage("input")}
              canSubmit={false}
              submitting={false}
            />
          )}
        </div>

        <WorkspaceMainStage
          project={project}
          stage={stage}
          optionsOpen={optionsOpen}
          payment={payment}
          downloadTokens={downloadTokens}
          onRequestPayment={setPaymentModal}
          onConfirmRender={handleConfirmRender}
          confirmLoading={generating && stage === "plans_generating"}
          listedOnStore={listedOnStore}
          editorMode={editorMode}
          onToggleEditor={canUseEditor ? () => setEditorMode((v) => !v) : undefined}
          onRoughPreview={canUseEditor ? () => setRoughPreviewOpen(true) : undefined}
          editorState={editorState}
          showEditor={Boolean(showEditor)}
        >
          {showEditor ? (
            <DesignEditor
              editorState={editorState!}
              project={project}
              budgetTargets={budgetTargets}
              onChange={setEditorState}
              onBudgetTargetsChange={handleBudgetTargetsChange}
              onSaveDraft={() => void handleSaveDraft()}
              saving={savingDraft}
            />
          ) : showSheetPreview ? (
            <SheetPreviewScroll
              sheets={preview.sheetPreviews ?? []}
              watermarked={preview.watermarked ?? false}
              generating={stage === "plans_generating" || preview.status === "generating"}
              projectName={project.projectName}
            />
          ) : (
            <PreviewCanvas
              preview={preview}
              activeView={activeView}
              onViewChange={setActiveView}
              floors={project.floors}
              onSaveDraft={canUseEditor ? () => void handleSaveDraft() : undefined}
              savingDraft={savingDraft}
              editorState={editorState}
              budgetTargets={budgetTargets}
              project={project}
            />
          )}
        </WorkspaceMainStage>
      </div>

      <PlanOptionsModal
        open={optionsOpen}
        onClose={() => setOptionsOpen(false)}
        onSubmit={handleGeneratePlans}
        loading={generating && stage === "plans_generating"}
      />

      {paymentModal && planId && (
        <PaymentModal
          open
          format={paymentModal}
          amount={paymentModal === "pdf" ? pdfPrice : cadPrice}
          planId={planId}
          project={project}
          userId={userId}
          onClose={() => setPaymentModal(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {editorState && (
        <RoughPreviewModal
          open={roughPreviewOpen}
          onClose={() => setRoughPreviewOpen(false)}
          editorState={editorState}
          budgetTargets={budgetTargets}
          onConfirmGenerate={handleConfirmRender}
          loading={generating}
        />
      )}

      {stage === "clarifying" && clarifyQueue[clarifyIndex] && (
        <ClarificationPanel
          question={clarifyQueue[clarifyIndex]}
          index={clarifyIndex}
          total={clarifyQueue.length}
          onAnswer={handleClarificationAnswer}
        />
      )}

      <MobileQuestionnaireFab onOpen={() => setQuestionnaireOpen(true)} />
      <MobileQuestionnaireSheet
        open={questionnaireOpen}
        onClose={() => setQuestionnaireOpen(false)}
        project={project}
        questionnaire={questionnaire}
        uploads={uploads}
        onProjectChange={handleProjectChange}
        onQuestionnaireChange={(u) => setQuestionnaire((q) => ({ ...q, ...u }))}
        onUploadsChange={(u) => setUploads((prev) => ({ ...prev, ...u }))}
        onSubmit={showQuestionnaire ? handleQuestionnaireSubmit : () => setStage("input")}
        submitting={checking || generating}
        canSubmit={showQuestionnaire}
      />
    </div>
  );
}
