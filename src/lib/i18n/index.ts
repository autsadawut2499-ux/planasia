import type { Locale, UiLocale } from "@/lib/geo/countries";

export type TranslationKey =
  | "nav.home"
  | "nav.store"
  | "nav.pricing"
  | "nav.howItWorks"
  | "nav.startDesign"
  | "nav.login"
  | "nav.menu"
  | "nav.closeMenu"
  | "nav.housePlans"
  | "nav.collections"
  | "nav.findDraftsman"
  | "nav.aboutPlans"
  | "nav.signIn"
  | "nav.searchByPlan"
  | "nav.wishlist"
  | "nav.cart"
  | "nav.shop"
  | "nav.account"
  | "nav.chat"
  | "nav.bottomNav"
  | "nav.seller"
  | "nav.sellerAria"
  | "hero.title"
  | "hero.subtitle"
  | "hero.cta"
  | "hero.ctaSecondary"
  | "gallery.title"
  | "publicGallery.nav"
  | "publicGallery.loading"
  | "publicGallery.loadError"
  | "publicGallery.emptyTitle"
  | "publicGallery.emptyDesc"
  | "publicGallery.viewWork"
  | "publicGallery.viewOnly"
  | "publicGallery.viewFloorPlan3d"
  | "publicGallery.viewFacade"
  | "publicGallery.lightboxTitle"
  | "publicGallery.closeLightbox"
  | "publicGallery.viewOnlyHint"
  | "how.title"
  | "how.step1.title"
  | "how.step1.desc"
  | "how.step2.title"
  | "how.step2.desc"
  | "how.step3.title"
  | "how.step3.desc"
  | "pricing.title"
  | "pricing.subtitle"
  | "pricing.standard"
  | "pricing.premium"
  | "pricing.luxury"
  | "pricing.store"
  | "pricing.custom1"
  | "pricing.custom2"
  | "pricing.cad"
  | "pricing.perDesign"
  | "pricing.buyNow"
  | "pricing.feature.pdfPreview"
  | "pricing.feature.instantDownload"
  | "pricing.feature.storeCatalog"
  | "pricing.feature.customSpec1Story"
  | "pricing.feature.customSpec2Story"
  | "pricing.feature.fullPdfA3"
  | "pricing.feature.permitReady"
  | "pricing.feature.structuralStandardReview"
  | "pricing.feature.foundationStructuralCalc"
  | "pricing.feature.cadDeliverable"
  | "pricing.popularBadge"
  | "pricing.starter.name"
  | "pricing.starter.tagline"
  | "pricing.starter.price"
  | "pricing.starter.priceNote"
  | "pricing.starter.feature1"
  | "pricing.starter.feature2"
  | "pricing.starter.feature3"
  | "pricing.starter.cta"
  | "pricing.pro.name"
  | "pricing.pro.tagline"
  | "pricing.pro.price"
  | "pricing.pro.priceNote"
  | "pricing.pro.feature1"
  | "pricing.pro.feature2"
  | "pricing.pro.feature3"
  | "pricing.pro.feature4"
  | "pricing.pro.cta"
  | "pricing.business.name"
  | "pricing.business.tagline"
  | "pricing.business.price"
  | "pricing.business.priceNote"
  | "pricing.business.feature1"
  | "pricing.business.feature2"
  | "pricing.business.feature3"
  | "pricing.business.feature4"
  | "pricing.business.cta"
  | "workspace.controlPanel"
  | "workspace.openQuestionnaire"
  | "workspace.style"
  | "workspace.roofType"
  | "workspace.colorPalette"
  | "workspace.floors"
  | "workspace.upload"
  | "workspace.uploadHint"
  | "workspace.projectName"
  | "workspace.location"
  | "workspace.preview"
  | "workspace.save"
  | "workspace.share"
  | "workspace.shareCopied"
  | "workspace.shareFailed"
  | "workspace.expandFullscreen"
  | "ai.statusLive"
  | "ai.statusOffline"
  | "ai.statusLiveHint"
  | "ai.statusOfflineHint"
  | "workspace.prevView"
  | "workspace.nextView"
  | "workspace.floor1"
  | "workspace.floor2"
  | "workspace.exportPdf"
  | "workspace.exportCad"
  | "workspace.exportPdfDesc"
  | "workspace.exportCadDesc"
  | "workspace.downloadPanel"
  | "workspace.downloadPanelHint"
  | "workspace.sheetArch"
  | "workspace.sheetStructural"
  | "workspace.sheetSanitary"
  | "workspace.sheetElectrical"
  | "workspace.sheetMechanical"
  | "workspace.sheetAc"
  | "workspace.sheetOther"
  | "workspace.sheetPreviewTitle"
  | "workspace.sheetPreviewHint"
  | "workspace.watermarkHint"
  | "workspace.myWorks"
  | "workspace.addWork"
  | "workspace.deleteWork"
  | "workspace.workCreated"
  | "workspace.workDeleted"
  | "sidebar.title"
  | "sidebar.projectName"
  | "sidebar.ownerName"
  | "sidebar.location"
  | "sidebar.floors"
  | "sidebar.floor1"
  | "sidebar.floor2"
  | "sidebar.bedrooms"
  | "sidebar.bathrooms"
  | "sidebar.budget"
  | "sidebar.style"
  | "sidebar.wallMaterial"
  | "sidebar.floorMaterial"
  | "sidebar.roofMaterial"
  | "sidebar.foundation"
  | "sidebar.groupProject"
  | "sidebar.groupBuilding"
  | "sidebar.groupMaterials"
  | "sidebar.groupUploads"
  | "workspace.chatPlaceholder"
  | "workspace.generate"
  | "workspace.generateRender"
  | "workspace.generatingRender"
  | "workspace.generatingPlans"
  | "workspace.generating"
  | "workspace.viewRender3d"
  | "workspace.viewFacade"
  | "workspace.viewFloorPlan"
  | "workspace.aiZone"
  | "workspace.aiPreviewEmpty"
  | "workspace.aiPreviewHint"
  | "workflow.step1"
  | "workflow.step2"
  | "workflow.step3"
  | "workflow.step4"
  | "workflow.step5"
  | "workflow.conceptReady"
  | "workflow.conceptReviewHint"
  | "workflow.conceptExportedHint"
  | "concept.exportPanel"
  | "concept.exportPanelHint"
  | "concept.exportPerspective"
  | "concept.exportPerspectiveDesc"
  | "concept.exportFacade"
  | "concept.exportFacadeDesc"
  | "concept.exportBoard"
  | "concept.exportBoardDesc"
  | "concept.exportEmpty"
  | "concept.exportDisclaimer"
  | "inputStage.title"
  | "inputStage.subtitle"
  | "inputStage.uploadSection"
  | "inputStage.floorPlan"
  | "inputStage.floorPlanHint"
  | "inputStage.floorPlan1"
  | "inputStage.floorPlan1Hint"
  | "inputStage.floorPlan2"
  | "inputStage.floorPlan2Hint"
  | "inputStage.elevation"
  | "inputStage.elevationHint"
  | "inputStage.dropHere"
  | "inputStage.browseFiles"
  | "inputStage.fileFormats"
  | "inputStage.uploading"
  | "inputStage.required"
  | "inputStage.styleSection"
  | "inputStage.styleModernMinimal"
  | "inputStage.styleNordic"
  | "inputStage.styleModernTropical"
  | "inputStage.styleLoftIndustrial"
  | "inputStage.styleJapanese"
  | "inputStage.startConcept"
  | "inputStage.confirm"
  | "inputStage.rendering"
  | "inputStage.sidebarHint"
  | "workflow.confirmPlan"
  | "workflow.confirmHint"
  | "workflow.optionsTitle"
  | "workflow.optionsDesc"
  | "workflow.generatePlans"
  | "workflow.cancel"
  | "workflow.watermarkHint"
  | "workflow.paywallHint"
  | "workflow.payToUnlock"
  | "workflow.preview3dOnly"
  | "workflow.preview3dHint"
  | "workflow.plansReadyPaywall"
  | "workflow.autoListed"
  | "workflow.unlockedHint"
  | "options.wall"
  | "options.floor"
  | "options.roof"
  | "options.extras"
  | "options.electrical"
  | "options.plumbing"
  | "options.structural"
  | "options.evCharger"
  | "payment.title"
  | "payment.desc"
  | "payment.payNow"
  | "payment.processing"
  | "payment.failed"
  | "download.readyPdf"
  | "download.readyCad"
  | "store.subtitle"
  | "store.communityBadge"
  | "store.empty"
  | "country.select"
  | "language.select"
  | "currency.select"
  | "footer.contact"
  | "footer.privacy"
  | "footer.terms"
  | "legal.lastUpdated"
  | "form.ownerName"
  | "form.projectName"
  | "form.province"
  | "form.floors"
  | "form.foundation"
  | "form.foundation.pile"
  | "form.foundation.spread"
  | "form.foundation.pileRequired"
  | "form.bedrooms"
  | "form.bathrooms"
  | "form.budget"
  | "questionnaire.title"
  | "questionnaire.subtitle"
  | "questionnaire.designDirection"
  | "questionnaire.goldenStandard"
  | "questionnaire.disciplinePreset"
  | "questionnaire.uploads"
  | "upload.optional"
  | "upload.optionalHint"
  | "upload.aiExtractHint"
  | "upload.ref1"
  | "upload.ref2"
  | "upload.ref1Hint"
  | "upload.ref2Hint"
  | "upload.tooltip"
  | "upload.analysisTitle"
  | "upload.analysisDone"
  | "upload.rejected"
  | "upload.floorPlan3dTitle"
  | "upload.floorPlan3dHint"
  | "upload.floorPlan3dClose"
  | "upload.generating3dFloorPlan"
  | "upload.floorPlan3dGeneratingHint"
  | "upload.floorPlan3dReady"
  | "upload.floorPlan3dFailed"
  | "workspace.viewFloorPlan3d"
  | "workspace.viewPresentationBoard"
  | "presentationBoard.title"
  | "presentationBoard.subtitle"
  | "presentationBoard.hint"
  | "presentationBoard.floors"
  | "presentationBoard.singleStory"
  | "presentationBoard.twoStory"
  | "presentationBoard.projectName"
  | "presentationBoard.description"
  | "presentationBoard.captionLeft"
  | "presentationBoard.captionCenter"
  | "presentationBoard.captionRight"
  | "presentationBoard.floorPlanRule"
  | "presentationBoard.generate"
  | "presentationBoard.generating"
  | "presentationBoard.generatingHint"
  | "presentationBoard.ready"
  | "presentationBoard.failed"
  | "presentationBoard.empty"
  | "presentationBoard.showPrompt"
  | "presentationBoard.hidePrompt"
  | "presentationBoard.open"
  | "presentationBoard.requiredForDrafting"
  | "presentationBoard.draftingReady"
  | "presentationBoard.draftingRequired"
  | "presentationBoard.upload"
  | "presentationBoard.download"
  | "presentationBoard.share"
  | "presentationBoard.shared"
  | "presentationBoard.linkCopied"
  | "presentationBoard.shareFailed"
  | "presentationBoard.stored"
  | "presentationBoard.downloaded"
  | "presentationBoard.storedLabel"
  | "presentationBoard.sourceGenerated"
  | "presentationBoard.sourceUploaded"
  | "questionnaire.slot1"
  | "questionnaire.slot1Hint"
  | "questionnaire.slot2"
  | "questionnaire.slot2Hint"
  | "questionnaire.slot3"
  | "questionnaire.slot3Hint"
  | "questionnaire.slot4"
  | "questionnaire.slot4Hint"
  | "questionnaire.floorPlanUnit"
  | "questionnaire.preferences"
  | "questionnaire.projectType"
  | "questionnaire.projectTypeHint"
  | "questionnaire.parkingSpaces"
  | "questionnaire.elevators"
  | "questionnaire.floorLoad"
  | "questionnaire.nonResidentialNote"
  | "questionnaire.decorationStyle"
  | "questionnaire.primaryMaterial"
  | "questionnaire.selectMaterial"
  | "questionnaire.landSize"
  | "questionnaire.constraints"
  | "questionnaire.constraintsPlaceholder"
  | "questionnaire.submit"
  | "questionnaire.checking"
  | "clarify.title"
  | "clarify.progress"
  | "clarify.noGuess"
  | "clarify.placeholder"
  | "questionnaire.slot1Tooltip"
  | "questionnaire.slot2Tooltip"
  | "questionnaire.slot3Tooltip"
  | "questionnaire.slot4Tooltip"
  | "toast.uploading"
  | "toast.uploadSuccess"
  | "toast.uploadError"
  | "toast.checking"
  | "toast.processingRender"
  | "toast.renderReady"
  | "toast.processingPlans"
  | "toast.plansReady"
  | "toast.error"
  | "toast.clarifyNeeded"
  | "store.pageTitle"
  | "store.searchPlaceholder"
  | "store.filters"
  | "store.results"
  | "store.any"
  | "store.filterFloors"
  | "store.filterBeds"
  | "store.filterBaths"
  | "store.filterLivingRooms"
  | "store.filterStyle"
  | "store.filterCollection"
  | "store.filterProvince"
  | "store.planLabel"
  | "store.startingAt"
  | "store.specSqft"
  | "store.specBeds"
  | "store.specBaths"
  | "store.specLivingRooms"
  | "store.specStories"
  | "store.viewPlan"
  | "store.viewExterior"
  | "store.viewFloorPlan"
  | "store.buyNow"
  | "store.checkoutTitle"
  | "store.purchaseSuccess"
  | "store.paymentPending"
  | "store.autoPublished"
  | "store.addToCart"
  | "store.cartTitle"
  | "store.cartEmpty"
  | "store.cartRemove"
  | "store.cartSubtotal"
  | "store.cartDiscount"
  | "store.cartTotal"
  | "store.cartCheckout"
  | "store.cartCheckoutSuccess"
  | "store.cartAdded"
  | "store.cartInCart"
  | "store.cartBundleDiscount"
  | "store.upsell.similarStyle"
  | "store.upsell.exploreMore"
  | "store.upsell.boqBundle"
  | "store.upsell.boqBundleDesc"
  | "store.upsell.bundleHint2"
  | "store.upsell.bundleHint3"
  | "common.yes"
  | "common.no"
  | "payment.promptpay"
  | "payment.card"
  | "store.aria.save"
  | "store.aria.favorites"
  | "store.aria.removeFavorite"
  | "store.favoritesTitle"
  | "store.favoritesEmpty"
  | "store.searchActive"
  | "store.favoritesFilterActive"
  | "store.globalBanner.title"
  | "store.globalBanner.subtitle"
  | "store.globalBanner.switchLabel"
  | "store.globalBanner.aiActive"
  | "store.globalBanner.aria"
  | "pwa.installTitle"
  | "pwa.installSubtitle"
  | "pwa.benefit1"
  | "pwa.benefit2"
  | "pwa.benefit3"
  | "pwa.installNow"
  | "pwa.installing"
  | "pwa.later"
  | "pwa.neverAsk"
  | "pwa.iosTitle"
  | "pwa.iosSteps"
  | "pwa.gotIt"
  | "pwa.androidHint"
  | "landing.ctaBand"
  | "landing.ctaBandDesc"
  | "editor.title"
  | "editor.saveDraft"
  | "editor.saving"
  | "editor.draftSaved"
  | "editor.rooms"
  | "editor.openings"
  | "editor.door"
  | "editor.window"
  | "editor.addDoor"
  | "editor.addWindow"
  | "editor.materials"
  | "editor.materialEstimate"
  | "editor.estimateNote"
  | "editor.view3d"
  | "editor.viewPlan"
  | "editor.width"
  | "editor.depth"
  | "editor.wallSide"
  | "editor.position"
  | "editor.openingWidth"
  | "editor.removeOpening"
  | "editor.roughPreviewTitle"
  | "editor.roughPreviewDesc"
  | "editor.structureSummary"
  | "editor.roomCount"
  | "editor.openingCount"
  | "editor.grossArea"
  | "editor.inclContingency"
  | "editor.backToEdit"
  | "editor.confirmAndGenerate"
  | "editor.barHint"
  | "editor.exitEdit"
  | "editor.openEdit"
  | "editor.previewStructure"
  | "editor.exportDocumentation"
  | "editor.exportDocumentationSuccess"
  | "editor.exportDocumentationFailed"
  | "editor.exportPreviewTitle"
  | "editor.exportPreviewLoading"
  | "editor.exportPreviewProject"
  | "editor.exportPreviewScheduleItems"
  | "editor.exportDownloadJson"
  | "editor.exportDownloadPdf"
  | "editor.exportPdfSuccess"
  | "editor.exportPdfFailed"
  | "job.exportTitle"
  | "job.queued"
  | "job.processing"
  | "job.completed"
  | "job.failed"
  | "job.download"
  | "job.downloadStarted"
  | "job.downloadAgain"
  | "job.jobId"
  | "job.rateLimited"
  | "cost.inputTitle"
  | "cost.maxBudget"
  | "cost.targetArea"
  | "cost.tierLabel"
  | "cost.tierEconomy"
  | "cost.tierStandard"
  | "cost.tierPremium"
  | "cost.liveTotal"
  | "cost.perSqm"
  | "cost.budgetUsed"
  | "cost.areaUsed"
  | "cost.alertTitle"
  | "cost.overBudgetMsg"
  | "cost.overAreaMsg"
  | "cost.estSavings"
  | "cost.applyFix"
  | "cost.bankReady"
  | "cost.bankReadyShort"
  | "cost.permitNotReady"
  | "cost.permitNotReadyShort"
  | "cost.ofBudget"
  | "cost.adjustNeeded"
  | "cost.rec.downgradeWall"
  | "cost.rec.downgradeFloor"
  | "cost.rec.downgradeRoof"
  | "cost.rec.changeTier"
  | "cost.rec.shrinkRoom"
  | "cost.rec.removeOpening"
  | "permit.title"
  | "permit.checking"
  | "permit.rateLimited"
  | "permit.checkFailed"
  | "permit.allClear"
  | "permit.issuesSummary"
  | "permit.passed"
  | "permit.needsReview"
  | "permit.requiredDocs"
  | "how.subtitle"
  | "how.stepLabel"
  | "how.step4.title"
  | "how.step4.desc"
  | "landing.hero.eyebrow"
  | "landing.hero.tagline"
  | "landing.hero.desc"
  | "landing.hero.getStarted"
  | "landing.hero.browseStyles"
  | "landing.hero.flowHint"
  | "features.eyebrow"
  | "features.title"
  | "features.fast.title"
  | "features.fast.desc"
  | "features.geometry.title"
  | "features.geometry.desc"
  | "features.styles.title"
  | "features.styles.desc"
  | "inputStage.uploadEyebrow"
  | "inputStage.uploadTitle"
  | "inputStage.uploadDesc"
  | "inputStage.bothReady"
  | "inputStage.needBoth"
  | "inputStage.confirmRender"
  | "results.eyebrow"
  | "results.title"
  | "results.newUpload"
  | "results.failed"
  | "results.planTitle"
  | "results.planSubtitle"
  | "results.facadeTitle"
  | "results.facadeSubtitle"
  | "results.rendering"
  | "results.empty"
  | "results.expand"
  | "results.download"
  | "results.downloadAll"
  | "results.downloaded"
  | "results.downloadFailed"
  | "results.share"
  | "results.shareTitle"
  | "results.shareText"
  | "results.shared"
  | "results.shareCopied"
  | "results.shareDownloadFallback"
  | "results.shareFailed"
  | "wizard.step.upload"
  | "wizard.step.confirm"
  | "wizard.step.result"
  | "wizard.aria"
  | "beforeAfter.before"
  | "beforeAfter.after"
  | "beforeAfter.beforeHint"
  | "beforeAfter.afterHint"
  | "beforeAfter.dragHint"
  | "beforeAfter.aria"
  | "chat.errorGeneric"
  | "galleryPage.title"
  | "galleryPage.subtitle"
  | "galleryPage.ctaTitle"
  | "galleryPage.ctaDesc"
  | "galleryPage.ctaButton"
  | "permit.blockSubmit";

/**
 * `en` is the complete source of truth. Other locales (including the wider Asian
 * UI languages) are optional — any missing key falls back to English in `t()`,
 * so new languages can be filled in incrementally without a type error.
 */
type Translations = { en: Record<TranslationKey, string> } & Partial<
  Record<UiLocale, Partial<Record<TranslationKey, string>>>
>;

const translations: Translations = {
  en: {
    "nav.home": "Home",
    "nav.store": "Store",
    "nav.pricing": "Pricing",
    "nav.howItWorks": "Workflow",
    "nav.startDesign": "Start Creating",
    "nav.login": "Sign in with Google",
    "nav.menu": "Menu",
    "nav.closeMenu": "Close menu",
    "nav.housePlans": "House Plans",
    "nav.collections": "Collections",
    "nav.findDraftsman": "Architects & Designers",
    "nav.aboutPlans": "Home loan consultation",
    "nav.signIn": "Sign In",
    "nav.searchByPlan": "Search by Plan #",
    "nav.wishlist": "Wishlist",
    "nav.cart": "Cart",
    "nav.shop": "Shop",
    "nav.account": "Account",
    "nav.chat": "Chat",
    "nav.bottomNav": "Mobile navigation",
    "nav.seller": "ลงขายแบบ",
    "nav.sellerAria": "ลงขายแบบ — entry for architects and draftsmen who write house plans",
    "hero.title": "House Plans & Designs, Ready to Build",
    "hero.subtitle":
      "Browse a curated collection of professional house plans and designs. Find your perfect layout, buy instantly, and download construction-ready documents.",
    "hero.cta": "Browse House Plans",
    "hero.ctaSecondary": "View House Shop",
    "gallery.title": "แบบบ้าน Curated Styles",
    "publicGallery.nav": "Gallery",
    "publicGallery.loading": "Loading gallery…",
    "publicGallery.loadError": "Could not load the gallery. Please try again.",
    "publicGallery.emptyTitle": "No projects in the gallery yet",
    "publicGallery.emptyDesc": "When users create AI home concepts, their work will appear here for inspiration.",
    "publicGallery.viewWork": "View work",
    "publicGallery.viewOnly": "View only",
    "publicGallery.viewFloorPlan3d": "3D plan",
    "publicGallery.viewFacade": "Facade",
    "publicGallery.lightboxTitle": "View project",
    "publicGallery.closeLightbox": "Close",
    "publicGallery.viewOnlyHint": "This gallery is view-only — high-resolution downloads are available to project owners in Workspace.",
    "how.title": "How It Works",
    "how.step1.title": "Select floor plan",
    "how.step1.desc": "Upload your 2D floor plan and front elevation to lock the building structure.",
    "how.step2.title": "Choose style & vibe",
    "how.step2.desc":
      "On the upload page, pick Minimalist, Modern, Tropical, Luxury, or Japanese — materials and atmosphere only.",
    "how.step3.title": "Confirm & generate",
    "how.step3.desc": "Review your inputs, then send one command to the AI rendering engine.",
    "pricing.title": "Plans & Pricing",
    "pricing.subtitle": "Standard architectural drawing sets and CAD files for construction projects.",
    "pricing.standard": "Standard",
    "pricing.premium": "Premium",
    "pricing.luxury": "Luxury",
    "pricing.store": "Ready-Made House Plans (Store)",
    "pricing.custom1": "Custom 1-Story Design",
    "pricing.custom2": "Custom 2-Story Design",
    "pricing.cad": "CAD File",
    "pricing.perDesign": "per set",
    "pricing.buyNow": "Get Started",
    "pricing.feature.pdfPreview": "PDF document set with preview samples",
    "pricing.feature.instantDownload": "Instant download after payment",
    "pricing.feature.storeCatalog": "Access to the ready-made house plan catalog",
    "pricing.feature.customSpec1Story": "Custom design to your specifications (single-storey)",
    "pricing.feature.customSpec2Story": "Custom design to your specifications (two-storey)",
    "pricing.feature.fullPdfA3": "Complete PDF drawing set (A3 layout)",
    "pricing.feature.permitReady": "Documentation ready for building permit submission",
    "pricing.feature.structuralStandardReview": "Reviewed against structural design standards",
    "pricing.feature.foundationStructuralCalc": "Foundation and structural calculation schedule included",
    "pricing.feature.cadDeliverable": "CAD files included for downstream use",
    "pricing.popularBadge": "Popular",
    "pricing.starter.name": "Starter",
    "pricing.starter.tagline": "For getting started",
    "pricing.starter.price": "Free",
    "pricing.starter.priceNote": "0 THB",
    "pricing.starter.feature1": "3 credits (3 generations / 6 images)",
    "pricing.starter.feature2": "Standard image resolution",
    "pricing.starter.feature3": "Instant download and share",
    "pricing.starter.cta": "Start free",
    "pricing.pro.name": "Pro",
    "pricing.pro.tagline": "For serious use",
    "pricing.pro.price": "290",
    "pricing.pro.priceNote": "THB · one-time",
    "pricing.pro.feature1": "30 credits (30 generations / 60 images)",
    "pricing.pro.feature2": "High-resolution renders",
    "pricing.pro.feature3": "Unlimited architectural styles",
    "pricing.pro.feature4": "High-res files for presentations",
    "pricing.pro.cta": "Choose this plan",
    "pricing.business.name": "Business",
    "pricing.business.tagline": "For teams and professionals",
    "pricing.business.price": "990",
    "pricing.business.priceNote": "THB / month",
    "pricing.business.feature1": "150 credits per month",
    "pricing.business.feature2": "Priority render queue",
    "pricing.business.feature3": "Commercial usage rights",
    "pricing.business.feature4": "Save history and revise past work",
    "pricing.business.cta": "Contact us",
    "workspace.controlPanel": "Control & Input Panel",
    "workspace.openQuestionnaire": "Design settings",
    "workspace.style": "Style",
    "workspace.roofType": "Roof Type",
    "workspace.colorPalette": "Color Palette",
    "workspace.floors": "Floors",
    "workspace.upload": "Upload Plan",
    "workspace.uploadHint": "Drag or click to upload house plan file",
    "workspace.projectName": "Project Name",
    "workspace.location": "Location",
    "workspace.preview": "Live Render Preview",
    "workspace.save": "Save",
    "workspace.share": "Share",
    "workspace.shareCopied": "Link copied to clipboard",
    "workspace.shareFailed": "Could not share — try copying the URL manually",
    "workspace.expandFullscreen": "Fullscreen",
    "ai.statusLive": "AI Live",
    "ai.statusOffline": "Template Mode",
    "ai.statusLiveHint": "Gemini AI connected — live generation enabled.",
    "ai.statusOfflineHint": "No AI key — using deterministic templates. Set GEMINI_API_KEY to connect.",
    "workspace.prevView": "Previous view",
    "workspace.nextView": "Next view",
    "workspace.floor1": "1st Floor Plan",
    "workspace.floor2": "2nd Floor Plan",
    "workspace.exportPdf": "Download PDF",
    "workspace.exportCad": "Download AutoCAD",
    "workspace.exportPdfDesc": "Full permit drawing set — clean, unwatermarked",
    "workspace.exportCadDesc": "CAD files for downstream use — clean, unwatermarked",
    "workspace.downloadPanel": "Downloads",
    "workspace.downloadPanelHint": "Preview is free. Pay to download clean files without watermarks.",
    "workspace.sheetArch": "Architectural",
    "workspace.sheetStructural": "Structural",
    "workspace.sheetSanitary": "Sanitary",
    "workspace.sheetElectrical": "Electrical",
    "workspace.sheetMechanical": "Mechanical",
    "workspace.sheetAc": "Air Conditioning",
    "workspace.sheetOther": "Drawing Sheet",
    "workspace.sheetPreviewTitle": "Drawing Sheet Preview",
    "workspace.sheetPreviewHint": "Scroll to review all sheets. Watermarked preview — pay to download clean files.",
    "workspace.watermarkHint": "Preview only — watermarked to protect your design.",
    "workspace.myWorks": "My works",
    "workspace.addWork": "Add work",
    "workspace.deleteWork": "Delete work",
    "workspace.workCreated": "New work created",
    "workspace.workDeleted": "Work deleted",
    "sidebar.title": "Project settings",
    "sidebar.projectName": "Project name",
    "sidebar.ownerName": "Owner name",
    "sidebar.location": "Construction site",
    "sidebar.floors": "Floors",
    "sidebar.floor1": "1 floor",
    "sidebar.floor2": "2 floors",
    "sidebar.bedrooms": "Bedrooms",
    "sidebar.bathrooms": "Bathrooms",
    "sidebar.budget": "Budget",
    "sidebar.style": "Preferred style",
    "sidebar.wallMaterial": "Wall material",
    "sidebar.floorMaterial": "Floor material",
    "sidebar.roofMaterial": "Roof material",
    "sidebar.foundation": "Foundation type",
    "sidebar.groupProject": "Project info",
    "sidebar.groupBuilding": "Building spec",
    "sidebar.groupMaterials": "Materials",
    "sidebar.groupUploads": "Reference files",
    "workspace.chatPlaceholder":
      "Consult AI to edit: e.g. 'change balcony to glass', 'adjust exterior walls'",
    "workspace.generate": "Generate",
    "workspace.generateRender": "Generate 3D Render",
    "workspace.generatingRender": "Creating 3D preview...",
    "workspace.generatingPlans": "Generating drawing sheets...",
    "workspace.generating": "Rendering your concept…",
    "workspace.viewRender3d": "3D Floor Plan",
    "workspace.viewFacade": "Front Elevation",
    "workspace.viewFloorPlan": "Floor Plan",
    "workspace.aiZone": "AI Output Zone",
    "workspace.aiPreviewEmpty": "Complete the brief and generate — AI images will appear here.",
    "workspace.aiPreviewHint": "Rendering 3D view, front facade, and floor plan…",
    "workflow.step1": "1. Home",
    "workflow.step2": "2. Floor Plan",
    "workflow.step3": "3. Style & Vibe",
    "workflow.step4": "4. Confirm",
    "workflow.step5": "5. AI Result",
    "workflow.conceptReady": "Concept ready — review zoning and download design ideas",
    "workflow.conceptReviewHint": "Review room zoning and presentation images, then export the concept pack",
    "workflow.conceptExportedHint": "Concept pack downloaded successfully",
    "concept.exportPanel": "Export concept",
    "concept.exportPanelHint": "Download 3D views and mood board for client presentation",
    "concept.exportPerspective": "3D perspective",
    "concept.exportPerspectiveDesc": "Three-dimensional concept render",
    "concept.exportFacade": "Front facade",
    "concept.exportFacadeDesc": "Straight-on front elevation image",
    "concept.exportBoard": "Mood board",
    "concept.exportBoardDesc": "Presentation board summarizing the design idea",
    "concept.exportEmpty": "Nothing to download yet — generate a concept first",
    "concept.exportDisclaimer": "Outputs are concept-level design ideas, not construction or permit drawings",
    "inputStage.title": "Generate your concept",
    "inputStage.subtitle": "Upload your floor plan and front elevation, pick a style, then confirm to render.",
    "inputStage.uploadSection": "Upload images",
    "inputStage.floorPlan": "2D floor plan",
    "inputStage.floorPlanHint": "Line drawing or sketch of the floor layout",
    "inputStage.floorPlan1": "First floor plan",
    "inputStage.floorPlan1Hint": "Ground floor / แปลนชั้น 1 — PNG, JPEG, or PDF",
    "inputStage.floorPlan2": "Second floor plan",
    "inputStage.floorPlan2Hint": "Upper floor / แปลนชั้น 2 — PNG, JPEG, or PDF",
    "inputStage.elevation": "Front elevation",
    "inputStage.elevationHint": "Front view / รูปหน้าบ้าน — PNG, JPEG, or PDF",
    "inputStage.dropHere": "Drag and drop your file here",
    "inputStage.browseFiles": "or click to browse",
    "inputStage.fileFormats": "PNG, JPEG, or PDF",
    "inputStage.uploading": "Uploading…",
    "inputStage.required": "Required",
    "inputStage.styleSection": "Style",
    "inputStage.styleModernMinimal": "แบบบ้าน Minimalist",
    "inputStage.styleNordic": "แบบบ้าน Modern",
    "inputStage.styleModernTropical": "แบบบ้าน Tropical",
    "inputStage.styleLoftIndustrial": "แบบบ้าน Luxury",
    "inputStage.styleJapanese": "แบบบ้าน Japanese",
    "inputStage.startConcept": "Start AI concept",
    "inputStage.confirm": "Confirm",
    "inputStage.rendering": "Rendering…",
    "inputStage.sidebarHint": "Upload references and pick a style, then click Confirm.",
    "workflow.confirmPlan": "Confirm concept",
    "workflow.confirmHint": "Review the 3D render. Confirm to generate the full drawing set.",
    "workflow.optionsTitle": "Plan Details & Options",
    "workflow.optionsDesc": "Select materials and disciplines before generating drawing sheets.",
    "workflow.generatePlans": "Generate Drawing Sheets",
    "workflow.cancel": "Cancel",
    "workflow.watermarkHint": "Watermarked preview — pay to download clean files.",
    "workflow.paywallHint": "Complete checkout to download clean, unwatermarked PDF or CAD files.",
    "workflow.payToUnlock": "Pay to Unlock",
    "workflow.preview3dOnly": "3D preview — drawing sheets generated after confirmation",
    "workflow.preview3dHint": "Inspect your 3D render, then confirm to generate all drawing sheets.",
    "workflow.plansReadyPaywall": "Drawing sheets ready — scroll to preview, pay to download",
    "workflow.autoListed": "Listed on Store for others (hidden from your view)",
    "workflow.unlockedHint": "Payment confirmed — floor plans, downloads, and Store listing are now active.",
    "options.wall": "Wall Material",
    "options.floor": "Floor Material",
    "options.roof": "Roof Material",
    "options.extras": "Drawing Sets & Extras",
    "options.electrical": "Electrical Plan",
    "options.plumbing": "Plumbing & Sanitary",
    "options.structural": "Structural calculation document (PDF file)",
    "options.evCharger": "EV Charger Outlet",
    "payment.title": "Unlock Download",
    "payment.desc": "Pay to download full-quality design files from the seller.",
    "payment.payNow": "Pay & Unlock",
    "payment.processing": "Processing...",
    "payment.failed": "Payment failed. Please try again.",
    "download.readyPdf": "PDF permit drawing set — click Export PDF to download.",
    "download.readyCad": "CAD floor plan export — click Export CAD to download.",
    "store.subtitle": "Curated architectural house plans ready for construction",
    "store.communityBadge": "AI Community Design",
    "store.empty": "No community listings yet. Create a design in Workspace to populate the store.",
    "country.select": "Country / Region",
    "language.select": "Language",
    "currency.select": "Currency",
    "footer.contact": "Contact",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Service",
    "legal.lastUpdated": "Last updated: July 2026",
    "form.ownerName": "Owner Name",
    "form.projectName": "Project Name (optional)",
    "form.province": "Province / District",
    "form.floors": "Number of Floors",
    "form.foundation": "Foundation Type",
    "form.foundation.pile": "Pile Foundation",
    "form.foundation.spread": "Spread Footing",
    "form.foundation.pileRequired":
      "For 2-floor buildings, pile foundation is required for structural safety.",
    "form.bedrooms": "Bedrooms",
    "form.bathrooms": "Bathrooms",
    "form.budget": "Construction Budget",
    "questionnaire.title": "Input Questionnaire",
    "questionnaire.subtitle": "Fill in project details — reference images are optional (max 2)",
    "questionnaire.designDirection": "Design Direction",
    "questionnaire.goldenStandard": "Golden Standard Reference",
    "questionnaire.disciplinePreset": "Drawing Set Scope",
    "questionnaire.uploads": "Reference images (optional, max 2)",
    "upload.optional": "Optional",
    "upload.optionalHint": "Not required — upload up to 2 plan/reference images (.jpg, .png only, no size limit).",
    "upload.aiExtractHint":
      "AI reads floor plans, walls, doors, windows, dimensions, materials, and builds a preliminary takeoff summary.",
    "upload.ref1": "Reference image 1",
    "upload.ref2": "Reference image 2",
    "upload.ref1Hint": "Floor plan, site plan, or elevation",
    "upload.ref2Hint": "Section, material schedule, or extra plan",
    "upload.tooltip":
      "AI extracts architectural data (layout, openings, dimensions) and material specs from your images.",
    "upload.analysisTitle": "AI summary",
    "upload.analysisDone": "Image analysis complete",
    "upload.rejected": "This image cannot be used — please upload house plans or building references only.",
    "upload.floorPlan3dTitle": "3D Floor Plan Preview",
    "upload.floorPlan3dHint": "Isometric bird's-eye view — AI generated from your reference images",
    "upload.floorPlan3dClose": "Close",
    "upload.generating3dFloorPlan": "Generating 3D floor plan…",
    "upload.floorPlan3dGeneratingHint": "AI is building a realistic isometric visualization with lighting, textures, and furniture layout.",
    "upload.floorPlan3dReady": "3D floor plan ready!",
    "upload.floorPlan3dFailed": "Could not generate 3D floor plan — showing layout preview instead.",
    "workspace.viewFloorPlan3d": "3D Floor Plan",
    "workspace.viewPresentationBoard": "Presentation Board",
    "presentationBoard.title": "Project Presentation Board",
    "presentationBoard.subtitle": "A3 landscape board — exterior left, plans + interiors right",
    "presentationBoard.hint": "Fixed A3 layout: header, 2-column grid (exterior | plans + 3 interiors), footer. Thai captions auto-filled — edit before generating.",
    "presentationBoard.floors": "House type",
    "presentationBoard.singleStory": "Single-story (1 floor plan)",
    "presentationBoard.twoStory": "Two-story (ground + upper plans)",
    "presentationBoard.projectName": "Project name / footer",
    "presentationBoard.description": "Project description",
    "presentationBoard.captionLeft": "Caption — left interior (Thai)",
    "presentationBoard.captionCenter": "Caption — center interior (Thai)",
    "presentationBoard.captionRight": "Caption — right interior (Thai)",
    "presentationBoard.floorPlanRule": "Floor plan labels",
    "presentationBoard.generate": "Generate Presentation Board",
    "presentationBoard.generating": "Generating board…",
    "presentationBoard.generatingHint": "AI is composing the A3 board: exterior, floor plans, interiors, and Thai captions.",
    "presentationBoard.ready": "Presentation board ready!",
    "presentationBoard.failed": "Could not generate presentation board.",
    "presentationBoard.empty": "Upload plans to preview the A3 layout, then Generate to compose the print board.",
    "presentationBoard.showPrompt": "Show master prompt",
    "presentationBoard.hidePrompt": "Hide master prompt",
    "presentationBoard.open": "Presentation Board",
    "presentationBoard.requiredForDrafting": "Generate or upload a presentation board first — it is required as input for DPT blueprint drafting.",
    "presentationBoard.draftingReady": "Presentation board saved — confirm to generate DPT-aligned drawing set.",
    "presentationBoard.draftingRequired": "Create a presentation board first — it drives the permit drafting workflow.",
    "presentationBoard.upload": "Upload board image",
    "presentationBoard.download": "Download image file",
    "presentationBoard.share": "Share",
    "presentationBoard.shared": "Presentation board shared",
    "presentationBoard.linkCopied": "Image reference copied",
    "presentationBoard.shareFailed": "Could not share presentation board",
    "presentationBoard.stored": "Presentation board stored in project",
    "presentationBoard.downloaded": "Download started",
    "presentationBoard.storedLabel": "Stored file",
    "presentationBoard.sourceGenerated": "AI generated",
    "presentationBoard.sourceUploaded": "uploaded",
    "questionnaire.slot1": "Slot 1 — Site / Area Plan",
    "questionnaire.slot1Hint": "External plan — up to 4 files",
    "questionnaire.slot2": "Slot 2 — Elevation / Section",
    "questionnaire.slot2Hint": "Proportions — up to 4 files",
    "questionnaire.slot3": "Slot 3 — 3D Front View",
    "questionnaire.slot3Hint": "Front view only — up to 4 files",
    "questionnaire.slot4": "Slot 4 — Floor Plans",
    "questionnaire.slot4Hint": "Match floor count — up to 4 files",
    "questionnaire.floorPlanUnit": "PDF, DWG, or image",
    "questionnaire.preferences": "Design Preferences",
    "questionnaire.projectType": "Building Type",
    "questionnaire.projectTypeHint": "Select category for permit and REA cost benchmark.",
    "questionnaire.parkingSpaces": "Parking spaces",
    "questionnaire.elevators": "Elevators",
    "questionnaire.floorLoad": "Floor load (kN/m²)",
    "questionnaire.nonResidentialNote": "Studio workspace supports up to 2 floors. Full multi-storey specs export in PDF/CAD packages.",
    "questionnaire.decorationStyle": "Decoration Style",
    "questionnaire.primaryMaterial": "Primary Material",
    "questionnaire.selectMaterial": "Select material...",
    "questionnaire.landSize": "Land Size",
    "questionnaire.constraints": "Special Constraints",
    "questionnaire.constraintsPlaceholder": "Setbacks, budget limits, room requirements...",
    "questionnaire.submit": "Verify & Start Design",
    "questionnaire.checking": "Checking inputs...",
    "clarify.title": "Clarification Needed",
    "clarify.progress": "Question",
    "clarify.noGuess": "The system will not guess — please answer clearly.",
    "clarify.placeholder": "Your answer...",
    "questionnaire.slot1Tooltip": "Upload a site/area plan showing land boundaries. Include dimensions if available — AI will ask if unclear.",
    "questionnaire.slot2Tooltip": "Upload elevation or section drawings showing building height and facade details.",
    "questionnaire.slot3Tooltip": "Upload a 3D front-view render or photo showing the desired exterior look (front face only).",
    "questionnaire.slot4Tooltip": "Upload floor plans (one per level). Up to 4 images in this slot; count must match floors selected.",
    "toast.uploading": "Uploading file…",
    "toast.uploadSuccess": "File uploaded successfully",
    "toast.uploadError": "Upload failed — please try again",
    "toast.checking": "Validating your inputs…",
    "toast.processingRender": "AI is generating your 3D preview…",
    "toast.renderReady": "3D preview ready!",
    "toast.processingPlans": "Preparing your plan files…",
    "toast.plansReady": "Plans generated successfully!",
    "toast.error": "Something went wrong — please try again",
    "toast.clarifyNeeded": "AI needs a quick clarification",
    "store.pageTitle": "House Plan Store",
    "store.searchPlaceholder": "Search house plans…",
    "store.filters": "Search Filters",
    "store.results": "results",
    "store.any": "Any",
    "store.filterFloors": "Stories",
    "store.filterBeds": "Bedrooms",
    "store.filterBaths": "Bathrooms",
    "store.filterLivingRooms": "Living rooms",
    "store.filterStyle": "Architectural Style",
    "store.filterCollection": "Collection",
    "store.filterProvince": "Province",
    "store.planLabel": "PLAN",
    "store.startingAt": "Starting at",
    "store.specSqft": "SQ FT",
    "store.specBeds": "BEDS",
    "store.specBaths": "BATHS",
    "store.specLivingRooms": "LIVING",
    "store.specStories": "STORIES",
    "store.viewPlan": "View Plan",
    "store.viewExterior": "Exterior",
    "store.viewFloorPlan": "Floor Plan",
    "store.buyNow": "Buy Now",
    "store.checkoutTitle": "Purchase House Plan",
    "store.purchaseSuccess": "Purchase complete — download started",
    "store.paymentPending":
      "Payment submitted — waiting for bank confirmation. Downloads unlock automatically.",
    "store.autoPublished": "Payment complete — your design is live on the Store (hidden from you)",
    "store.addToCart": "Add to Cart",
    "store.cartTitle": "Shopping Cart",
    "store.cartEmpty": "Your cart is empty — browse plans and add your favorites.",
    "store.cartRemove": "Remove",
    "store.cartSubtotal": "Subtotal",
    "store.cartDiscount": "Bundle discount",
    "store.cartTotal": "Total",
    "store.cartCheckout": "Checkout All",
    "store.cartCheckoutSuccess": "Cart purchase complete — downloads started",
    "store.cartAdded": "Added to cart",
    "store.cartInCart": "In Cart",
    "store.cartBundleDiscount": "Bundle savings applied",
    "store.upsell.similarStyle": "Similar styles you may like",
    "store.upsell.exploreMore": "Explore more designs",
    "store.upsell.boqBundle": "Quantity & materials document (PDF file)",
    "store.upsell.boqBundleDesc": "Bill of quantities and material estimate for every plan in your cart",
    "store.upsell.bundleHint2": "Add one more plan for {pct}% bundle discount",
    "store.upsell.bundleHint3": "Add another plan for {pct}% bundle discount",
    "common.yes": "Yes",
    "common.no": "No",
    "payment.promptpay": "PromptPay",
    "payment.card": "Card",
    "store.aria.save": "Save to favorites",
    "store.aria.favorites": "Favorites",
    "store.aria.removeFavorite": "Remove from favorites",
    "store.favoritesTitle": "Saved plans",
    "store.favoritesEmpty": "No saved plans yet — tap the heart on any listing.",
    "store.searchActive": "Search",
    "store.favoritesFilterActive": "Favorites only",
    "store.globalBanner.title": "Shop in your language",
    "store.globalBanner.subtitle":
      "House names, descriptions, and checkout are auto-translated to match your browser or selected language.",
    "store.globalBanner.switchLabel": "Choose language",
    "store.globalBanner.aiActive": "Auto-translate on",
    "store.globalBanner.aria": "International language support",
    "pwa.installTitle": "Install Planasia App",
    "pwa.installSubtitle": "Add to your home screen for instant access to house plans and purchases.",
    "pwa.benefit1": "One-tap access to the House Plan Store",
    "pwa.benefit2": "Works offline for cached pages",
    "pwa.benefit3": "Full-screen app experience on mobile",
    "pwa.installNow": "Install App",
    "pwa.installing": "Installing…",
    "pwa.later": "Maybe later",
    "pwa.neverAsk": "Don't ask again",
    "pwa.iosTitle": "Install on iPhone / iPad",
    "pwa.iosSteps": "Tap the Share button in Safari, then choose \"Add to Home Screen\".",
    "pwa.gotIt": "Got it",
    "pwa.androidHint": "Open your browser menu (⋮) and tap \"Install app\" or \"Add to Home screen\".",
    "landing.ctaBand": "Find Your Perfect House Plan",
    "landing.ctaBandDesc": "Explore our full catalog of house designs and buy the plans you love.",
    "editor.title": "3D Design Editor",
    "editor.saveDraft": "Save Draft",
    "editor.saving": "Saving…",
    "editor.draftSaved": "Draft saved — resume anytime",
    "editor.rooms": "Rooms",
    "editor.openings": "Doors & Windows",
    "editor.door": "Door",
    "editor.window": "Window",
    "editor.addDoor": "Add door",
    "editor.addWindow": "Add window",
    "editor.materials": "Materials",
    "editor.materialEstimate": "Material estimate",
    "editor.estimateNote": "Approx. excl. labor",
    "editor.view3d": "3D view",
    "editor.viewPlan": "Floor plan (click to select)",
    "editor.width": "Width",
    "editor.depth": "Depth",
    "editor.wallSide": "Wall",
    "editor.position": "Position",
    "editor.openingWidth": "Opening width",
    "editor.removeOpening": "Remove",
    "editor.roughPreviewTitle": "Structure preview",
    "editor.roughPreviewDesc": "Low-fidelity wireframe — verify layout before final render",
    "editor.structureSummary": "Structure summary",
    "editor.roomCount": "Rooms",
    "editor.openingCount": "Openings",
    "editor.grossArea": "Gross area",
    "editor.inclContingency": "incl. 10% contingency",
    "editor.backToEdit": "Back to edit",
    "editor.confirmAndGenerate": "Confirm & generate plans",
    "editor.barHint": "Edit rooms, openings, and materials in real time",
    "editor.exitEdit": "Exit editor",
    "editor.openEdit": "Edit design",
    "editor.previewStructure": "Preview",
    "editor.exportDocumentation": "Export documentation",
    "editor.exportDocumentationSuccess": "Documentation JSON downloaded",
    "editor.exportDocumentationFailed": "Could not export documentation",
    "editor.exportPreviewTitle": "Documentation preview",
    "editor.exportPreviewLoading": "Building export summary…",
    "editor.exportPreviewProject": "Project summary",
    "editor.exportPreviewScheduleItems": "openings",
    "editor.exportDownloadJson": "Download JSON",
    "editor.exportDownloadPdf": "Download PDF summary",
    "editor.exportPdfSuccess": "PDF summary downloaded",
    "editor.exportPdfFailed": "Could not generate PDF summary",
    "job.exportTitle": "Export in progress",
    "job.queued": "Queued — position {n} in line",
    "job.processing": "Generating your file…",
    "job.completed": "Export ready!",
    "job.failed": "Export failed",
    "job.download": "Download file",
    "job.downloadStarted": "Download started — check your downloads folder",
    "job.downloadAgain": "Download again",
    "job.jobId": "Job ID",
    "job.rateLimited": "Too many requests — please wait and try again",
    "cost.inputTitle": "Budget & area targets",
    "cost.maxBudget": "Max budget (THB)",
    "cost.targetArea": "Target usable area (m²)",
    "cost.tierLabel": "Construction grade (REA index)",
    "cost.tierEconomy": "Economy — ฿12–16K/m²",
    "cost.tierStandard": "Standard — ฿18–23K/m²",
    "cost.tierPremium": "Premium — ฿28–35K/m²",
    "cost.liveTotal": "Estimated total cost",
    "cost.perSqm": "Cost per m²",
    "cost.budgetUsed": "Budget utilization",
    "cost.areaUsed": "Area utilization",
    "cost.alertTitle": "Budget / area alert",
    "cost.overBudgetMsg": "Over budget by {amount}",
    "cost.overAreaMsg": "Exceeds target area by {delta} m²",
    "cost.estSavings": "Est. savings",
    "cost.applyFix": "Apply",
    "cost.bankReady": "Design is within budget and area targets — useful for early bank discussions.",
    "cost.bankReadyShort": "Budget-ready",
    "cost.permitNotReady": "Budget and area look good, but local rules still need a professional review.",
    "cost.permitNotReadyShort": "Local review needed",
    "cost.ofBudget": "of budget",
    "cost.adjustNeeded": "Adjust design",
    "cost.rec.downgradeWall": "Downgrade wall material to reduce cost",
    "cost.rec.downgradeFloor": "Switch to ceramic tile flooring",
    "cost.rec.downgradeRoof": "Switch to metal sheet roofing",
    "cost.rec.changeTier": "Lower construction grade tier",
    "cost.rec.shrinkRoom": "Reduce largest room size by 10%",
    "cost.rec.removeOpening": "Remove extra window opening",
    "permit.title": "Permit compliance check",
    "permit.checking": "Checking building regulations…",
    "permit.rateLimited": "Too many checks — please wait a moment.",
    "permit.checkFailed": "Could not verify permit rules. Try again.",
    "permit.allClear": "No permit blockers detected for this building type.",
    "permit.issuesSummary": "{errors} errors · {warnings} warnings",
    "permit.passed": "Passed",
    "permit.needsReview": "Review needed",
    "permit.requiredDocs": "Typical permit documents",
    "how.subtitle": "A simple 4-step journey from plan upload to photorealistic architectural renders.",
    "how.stepLabel": "Step {n}",
    "how.step4.title": "Get AI 3D results",
    "how.step4.desc": "Receive photorealistic 3D floor plan and front elevation renders ready to share.",
    "landing.hero.eyebrow": "AI Architectural Studio",
    "landing.hero.tagline": "Turn floor plans into photorealistic 3D homes — in seconds.",
    "landing.hero.desc": "Upload a 2D plan and front elevation in Workspace, choose your house style, confirm, and let AI generate magazine-quality architectural renders while locking your original geometry.",
    "landing.hero.getStarted": "Get Started",
    "landing.hero.browseStyles": "Browse styles",
    "landing.hero.flowHint": "Guided flow: Upload plans → Pick style → Confirm & Render → AI Result",
    "features.eyebrow": "Why Planasia",
    "features.title": "Built for speed, fidelity, and style",
    "features.fast.title": "Fast AI rendering",
    "features.fast.desc": "Go from plan to photorealistic concept views in minutes — not days of manual modeling.",
    "features.geometry.title": "Geometry-locked realism",
    "features.geometry.desc": "Textures, lighting, and atmosphere are enhanced while your original structure stays locked.",
    "features.styles.title": "Curated design styles",
    "features.styles.desc": "Minimalist, Modern, Tropical, Luxury, Japanese — apply vibe in Workspace without redesigning the plan.",
    "inputStage.uploadEyebrow": "Upload",
    "inputStage.uploadTitle": "Upload your floor plan & facade",
    "inputStage.uploadDesc": "Add both images, pick a house style, then confirm to generate photorealistic 3D renders.",
    "inputStage.bothReady": "All 3 assets ready. AI will lock geometry from both floor plans and the elevation.",
    "inputStage.needBoth": "Upload first floor plan, second floor plan, and front elevation to continue.",
    "inputStage.confirmRender": "Confirm & Render",
    "results.eyebrow": "AI Result",
    "results.title": "Your 3D renders",
    "results.newUpload": "New upload",
    "results.failed": "Rendering failed. Please try again with both images.",
    "results.planTitle": "3D floor plan",
    "results.planSubtitle": "Photorealistic plan visualization",
    "results.facadeTitle": "Front facade",
    "results.facadeSubtitle": "Elevation / exterior render",
    "results.rendering": "Rendering…",
    "results.empty": "No render available",
    "results.expand": "Expand {title}",
    "results.download": "Download",
    "results.downloadAll": "Download all",
    "results.downloaded": "Download started",
    "results.downloadFailed": "Could not download — please try again",
    "results.share": "Share",
    "results.shareTitle": "Planasia 3D renders",
    "results.shareText": "Check out my AI 3D home renders from Planasia",
    "results.shared": "Shared",
    "results.shareCopied": "Link copied to clipboard",
    "results.shareDownloadFallback": "Images downloaded — share them from your device",
    "results.shareFailed": "Could not share — try downloading instead",
    "wizard.step.upload": "Upload",
    "wizard.step.confirm": "Confirm",
    "wizard.step.result": "AI Result",
    "wizard.aria": "Design journey",
    "beforeAfter.before": "Before",
    "beforeAfter.after": "After",
    "beforeAfter.beforeHint": "Line drawing",
    "beforeAfter.afterHint": "AI 3D render",
    "beforeAfter.dragHint": "Drag to compare",
    "beforeAfter.aria": "Before and after comparison slider",
    "chat.errorGeneric": "Sorry, something went wrong. Please try again.",
    "galleryPage.title": "Project gallery",
    "galleryPage.subtitle":
      "Browse AI-generated home concepts from Planasia users — view-only inspiration.",
    "galleryPage.ctaTitle": "Want to create your own concept?",
    "galleryPage.ctaDesc":
      "Upload a floor plan, pick a style, and let AI generate 3D views and facades in minutes.",
    "galleryPage.ctaButton": "Start creating",
    "permit.blockSubmit": "Fix permit errors before continuing.",
  },
  th: {
    "nav.home": "หน้าแรก",
    "nav.store": "Store",
    "nav.pricing": "แพ็กเกจ",
    "nav.howItWorks": "ขั้นตอนการใช้งาน",
    "nav.startDesign": "เริ่มออกแบบ",
    "nav.login": "เข้าสู่ระบบ",
    "nav.menu": "เมนู",
    "nav.closeMenu": "ปิดเมนู",
    "nav.housePlans": "แบบบ้าน",
    "nav.collections": "คอลเลกชัน",
    "nav.findDraftsman": "สถาปนิกและนักออกแบบ",
    "nav.aboutPlans": "ปรึกษาสินเชื่อบ้าน",
    "nav.signIn": "เข้าสู่ระบบ",
    "nav.searchByPlan": "ค้นหาด้วยรหัสแบบบ้าน",
    "nav.wishlist": "รายการโปรด",
    "nav.cart": "รถเข็น",
    "nav.shop": "ร้านค้า",
    "nav.account": "บัญชี",
    "nav.chat": "แชท",
    "nav.bottomNav": "เมนูนำทางมือถือ",
    "nav.seller": "ลงขายแบบ",
    "nav.sellerAria": "ลงขายแบบ — ทางเข้าสำหรับสถาปนิกและนักออกแบบ",
    "hero.title": "แบบบ้านและดีไซน์ พร้อมสร้าง",
    "hero.subtitle":
      "เลือกชมคอลเลกชันแบบบ้านระดับมืออาชีพ ค้นหาแปลนที่ใช่ ซื้อได้ทันที และดาวน์โหลดเอกสารพร้อมก่อสร้าง",
    "hero.cta": "เลือกดูแบบบ้าน",
    "hero.ctaSecondary": "เข้าชมร้านแบบบ้าน",
    "gallery.title": "แบบบ้านแนะนำ",
    "publicGallery.nav": "แกลเลอรีผลงาน",
    "publicGallery.loading": "กำลังโหลดแกลเลอรี...",
    "publicGallery.loadError": "ไม่สามารถโหลดแกลเลอรีได้ กรุณาลองใหม่อีกครั้ง",
    "publicGallery.emptyTitle": "ยังไม่มีผลงานในแกลเลอรี",
    "publicGallery.emptyDesc": "เมื่อมีผู้ใช้สร้างคอนเซปต์บ้านด้วย AI ผลงานจะปรากฏที่นี่เพื่อเป็นแรงบันดาลใจ",
    "publicGallery.viewWork": "ดูผลงาน",
    "publicGallery.viewOnly": "ดูอย่างเดียว",
    "publicGallery.viewFloorPlan3d": "แปลน 3D",
    "publicGallery.viewFacade": "หน้าตรง",
    "publicGallery.lightboxTitle": "ดูภาพผลงาน",
    "publicGallery.closeLightbox": "ปิด",
    "publicGallery.viewOnlyHint": "หน้าแกลเลอรีนี้สำหรับดูอย่างเดียว — ดาวน์โหลดไฟล์ความละเอียดสูงได้เฉพาะเจ้าของผลงานใน Workspace",
    "how.title": "ขั้นตอนการใช้งาน",
    "how.step1.title": "เลือกแปลนบ้าน",
    "how.step1.desc": "อัปโหลดแปลน 2D และรูปหน้าตรง เพื่อล็อกโครงสร้างอาคาร",
    "how.step2.title": "เลือกสไตล์และบรรยากาศ",
    "how.step2.desc":
      "เลือกมินิมอล โมเดิร์น ทรอปิคอล หรูหรา หรือญี่ปุ่น ในหน้าอัปโหลด — ปรับวัสดุและบรรยากาศโดยไม่เปลี่ยนโครงสร้าง",
    "how.step3.title": "ยืนยันและสร้างภาพ",
    "how.step3.desc": "ตรวจสอบข้อมูล แล้วสั่งเรนเดอร์ด้วย AI เพียงครั้งเดียว",
    "pricing.title": "แพ็กเกจและราคา",
    "pricing.subtitle": "สร้างคอนเซปต์บ้านด้วย AI — เริ่มทดลองฟรี อัปเกรดเมื่อพร้อมใช้งานจริง",
    "pricing.standard": "มาตรฐาน",
    "pricing.premium": "พรีเมียม",
    "pricing.luxury": "หรูหรา",
    "pricing.store": "แบบบ้านสำเร็จรูป",
    "pricing.custom1": "สั่งทำแบบบ้าน 1 ชั้น",
    "pricing.custom2": "สั่งทำแบบบ้าน 2 ชั้น",
    "pricing.cad": "ไฟล์ CAD",
    "pricing.perDesign": "/ แบบ",
    "pricing.buyNow": "เลือกแพ็กเกจ",
    "pricing.feature.pdfPreview": "ชุดเอกสาร PDF + ตัวอย่าง",
    "pricing.feature.instantDownload": "ดาวน์โหลดทันทีหลังชำระเงิน",
    "pricing.feature.storeCatalog": "เข้าถึงแคตตาล็อกแบบบ้านสำเร็จรูป",
    "pricing.feature.customSpec1Story": "ออกแบบตามสเปคเฉพาะ (บ้าน 1 ชั้น)",
    "pricing.feature.customSpec2Story": "ออกแบบตามสเปคเฉพาะ (บ้าน 2 ชั้น)",
    "pricing.feature.fullPdfA3": "ชุดนำเสนอคอนเซปต์ PDF",
    "pricing.feature.permitReady": "เน้นการนำเสนอไอเดียดีไซน์ ไม่ใช่ชุดยื่นขออนุญาต",
    "pricing.feature.structuralStandardReview": "ตรวจสอบความสมเหตุสมผลของผังห้องเบื้องต้น",
    "pricing.feature.foundationStructuralCalc": "ไม่รวมการคำนวณโครงสร้างหรือรายละเอียดก่อสร้าง",
    "pricing.feature.cadDeliverable": "พร้อมไฟล์ CAD สำหรับนำไปใช้งานต่อ",
    "pricing.popularBadge": "ยอดนิยม",
    "pricing.starter.name": "แพ็กเกจทดลอง",
    "pricing.starter.tagline": "สำหรับผู้เริ่มต้น",
    "pricing.starter.price": "ฟรี",
    "pricing.starter.priceNote": "0 บาท",
    "pricing.starter.feature1": "ได้รับ 3 เครดิต (สร้างภาพได้ 3 ครั้ง / 6 รูป)",
    "pricing.starter.feature2": "รูปภาพความละเอียดมาตรฐาน",
    "pricing.starter.feature3": "ดาวน์โหลดและแชร์ได้ทันที",
    "pricing.starter.cta": "เริ่มต้นใช้งานฟรี",
    "pricing.pro.name": "แพ็กเกจยอดนิยม",
    "pricing.pro.tagline": "สำหรับใช้งานจริงจัง",
    "pricing.pro.price": "290",
    "pricing.pro.priceNote": "บาท / ครั้งเดียว",
    "pricing.pro.feature1": "ได้รับ 30 เครดิต (สร้างภาพได้ 30 ครั้ง / 60 รูป)",
    "pricing.pro.feature2": "ความคมชัดระดับสูงพิเศษ (ความละเอียดสูง / รายละเอียดคมชัด)",
    "pricing.pro.feature3": "เลือกสไตล์สถาปัตยกรรมได้ไม่จำกัด",
    "pricing.pro.feature4": "ดาวน์โหลดไฟล์ความละเอียดสูงสำหรับพรีเซนต์",
    "pricing.pro.cta": "เลือกแพ็กเกจนี้",
    "pricing.business.name": "แพ็กเกจธุรกิจ",
    "pricing.business.tagline": "สำหรับบริษัทหรือมืออาชีพ",
    "pricing.business.price": "990",
    "pricing.business.priceNote": "บาท / เดือน",
    "pricing.business.feature1": "ได้รับ 150 เครดิตต่อเดือน",
    "pricing.business.feature2": "เรนเดอร์ด้วยความเร็วด่วนพิเศษ (คิวลำดับความสำคัญ)",
    "pricing.business.feature3": "สิทธิ์การใช้งานเชิงพาณิชย์",
    "pricing.business.feature4": "บันทึกประวัติและแก้ไขงานย้อนหลังได้",
    "pricing.business.cta": "ติดต่อใช้งาน",
    "workspace.controlPanel": "แผงควบคุมและอัปโหลด",
    "workspace.openQuestionnaire": "ตั้งค่าการออกแบบ",
    "workspace.style": "สไตล์",
    "workspace.roofType": "ประเภทหลังคา",
    "workspace.colorPalette": "โทนสี",
    "workspace.floors": "จำนวนชั้น",
    "workspace.upload": "อัปโหลดแปลน",
    "workspace.uploadHint": "ลากหรือคลิกเพื่ออัปโหลดไฟล์แปลนบ้าน",
    "workspace.projectName": "ชื่อโครงการ",
    "workspace.location": "สถานที่ก่อสร้าง",
    "workspace.preview": "พื้นที่แสดงผลงานออกแบบ",
    "workspace.save": "บันทึก",
    "workspace.share": "แชร์",
    "workspace.shareCopied": "คัดลอกลิงก์แล้ว",
    "workspace.shareFailed": "แชร์ไม่สำเร็จ — ลองคัดลอก URL เอง",
    "workspace.expandFullscreen": "ขยายเต็มจอ",
    "ai.statusLive": "AI พร้อม",
    "ai.statusOffline": "โหมดแม่แบบ",
    "ai.statusLiveHint": "เชื่อมระบบ AI แล้ว — พร้อมสร้างภาพแบบเรียลไทม์",
    "ai.statusOfflineHint": "ยังไม่ได้ตั้งค่า API — ใช้แม่แบบแทน ตั้ง GEMINI_API_KEY เพื่อเชื่อม AI",
    "workspace.prevView": "มุมมองก่อนหน้า",
    "workspace.nextView": "มุมมองถัดไป",
    "workspace.floor1": "แปลนพื้นชั้นที่ 1",
    "workspace.floor2": "แปลนพื้นชั้นที่ 2",
    "workspace.exportPdf": "ดาวน์โหลดชุดคอนเซปต์",
    "workspace.exportCad": "ดาวน์โหลดไฟล์ผัง",
    "workspace.exportPdfDesc": "ภาพมุมมอง 3D และบอร์ดนำเสนอ",
    "workspace.exportCadDesc": "ไฟล์ผังการจัดโซนห้องเบื้องต้น",
    "workspace.downloadPanel": "ส่งออกคอนเซปต์",
    "workspace.downloadPanelHint": "ดาวน์โหลดภาพและไอเดียดีไซน์ที่สร้างแล้ว — ไม่มีค่าใช้จ่ายเพิ่มเติม",
    "workspace.sheetArch": "สถาปัตยกรรม",
    "workspace.sheetStructural": "โครงสร้าง",
    "workspace.sheetSanitary": "สุขาภิบาล",
    "workspace.sheetElectrical": "ไฟฟ้า",
    "workspace.sheetMechanical": "เครื่องกล",
    "workspace.sheetAc": "ปรับอากาศ",
    "workspace.sheetOther": "แบบแปลน",
    "workspace.sheetPreviewTitle": "ตัวอย่างชุดแบบแปลน",
    "workspace.sheetPreviewHint": "เลื่อนดูแบบทั้งหมด ตัวอย่างมีลายน้ำ — ชำระเงินเพื่อดาวน์โหลดไฟล์สะอาด",
    "workspace.watermarkHint": "ตัวอย่างเท่านั้น — มีลายน้ำเพื่อป้องกันการคัดลอก",
    "workspace.myWorks": "งานของฉัน",
    "workspace.addWork": "เพิ่มงาน",
    "workspace.deleteWork": "ลบงาน",
    "workspace.workCreated": "สร้างงานใหม่แล้ว",
    "workspace.workDeleted": "ลบงานแล้ว",
    "sidebar.title": "ตั้งค่าโครงการ",
    "sidebar.projectName": "ชื่อโครงการ",
    "sidebar.ownerName": "ชื่อเจ้าของโครงการ",
    "sidebar.location": "สถานที่ก่อสร้าง",
    "sidebar.floors": "บ้าน 1 ชั้น หรือ 2 ชั้น",
    "sidebar.floor1": "บ้าน 1 ชั้น",
    "sidebar.floor2": "บ้าน 2 ชั้น",
    "sidebar.bedrooms": "กี่ห้องนอน",
    "sidebar.bathrooms": "กี่ห้องน้ำ",
    "sidebar.budget": "งบประมาณ",
    "sidebar.style": "สไตล์ที่ชอบ",
    "sidebar.wallMaterial": "วัสดุผนัง",
    "sidebar.floorMaterial": "วัสดุปูพื้น",
    "sidebar.roofMaterial": "วัสดุมุงหลังคา",
    "sidebar.foundation": "ชนิดฐานราก",
    "sidebar.groupProject": "ข้อมูลโครงการ",
    "sidebar.groupBuilding": "สเปกอาคาร",
    "sidebar.groupMaterials": "วัสดุ & ฐานราก",
    "sidebar.groupUploads": "ไฟล์อ้างอิง",
    "workspace.chatPlaceholder":
      "ปรึกษา AI เพื่อแก้ไข: เช่น 'เปลี่ยนระเบียงเป็นกระจก', 'ปรับผนังภายนอก'",
    "workspace.generate": "สร้างแบบ",
    "workspace.generateRender": "สร้างภาพ 3D",
    "workspace.generatingRender": "กำลังสร้างภาพ 3D ตัวอย่าง...",
    "workspace.generatingPlans": "กำลังจัดโซนห้องและสรุปคอนเซปต์...",
    "workspace.generating": "กำลังสร้างบ้านในฝันของคุณ...",
    "workspace.viewRender3d": "ภาพ 3D",
    "workspace.viewFacade": "หน้าตรง",
    "workspace.viewFloorPlan": "แปลนพื้น",
    "workspace.aiZone": "โซนแสดงผล AI",
    "workspace.aiPreviewEmpty": "กรอกข้อมูลและกดสร้าง — ภาพจาก AI จะแสดงที่นี่",
    "workspace.aiPreviewHint": "กำลังสร้างภาพ 3D, หน้าตรง และแปลนพื้น…",
    "workflow.step1": "1. ข้อมูลโครงการ",
    "workflow.step2": "2. คอนเซปต์ 3D",
    "workflow.step3": "3. จัดโซนห้องและแปลนผัง",
    "workflow.step4": "4. ส่งออกไอเดีย",
    "workflow.step5": "5. ส่งออกไอเดีย",
    "workflow.confirmPlan": "ยืนยันคอนเซปต์",
    "workflow.confirmHint": "ตรวจสอบภาพ 3D และบอร์ดนำเสนอ แล้วยืนยันเพื่อสรุปคอนเซปต์",
    "workflow.conceptReady": "คอนเซปต์พร้อมแล้ว — ตรวจสอบผังห้องและดาวน์โหลดไอเดียดีไซน์",
    "workflow.conceptReviewHint": "ตรวจสอบการจัดโซนห้องและภาพนำเสนอ จากนั้นดาวน์โหลดชุดคอนเซปต์",
    "workflow.conceptExportedHint": "ดาวน์โหลดชุดคอนเซปต์เรียบร้อยแล้ว",
    "concept.exportPanel": "ส่งออกคอนเซปต์",
    "concept.exportPanelHint": "ดาวน์โหลดภาพมุมมอง 3D หน้าตรง และบอร์ดนำเสนอ",
    "concept.exportPerspective": "ภาพมุมมอง 3D",
    "concept.exportPerspectiveDesc": "ภาพเรนเดอร์มุมมองสามมิติของคอนเซปต์บ้าน",
    "concept.exportFacade": "ภาพหน้าตรง",
    "concept.exportFacadeDesc": "ภาพมุมมองด้านหน้าอาคาร",
    "concept.exportBoard": "บอร์ดนำเสนอ",
    "concept.exportBoardDesc": "ภาพสรุปไอเดียดีไซน์สำหรับนำเสนอ",
    "concept.exportEmpty": "ยังไม่มีไฟล์ให้ดาวน์โหลด — สร้างคอนเซปต์ก่อน",
    "concept.exportDisclaimer": "ผลลัพธ์เป็นระดับคอนเซปต์ดีไซน์ ไม่ใช่ชุดแบบก่อสร้างหรือเอกสารยื่นขออนุญาต",
    "inputStage.title": "อัปโหลดไฟล์และเลือกสไตล์",
    "inputStage.subtitle": "อัปโหลดแปลน 2D และรูปหน้าตรง จากนั้นเลือกสไตล์บ้าน — ระบบจะสร้างคอนเซปต์ด้วย AI ให้คุณ",
    "inputStage.uploadSection": "อัปโหลดไฟล์อ้างอิง",
    "inputStage.floorPlan": "แปลน 2D",
    "inputStage.floorPlanHint": "ไฟล์แปลนชั้นลายเส้น ใช้กำหนดโครงสร้างและสัดส่วนห้อง",
    "inputStage.floorPlan1": "แปลนชั้น 1",
    "inputStage.floorPlan1Hint": "ผังพื้นชั้นล่าง — รองรับ PNG, JPEG, PDF",
    "inputStage.floorPlan2": "แปลนชั้น 2",
    "inputStage.floorPlan2Hint": "ผังพื้นชั้นบน — รองรับ PNG, JPEG, PDF",
    "inputStage.elevation": "รูปหน้าตรง",
    "inputStage.elevationHint": "มุมมองด้านหน้าอาคาร ใช้กำหนดทรงบ้านและรูปทรงภายนอก",
    "inputStage.dropHere": "ลากวางไฟล์ที่นี่",
    "inputStage.browseFiles": "หรือคลิกเพื่อเลือกไฟล์",
    "inputStage.fileFormats": "รองรับ PNG, JPEG และ PDF",
    "inputStage.uploading": "กำลังอัปโหลด...",
    "inputStage.required": "จำเป็น",
    "inputStage.styleSection": "สไตล์ที่ต้องการ",
    "inputStage.styleModernMinimal": "แบบบ้านโมเดิร์น มินิมอล",
    "inputStage.styleNordic": "แบบบ้านนอร์ดิก / สแกนดินาเวีย",
    "inputStage.styleModernTropical": "แบบบ้านโมเดิร์น โทรปิคอล",
    "inputStage.styleLoftIndustrial": "แบบบ้านลอฟท์ / อินดัสเทรียล",
    "inputStage.styleJapanese": "แบบบ้านญี่ปุ่น",
    "inputStage.startConcept": "เริ่มสร้างคอนเซปต์ AI",
    "inputStage.confirm": "ยืนยัน",
    "inputStage.rendering": "กำลังเรนเดอร์…",
    "inputStage.sidebarHint": "อัปโหลดแปลนและเลือกสไตล์ แล้วกดเริ่มสร้างคอนเซปต์",
    "upload.ref1": "แปลน 2D / ผังพื้น",
    "upload.ref1Hint": "ลายเส้นแปลนชั้น — สัดส่วนและโครงสร้างห้อง",
    "upload.ref2": "รูปหน้าตรง / ทรงบ้าน",
    "upload.ref2Hint": "มุมมองด้านหน้า — ฟอร์มอาคารภายนอก",
    "workflow.optionsTitle": "รายละเอียดและตัวเลือกแบบ",
    "workflow.optionsDesc": "เลือกวัสดุและสาขาวิศวกรรมก่อนสร้างชุดแบบแปลน",
    "workflow.generatePlans": "สร้างชุดแบบแปลน",
    "workflow.cancel": "ยกเลิก",
    "workflow.watermarkHint": "ตัวอย่างมีลายน้ำ — ชำระเงินเพื่อดาวน์โหลดไฟล์สะอาด",
    "workflow.paywallHint": "ชำระเงินเพื่อดาวน์โหลดไฟล์ PDF หรือ CAD สะอาดไม่มีลายน้ำ",
    "workflow.payToUnlock": "ชำระเงินเพื่อดาวน์โหลด",
    "workflow.preview3dOnly": "พรีวิว 3D — สร้างแบบแปลนหลังยืนยัน",
    "workflow.preview3dHint": "ตรวจสอบภาพ 3D แล้วกดยืนยันเพื่อสร้างชุดแบบแปลนทั้งหมด",
    "workflow.plansReadyPaywall": "ชุดแบบแปลนพร้อมแล้ว — เลื่อนดูตัวอย่าง ชำระเงินเพื่อดาวน์โหลด",
    "workflow.autoListed": "ลงร้านแบบบ้านแล้ว (คนอื่นเห็นได้ คุณมองไม่เห็น)",
    "workflow.unlockedHint": "ชำระเงินเรียบร้อย — ดูแปลนชั้น ดาวน์โหลด และลงร้านแบบบ้านเปิดใช้งานแล้ว",
    "options.wall": "วัสดุผนัง",
    "options.floor": "วัสดุพื้น",
    "options.roof": "วัสดุหลังคา",
    "options.extras": "ชุดแบบและตัวเลือกเสริม",
    "options.electrical": "แปลนระบบไฟฟ้า",
    "options.plumbing": "แปลนระบบประปา/สุขาภิบาล",
    "options.structural": "เอกสารรายการคำนวณโครงสร้าง (ไฟล์ PDF)",
    "options.evCharger": "ปลั๊กชาร์จรถยนต์ไฟฟ้า",
    "payment.title": "ปลดล็อกการดาวน์โหลด",
    "payment.desc": "ชำระเงินเพื่อดาวน์โหลดไฟล์คุณภาพเต็มจากผู้ขาย",
    "payment.payNow": "ชำระเงินและปลดล็อก",
    "payment.processing": "กำลังดำเนินการ...",
    "payment.failed": "ชำระเงินไม่สำเร็จ กรุณาลองใหม่",
    "download.readyPdf": "ชุดแบบ PDF พร้อมแล้ว — กดส่งออก PDF เพื่อดาวน์โหลด",
    "download.readyCad": "ไฟล์ CAD พร้อมแล้ว — กดส่งออก CAD เพื่อดาวน์โหลด",
    "store.subtitle": "คลังแบบบ้านพร้อมสร้าง คัดสรรจากสถาปนิกมืออาชีพ",
    "store.communityBadge": "แบบชุมชน AI",
    "store.empty": "ยังไม่มีสินค้า — สร้างแบบในพื้นที่ทำงานเพื่อลงร้าน",
    "country.select": "ประเทศ / ภูมิภาค",
    "language.select": "ภาษา",
    "currency.select": "สกุลเงิน",
    "footer.contact": "ติดต่อ",
    "footer.privacy": "นโยบายความเป็นส่วนตัว",
    "footer.terms": "ข้อกำหนดการใช้งาน",
    "legal.lastUpdated": "อัปเดตล่าสุด: กรกฎาคม 2569",
    "form.ownerName": "ชื่อ-นามสกุลเจ้าของโครงการ",
    "form.projectName": "ชื่อโครงการ / ชื่อบ้าน (ไม่บังคับ)",
    "form.province": "จังหวัด / อำเภอ / ตำบล",
    "form.floors": "จำนวนชั้น",
    "form.foundation": "ประเภทฐานราก",
    "form.foundation.pile": "ฐานรากเสาเข็ม",
    "form.foundation.spread": "ฐานรากแผ่",
    "form.foundation.pileRequired":
      "เพื่อความปลอดภัย บ้าน 2 ชั้น ระบบกำหนดให้ใช้ฐานรากเสาเข็มเท่านั้น",
    "form.bedrooms": "ห้องนอน",
    "form.bathrooms": "ห้องน้ำ",
    "form.budget": "งบประมาณก่อสร้าง",
    "questionnaire.title": "แบบฟอร์มรับข้อมูล",
    "questionnaire.subtitle": "กรอกข้อมูลโครงการ — อัปโหลดรูปอ้างอิงได้ไม่บังคับ (สูงสุด 2 รูป)",
    "questionnaire.designDirection": "แนวทางออกแบบ",
    "questionnaire.goldenStandard": "มาตรฐานอ้างอิง",
    "questionnaire.disciplinePreset": "ขอบเขตชุดเอกสาร",
    "questionnaire.uploads": "รูปอ้างอิง (ไม่บังคับ สูงสุด 2 รูป)",
    "upload.optional": "ไม่บังคับ",
    "upload.optionalHint": "ไม่จำเป็นต้องอัปโหลด — รองรับ .jpg / .png เท่านั้น ไม่จำกัดขนาดไฟล์ (สูงสุด 2 รูป)",
    "upload.aiExtractHint":
      "ระบบจะวิเคราะห์ข้อมูลจากไฟล์ที่อัปโหลดเพื่อช่วยสร้างคอนเซปต์ให้ตรงกับแปลนและทรงบ้านของคุณ",
    "upload.tooltip":
      "AI อ่านข้อมูลสถาปัตยกรรม (ผัง, ช่องเปิด, ขนาด) และสเปควัสดุจากรูปที่อัปโหลด",
    "upload.analysisTitle": "สรุปจาก AI",
    "upload.analysisDone": "วิเคราะห์รูปภาพเรียบร้อย",
    "upload.rejected": "ไม่สามารถใช้รูปนี้ได้ — กรุณาอัปโหลดแปลนบ้านหรือรูปอ้างอิงงานก่อสร้างเท่านั้น",
    "upload.floorPlan3dTitle": "แปลนพื้น 3 มิติ",
    "upload.floorPlan3dHint": "มุมมองเฉียงจากด้านบน — AI สร้างจากรูปอ้างอิงของคุณ",
    "upload.floorPlan3dClose": "ปิด",
    "upload.generating3dFloorPlan": "กำลังสร้างแปลนพื้น 3 มิติ…",
    "upload.floorPlan3dGeneratingHint": "AI กำลังสร้างภาพจำลอง 3 มิติแบบสมจริง พร้อมแสงเงา วัสดุ และเฟอร์นิเจอร์คร่าวๆ",
    "upload.floorPlan3dReady": "แปลนพื้น 3 มิติพร้อมแล้ว!",
    "upload.floorPlan3dFailed": "สร้างแปลนพื้น 3 มิติไม่สำเร็จ — แสดงตัวอย่างเลย์เอาต์แทน",
    "workspace.viewFloorPlan3d": "แปลนพื้น 3D",
    "workspace.viewPresentationBoard": "บอร์ดนำเสนอ",
    "presentationBoard.title": "บอร์ดนำเสนอโครงการ",
    "presentationBoard.subtitle": "บอร์ด A3 แนวนอน — ภายนอกซ้าย, แปลน+ภายในขวา",
    "presentationBoard.hint": "เลย์เอาต์ A3 คงที่: หัวเรื่อง, กริด 2 คอลัมน์ (ภายนอก | แปลน + ภายใน 3 ภาพ), ท้ายบอร์ด — แก้ข้อความไทยก่อนสร้าง",
    "presentationBoard.floors": "ประเภทบ้าน",
    "presentationBoard.singleStory": "บ้านชั้นเดียว (แปลน 1 ชั้น)",
    "presentationBoard.twoStory": "บ้านสองชั้น (ชั้นล่าง + ชั้นบน)",
    "presentationBoard.projectName": "ชื่อโครงการ / ส่วนท้าย",
    "presentationBoard.description": "คำอธิบายโครงการ",
    "presentationBoard.captionLeft": "คำบรรยาย — ภายในซ้าย (ภาษาไทย)",
    "presentationBoard.captionCenter": "คำบรรยาย — ภายในกลาง (ภาษาไทย)",
    "presentationBoard.captionRight": "คำบรรยาย — ภายในขวา (ภาษาไทย)",
    "presentationBoard.floorPlanRule": "ป้ายกำกับแปลน",
    "presentationBoard.generate": "สร้างบอร์ดนำเสนอ",
    "presentationBoard.generating": "กำลังสร้างบอร์ด…",
    "presentationBoard.generatingHint": "AI กำลังจัดวางบอร์ด A3: ภายนอก แปลนพื้น ภายใน และคำบรรยายภาษาไทย",
    "presentationBoard.ready": "บอร์ดนำเสนอพร้อมแล้ว!",
    "presentationBoard.failed": "สร้างบอร์ดนำเสนอไม่สำเร็จ",
    "presentationBoard.empty": "อัปโหลดแปลนเพื่อดูตัวอย่างเลย์เอาต์ A3 แล้วกดสร้างเพื่อคอมโพสบอร์ดพิมพ์",
    "presentationBoard.showPrompt": "แสดงคำสั่งหลัก",
    "presentationBoard.hidePrompt": "ซ่อนคำสั่งหลัก",
    "presentationBoard.open": "บอร์ดนำเสนอ",
    "presentationBoard.requiredForDrafting": "กรุณาสร้างหรืออัปโหลดบอร์ดนำเสนอก่อน — ใช้เป็นข้อมูลตั้งต้นสำหรับสรุปคอนเซปต์",
    "presentationBoard.draftingReady": "บันทึกบอร์ดนำเสนอแล้ว — ยืนยันเพื่อสรุปและส่งออกคอนเซปต์",
    "presentationBoard.draftingRequired": "สร้างบอร์ดนำเสนอก่อน — เป็นขั้นตอนสำคัญก่อนสรุปคอนเซปต์",
    "presentationBoard.upload": "อัปโหลดรูปบอร์ด",
    "presentationBoard.download": "ดาวน์โหลดไฟล์รูป",
    "presentationBoard.share": "แชร์",
    "presentationBoard.shared": "แชร์บอร์ดนำเสนอแล้ว",
    "presentationBoard.linkCopied": "คัดลอกข้อมูลรูปแล้ว",
    "presentationBoard.shareFailed": "แชร์บอร์ดนำเสนอไม่สำเร็จ",
    "presentationBoard.stored": "บันทึกบอร์ดนำเสนอในโครงการแล้ว",
    "presentationBoard.downloaded": "เริ่มดาวน์โหลดแล้ว",
    "presentationBoard.storedLabel": "ไฟล์ที่บันทึก",
    "presentationBoard.sourceGenerated": "AI สร้าง",
    "presentationBoard.sourceUploaded": "อัปโหลด",
    "questionnaire.slot1": "ช่อง 1 — แปลนพื้นที่",
    "questionnaire.slot1Hint": "แปลนจากภายนอก — อัปโหลดได้สูงสุด 4 รูป",
    "questionnaire.slot2": "ช่อง 2 — รูปด้าน / รูปตัด",
    "questionnaire.slot2Hint": "อ้างอิงสัดส่วน — สูงสุด 4 รูป",
    "questionnaire.slot3": "ช่อง 3 — รูป 3D หน้าตรง",
    "questionnaire.slot3Hint": "มุมหน้าตรงเท่านั้น — สูงสุด 4 รูป",
    "questionnaire.slot4": "ช่อง 4 — แปลนพื้น",
    "questionnaire.slot4Hint": "ต้องครบตามจำนวนชั้น — สูงสุด 4 รูป",
    "questionnaire.floorPlanUnit": "PDF, DWG หรือรูปภาพ",
    "questionnaire.preferences": "ความต้องการการออกแบบ",
    "questionnaire.projectType": "ประเภทอาคาร",
    "questionnaire.projectTypeHint": "เลือกประเภทที่ตรงกับการขออนุญาตและดัชนีต้นทุน REA",
    "questionnaire.parkingSpaces": "ที่จอดรถ",
    "questionnaire.elevators": "ลิฟต์",
    "questionnaire.floorLoad": "น้ำหนักบรรทุกพื้น (kN/m²)",
    "questionnaire.nonResidentialNote": "พื้นที่ทำงานรองรับสูงสุด 2 ชั้น — แบบหลายชั้นเต็มรูปแบบอยู่ในชุด PDF/CAD",
    "questionnaire.decorationStyle": "สไตล์การตกแต่ง",
    "questionnaire.primaryMaterial": "วัสดุหลัก",
    "questionnaire.selectMaterial": "เลือกวัสดุ...",
    "questionnaire.landSize": "ขนาดที่ดิน",
    "questionnaire.constraints": "ข้อจำกัดพิเศษ",
    "questionnaire.constraintsPlaceholder": "ระยะร่น งบประมาณ ความต้องการห้อง...",
    "questionnaire.submit": "ตรวจสอบและเริ่มออกแบบ",
    "questionnaire.checking": "กำลังตรวจสอบ...",
    "clarify.title": "ต้องการข้อมูลเพิ่มเติม",
    "clarify.progress": "คำถาม",
    "clarify.noGuess": "ระบบไม่เดาเอง — กรุณาตอบให้ชัดเจน",
    "clarify.placeholder": "คำตอบของคุณ...",
    "questionnaire.slot1Tooltip": "อัปโหลดแปลนพื้นที่/ที่ดิน แสดงขอบเขตที่ดิน หากมีมิติให้ระบุ — AI จะถามเพิ่มหากไม่ชัด",
    "questionnaire.slot2Tooltip": "อัปโหลดรูปด้านอาคารหรือรูปตัด แสดงความสูงและรายละเอียดหน้าตาอาคาร",
    "questionnaire.slot3Tooltip": "อัปโหลดภาพ 3D มุมหน้าตรง หรือรูปอ้างอิงหน้าตาบ้านที่ต้องการ (เฉพาะด้านหน้า)",
    "questionnaire.slot4Tooltip": "อัปโหลดแปลนชั้นละ 1 ไฟล์ ช่องนี้รองรับสูงสุด 4 รูป — จำนวนต้องตรงกับจำนวนชั้นที่เลือก",
    "toast.uploading": "กำลังอัปโหลดไฟล์…",
    "toast.uploadSuccess": "อัปโหลดสำเร็จ",
    "toast.uploadError": "อัปโหลดไม่สำเร็จ — กรุณาลองใหม่",
    "toast.checking": "กำลังตรวจสอบข้อมูล…",
    "toast.processingRender": "AI กำลังสร้างภาพ 3D…",
    "toast.renderReady": "ภาพ 3D พร้อมแล้ว!",
    "toast.processingPlans": "กำลังจัดโซนห้องและสรุปคอนเซปต์…",
    "toast.plansReady": "สร้างแปลนสำเร็จ!",
    "toast.error": "เกิดข้อผิดพลาด — กรุณาลองใหม่",
    "toast.clarifyNeeded": "AI ต้องการข้อมูลเพิ่มเติม",
    "store.pageTitle": "สโตร์แบบบ้าน",
    "store.searchPlaceholder": "ค้นหาแบบบ้าน…",
    "store.filters": "ตัวกรอง",
    "store.results": "รายการ",
    "store.any": "ทั้งหมด",
    "store.filterFloors": "จำนวนชั้น",
    "store.filterBeds": "ห้องนอน",
    "store.filterBaths": "ห้องน้ำ",
    "store.filterLivingRooms": "ห้องรับแขก",
    "store.filterStyle": "สไตล์สถาปัตย์",
    "store.filterCollection": "คอลเลกชัน",
    "store.filterProvince": "จังหวัด",
    "store.planLabel": "แบบ",
    "store.startingAt": "เริ่มต้น",
    "store.specSqft": "ตร.ม.",
    "store.specBeds": "ห้องนอน",
    "store.specBaths": "ห้องน้ำ",
    "store.specLivingRooms": "ห้องรับแขก",
    "store.specStories": "ชั้น",
    "store.viewPlan": "ดูแบบ",
    "store.viewExterior": "รูปด้าน",
    "store.viewFloorPlan": "แปลนชั้น",
    "store.buyNow": "ซื้อเลย",
    "store.checkoutTitle": "ซื้อแบบบ้าน",
    "store.purchaseSuccess": "ชำระเงินสำเร็จ — กำลังดาวน์โหลด",
    "store.paymentPending":
      "ส่งการชำระเงินแล้ว — รอธนาคารยืนยัน ระบบจะปลดล็อกดาวน์โหลดให้อัตโนมัติ",
    "store.autoPublished": "ชำระเงินสำเร็จ — แบบของคุณลงร้านแล้ว (ซ่อนจากคุณ)",
    "store.addToCart": "ใส่ตะกร้า",
    "store.cartTitle": "ตะกร้าสินค้า",
    "store.cartEmpty": "ตะกร้าว่าง — เลือกแบบบ้านที่ชอบแล้วใส่ตะกร้าได้เลย",
    "store.cartRemove": "ลบ",
    "store.cartSubtotal": "ยอดรวม",
    "store.cartDiscount": "ส่วนลดแพ็ก",
    "store.cartTotal": "ยอดชำระ",
    "store.cartCheckout": "ชำระเงินรวม",
    "store.cartCheckoutSuccess": "ชำระเงินตะกร้าสำเร็จ — กำลังดาวน์โหลด",
    "store.cartAdded": "ใส่ตะกร้าแล้ว",
    "store.cartInCart": "อยู่ในตะกร้า",
    "store.cartBundleDiscount": "ได้รับส่วนลดแพ็กแล้ว",
    "store.upsell.similarStyle": "แบบสไตล์ใกล้เคียงที่คุณอาจชอบ",
    "store.upsell.exploreMore": "สำรวจแบบอื่นๆ เพิ่มเติม",
    "store.upsell.boqBundle": "เอกสารปริมาณราคาและวัสดุ (ไฟล์ PDF)",
    "store.upsell.boqBundleDesc": "รายการคำนวณราคาบ้านและวัสดุก่อสร้าง สำหรับทุกแบบในตะกร้า",
    "store.upsell.bundleHint2": "เพิ่มอีก 1 แบบ รับส่วนลด {pct}%",
    "store.upsell.bundleHint3": "เพิ่มอีก 1 แบบ รับส่วนลด {pct}%",
    "common.yes": "ใช่",
    "common.no": "ไม่",
    "payment.promptpay": "พร้อมเพย์",
    "payment.card": "บัตรเครดิต/เดบิต",
    "store.aria.save": "บันทึกรายการโปรด",
    "store.aria.favorites": "รายการโปรด",
    "store.aria.removeFavorite": "ลบออกจากรายการโปรด",
    "store.favoritesTitle": "แบบที่บันทึกไว้",
    "store.favoritesEmpty": "ยังไม่มีแบบที่บันทึก — กดหัวใจที่การ์ดแบบบ้าน",
    "store.searchActive": "ค้นหา",
    "store.favoritesFilterActive": "เฉพาะรายการโปรด",
    "store.globalBanner.title": "ช้อปด้วยภาษาของคุณ",
    "store.globalBanner.subtitle":
      "ชื่อแบบบ้าน คำอธิบาย และหน้าชำระเงินแปลอัตโนมัติตามภาษาเบราว์เซอร์หรือภาษาที่คุณเลือก",
    "store.globalBanner.switchLabel": "เลือกภาษา",
    "store.globalBanner.aiActive": "แปลอัตโนมัติ",
    "store.globalBanner.aria": "รองรับหลายภาษาระดับสากล",
    "pwa.installTitle": "ติดตั้งแอป Planasia",
    "pwa.installSubtitle": "เพิ่มไปหน้าจอหลักเพื่อเข้าถึงร้านแบบบ้านและประวัติการซื้อได้ทันที",
    "pwa.benefit1": "เข้าร้านแบบบ้านได้ในคลิกเดียว",
    "pwa.benefit2": "ใช้งานหน้าที่แคชไว้ได้แม้ไม่มีอินเทอร์เน็ต",
    "pwa.benefit3": "ประสบการณ์เต็มจอเหมือนแอปจริง",
    "pwa.installNow": "ติดตั้งแอป",
    "pwa.installing": "กำลังติดตั้ง…",
    "pwa.later": "ไว้ทีหลัง",
    "pwa.neverAsk": "ไม่ต้องถามอีก",
    "pwa.iosTitle": "ติดตั้งบน iPhone / iPad",
    "pwa.iosSteps": "แตะปุ่มแชร์ใน Safari แล้วเลือก \"เพิ่มที่หน้าจอโฮม\"",
    "pwa.gotIt": "เข้าใจแล้ว",
    "pwa.androidHint": "เปิดเมนูเบราว์เซอร์ (⋮) แล้วแตะ \"ติดตั้งแอป\" หรือ \"เพิ่มไปหน้าจอหลัก\"",
    "landing.ctaBand": "ค้นหาแบบบ้านที่ใช่สำหรับคุณ",
    "landing.ctaBandDesc": "สำรวจแคตตาล็อกแบบบ้านทั้งหมดของเรา และซื้อแบบที่คุณชอบ",
    "editor.title": "ตัวแก้ไขดีไซน์ 3D",
    "editor.saveDraft": "บันทึกแบบร่าง",
    "editor.saving": "กำลังบันทึก…",
    "editor.draftSaved": "บันทึกแบบร่างแล้ว — กลับมาแก้ต่อได้ทุกเมื่อ",
    "editor.rooms": "ห้อง",
    "editor.openings": "ประตูและหน้าต่าง",
    "editor.door": "ประตู",
    "editor.window": "หน้าต่าง",
    "editor.addDoor": "เพิ่มประตู",
    "editor.addWindow": "เพิ่มหน้าต่าง",
    "editor.materials": "วัสดุ",
    "editor.materialEstimate": "ประมาณการวัสดุ",
    "editor.estimateNote": "โดยประมาณ ไม่รวมค่าแรง",
    "editor.view3d": "มุมมอง 3D",
    "editor.viewPlan": "แปลนชั้น (คลิกเลือกห้อง)",
    "editor.width": "ความกว้าง",
    "editor.depth": "ความลึก",
    "editor.wallSide": "ผนัง",
    "editor.position": "ตำแหน่ง",
    "editor.openingWidth": "ความกว้างช่องเปิด",
    "editor.removeOpening": "ลบ",
    "editor.roughPreviewTitle": "พรีวิวโครงสร้าง",
    "editor.roughPreviewDesc": "โครงร่างหยาบ — ตรวจสอบก่อนประมวลผลภาพจริง",
    "editor.structureSummary": "สรุปโครงสร้าง",
    "editor.roomCount": "จำนวนห้อง",
    "editor.openingCount": "ช่องเปิด",
    "editor.grossArea": "พื้นที่รวม",
    "editor.inclContingency": "รวมสำรอง 10%",
    "editor.backToEdit": "กลับไปแก้ไข",
    "editor.confirmAndGenerate": "ยืนยันและสร้างแปลน",
    "editor.barHint": "ปรับห้อง ประตู หน้าต่าง และวัสดุแบบเรียลไทม์",
    "editor.exitEdit": "ออกจากตัวแก้ไข",
    "editor.openEdit": "แก้ไขดีไซน์",
    "editor.previewStructure": "พรีวิว",
    "editor.exportDocumentation": "ส่งออกเอกสาร",
    "editor.exportDocumentationSuccess": "ดาวน์โหลดไฟล์ JSON เอกสารแล้ว",
    "editor.exportDocumentationFailed": "ส่งออกเอกสารไม่สำเร็จ",
    "editor.exportPreviewTitle": "ตัวอย่างเอกสาร",
    "editor.exportPreviewLoading": "กำลังสร้างสรุปเอกสาร…",
    "editor.exportPreviewProject": "สรุปโครงการ",
    "editor.exportPreviewScheduleItems": "ช่องเปิด",
    "editor.exportDownloadJson": "ดาวน์โหลดไฟล์ JSON",
    "editor.exportDownloadPdf": "ดาวน์โหลด PDF สรุป",
    "editor.exportPdfSuccess": "ดาวน์โหลด PDF สรุปแล้ว",
    "editor.exportPdfFailed": "สร้าง PDF สรุปไม่สำเร็จ",
    "job.exportTitle": "กำลังส่งออกไฟล์",
    "job.queued": "อยู่ในคิว — ลำดับที่ {n}",
    "job.processing": "กำลังสร้างไฟล์…",
    "job.completed": "ส่งออกเสร็จแล้ว!",
    "job.failed": "ส่งออกไม่สำเร็จ",
    "job.download": "ดาวน์โหลดไฟล์",
    "job.downloadStarted": "เริ่มดาวน์โหลดแล้ว — ตรวจสอบโฟลเดอร์ดาวน์โหลดของคุณ",
    "job.downloadAgain": "ดาวน์โหลดอีกครั้ง",
    "job.jobId": "รหัสงาน",
    "job.rateLimited": "คำขอมากเกินไป — รอสักครู่แล้วลองใหม่",
    "cost.inputTitle": "งบประมาณและพื้นที่เป้าหมาย",
    "cost.maxBudget": "งบประมาณสูงสุด (บาท)",
    "cost.targetArea": "พื้นที่ใช้สอยเป้าหมาย (ตร.ม.)",
    "cost.tierLabel": "ระดับต้นทุนก่อสร้าง (ดัชนี REA)",
    "cost.tierEconomy": "ประหยัด — ฿12–16K/ตร.ม.",
    "cost.tierStandard": "มาตรฐาน — ฿18–23K/ตร.ม.",
    "cost.tierPremium": "พรีเมียม — ฿28–35K/ตร.ม.",
    "cost.liveTotal": "ต้นทุนรวมประเมิน",
    "cost.perSqm": "ต้นทุนต่อ ตร.ม.",
    "cost.budgetUsed": "การใช้งบประมาณ",
    "cost.areaUsed": "การใช้พื้นที่",
    "cost.alertTitle": "แจ้งเตือนงบ / พื้นที่",
    "cost.overBudgetMsg": "เกินงบประมาณ {amount}",
    "cost.overAreaMsg": "เกินพื้นที่เป้าหมาย {delta} ตร.ม.",
    "cost.estSavings": "ประหยัดได้โดยประมาณ",
    "cost.applyFix": "ปรับให้",
    "cost.bankReady": "ดีไซน์อยู่ในกรอบงบและพื้นที่เป้าหมาย — เหมาะสำหรับนำเสนอคอนเซปต์",
    "cost.bankReadyShort": "งบประมาณโอเค",
    "cost.permitNotReady": "งบและพื้นที่โอเคแล้ว แต่ควรให้ผู้เชี่ยวชาญท้องถิ่นตรวจทานกฎก่อนก่อสร้าง",
    "cost.permitNotReadyShort": "ต้องตรวจทานท้องถิ่น",
    "cost.ofBudget": "ของงบ",
    "cost.adjustNeeded": "ควรปรับแบบ",
    "cost.rec.downgradeWall": "ลดเกรดวัสดุผนังเพื่อลดต้นทุน",
    "cost.rec.downgradeFloor": "เปลี่ยนเป็นพื้นกระเบื้องเซรามิค",
    "cost.rec.downgradeRoof": "เปลี่ยนเป็นหลังคาเมทัลชีท",
    "cost.rec.changeTier": "ลดระดับต้นทุนก่อสร้าง",
    "cost.rec.shrinkRoom": "ลดขนาดห้องใหญ่สุด 10%",
    "cost.rec.removeOpening": "ลบหน้าต่างที่เพิ่มเข้ามา",
    "permit.title": "ตรวจสอบกฎขออนุญาต",
    "permit.checking": "กำลังตรวจสอบกฎก่อสร้าง…",
    "permit.rateLimited": "ตรวจสอบบ่อยเกินไป — รอสักครู่",
    "permit.checkFailed": "ตรวจสอบไม่สำเร็จ ลองใหม่อีกครั้ง",
    "permit.allClear": "ไม่พบข้อปิดกั้นการขออนุญาตสำหรับประเภทนี้",
    "permit.issuesSummary": "{errors} ข้อผิดพลาด · {warnings} คำเตือน",
    "permit.passed": "ผ่าน",
    "permit.needsReview": "ต้องตรวจสอบ",
    "permit.requiredDocs": "เอกสารที่มักใช้ยื่นอนุญาต",
    "how.subtitle": "เพียง 4 ขั้นตอน จากการอัปโหลดแปลนสู่ภาพเรนเดอร์สถาปัตยกรรมสมจริง",
    "how.stepLabel": "ขั้นตอน {n}",
    "how.step4.title": "รับผลลัพธ์ 3D",
    "how.step4.desc": "ได้ภาพแปลน 3D และหน้าตรงสมจริง พร้อมแชร์ได้ทันที",
    "landing.hero.eyebrow": "สตูดิโอสถาปัตยกรรม AI",
    "landing.hero.tagline": "เปลี่ยนแปลนบ้านเป็นบ้าน 3D สมจริง — ภายในไม่กี่วินาที",
    "landing.hero.desc": "อัปโหลดแปลน 2D และรูปหน้าตรงใน Workspace เลือกสไตล์บ้าน ยืนยัน แล้วให้ AI สร้างภาพเรนเดอร์คุณภาพสูง โดยยังล็อกโครงสร้างเดิมไว้",
    "landing.hero.getStarted": "เริ่มต้นใช้งาน",
    "landing.hero.browseStyles": "ดูสไตล์",
    "landing.hero.flowHint": "ขั้นตอน: อัปโหลดแปลน → เลือกสไตล์ → ยืนยันและเรนเดอร์ → ผลลัพธ์ AI",
    "features.eyebrow": "ทำไมต้อง Planasia",
    "features.title": "เร็ว แม่นยำ และเลือกสไตล์ได้",
    "features.fast.title": "เรนเดอร์ด้วย AI รวดเร็ว",
    "features.fast.desc": "จากแปลนสู่ภาพคอนเซปต์สมจริงในไม่กี่นาที — ไม่ต้องโมเดลมือหลายวัน",
    "features.geometry.title": "สมจริงโดยล็อกโครงสร้าง",
    "features.geometry.desc": "ปรับพื้นผิว แสง และบรรยากาศ โดยโครงสร้างเดิมยังคงเดิม",
    "features.styles.title": "สไตล์ออกแบบคัดสรร",
    "features.styles.desc": "มินิมอล โมเดิร์น ทรอปิคอล หรูหรา ญี่ปุ่น — เลือกบรรยากาศใน Workspace โดยไม่ต้องออกแบบแปลนใหม่",
    "inputStage.uploadEyebrow": "อัปโหลด",
    "inputStage.uploadTitle": "อัปโหลดแปลนและรูปหน้าตรง",
    "inputStage.uploadDesc": "เพิ่มทั้งสองภาพ เลือกสไตล์บ้าน แล้วยืนยันเพื่อสร้างเรนเดอร์ 3D สมจริง",
    "inputStage.bothReady": "ครบทั้ง 3 ไฟล์แล้ว AI จะล็อกโครงสร้างจากแปลนทั้งสองชั้นและรูปหน้าบ้าน",
    "inputStage.needBoth": "อัปโหลดแปลนชั้น 1, แปลนชั้น 2 และรูปหน้าบ้านเพื่อดำเนินการต่อ",
    "inputStage.confirmRender": "ยืนยันและเรนเดอร์",
    "results.eyebrow": "ผลลัพธ์ AI",
    "results.title": "เรนเดอร์ 3D ของคุณ",
    "results.newUpload": "อัปโหลดใหม่",
    "results.failed": "เรนเดอร์ไม่สำเร็จ กรุณาลองใหม่ด้วยทั้งสองภาพ",
    "results.planTitle": "แปลน 3D",
    "results.planSubtitle": "ภาพแปลนสมจริง",
    "results.facadeTitle": "หน้าตรงอาคาร",
    "results.facadeSubtitle": "เรนเดอร์ด้านหน้า / ภายนอก",
    "results.rendering": "กำลังเรนเดอร์…",
    "results.empty": "ยังไม่มีภาพเรนเดอร์",
    "results.expand": "ขยาย {title}",
    "results.download": "ดาวน์โหลด",
    "results.downloadAll": "ดาวน์โหลดทั้งหมด",
    "results.downloaded": "เริ่มดาวน์โหลดแล้ว",
    "results.downloadFailed": "ดาวน์โหลดไม่สำเร็จ — กรุณาลองใหม่",
    "results.share": "แชร์",
    "results.shareTitle": "เรนเดอร์ 3D จาก Planasia",
    "results.shareText": "ชมเรนเดอร์บ้าน 3D ด้วย AI จาก Planasia ของฉัน",
    "results.shared": "แชร์แล้ว",
    "results.shareCopied": "คัดลอกลิงก์แล้ว",
    "results.shareDownloadFallback": "ดาวน์โหลดภาพแล้ว — แชร์จากอุปกรณ์ของคุณได้",
    "results.shareFailed": "แชร์ไม่สำเร็จ — ลองดาวน์โหลดแทน",
    "wizard.step.upload": "อัปโหลด",
    "wizard.step.confirm": "ยืนยัน",
    "wizard.step.result": "ผลลัพธ์ AI",
    "wizard.aria": "ขั้นตอนการออกแบบ",
    "beforeAfter.before": "ก่อน",
    "beforeAfter.after": "หลัง",
    "beforeAfter.beforeHint": "ลายเส้น",
    "beforeAfter.afterHint": "เรนเดอร์ 3D ด้วย AI",
    "beforeAfter.dragHint": "ลากเพื่อเปรียบเทียบ",
    "beforeAfter.aria": "สไลเดอร์เปรียบเทียบก่อนและหลัง",
    "chat.errorGeneric": "ขออภัย เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
    "galleryPage.title": "แกลเลอรีผลงาน",
    "galleryPage.subtitle":
      "ชมคอนเซปต์บ้านที่สร้างด้วย AI จากผู้ใช้ Planasia — ดูเพื่อแรงบันดาลใจเท่านั้น",
    "galleryPage.ctaTitle": "อยากสร้างคอนเซปต์ของคุณเอง?",
    "galleryPage.ctaDesc":
      "อัปโหลดแปลนบ้าน เลือกสไตล์ แล้วให้ AI สร้างภาพ 3D และหน้าตรงให้คุณภายในไม่กี่นาที",
    "galleryPage.ctaButton": "เริ่มสร้างคอนเซปต์",
    "permit.blockSubmit": "แก้ข้อผิดพลาดด้านใบอนุญาตก่อนดำเนินการต่อ",
  },
  hi: {
    "nav.home": "Home",
    "nav.store": "Store",
    "nav.pricing": "Pricing",
    "nav.howItWorks": "Workflow",
    "nav.startDesign": "Start Creating",
    "nav.login": "Google से साइन इन",
    "nav.menu": "Menu",
    "nav.closeMenu": "Close menu",
    "nav.housePlans": "House Plans",
    "nav.collections": "Collections",
    "nav.findDraftsman": "Architects & Designers",
    "nav.aboutPlans": "Home loan consultation",
    "nav.signIn": "Sign In",
    "nav.searchByPlan": "Search by Plan #",
    "nav.wishlist": "Wishlist",
    "nav.cart": "Cart",
    "nav.seller": "ลงขายแบบ",
    "nav.sellerAria": "ลงขายแบบ — entry for architects and draftsmen who write house plans",
    "hero.title": "House Plans & Designs, Ready to Build",
    "hero.subtitle":
      "Browse a curated collection of professional house plans and designs. Find your perfect layout, buy instantly, and download construction-ready documents.",
    "hero.cta": "Browse House Plans",
    "hero.ctaSecondary": "View House Shop",
    "gallery.title": "แบบบ้าน Curated Styles",
    "publicGallery.nav": "แกลเลอรีผลงาน",
    "publicGallery.loading": "กำลังโหลดแกลเลอรี...",
    "publicGallery.loadError": "ไม่สามารถโหลดแกลเลอรีได้ กรุณาลองใหม่อีกครั้ง",
    "publicGallery.emptyTitle": "ยังไม่มีผลงานในแกลเลอรี",
    "publicGallery.emptyDesc": "เมื่อมีผู้ใช้สร้างคอนเซปต์บ้านด้วย AI ผลงานจะปรากฏที่นี่เพื่อเป็นแรงบันดาลใจ",
    "publicGallery.viewWork": "ดูผลงาน",
    "publicGallery.viewOnly": "ดูอย่างเดียว",
    "publicGallery.viewFloorPlan3d": "แปลน 3D",
    "publicGallery.viewFacade": "หน้าตรง",
    "publicGallery.lightboxTitle": "ดูภาพผลงาน",
    "publicGallery.closeLightbox": "ปิด",
    "publicGallery.viewOnlyHint": "หน้าแกลเลอรีนี้สำหรับดูอย่างเดียว — ดาวน์โหลดไฟล์ความละเอียดสูงได้เฉพาะเจ้าของผลงานใน Workspace",
    "how.title": "How It Works",
    "how.step1.title": "Input Vision & Specs",
    "how.step1.desc": "Define your architectural parameters, materials, and spatial requirements.",
    "how.step2.title": "AI Generation & 3D Render",
    "how.step2.desc":
      "Our AI engine instantly generates high-fidelity 3D architectural renders and design concepts.",
    "how.step3.title": "Permit-Ready Blueprints",
    "how.step3.desc":
      "Export professional architectural blueprints and documentation ready for construction permits and contractors.",
    "pricing.title": "Plans & Pricing",
    "pricing.subtitle": "Standard architectural drawing sets and CAD files for construction projects.",
    "pricing.standard": "Standard",
    "pricing.premium": "Premium",
    "pricing.luxury": "Luxury",
    "pricing.store": "Ready-Made House Plans (Store)",
    "pricing.custom1": "Custom 1-Story Design",
    "pricing.custom2": "Custom 2-Story Design",
    "pricing.cad": "CAD File",
    "pricing.perDesign": "per set",
    "pricing.buyNow": "Get Started",
    "pricing.feature.pdfPreview": "PDF document set with preview samples",
    "pricing.feature.instantDownload": "Instant download after payment",
    "pricing.feature.storeCatalog": "Access to the ready-made house plan catalog",
    "pricing.feature.customSpec1Story": "Custom design to your specifications (single-storey)",
    "pricing.feature.customSpec2Story": "Custom design to your specifications (two-storey)",
    "pricing.feature.fullPdfA3": "Complete PDF drawing set (A3 layout)",
    "pricing.feature.permitReady": "Documentation ready for building permit submission",
    "pricing.feature.structuralStandardReview": "Reviewed against structural design standards",
    "pricing.feature.foundationStructuralCalc": "Foundation and structural calculation schedule included",
    "pricing.feature.cadDeliverable": "CAD files included for downstream use",
    "pricing.popularBadge": "ยอดนิยม",
    "pricing.starter.name": "แพ็กเกจทดลอง",
    "pricing.starter.tagline": "สำหรับผู้เริ่มต้น",
    "pricing.starter.price": "ฟรี",
    "pricing.starter.priceNote": "0 บาท",
    "pricing.starter.feature1": "ได้รับ 3 เครดิต (สร้างภาพได้ 3 ครั้ง / 6 รูป)",
    "pricing.starter.feature2": "รูปภาพความละเอียดมาตรฐาน",
    "pricing.starter.feature3": "ดาวน์โหลดและแชร์ได้ทันที",
    "pricing.starter.cta": "เริ่มต้นใช้งานฟรี",
    "pricing.pro.name": "แพ็กเกจยอดนิยม",
    "pricing.pro.tagline": "สำหรับใช้งานจริงจัง",
    "pricing.pro.price": "290",
    "pricing.pro.priceNote": "บาท / ครั้งเดียว",
    "pricing.pro.feature1": "ได้รับ 30 เครดิต (สร้างภาพได้ 30 ครั้ง / 60 รูป)",
    "pricing.pro.feature2": "ความคมชัดระดับสูงพิเศษ (ความละเอียดสูง / รายละเอียดคมชัด)",
    "pricing.pro.feature3": "เลือกสไตล์สถาปัตยกรรมได้ไม่จำกัด",
    "pricing.pro.feature4": "ดาวน์โหลดไฟล์ความละเอียดสูงสำหรับพรีเซนต์",
    "pricing.pro.cta": "เลือกแพ็กเกจนี้",
    "pricing.business.name": "แพ็กเกจธุรกิจ",
    "pricing.business.tagline": "สำหรับบริษัทหรือมืออาชีพ",
    "pricing.business.price": "990",
    "pricing.business.priceNote": "บาท / เดือน",
    "pricing.business.feature1": "ได้รับ 150 เครดิตต่อเดือน",
    "pricing.business.feature2": "เรนเดอร์ด้วยความเร็วด่วนพิเศษ (คิวลำดับความสำคัญ)",
    "pricing.business.feature3": "สิทธิ์การใช้งานเชิงพาณิชย์",
    "pricing.business.feature4": "บันทึกประวัติและแก้ไขงานย้อนหลังได้",
    "pricing.business.cta": "ติดต่อใช้งาน",
    "workspace.controlPanel": "नियंत्रण और इनपुट पैनल",
    "workspace.openQuestionnaire": "डिज़ाइन सेटिंग्स",
    "workspace.style": "शैली",
    "workspace.roofType": "छत का प्रकार",
    "workspace.colorPalette": "रंग पैलेट",
    "workspace.floors": "मंजिलें",
    "workspace.upload": "योजना अपलोड",
    "workspace.uploadHint": "घर की योजना फ़ाइल अपलोड करने के लिए खींचें या क्लिक करें",
    "workspace.projectName": "परियोजना का नाम",
    "workspace.location": "स्थान",
    "workspace.preview": "लाइव रेंडर पूर्वावलोकन",
    "workspace.save": "सहेजें",
    "workspace.share": "साझा करें",
    "workspace.shareCopied": "लिंक क्लिपबोर्ड पर कॉपी हो गया",
    "workspace.shareFailed": "साझा नहीं हो सका — URL मैन्युअल कॉपी करें",
    "workspace.expandFullscreen": "Fullscreen",
    "ai.statusLive": "AI Live",
    "ai.statusOffline": "Template Mode",
    "ai.statusLiveHint": "AI connected.",
    "ai.statusOfflineHint": "Template mode — set GEMINI_API_KEY.",
    "workspace.prevView": "पिछला दृश्य",
    "workspace.nextView": "अगला दृश्य",
    "workspace.floor1": "पहली मंजिल की योजना",
    "workspace.floor2": "दूसरी मंजिल की योजना",
    "workspace.exportPdf": "Download PDF",
    "workspace.exportCad": "Download AutoCAD",
    "workspace.exportPdfDesc": "Full permit drawing set — clean, unwatermarked",
    "workspace.exportCadDesc": "CAD files for downstream use — clean, unwatermarked",
    "workspace.downloadPanel": "Downloads",
    "workspace.downloadPanelHint": "Preview is free. Pay to download clean files without watermarks.",
    "workspace.sheetArch": "Architectural",
    "workspace.sheetStructural": "Structural",
    "workspace.sheetSanitary": "Sanitary",
    "workspace.sheetElectrical": "Electrical",
    "workspace.sheetMechanical": "Mechanical",
    "workspace.sheetAc": "Air Conditioning",
    "workspace.sheetOther": "Drawing Sheet",
    "workspace.sheetPreviewTitle": "Drawing Sheet Preview",
    "workspace.sheetPreviewHint": "Scroll to review all sheets. Watermarked preview — pay to download clean files.",
    "workspace.watermarkHint": "Preview only — watermarked to protect your design.",
    "workspace.myWorks": "My works",
    "workspace.addWork": "Add work",
    "workspace.deleteWork": "Delete work",
    "workspace.workCreated": "New work created",
    "workspace.workDeleted": "Work deleted",
    "sidebar.title": "Project settings",
    "sidebar.projectName": "Project name",
    "sidebar.ownerName": "Owner name",
    "sidebar.location": "Construction site",
    "sidebar.floors": "Floors",
    "sidebar.floor1": "1 floor",
    "sidebar.floor2": "2 floors",
    "sidebar.bedrooms": "Bedrooms",
    "sidebar.bathrooms": "Bathrooms",
    "sidebar.budget": "Budget",
    "sidebar.style": "Preferred style",
    "sidebar.wallMaterial": "Wall material",
    "sidebar.floorMaterial": "Floor material",
    "sidebar.roofMaterial": "Roof material",
    "sidebar.foundation": "Foundation type",
    "sidebar.groupProject": "Project info",
    "sidebar.groupBuilding": "Building spec",
    "sidebar.groupMaterials": "Materials",
    "sidebar.groupUploads": "Reference files",
    "workspace.chatPlaceholder":
      "AI से संपादन के लिए परामर्श: जैसे 'बालकनी को कांच में बदलें'",
    "workspace.generate": "जनरेट",
    "workspace.generateRender": "3D रेंडर बनाएं",
    "workspace.generatingRender": "3D पूर्वावलोकन बना रहे हैं...",
    "workspace.generatingPlans": "योजनाएँ बना रहे हैं...",
    "workspace.generating": "आपका सपनों का घर बना रहे हैं...",
    "workspace.viewRender3d": "3D Render",
    "workspace.viewFacade": "Front Facade",
    "workspace.viewFloorPlan": "Floor Plan",
    "workspace.aiZone": "AI Output Zone",
    "workspace.aiPreviewEmpty": "Complete the brief and generate — AI images will appear here.",
    "workspace.aiPreviewHint": "Rendering 3D view, front facade, and floor plan…",
    "workflow.step1": "1. Home",
    "workflow.step2": "2. Floor Plan",
    "workflow.step3": "3. Style & Vibe",
    "workflow.step4": "4. Confirm",
    "workflow.step5": "5. AI Result",
    "workflow.confirmPlan": "डिज़ाइन की पुष्टि करें",
    "workflow.confirmHint": "3D रेंडर से संतुष्ट हैं? फ़्लोर प्लान बनाने के लिए पुष्टि करें।",
    "workflow.conceptReady": "Concept ready — review zoning and download design ideas",
    "workflow.conceptReviewHint": "Review room zoning and presentation images, then export the concept pack",
    "workflow.conceptExportedHint": "Concept pack downloaded successfully",
    "concept.exportPanel": "Export concept",
    "concept.exportPanelHint": "Download 3D views and mood board for client presentation",
    "concept.exportPerspective": "3D perspective",
    "concept.exportPerspectiveDesc": "Three-dimensional concept render",
    "concept.exportFacade": "Front facade",
    "concept.exportFacadeDesc": "Straight-on front elevation image",
    "concept.exportBoard": "Mood board",
    "concept.exportBoardDesc": "Presentation board summarizing the design idea",
    "concept.exportEmpty": "Nothing to download yet — generate a concept first",
    "concept.exportDisclaimer": "Outputs are concept-level design ideas, not construction or permit drawings",
    "inputStage.title": "Upload references & pick a style",
    "inputStage.subtitle": "Drop a 2D floor plan and front elevation (optional), then choose a design style.",
    "inputStage.uploadSection": "Reference images",
    "inputStage.floorPlan": "2D floor plan",
    "inputStage.floorPlanHint": "Line drawing — room proportions and layout",
    "inputStage.floorPlan1": "First floor plan",
    "inputStage.floorPlan1Hint": "Ground floor — PNG, JPEG, or PDF",
    "inputStage.floorPlan2": "Second floor plan",
    "inputStage.floorPlan2Hint": "Upper floor — PNG, JPEG, or PDF",
    "inputStage.elevation": "Front elevation",
    "inputStage.elevationHint": "Front view — exterior shape (optional)",
    "inputStage.dropHere": "ลากวางไฟล์ที่นี่",
    "inputStage.browseFiles": "หรือคลิกเพื่อเลือกไฟล์",
    "inputStage.fileFormats": "รองรับ PNG, JPEG และ PDF",
    "inputStage.uploading": "กำลังอัปโหลด...",
    "inputStage.required": "จำเป็น",
    "inputStage.styleSection": "Preferred style",
    "inputStage.styleModernMinimal": "แบบบ้าน Minimalist",
    "inputStage.styleNordic": "แบบบ้าน Modern",
    "inputStage.styleModernTropical": "แบบบ้าน Tropical",
    "inputStage.styleLoftIndustrial": "แบบบ้าน Luxury",
    "inputStage.styleJapanese": "แบบบ้าน Japanese",
    "inputStage.startConcept": "Start AI concept",
    "inputStage.confirm": "Confirm",
    "inputStage.rendering": "Rendering…",
    "inputStage.sidebarHint": "Fill project details in the left panel, then click Start.",
    "workflow.optionsTitle": "योजना विवरण और विकल्प",
    "workflow.optionsDesc": "आधिकारिक योजना बनाने से पहले सामग्री चुनें।",
    "workflow.generatePlans": "फ़्लोर प्लान बनाएं",
    "workflow.cancel": "रद्द करें",
    "workflow.watermarkHint": "फ़्लोर प्लान और डाउनलोड अनलॉक करने के लिए भुगतान करें।",
    "workflow.paywallHint": "केवल 3D पूर्वावलोकन। फ़्लोर प्लान, विवरण और डाउनलोड के लिए भुगतान करें।",
    "workflow.payToUnlock": "अनलॉक करने के लिए भुगतान",
    "workflow.preview3dOnly": "3D पूर्वावलोकन — फ़्लोर प्लान के लिए भुगतान",
    "workflow.preview3dHint": "3D रेंडर देखें। पूर्ण योजना सेट बनाने के लिए पुष्टि करें (भुगतान तक लॉक)।",
    "workflow.plansReadyPaywall": "योजना सेट तैयार — अनलॉक के लिए भुगतान",
    "workflow.autoListed": "स्टोर पर सूचीबद्ध (आपको नहीं दिखेगा)",
    "workflow.unlockedHint": "अनलॉक — फ़्लोर प्लान, डाउनलोड और स्टोर लिस्टिंग सक्रिय।",
    "options.wall": "Wall Material",
    "options.floor": "Floor Material",
    "options.roof": "Roof Material",
    "options.extras": "Drawing Sets",
    "options.electrical": "Electrical Plan",
    "options.plumbing": "Plumbing",
    "options.structural": "Structural Calc",
    "options.evCharger": "EV Charger",
    "payment.title": "Unlock Download",
    "payment.desc": "Pay to download full-quality files.",
    "payment.payNow": "Pay & Unlock",
    "payment.processing": "Processing...",
    "payment.failed": "Payment failed.",
    "download.readyPdf": "PDF ready — click Export PDF to download.",
    "download.readyCad": "CAD ready — click Export CAD to download.",
    "store.subtitle": "Curated architectural house plans ready for construction",
    "store.communityBadge": "AI Community Design",
    "store.empty": "No listings yet.",
    "country.select": "देश / क्षेत्र",
    "language.select": "भाषा",
    "currency.select": "मुद्रा",
    "footer.contact": "संपर्क",
    "footer.privacy": "गोपनीयता नीति",
    "footer.terms": "सेवा की शर्तें",
    "legal.lastUpdated": "अंतिम अपडेट: जुलाई 2026",
    "form.ownerName": "मालिक का नाम",
    "form.projectName": "परियोजना का नाम (वैकल्पिक)",
    "form.province": "प्रांत / जिला",
    "form.floors": "मंजिलों की संख्या",
    "form.foundation": "नींव का प्रकार",
    "form.foundation.pile": "पाइल फाउंडेशन",
    "form.foundation.spread": "स्प्रेड फुटिंग",
    "form.foundation.pileRequired":
      "2-मंजिला भवनों के लिए, संरचनात्मक सुरक्षा हेतु पाइल फाउंडेशन आवश्यक है।",
    "form.bedrooms": "शयनकक्ष",
    "form.bathrooms": "स्नानघर",
    "form.budget": "निर्माण बजट",
    "questionnaire.title": "Input Questionnaire",
    "questionnaire.subtitle": "Fill in project details — reference images optional (max 2)",
    "questionnaire.designDirection": "Design Direction",
    "questionnaire.goldenStandard": "Golden Standard",
    "questionnaire.disciplinePreset": "Drawing Set Scope",
    "questionnaire.uploads": "Reference images (optional, max 2)",
    "upload.optional": "Optional",
    "upload.optionalHint": "Up to 2 .jpg/.png images, no size limit.",
    "upload.aiExtractHint": "AI extracts plans, dimensions, materials, and summary.",
    "upload.ref1": "Reference image 1",
    "upload.ref2": "Reference image 2",
    "upload.ref1Hint": "Floor or site plan",
    "upload.ref2Hint": "Extra plan or section",
    "upload.tooltip": "AI reads architectural data from images.",
    "upload.analysisTitle": "AI summary",
    "upload.analysisDone": "Analysis complete",
    "upload.rejected": "Image not suitable — use house plans only.",
    "upload.floorPlan3dTitle": "3D Floor Plan Preview",
    "upload.floorPlan3dHint": "Isometric bird's-eye view from reference images",
    "upload.floorPlan3dClose": "Close",
    "upload.generating3dFloorPlan": "Generating 3D floor plan…",
    "upload.floorPlan3dGeneratingHint": "Building realistic isometric visualization with lighting and textures.",
    "upload.floorPlan3dReady": "3D floor plan ready!",
    "upload.floorPlan3dFailed": "Could not generate 3D floor plan.",
    "workspace.viewFloorPlan3d": "3D Floor Plan",
    "workspace.viewPresentationBoard": "Presentation Board",
    "presentationBoard.title": "Project Presentation Board",
    "presentationBoard.subtitle": "AI board matching villa reference layout",
    "presentationBoard.hint": "Fixed layout: exterior, floor plans, 3 interiors. Edit Thai captions before generating.",
    "presentationBoard.floors": "House type",
    "presentationBoard.singleStory": "Single-story",
    "presentationBoard.twoStory": "Two-story",
    "presentationBoard.projectName": "Project name / footer",
    "presentationBoard.description": "Description",
    "presentationBoard.captionLeft": "Left caption (Thai)",
    "presentationBoard.captionCenter": "Center caption (Thai)",
    "presentationBoard.captionRight": "Right caption (Thai)",
    "presentationBoard.floorPlanRule": "Floor plan labels",
    "presentationBoard.generate": "Generate Board",
    "presentationBoard.generating": "Generating…",
    "presentationBoard.generatingHint": "Composing presentation board…",
    "presentationBoard.ready": "Board ready!",
    "presentationBoard.failed": "Generation failed.",
    "presentationBoard.empty": "Click Generate to create board.",
    "presentationBoard.showPrompt": "Show prompt",
    "presentationBoard.hidePrompt": "Hide prompt",
    "presentationBoard.open": "Presentation Board",
    "presentationBoard.requiredForDrafting": "Generate or upload a presentation board first.",
    "presentationBoard.draftingReady": "Board saved — confirm to generate DPT drawing set.",
    "presentationBoard.draftingRequired": "Create a presentation board first.",
    "presentationBoard.upload": "Upload board",
    "presentationBoard.download": "Download",
    "presentationBoard.share": "Share",
    "presentationBoard.shared": "Shared",
    "presentationBoard.linkCopied": "Copied",
    "presentationBoard.shareFailed": "Share failed",
    "presentationBoard.stored": "Stored in project",
    "presentationBoard.downloaded": "Download started",
    "presentationBoard.storedLabel": "Stored file",
    "presentationBoard.sourceGenerated": "AI generated",
    "presentationBoard.sourceUploaded": "uploaded",
    "questionnaire.slot1": "Slot 1 — Site Plan",
    "questionnaire.slot1Hint": "With or without dimensions",
    "questionnaire.slot2": "Slot 2 — Elevation",
    "questionnaire.slot2Hint": "Proportion reference",
    "questionnaire.slot3": "Slot 3 — 3D Front",
    "questionnaire.slot3Hint": "Front view only",
    "questionnaire.slot4": "Slot 4 — Floor Plans",
    "questionnaire.slot4Hint": "Match floor count",
    "questionnaire.floorPlanUnit": "PDF, DWG, or image",
    "questionnaire.preferences": "Preferences",
    "questionnaire.projectType": "Building Type",
    "questionnaire.projectTypeHint": "Select category for permit and REA cost benchmark.",
    "questionnaire.parkingSpaces": "Parking spaces",
    "questionnaire.elevators": "Elevators",
    "questionnaire.floorLoad": "Floor load (kN/m²)",
    "questionnaire.nonResidentialNote": "Workspace supports up to 2 floors; full specs in export packages.",
    "questionnaire.decorationStyle": "Decoration Style",
    "questionnaire.primaryMaterial": "Primary Material",
    "questionnaire.selectMaterial": "Select...",
    "questionnaire.landSize": "Land Size",
    "questionnaire.constraints": "Constraints",
    "questionnaire.constraintsPlaceholder": "Special requirements...",
    "questionnaire.submit": "Verify & Start",
    "questionnaire.checking": "Checking...",
    "clarify.title": "Clarification",
    "clarify.progress": "Question",
    "clarify.noGuess": "System will not guess.",
    "clarify.placeholder": "Your answer...",
    "questionnaire.slot1Tooltip": "Upload a site/area plan showing land boundaries.",
    "questionnaire.slot2Tooltip": "Upload elevation or section drawings.",
    "questionnaire.slot3Tooltip": "Upload a 3D front-view render (front face only).",
    "questionnaire.slot4Tooltip": "Upload one floor plan per level.",
    "toast.uploading": "Uploading file…",
    "toast.uploadSuccess": "File uploaded successfully",
    "toast.uploadError": "Upload failed",
    "toast.checking": "Validating inputs…",
    "toast.processingRender": "Generating 3D preview…",
    "toast.renderReady": "3D preview ready!",
    "toast.processingPlans": "Generating plans…",
    "toast.plansReady": "Plans ready!",
    "toast.error": "Something went wrong",
    "toast.clarifyNeeded": "AI needs clarification",
    "store.pageTitle": "House Plan Store",
    "store.searchPlaceholder": "Search house plans…",
    "store.filters": "Filters",
    "store.results": "results",
    "store.any": "Any",
    "store.filterFloors": "Stories",
    "store.filterBeds": "Bedrooms",
    "store.filterBaths": "Bathrooms",
    "store.filterLivingRooms": "Living rooms",
    "store.filterStyle": "Style",
    "store.filterCollection": "Collection",
    "store.filterProvince": "Province",
    "store.planLabel": "PLAN",
    "store.startingAt": "Starting at",
    "store.specSqft": "SQ FT",
    "store.specBeds": "BEDS",
    "store.specBaths": "BATHS",
    "store.specLivingRooms": "LIVING",
    "store.specStories": "STORIES",
    "store.viewPlan": "View Plan",
    "store.viewExterior": "Exterior",
    "store.viewFloorPlan": "Floor Plan",
    "store.buyNow": "Buy Now",
    "store.checkoutTitle": "Purchase",
    "store.purchaseSuccess": "Purchase complete",
    "store.paymentPending":
      "Payment submitted — waiting for bank confirmation. Downloads unlock automatically.",
    "store.autoPublished": "Payment complete — listed on Store (hidden from you)",
    "store.addToCart": "Add to Cart",
    "store.cartTitle": "Shopping Cart",
    "store.cartEmpty": "Your cart is empty.",
    "store.cartRemove": "Remove",
    "store.cartSubtotal": "Subtotal",
    "store.cartDiscount": "Bundle discount",
    "store.cartTotal": "Total",
    "store.cartCheckout": "Checkout All",
    "store.cartCheckoutSuccess": "Cart purchase complete",
    "store.cartAdded": "Added to cart",
    "store.cartInCart": "In Cart",
    "store.cartBundleDiscount": "Bundle savings applied",
    "store.upsell.similarStyle": "Similar styles",
    "store.upsell.exploreMore": "Explore more",
    "store.upsell.boqBundle": "BOQ Add-on (Bill of Quantities)",
    "store.upsell.boqBundleDesc": "Construction cost & material estimate for all cart plans",
    "store.upsell.bundleHint2": "Add 1 more for {pct}% off",
    "store.upsell.bundleHint3": "Add 1 more for {pct}% off",
    "common.yes": "हाँ",
    "common.no": "नहीं",
    "payment.promptpay": "PromptPay",
    "payment.card": "कार्ड",
    "store.aria.save": "पसंदीदा में सहेजें",
    "store.aria.favorites": "पसंदीदा",
    "store.aria.removeFavorite": "पसंदीदा से हटाएं",
    "store.favoritesTitle": "सहेजी गई योजनाएं",
    "store.favoritesEmpty": "अभी कोई सहेजी योजना नहीं — किसी लिस्टिंग पर दिल दबाएं।",
    "store.searchActive": "खोज",
    "store.favoritesFilterActive": "केवल पसंदीदा",
    "store.globalBanner.title": "अपनी भाषा में खरीदें",
    "store.globalBanner.subtitle":
      "घर के नाम, विवरण और चेकआउट आपके ब्राउज़र या चुनी भाषा में स्वतः अनुवादित।",
    "store.globalBanner.switchLabel": "भाषा चुनें",
    "store.globalBanner.aiActive": "ऑटो-अनुवाद",
    "store.globalBanner.aria": "अंतर्राष्ट्रीय भाषा समर्थन",
    "pwa.installTitle": "Planasia ऐप इंस्टॉल करें",
    "pwa.installSubtitle": "हाउस प्लान और खरीदारी के लिए होम स्क्रीन पर जोड़ें।",
    "pwa.benefit1": "स्टोर तक एक-टैप पहुँच",
    "pwa.benefit2": "कैश पेज Offline भी",
    "pwa.benefit3": "मोबाइल पर पूर्ण ऐप अनुभव",
    "pwa.installNow": "ऐप इंस्टॉल करें",
    "pwa.installing": "इंस्टॉल हो रहा है…",
    "pwa.later": "बाद में",
    "pwa.neverAsk": "दोबारा न पूछें",
    "pwa.iosTitle": "iPhone / iPad पर इंस्टॉल",
    "pwa.iosSteps": "Safari में Share दबाएँ, फिर \"Add to Home Screen\" चुनें।",
    "pwa.gotIt": "समझ गया",
    "pwa.androidHint": "ब्राउज़र मेनू (⋮) खोलें और \"Install app\" या \"Add to Home screen\" टैप करें।",
    "landing.ctaBand": "Find Your Perfect House Plan",
    "landing.ctaBandDesc": "Explore our full catalog of house designs and buy the plans you love.",
    "editor.title": "3D Design Editor",
    "editor.saveDraft": "Save Draft",
    "editor.saving": "Saving…",
    "editor.draftSaved": "Draft saved",
    "editor.rooms": "Rooms",
    "editor.openings": "Doors & Windows",
    "editor.door": "Door",
    "editor.window": "Window",
    "editor.addDoor": "Add door",
    "editor.addWindow": "Add window",
    "editor.materials": "Materials",
    "editor.materialEstimate": "Material estimate",
    "editor.estimateNote": "Approx. excl. labor",
    "editor.view3d": "3D view",
    "editor.viewPlan": "Floor plan",
    "editor.width": "Width",
    "editor.depth": "Depth",
    "editor.wallSide": "Wall",
    "editor.position": "Position",
    "editor.openingWidth": "Opening width",
    "editor.removeOpening": "Remove",
    "editor.roughPreviewTitle": "Structure preview",
    "editor.roughPreviewDesc": "Wireframe before final render",
    "editor.structureSummary": "Summary",
    "editor.roomCount": "Rooms",
    "editor.openingCount": "Openings",
    "editor.grossArea": "Gross area",
    "editor.inclContingency": "incl. contingency",
    "editor.backToEdit": "Back to edit",
    "editor.confirmAndGenerate": "Confirm & generate",
    "editor.barHint": "Edit in real time",
    "editor.exitEdit": "Exit editor",
    "editor.openEdit": "Edit design",
    "editor.previewStructure": "Preview",
    "editor.exportDocumentation": "Export documentation",
    "editor.exportDocumentationSuccess": "Documentation downloaded",
    "editor.exportDocumentationFailed": "Export failed",
    "editor.exportPreviewTitle": "Documentation preview",
    "editor.exportPreviewLoading": "Loading summary…",
    "editor.exportPreviewProject": "Project summary",
    "editor.exportPreviewScheduleItems": "openings",
    "editor.exportDownloadJson": "Download JSON",
    "editor.exportDownloadPdf": "Download PDF",
    "editor.exportPdfSuccess": "PDF downloaded",
    "editor.exportPdfFailed": "PDF export failed",
    "job.exportTitle": "Export in progress",
    "job.queued": "Queued — position {n}",
    "job.processing": "Generating file…",
    "job.completed": "Export ready!",
    "job.failed": "Export failed",
    "job.download": "Download file",
    "job.downloadStarted": "Download started — check your downloads folder",
    "job.downloadAgain": "Download again",
    "job.jobId": "Job ID",
    "job.rateLimited": "Too many requests — try again later",
    "cost.inputTitle": "Budget & area targets",
    "cost.maxBudget": "Max budget (THB)",
    "cost.targetArea": "Target area (m²)",
    "cost.tierLabel": "Construction grade (REA)",
    "cost.tierEconomy": "Economy",
    "cost.tierStandard": "Standard",
    "cost.tierPremium": "Premium",
    "cost.liveTotal": "Estimated total",
    "cost.perSqm": "Per m²",
    "cost.budgetUsed": "Budget used",
    "cost.areaUsed": "Area used",
    "cost.alertTitle": "Budget alert",
    "cost.overBudgetMsg": "Over by {amount}",
    "cost.overAreaMsg": "Over area by {delta} m²",
    "cost.estSavings": "Est. savings",
    "cost.applyFix": "Apply",
    "cost.bankReady": "Within budget and area — useful for early bank discussions.",
    "cost.bankReadyShort": "Budget-ready",
    "cost.permitNotReady": "Budget and area look good, but local rules still need a professional review.",
    "cost.permitNotReadyShort": "Local review needed",
    "cost.ofBudget": "of budget",
    "cost.adjustNeeded": "Adjust design",
    "cost.rec.downgradeWall": "Downgrade wall material",
    "cost.rec.downgradeFloor": "Use ceramic tile floor",
    "cost.rec.downgradeRoof": "Use metal sheet roof",
    "cost.rec.changeTier": "Lower construction tier",
    "cost.rec.shrinkRoom": "Shrink largest room 10%",
    "cost.rec.removeOpening": "Remove extra window",
    "permit.title": "Permit compliance check",
    "permit.checking": "Checking building regulations…",
    "permit.rateLimited": "Too many checks — please wait.",
    "permit.checkFailed": "Could not verify permit rules.",
    "permit.allClear": "No permit blockers detected.",
    "permit.issuesSummary": "{errors} errors · {warnings} warnings",
    "permit.passed": "Passed",
    "permit.needsReview": "Review needed",
    "permit.requiredDocs": "Typical permit documents",
    "how.subtitle": "A simple 4-step journey from plan upload to photorealistic architectural renders.",
    "how.stepLabel": "Step {n}",
    "how.step4.title": "Get AI 3D results",
    "how.step4.desc": "Receive photorealistic 3D floor plan and front elevation renders ready to share.",
    "landing.hero.eyebrow": "AI Architectural Studio",
    "landing.hero.tagline": "Turn floor plans into photorealistic 3D homes — in seconds.",
    "landing.hero.desc": "Upload a 2D plan and front elevation in Workspace, choose your house style, confirm, and let AI generate magazine-quality architectural renders while locking your original geometry.",
    "landing.hero.getStarted": "Get Started",
    "landing.hero.browseStyles": "Browse styles",
    "landing.hero.flowHint": "Guided flow: Upload plans → Pick style → Confirm & Render → AI Result",
    "features.eyebrow": "Why Planasia",
    "features.title": "Built for speed, fidelity, and style",
    "features.fast.title": "Fast AI rendering",
    "features.fast.desc": "Go from plan to photorealistic concept views in minutes — not days of manual modeling.",
    "features.geometry.title": "Geometry-locked realism",
    "features.geometry.desc": "Textures, lighting, and atmosphere are enhanced while your original structure stays locked.",
    "features.styles.title": "Curated design styles",
    "features.styles.desc": "Minimalist, Modern, Tropical, Luxury, Japanese — apply vibe in Workspace without redesigning the plan.",
    "inputStage.uploadEyebrow": "Upload",
    "inputStage.uploadTitle": "Upload your floor plan & facade",
    "inputStage.uploadDesc": "Add both images, pick a house style, then confirm to generate photorealistic 3D renders.",
    "inputStage.bothReady": "All 3 assets ready. AI will lock geometry from both floor plans and the elevation.",
    "inputStage.needBoth": "Upload first floor plan, second floor plan, and front elevation to continue.",
    "inputStage.confirmRender": "Confirm & Render",
    "results.eyebrow": "AI Result",
    "results.title": "Your 3D renders",
    "results.newUpload": "New upload",
    "results.failed": "Rendering failed. Please try again with both images.",
    "results.planTitle": "3D floor plan",
    "results.planSubtitle": "Photorealistic plan visualization",
    "results.facadeTitle": "Front facade",
    "results.facadeSubtitle": "Elevation / exterior render",
    "results.rendering": "Rendering…",
    "results.empty": "No render available",
    "results.expand": "Expand {title}",
    "results.download": "Download",
    "results.downloadAll": "Download all",
    "results.downloaded": "Download started",
    "results.downloadFailed": "Could not download — please try again",
    "results.share": "Share",
    "results.shareTitle": "Planasia 3D renders",
    "results.shareText": "Check out my AI 3D home renders from Planasia",
    "results.shared": "Shared",
    "results.shareCopied": "Link copied to clipboard",
    "results.shareDownloadFallback": "Images downloaded — share them from your device",
    "results.shareFailed": "Could not share — try downloading instead",
    "wizard.step.upload": "Upload",
    "wizard.step.confirm": "Confirm",
    "wizard.step.result": "AI Result",
    "wizard.aria": "Design journey",
    "beforeAfter.before": "Before",
    "beforeAfter.after": "After",
    "beforeAfter.beforeHint": "Line drawing",
    "beforeAfter.afterHint": "AI 3D render",
    "beforeAfter.dragHint": "Drag to compare",
    "beforeAfter.aria": "Before and after comparison slider",
    "chat.errorGeneric": "Sorry, something went wrong. Please try again.",
    "galleryPage.title": "Project gallery",
    "galleryPage.subtitle":
      "Browse AI-generated home concepts from Planasia users — view-only inspiration.",
    "galleryPage.ctaTitle": "Want to create your own concept?",
    "galleryPage.ctaDesc":
      "Upload a floor plan, pick a style, and let AI generate 3D views and facades in minutes.",
    "galleryPage.ctaButton": "Start creating",
    "permit.blockSubmit": "Fix permit errors before continuing.",
  },
  vi: {
    "nav.home": "Home",
    "nav.store": "Store",
    "nav.pricing": "Pricing",
    "nav.howItWorks": "Workflow",
    "nav.startDesign": "Start Creating",
    "nav.login": "Đăng nhập Google",
    "nav.menu": "Menu",
    "nav.closeMenu": "Close menu",
    "nav.housePlans": "House Plans",
    "nav.collections": "Collections",
    "nav.findDraftsman": "Architects & Designers",
    "nav.aboutPlans": "Home loan consultation",
    "nav.signIn": "Sign In",
    "nav.searchByPlan": "Search by Plan #",
    "nav.wishlist": "Wishlist",
    "nav.cart": "Cart",
    "nav.seller": "ลงขายแบบ",
    "nav.sellerAria": "ลงขายแบบ — entry for architects and draftsmen who write house plans",
    "hero.title": "House Plans & Designs, Ready to Build",
    "hero.subtitle":
      "Browse a curated collection of professional house plans and designs. Find your perfect layout, buy instantly, and download construction-ready documents.",
    "hero.cta": "Browse House Plans",
    "hero.ctaSecondary": "View House Shop",
    "gallery.title": "แบบบ้าน Curated Styles",
    "publicGallery.nav": "แกลเลอรีผลงาน",
    "publicGallery.loading": "กำลังโหลดแกลเลอรี...",
    "publicGallery.loadError": "ไม่สามารถโหลดแกลเลอรีได้ กรุณาลองใหม่อีกครั้ง",
    "publicGallery.emptyTitle": "ยังไม่มีผลงานในแกลเลอรี",
    "publicGallery.emptyDesc": "เมื่อมีผู้ใช้สร้างคอนเซปต์บ้านด้วย AI ผลงานจะปรากฏที่นี่เพื่อเป็นแรงบันดาลใจ",
    "publicGallery.viewWork": "ดูผลงาน",
    "publicGallery.viewOnly": "ดูอย่างเดียว",
    "publicGallery.viewFloorPlan3d": "แปลน 3D",
    "publicGallery.viewFacade": "หน้าตรง",
    "publicGallery.lightboxTitle": "ดูภาพผลงาน",
    "publicGallery.closeLightbox": "ปิด",
    "publicGallery.viewOnlyHint": "หน้าแกลเลอรีนี้สำหรับดูอย่างเดียว — ดาวน์โหลดไฟล์ความละเอียดสูงได้เฉพาะเจ้าของผลงานใน Workspace",
    "how.title": "How It Works",
    "how.step1.title": "Input Vision & Specs",
    "how.step1.desc": "Define your architectural parameters, materials, and spatial requirements.",
    "how.step2.title": "AI Generation & 3D Render",
    "how.step2.desc":
      "Our AI engine instantly generates high-fidelity 3D architectural renders and design concepts.",
    "how.step3.title": "Permit-Ready Blueprints",
    "how.step3.desc":
      "Export professional architectural blueprints and documentation ready for construction permits and contractors.",
    "pricing.title": "Plans & Pricing",
    "pricing.subtitle": "Standard architectural drawing sets and CAD files for construction projects.",
    "pricing.standard": "Standard",
    "pricing.premium": "Premium",
    "pricing.luxury": "Luxury",
    "pricing.store": "Ready-Made House Plans (Store)",
    "pricing.custom1": "Custom 1-Story Design",
    "pricing.custom2": "Custom 2-Story Design",
    "pricing.cad": "CAD File",
    "pricing.perDesign": "per set",
    "pricing.buyNow": "Get Started",
    "pricing.feature.pdfPreview": "PDF document set with preview samples",
    "pricing.feature.instantDownload": "Instant download after payment",
    "pricing.feature.storeCatalog": "Access to the ready-made house plan catalog",
    "pricing.feature.customSpec1Story": "Custom design to your specifications (single-storey)",
    "pricing.feature.customSpec2Story": "Custom design to your specifications (two-storey)",
    "pricing.feature.fullPdfA3": "Complete PDF drawing set (A3 layout)",
    "pricing.feature.permitReady": "Documentation ready for building permit submission",
    "pricing.feature.structuralStandardReview": "Reviewed against structural design standards",
    "pricing.feature.foundationStructuralCalc": "Foundation and structural calculation schedule included",
    "pricing.feature.cadDeliverable": "CAD files included for downstream use",
    "pricing.popularBadge": "ยอดนิยม",
    "pricing.starter.name": "แพ็กเกจทดลอง",
    "pricing.starter.tagline": "สำหรับผู้เริ่มต้น",
    "pricing.starter.price": "ฟรี",
    "pricing.starter.priceNote": "0 บาท",
    "pricing.starter.feature1": "ได้รับ 3 เครดิต (สร้างภาพได้ 3 ครั้ง / 6 รูป)",
    "pricing.starter.feature2": "รูปภาพความละเอียดมาตรฐาน",
    "pricing.starter.feature3": "ดาวน์โหลดและแชร์ได้ทันที",
    "pricing.starter.cta": "เริ่มต้นใช้งานฟรี",
    "pricing.pro.name": "แพ็กเกจยอดนิยม",
    "pricing.pro.tagline": "สำหรับใช้งานจริงจัง",
    "pricing.pro.price": "290",
    "pricing.pro.priceNote": "บาท / ครั้งเดียว",
    "pricing.pro.feature1": "ได้รับ 30 เครดิต (สร้างภาพได้ 30 ครั้ง / 60 รูป)",
    "pricing.pro.feature2": "ความคมชัดระดับสูงพิเศษ (ความละเอียดสูง / รายละเอียดคมชัด)",
    "pricing.pro.feature3": "เลือกสไตล์สถาปัตยกรรมได้ไม่จำกัด",
    "pricing.pro.feature4": "ดาวน์โหลดไฟล์ความละเอียดสูงสำหรับพรีเซนต์",
    "pricing.pro.cta": "เลือกแพ็กเกจนี้",
    "pricing.business.name": "แพ็กเกจธุรกิจ",
    "pricing.business.tagline": "สำหรับบริษัทหรือมืออาชีพ",
    "pricing.business.price": "990",
    "pricing.business.priceNote": "บาท / เดือน",
    "pricing.business.feature1": "ได้รับ 150 เครดิตต่อเดือน",
    "pricing.business.feature2": "เรนเดอร์ด้วยความเร็วด่วนพิเศษ (คิวลำดับความสำคัญ)",
    "pricing.business.feature3": "สิทธิ์การใช้งานเชิงพาณิชย์",
    "pricing.business.feature4": "บันทึกประวัติและแก้ไขงานย้อนหลังได้",
    "pricing.business.cta": "ติดต่อใช้งาน",
    "workspace.controlPanel": "Bảng điều khiển & Tải lên",
    "workspace.openQuestionnaire": "Cài đặt thiết kế",
    "workspace.style": "Phong cách",
    "workspace.roofType": "Loại mái",
    "workspace.colorPalette": "Bảng màu",
    "workspace.floors": "Số tầng",
    "workspace.upload": "Tải bản vẽ",
    "workspace.uploadHint": "Kéo hoặc nhấp để tải tệp bản vẽ nhà",
    "workspace.projectName": "Tên dự án",
    "workspace.location": "Vị trí xây dựng",
    "workspace.preview": "Xem trước render trực tiếp",
    "workspace.save": "Lưu",
    "workspace.share": "Chia sẻ",
    "workspace.shareCopied": "Đã sao chép liên kết",
    "workspace.shareFailed": "Không thể chia sẻ — hãy sao chép URL thủ công",
    "workspace.expandFullscreen": "Toàn màn hình",
    "ai.statusLive": "AI Live",
    "ai.statusOffline": "Chế độ Template",
    "ai.statusLiveHint": "AI đã kết nối.",
    "ai.statusOfflineHint": "Chưa có API key — dùng template.",
    "workspace.prevView": "Góc nhìn trước",
    "workspace.nextView": "Góc nhìn tiếp",
    "workspace.floor1": "Bản vẽ tầng 1",
    "workspace.floor2": "Bản vẽ tầng 2",
    "workspace.exportPdf": "Download PDF",
    "workspace.exportCad": "Download AutoCAD",
    "workspace.exportPdfDesc": "Full permit drawing set — clean, unwatermarked",
    "workspace.exportCadDesc": "CAD files for downstream use — clean, unwatermarked",
    "workspace.downloadPanel": "Downloads",
    "workspace.downloadPanelHint": "Preview is free. Pay to download clean files without watermarks.",
    "workspace.sheetArch": "Architectural",
    "workspace.sheetStructural": "Structural",
    "workspace.sheetSanitary": "Sanitary",
    "workspace.sheetElectrical": "Electrical",
    "workspace.sheetMechanical": "Mechanical",
    "workspace.sheetAc": "Air Conditioning",
    "workspace.sheetOther": "Drawing Sheet",
    "workspace.sheetPreviewTitle": "Drawing Sheet Preview",
    "workspace.sheetPreviewHint": "Scroll to review all sheets. Watermarked preview — pay to download clean files.",
    "workspace.watermarkHint": "Preview only — watermarked to protect your design.",
    "workspace.myWorks": "My works",
    "workspace.addWork": "Add work",
    "workspace.deleteWork": "Delete work",
    "workspace.workCreated": "New work created",
    "workspace.workDeleted": "Work deleted",
    "sidebar.title": "Cài đặt dự án",
    "sidebar.projectName": "Tên dự án",
    "sidebar.ownerName": "Chủ dự án",
    "sidebar.location": "Địa điểm xây dựng",
    "sidebar.floors": "Số tầng",
    "sidebar.floor1": "Nhà 1 tầng",
    "sidebar.floor2": "Nhà 2 tầng",
    "sidebar.bedrooms": "Phòng ngủ",
    "sidebar.bathrooms": "Phòng tắm",
    "sidebar.budget": "Ngân sách",
    "sidebar.style": "Phong cách yêu thích",
    "sidebar.wallMaterial": "Vật liệu tường",
    "sidebar.floorMaterial": "Vật liệu sàn",
    "sidebar.roofMaterial": "Vật liệu mái",
    "sidebar.foundation": "Loại móng",
    "sidebar.groupProject": "Thông tin dự án",
    "sidebar.groupBuilding": "Thông số công trình",
    "sidebar.groupMaterials": "Vật liệu",
    "sidebar.groupUploads": "Tệp tham chiếu",
    "workspace.chatPlaceholder":
      "Tư vấn AI để chỉnh sửa: vd. 'đổi ban công thành kính'",
    "workspace.generate": "Tạo",
    "workspace.generateRender": "Tạo 3D Render",
    "workspace.generatingRender": "Đang tạo xem trước 3D...",
    "workspace.generatingPlans": "Đang tạo bản vẽ...",
    "workspace.generating": "Đang tạo ngôi nhà mơ ước của bạn...",
    "workspace.viewRender3d": "Render 3D",
    "workspace.viewFacade": "Mặt tiền",
    "workspace.viewFloorPlan": "Mặt bằng",
    "workspace.aiZone": "Khu vực AI",
    "workspace.aiPreviewEmpty": "Hoàn thành thông tin và tạo — hình ảnh AI sẽ hiển thị tại đây.",
    "workspace.aiPreviewHint": "Đang tạo 3D, mặt tiền và mặt bằng…",
    "workflow.step1": "1. Thông tin",
    "workflow.step2": "2. Xem 3D",
    "workflow.step3": "3. Tùy chọn",
    "workflow.step4": "4. Xem trước",
    "workflow.step5": "5. Tải xuống",
    "workflow.confirmPlan": "Xác nhận thiết kế",
    "workflow.confirmHint": "Hài lòng với 3D? Xác nhận để tạo bản vẽ chi tiết.",
    "workflow.conceptReady": "Concept ready — review zoning and download design ideas",
    "workflow.conceptReviewHint": "Review room zoning and presentation images, then export the concept pack",
    "workflow.conceptExportedHint": "Concept pack downloaded successfully",
    "concept.exportPanel": "Export concept",
    "concept.exportPanelHint": "Download 3D views and mood board for client presentation",
    "concept.exportPerspective": "3D perspective",
    "concept.exportPerspectiveDesc": "Three-dimensional concept render",
    "concept.exportFacade": "Front facade",
    "concept.exportFacadeDesc": "Straight-on front elevation image",
    "concept.exportBoard": "Mood board",
    "concept.exportBoardDesc": "Presentation board summarizing the design idea",
    "concept.exportEmpty": "Nothing to download yet — generate a concept first",
    "concept.exportDisclaimer": "Outputs are concept-level design ideas, not construction or permit drawings",
    "inputStage.title": "Upload references & pick a style",
    "inputStage.subtitle": "Drop a 2D floor plan and front elevation (optional), then choose a design style.",
    "inputStage.uploadSection": "Reference images",
    "inputStage.floorPlan": "2D floor plan",
    "inputStage.floorPlanHint": "Line drawing — room proportions and layout",
    "inputStage.floorPlan1": "First floor plan",
    "inputStage.floorPlan1Hint": "Ground floor — PNG, JPEG, or PDF",
    "inputStage.floorPlan2": "Second floor plan",
    "inputStage.floorPlan2Hint": "Upper floor — PNG, JPEG, or PDF",
    "inputStage.elevation": "Front elevation",
    "inputStage.elevationHint": "Front view — exterior shape (optional)",
    "inputStage.dropHere": "ลากวางไฟล์ที่นี่",
    "inputStage.browseFiles": "หรือคลิกเพื่อเลือกไฟล์",
    "inputStage.fileFormats": "รองรับ PNG, JPEG และ PDF",
    "inputStage.uploading": "กำลังอัปโหลด...",
    "inputStage.required": "จำเป็น",
    "inputStage.styleSection": "Preferred style",
    "inputStage.styleModernMinimal": "แบบบ้าน Minimalist",
    "inputStage.styleNordic": "แบบบ้าน Modern",
    "inputStage.styleModernTropical": "แบบบ้าน Tropical",
    "inputStage.styleLoftIndustrial": "แบบบ้าน Luxury",
    "inputStage.styleJapanese": "แบบบ้าน Japanese",
    "inputStage.startConcept": "Start AI concept",
    "inputStage.confirm": "Confirm",
    "inputStage.rendering": "Rendering…",
    "inputStage.sidebarHint": "Fill project details in the left panel, then click Start.",
    "workflow.optionsTitle": "Chi tiết & Tùy chọn",
    "workflow.optionsDesc": "Chọn vật liệu trước khi tạo bản vẽ chính thức.",
    "workflow.generatePlans": "Tạo bản vẽ",
    "workflow.cancel": "Hủy",
    "workflow.watermarkHint": "Thanh toán để mở khóa bản vẽ và tải xuống.",
    "workflow.paywallHint": "Chỉ xem 3D. Thanh toán để mở khóa bản vẽ, chi tiết và tải xuống.",
    "workflow.payToUnlock": "Thanh toán để mở khóa",
    "workflow.preview3dOnly": "Xem trước 3D — trả phí để xem mặt bằng",
    "workflow.preview3dHint": "Xem render 3D. Xác nhận để tạo bộ bản vẽ (khóa cho đến khi thanh toán).",
    "workflow.plansReadyPaywall": "Bộ bản vẽ sẵn sàng — thanh toán để mở khóa",
    "workflow.autoListed": "Đã lên Store (ẩn khỏi bạn)",
    "workflow.unlockedHint": "Đã mở khóa — bản vẽ, tải xuống và Store đã kích hoạt.",
    "options.wall": "Vật liệu tường",
    "options.floor": "Vật liệu sàn",
    "options.roof": "Vật liệu mái",
    "options.extras": "Bộ bản vẽ",
    "options.electrical": "Hệ thống điện",
    "options.plumbing": "Cấp thoát nước",
    "options.structural": "Tính toán kết cấu",
    "options.evCharger": "EV Charger",
    "payment.title": "Mở khóa tải xuống",
    "payment.desc": "Thanh toán để tải file chất lượng đầy đủ.",
    "payment.payNow": "Thanh toán",
    "payment.processing": "Đang xử lý...",
    "payment.failed": "Thanh toán thất bại.",
    "download.readyPdf": "PDF sẵn sàng — nhấn Export PDF để tải.",
    "download.readyCad": "CAD sẵn sàng — nhấn Export CAD để tải.",
    "store.subtitle": "Kho bản vẽ nhà sẵn sàng xây dựng, tuyển chọn từ kiến trúc sư chuyên nghiệp",
    "store.communityBadge": "Thiết kế cộng đồng AI",
    "store.empty": "Chưa có sản phẩm.",
    "country.select": "Quốc gia / Khu vực",
    "language.select": "Ngôn ngữ",
    "currency.select": "Tiền tệ",
    "footer.contact": "Liên hệ",
    "footer.privacy": "Chính sách bảo mật",
    "footer.terms": "Điều khoản dịch vụ",
    "legal.lastUpdated": "Cập nhật lần cuối: Tháng 7/2026",
    "form.ownerName": "Tên chủ dự án",
    "form.projectName": "Tên dự án (tùy chọn)",
    "form.province": "Tỉnh / Quận",
    "form.floors": "Số tầng",
    "form.foundation": "Loại móng",
    "form.foundation.pile": "Móng cọc",
    "form.foundation.spread": "Móng đơn",
    "form.foundation.pileRequired":
      "Với nhà 2 tầng, móng cọc là bắt buộc để đảm bảo an toàn kết cấu.",
    "form.bedrooms": "Phòng ngủ",
    "form.bathrooms": "Phòng tắm",
    "form.budget": "Ngân sách xây dựng",
    "questionnaire.title": "Biểu mẫu đầu vào",
    "questionnaire.subtitle": "Điền thông tin — ảnh tham chiếu tùy chọn (tối đa 2)",
    "questionnaire.designDirection": "Hướng thiết kế",
    "questionnaire.goldenStandard": "Tiêu chuẩn vàng",
    "questionnaire.disciplinePreset": "Phạm vi bản vẽ",
    "questionnaire.uploads": "Ảnh tham chiếu (tùy chọn, tối đa 2)",
    "upload.optional": "Tùy chọn",
    "upload.optionalHint": "Tối đa 2 ảnh .jpg/.png, không giới hạn dung lượng.",
    "upload.aiExtractHint": "AI trích xuất bản vẽ, kích thước, vật liệu và tóm tắt.",
    "upload.ref1": "Ảnh tham chiếu 1",
    "upload.ref2": "Ảnh tham chiếu 2",
    "upload.ref1Hint": "Mặt bằng hoặc mặt đứng",
    "upload.ref2Hint": "Mặt cắt hoặc bản vẽ thêm",
    "upload.tooltip": "AI đọc dữ liệu kiến trúc từ ảnh.",
    "upload.analysisTitle": "Tóm tắt AI",
    "upload.analysisDone": "Phân tích xong",
    "upload.rejected": "Ảnh không phù hợp — chỉ dùng bản vẽ nhà.",
    "upload.floorPlan3dTitle": "Xem trước mặt bằng 3D",
    "upload.floorPlan3dHint": "Góc nhìn isometric từ ảnh tham chiếu",
    "upload.floorPlan3dClose": "Đóng",
    "upload.generating3dFloorPlan": "Đang tạo mặt bằng 3D…",
    "upload.floorPlan3dGeneratingHint": "AI đang dựng hình ảnh 3D với ánh sáng và vật liệu.",
    "upload.floorPlan3dReady": "Mặt bằng 3D đã sẵn sàng!",
    "upload.floorPlan3dFailed": "Không thể tạo mặt bằng 3D.",
    "workspace.viewFloorPlan3d": "Mặt bằng 3D",
    "workspace.viewPresentationBoard": "Bảng trình bày",
    "presentationBoard.title": "Bảng trình bày dự án",
    "presentationBoard.subtitle": "AI tạo bảng theo mẫu villa",
    "presentationBoard.hint": "Bố cục cố định: ngoại thất, mặt bằng, 3 nội thất. Chỉnh chú thích tiếng Thái trước khi tạo.",
    "presentationBoard.floors": "Loại nhà",
    "presentationBoard.singleStory": "Một tầng",
    "presentationBoard.twoStory": "Hai tầng",
    "presentationBoard.projectName": "Tên dự án / footer",
    "presentationBoard.description": "Mô tả",
    "presentationBoard.captionLeft": "Chú thích trái (Thái)",
    "presentationBoard.captionCenter": "Chú thích giữa (Thái)",
    "presentationBoard.captionRight": "Chú thích phải (Thái)",
    "presentationBoard.floorPlanRule": "Nhãn mặt bằng",
    "presentationBoard.generate": "Tạo bảng trình bày",
    "presentationBoard.generating": "Đang tạo…",
    "presentationBoard.generatingHint": "AI đang dựng bảng trình bày…",
    "presentationBoard.ready": "Bảng đã sẵn sàng!",
    "presentationBoard.failed": "Tạo thất bại.",
    "presentationBoard.empty": "Nhấn Tạo để tạo bảng trình bày.",
    "presentationBoard.showPrompt": "Hiện prompt",
    "presentationBoard.hidePrompt": "Ẩn prompt",
    "presentationBoard.open": "Bảng trình bày",
    "presentationBoard.requiredForDrafting": "Tạo hoặc tải lên bảng trình bày trước.",
    "presentationBoard.draftingReady": "Đã lưu bảng — xác nhận để tạo bản vẽ DPT.",
    "presentationBoard.draftingRequired": "Tạo bảng trình bày trước.",
    "presentationBoard.upload": "Tải lên",
    "presentationBoard.download": "Tải xuống",
    "presentationBoard.share": "Chia sẻ",
    "presentationBoard.shared": "Đã chia sẻ",
    "presentationBoard.linkCopied": "Đã sao chép",
    "presentationBoard.shareFailed": "Chia sẻ thất bại",
    "presentationBoard.stored": "Đã lưu trong dự án",
    "presentationBoard.downloaded": "Đang tải xuống",
    "presentationBoard.storedLabel": "Tệp đã lưu",
    "presentationBoard.sourceGenerated": "AI tạo",
    "presentationBoard.sourceUploaded": "tải lên",
    "questionnaire.slot1": "Ô 1 — Mặt bằng",
    "questionnaire.slot1Hint": "Có hoặc không kích thước",
    "questionnaire.slot2": "Ô 2 — Mặt đứng",
    "questionnaire.slot2Hint": "Tham chiếu tỷ lệ",
    "questionnaire.slot3": "Ô 3 — 3D mặt trước",
    "questionnaire.slot3Hint": "Chỉ góc nhìn trước",
    "questionnaire.slot4": "Ô 4 — Mặt bằng tầng",
    "questionnaire.slot4Hint": "Khớp số tầng",
    "questionnaire.floorPlanUnit": "PDF, DWG hoặc ảnh",
    "questionnaire.preferences": "Sở thích",
    "questionnaire.projectType": "Loại công trình",
    "questionnaire.projectTypeHint": "Chọn loại phù hợp với cấp phép và chỉ số chi phí REA.",
    "questionnaire.parkingSpaces": "Chỗ đỗ xe",
    "questionnaire.elevators": "Thang máy",
    "questionnaire.floorLoad": "Tải trọng sàn (kN/m²)",
    "questionnaire.nonResidentialNote": "Workspace hỗ trợ tối đa 2 tầng; bản vẽ đầy đủ trong gói xuất.",
    "questionnaire.decorationStyle": "Phong cách",
    "questionnaire.primaryMaterial": "Vật liệu chính",
    "questionnaire.selectMaterial": "Chọn...",
    "questionnaire.landSize": "Diện tích đất",
    "questionnaire.constraints": "Ràng buộc",
    "questionnaire.constraintsPlaceholder": "Yêu cầu đặc biệt...",
    "questionnaire.submit": "Xác minh & Bắt đầu",
    "questionnaire.checking": "Đang kiểm tra...",
    "clarify.title": "Cần làm rõ",
    "clarify.progress": "Câu hỏi",
    "clarify.noGuess": "Hệ thống không đoán.",
    "clarify.placeholder": "Câ trả lời...",
    "questionnaire.slot1Tooltip": "Tải bản vẽ mặt bằng/khu đất.",
    "questionnaire.slot2Tooltip": "Tải mặt đứng hoặc mặt cắt.",
    "questionnaire.slot3Tooltip": "Tải hình 3D mặt trước.",
    "questionnaire.slot4Tooltip": "Tải một mặt bằng cho mỗi tầng.",
    "toast.uploading": "Đang tải lên…",
    "toast.uploadSuccess": "Tải lên thành công",
    "toast.uploadError": "Tải lên thất bại",
    "toast.checking": "Đang kiểm tra…",
    "toast.processingRender": "Đang tạo xem trước 3D…",
    "toast.renderReady": "Xem trước 3D sẵn sàng!",
    "toast.processingPlans": "Đang tạo bản vẽ…",
    "toast.plansReady": "Bản vẽ đã sẵn sàng!",
    "toast.error": "Đã xảy ra lỗi",
    "toast.clarifyNeeded": "AI cần làm rõ",
    "store.pageTitle": "Cửa hàng bản vẽ",
    "store.searchPlaceholder": "Tìm bản vẽ…",
    "store.filters": "Bộ lọc",
    "store.results": "kết quả",
    "store.any": "Tất cả",
    "store.filterFloors": "Tầng",
    "store.filterBeds": "Phòng ngủ",
    "store.filterBaths": "Phòng tắm",
    "store.filterLivingRooms": "Phòng khách",
    "store.filterStyle": "Phong cách",
    "store.filterCollection": "Bộ sưu tập",
    "store.filterProvince": "Tỉnh",
    "store.planLabel": "BẢN",
    "store.startingAt": "Từ",
    "store.specSqft": "M²",
    "store.specBeds": "PN",
    "store.specBaths": "PT",
    "store.specLivingRooms": "PK",
    "store.specStories": "TẦNG",
    "store.viewPlan": "Xem bản vẽ",
    "store.viewExterior": "Mặt ngoài",
    "store.viewFloorPlan": "Mặt bằng",
    "store.buyNow": "Mua ngay",
    "store.checkoutTitle": "Thanh toán",
    "store.purchaseSuccess": "Thanh toán thành công",
    "store.paymentPending":
      "Đã gửi thanh toán — đang chờ ngân hàng xác nhận. Tải xuống sẽ mở tự động.",
    "store.autoPublished": "Thanh toán xong — đã lên Store (ẩn khỏi bạn)",
    "store.addToCart": "Thêm vào giỏ",
    "store.cartTitle": "Giỏ hàng",
    "store.cartEmpty": "Giỏ hàng trống.",
    "store.cartRemove": "Xóa",
    "store.cartSubtotal": "Tạm tính",
    "store.cartDiscount": "Giảm giá gói",
    "store.cartTotal": "Tổng",
    "store.cartCheckout": "Thanh toán tất cả",
    "store.cartCheckoutSuccess": "Thanh toán giỏ hàng thành công",
    "store.cartAdded": "Đã thêm vào giỏ",
    "store.cartInCart": "Trong giỏ",
    "store.cartBundleDiscount": "Đã áp dụng giảm giá gói",
    "store.upsell.similarStyle": "Phong cách tương tự",
    "store.upsell.exploreMore": "Khám phá thêm",
    "store.upsell.boqBundle": "Gói BOQ (bảng khối lượng / dự toán vật liệu)",
    "store.upsell.boqBundleDesc": "Bảng khối lượng và dự toán vật liệu cho mọi bản vẽ trong giỏ",
    "store.upsell.bundleHint2": "Thêm 1 bản vẽ giảm {pct}%",
    "store.upsell.bundleHint3": "Thêm 1 bản vẽ giảm {pct}%",
    "common.yes": "Có",
    "common.no": "Không",
    "payment.promptpay": "PromptPay",
    "payment.card": "Thẻ",
    "store.aria.save": "Lưu yêu thích",
    "store.aria.favorites": "Yêu thích",
    "store.aria.removeFavorite": "Xóa khỏi yêu thích",
    "store.favoritesTitle": "Bản vẽ đã lưu",
    "store.favoritesEmpty": "Chưa có bản vẽ nào — nhấn trái tim trên thẻ sản phẩm.",
    "store.searchActive": "Tìm kiếm",
    "store.favoritesFilterActive": "Chỉ yêu thích",
    "store.globalBanner.title": "Mua sắm bằng ngôn ngữ của bạn",
    "store.globalBanner.subtitle":
      "Tên nhà, mô tả và thanh toán được dịch tự động theo trình duyệt hoặc ngôn ngữ bạn chọn.",
    "store.globalBanner.switchLabel": "Chọn ngôn ngữ",
    "store.globalBanner.aiActive": "Dịch tự động",
    "store.globalBanner.aria": "Hỗ trợ đa ngôn ngữ quốc tế",
    "pwa.installTitle": "Cài đặt ứng dụng Planasia",
    "pwa.installSubtitle": "Thêm vào màn hình chính để truy cập cửa hàng và lịch sử mua hàng nhanh hơn.",
    "pwa.benefit1": "Truy cập Store một chạm",
    "pwa.benefit2": "Dùng trang đã lưu khi Offline",
    "pwa.benefit3": "Trải nghiệm toàn màn hình như app",
    "pwa.installNow": "Cài đặt",
    "pwa.installing": "Đang cài…",
    "pwa.later": "Để sau",
    "pwa.neverAsk": "Không hỏi lại",
    "pwa.iosTitle": "Cài trên iPhone / iPad",
    "pwa.iosSteps": "Nhấn Share trong Safari, chọn \"Thêm vào Màn hình chính\".",
    "pwa.gotIt": "Đã hiểu",
    "pwa.androidHint": "Mở menu trình duyệt (⋮) và chọn \"Cài đặt ứng dụng\" hoặc \"Thêm vào Màn hình chính\".",
    "landing.ctaBand": "Find Your Perfect House Plan",
    "landing.ctaBandDesc": "Explore our full catalog of house designs and buy the plans you love.",
    "editor.title": "Trình chỉnh sửa 3D",
    "editor.saveDraft": "Lưu bản nháp",
    "editor.saving": "Đang lưu…",
    "editor.draftSaved": "Đã lưu bản nháp",
    "editor.rooms": "Phòng",
    "editor.openings": "Cửa & cửa sổ",
    "editor.door": "Cửa",
    "editor.window": "Cửa sổ",
    "editor.addDoor": "Thêm cửa",
    "editor.addWindow": "Thêm cửa sổ",
    "editor.materials": "Vật liệu",
    "editor.materialEstimate": "Ước tính vật liệu",
    "editor.estimateNote": "Chưa gồm nhân công",
    "editor.view3d": "Góc nhìn 3D",
    "editor.viewPlan": "Mặt bằng",
    "editor.width": "Chiều rộng",
    "editor.depth": "Chiều sâu",
    "editor.wallSide": "Tường",
    "editor.position": "Vị trí",
    "editor.openingWidth": "Độ rộng mở",
    "editor.removeOpening": "Xóa",
    "editor.roughPreviewTitle": "Xem trước cấu trúc",
    "editor.roughPreviewDesc": "Khung dây trước khi render cuối",
    "editor.structureSummary": "Tóm tắt",
    "editor.roomCount": "Phòng",
    "editor.openingCount": "Lỗ mở",
    "editor.grossArea": "Diện tích",
    "editor.inclContingency": "gồm dự phòng 10%",
    "editor.backToEdit": "Quay lại chỉnh",
    "editor.confirmAndGenerate": "Xác nhận & tạo bản vẽ",
    "editor.barHint": "Chỉnh phòng, cửa, vật liệu theo thời gian thực",
    "editor.exitEdit": "Thoát",
    "editor.openEdit": "Chỉnh thiết kế",
    "editor.previewStructure": "Xem trước",
    "editor.exportDocumentation": "Xuất tài liệu",
    "editor.exportDocumentationSuccess": "Đã tải JSON tài liệu",
    "editor.exportDocumentationFailed": "Xuất tài liệu thất bại",
    "editor.exportPreviewTitle": "Xem trước tài liệu",
    "editor.exportPreviewLoading": "Đang tạo bản tóm tắt…",
    "editor.exportPreviewProject": "Tóm tắt dự án",
    "editor.exportPreviewScheduleItems": "lỗ mở",
    "editor.exportDownloadJson": "Tải JSON",
    "editor.exportDownloadPdf": "Tải PDF tóm tắt",
    "editor.exportPdfSuccess": "Đã tải PDF tóm tắt",
    "editor.exportPdfFailed": "Không tạo được PDF",
    "job.exportTitle": "Đang xuất tệp",
    "job.queued": "Đang chờ — vị trí {n}",
    "job.processing": "Đang tạo tệp…",
    "job.completed": "Xuất tệp xong!",
    "job.failed": "Xuất tệp thất bại",
    "job.download": "Tải tệp",
    "job.downloadStarted": "Đã bắt đầu tải xuống — kiểm tra thư mục Downloads",
    "job.downloadAgain": "Tải lại",
    "job.jobId": "Mã công việc",
    "job.rateLimited": "Quá nhiều yêu cầu — thử lại sau",
    "cost.inputTitle": "Ngân sách & diện tích mục tiêu",
    "cost.maxBudget": "Ngân sách tối đa (THB)",
    "cost.targetArea": "Diện tích sử dụng (m²)",
    "cost.tierLabel": "Cấp độ xây dựng (REA)",
    "cost.tierEconomy": "Tiết kiệm",
    "cost.tierStandard": "Tiêu chuẩn",
    "cost.tierPremium": "Cao cấp",
    "cost.liveTotal": "Tổng chi phí ước tính",
    "cost.perSqm": "Chi phí/m²",
    "cost.budgetUsed": "Sử dụng ngân sách",
    "cost.areaUsed": "Sử dụng diện tích",
    "cost.alertTitle": "Cảnh báo ngân sách",
    "cost.overBudgetMsg": "Vượt ngân sách {amount}",
    "cost.overAreaMsg": "Vượt diện tích {delta} m²",
    "cost.estSavings": "Tiết kiệm ước tính",
    "cost.applyFix": "Áp dụng",
    "cost.bankReady": "Trong ngân sách và diện tích — hữu ích cho thảo luận vay sớm.",
    "cost.bankReadyShort": "Ngân sách ổn",
    "cost.permitNotReady": "Ngân sách và diện tích ổn, nhưng vẫn cần chuyên gia địa phương rà soát.",
    "cost.permitNotReadyShort": "Cần rà soát địa phương",
    "cost.ofBudget": "ngân sách",
    "cost.adjustNeeded": "Cần điều chỉnh",
    "cost.rec.downgradeWall": "Hạ cấp vật liệu tường",
    "cost.rec.downgradeFloor": "Dùng gạch ceramic",
    "cost.rec.downgradeRoof": "Dùng mái tôn",
    "cost.rec.changeTier": "Hạ cấp xây dựng",
    "cost.rec.shrinkRoom": "Thu nhỏ phòng lớn nhất 10%",
    "cost.rec.removeOpening": "Bỏ cửa sổ thêm",
    "permit.title": "Kiểm tra tuân thủ cấp phép",
    "permit.checking": "Đang kiểm tra quy định xây dựng…",
    "permit.rateLimited": "Kiểm tra quá nhiều — vui lòng đợi.",
    "permit.checkFailed": "Không thể xác minh quy tắc cấp phép.",
    "permit.allClear": "Không phát hiện vấn đề cấp phép.",
    "permit.issuesSummary": "{errors} lỗi · {warnings} cảnh báo",
    "permit.passed": "Đạt",
    "permit.needsReview": "Cần xem xét",
    "permit.requiredDocs": "Hồ sơ cấp phép thông thường",
    "how.subtitle": "A simple 4-step journey from plan upload to photorealistic architectural renders.",
    "how.stepLabel": "Step {n}",
    "how.step4.title": "Get AI 3D results",
    "how.step4.desc": "Receive photorealistic 3D floor plan and front elevation renders ready to share.",
    "landing.hero.eyebrow": "AI Architectural Studio",
    "landing.hero.tagline": "Turn floor plans into photorealistic 3D homes — in seconds.",
    "landing.hero.desc": "Upload a 2D plan and front elevation in Workspace, choose your house style, confirm, and let AI generate magazine-quality architectural renders while locking your original geometry.",
    "landing.hero.getStarted": "Get Started",
    "landing.hero.browseStyles": "Browse styles",
    "landing.hero.flowHint": "Guided flow: Upload plans → Pick style → Confirm & Render → AI Result",
    "features.eyebrow": "Why Planasia",
    "features.title": "Built for speed, fidelity, and style",
    "features.fast.title": "Fast AI rendering",
    "features.fast.desc": "Go from plan to photorealistic concept views in minutes — not days of manual modeling.",
    "features.geometry.title": "Geometry-locked realism",
    "features.geometry.desc": "Textures, lighting, and atmosphere are enhanced while your original structure stays locked.",
    "features.styles.title": "Curated design styles",
    "features.styles.desc": "Minimalist, Modern, Tropical, Luxury, Japanese — apply vibe in Workspace without redesigning the plan.",
    "inputStage.uploadEyebrow": "Upload",
    "inputStage.uploadTitle": "Upload your floor plan & facade",
    "inputStage.uploadDesc": "Add both images, pick a house style, then confirm to generate photorealistic 3D renders.",
    "inputStage.bothReady": "All 3 assets ready. AI will lock geometry from both floor plans and the elevation.",
    "inputStage.needBoth": "Upload first floor plan, second floor plan, and front elevation to continue.",
    "inputStage.confirmRender": "Confirm & Render",
    "results.eyebrow": "AI Result",
    "results.title": "Your 3D renders",
    "results.newUpload": "New upload",
    "results.failed": "Rendering failed. Please try again with both images.",
    "results.planTitle": "3D floor plan",
    "results.planSubtitle": "Photorealistic plan visualization",
    "results.facadeTitle": "Front facade",
    "results.facadeSubtitle": "Elevation / exterior render",
    "results.rendering": "Rendering…",
    "results.empty": "No render available",
    "results.expand": "Expand {title}",
    "results.download": "Download",
    "results.downloadAll": "Download all",
    "results.downloaded": "Download started",
    "results.downloadFailed": "Could not download — please try again",
    "results.share": "Share",
    "results.shareTitle": "Planasia 3D renders",
    "results.shareText": "Check out my AI 3D home renders from Planasia",
    "results.shared": "Shared",
    "results.shareCopied": "Link copied to clipboard",
    "results.shareDownloadFallback": "Images downloaded — share them from your device",
    "results.shareFailed": "Could not share — try downloading instead",
    "wizard.step.upload": "Upload",
    "wizard.step.confirm": "Confirm",
    "wizard.step.result": "AI Result",
    "wizard.aria": "Design journey",
    "beforeAfter.before": "Before",
    "beforeAfter.after": "After",
    "beforeAfter.beforeHint": "Line drawing",
    "beforeAfter.afterHint": "AI 3D render",
    "beforeAfter.dragHint": "Drag to compare",
    "beforeAfter.aria": "Before and after comparison slider",
    "chat.errorGeneric": "Sorry, something went wrong. Please try again.",
    "galleryPage.title": "Project gallery",
    "galleryPage.subtitle":
      "Browse AI-generated home concepts from Planasia users — view-only inspiration.",
    "galleryPage.ctaTitle": "Want to create your own concept?",
    "galleryPage.ctaDesc":
      "Upload a floor plan, pick a style, and let AI generate 3D views and facades in minutes.",
    "galleryPage.ctaButton": "Start creating",
    "permit.blockSubmit": "Sửa lỗi cấp phép trước khi tiếp tục.",
  },
};

export function t(locale: UiLocale, key: TranslationKey): string {
  return translations[locale]?.[key] ?? translations.en[key] ?? key;
}

export {
  pickLocalized,
  pickLocalizedLabel,
  localeName,
  aiRespondInLocale,
  localeHtmlLang,
  uiLocaleHtmlLang,
} from "@/lib/i18n/localized-text";
export type { LocalizedText, LocalizedLabels } from "@/lib/i18n/localized-text";

export function formatPrice(amount: number, currency: string, locale: Locale): string {
  const localeMap: Record<Locale, string> = {
    en: "en-US",
    th: "th-TH",
    hi: "hi-IN",
    vi: "vi-VN",
  };
  return new Intl.NumberFormat(localeMap[locale], {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
