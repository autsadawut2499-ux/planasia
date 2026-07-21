"use client";



import { ClipboardList, X } from "lucide-react";

import { QuestionnairePanel } from "@/components/workspace/QuestionnairePanel";

import { useApp } from "@/context/AppContext";

import type { ProjectInput, QuestionnaireInput, QuestionnaireUploads } from "@/lib/ai/types";



interface MobileQuestionnaireSheetProps {

  open: boolean;

  onClose: () => void;

  project: ProjectInput;

  questionnaire: QuestionnaireInput;

  uploads: QuestionnaireUploads;

  onProjectChange: (updates: Partial<ProjectInput>) => void;

  onQuestionnaireChange: (updates: Partial<QuestionnaireInput>) => void;

  onUploadsChange: (updates: Partial<QuestionnaireUploads>) => void;

  onSubmit: () => void;

  submitting?: boolean;

  canSubmit?: boolean;

}



export function MobileQuestionnaireSheet({

  open,

  onClose,

  project,

  questionnaire,

  uploads,

  onProjectChange,

  onQuestionnaireChange,

  onUploadsChange,

  onSubmit,

  submitting,

  canSubmit = true,

}: MobileQuestionnaireSheetProps) {

  const { translate } = useApp();



  if (!open) return null;



  const handleSubmit = () => {

    onSubmit();

    onClose();

  };



  return (

    <>

      <button

        type="button"

        className="fixed inset-0 z-[60] bg-black/50 lg:hidden"

        aria-label={translate("workflow.cancel")}

        onClick={onClose}

      />

      <aside

        className="fixed inset-x-0 bottom-0 z-[61] flex max-h-[92vh] flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-[#141414] shadow-2xl lg:hidden"

        role="dialog"

        aria-modal="true"

        aria-label={translate("sidebar.title")}

      >

        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">

          <div className="flex items-center gap-2">

            <ClipboardList className="h-5 w-5 text-[#2680eb]" />

            <h2 className="text-sm font-semibold text-white">{translate("sidebar.title")}</h2>

          </div>

          <button

            type="button"

            onClick={onClose}

            className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white"

            aria-label={translate("nav.closeMenu")}

          >

            <X className="h-5 w-5" />

          </button>

        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">

          <QuestionnairePanel

            embedded

            project={project}

            questionnaire={questionnaire}

            uploads={uploads}

            onProjectChange={onProjectChange}

            onQuestionnaireChange={onQuestionnaireChange}

            onUploadsChange={onUploadsChange}

            onSubmit={handleSubmit}

            submitting={submitting}

            canSubmit={canSubmit}

          />

        </div>

      </aside>

    </>

  );

}



interface MobileQuestionnaireFabProps {

  onOpen: () => void;

}



export function MobileQuestionnaireFab({ onOpen }: MobileQuestionnaireFabProps) {

  const { translate } = useApp();



  return (

    <button

      type="button"

      onClick={onOpen}

      className="fixed bottom-20 left-4 z-40 flex items-center gap-2 rounded-full border border-white/15 bg-[#141414]/95 px-4 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition hover:bg-white/10 lg:hidden"

      aria-label={translate("workspace.openQuestionnaire")}

    >

      <ClipboardList className="h-4 w-4 text-[#2680eb]" />

      {translate("workspace.openQuestionnaire")}

    </button>

  );

}

