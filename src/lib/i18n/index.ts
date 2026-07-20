import type { Locale } from "@/lib/geo/countries";

export type TranslationKey =
  | "nav.store"
  | "nav.pricing"
  | "nav.howItWorks"
  | "nav.startDesign"
  | "nav.login"
  | "nav.menu"
  | "nav.closeMenu"
  | "hero.title"
  | "hero.subtitle"
  | "hero.cta"
  | "gallery.title"
  | "how.title"
  | "how.step1.title"
  | "how.step1.desc"
  | "how.step2.title"
  | "how.step2.desc"
  | "how.step3.title"
  | "how.step3.desc"
  | "pricing.title"
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
  | "pricing.feature.aiCustom"
  | "pricing.feature.oneFloorPdf"
  | "pricing.feature.twoFloorPdf"
  | "pricing.feature.a3Permit"
  | "pricing.feature.multiAiValidation"
  | "pricing.feature.pileFoundation"
  | "pricing.feature.structuralCheck"
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
  | "workspace.prevView"
  | "workspace.nextView"
  | "workspace.floor1"
  | "workspace.floor2"
  | "workspace.exportPdf"
  | "workspace.exportCad"
  | "workspace.chatPlaceholder"
  | "workspace.generate"
  | "workspace.generateRender"
  | "workspace.generatingRender"
  | "workspace.generatingPlans"
  | "workspace.generating"
  | "workflow.step1"
  | "workflow.step2"
  | "workflow.step3"
  | "workflow.step4"
  | "workflow.step5"
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
  | "store.autoListingNote"
  | "store.disclaimer"
  | "store.communityBadge"
  | "store.empty"
  | "country.select"
  | "language.select"
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
  | "store.filterStyle"
  | "store.planLabel"
  | "store.startingAt"
  | "store.specSqft"
  | "store.specBeds"
  | "store.specBaths"
  | "store.specStories"
  | "store.viewPlan"
  | "store.viewExterior"
  | "store.viewFloorPlan"
  | "store.buyNow"
  | "store.checkoutTitle"
  | "store.purchaseSuccess"
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
  | "store.upsell.cadBundle"
  | "store.upsell.cadBundleDesc"
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
  | "permit.blockSubmit";

const translations: Record<Locale, Record<TranslationKey, string>> = {
  en: {
    "nav.store": "Store",
    "nav.pricing": "Pricing",
    "nav.howItWorks": "How It Works",
    "nav.startDesign": "Start Designing",
    "nav.login": "Sign in with Google",
    "nav.menu": "Menu",
    "nav.closeMenu": "Close menu",
    "hero.title": "Design Your Dream Home with World-Class AI",
    "hero.subtitle":
      "AI-powered architectural plans compliant with local building codes — ready for A3 printing and permit submission.",
    "hero.cta": "Start Designing",
    "gallery.title": "10 Design Styles for Every Lifestyle",
    "how.title": "How It Works",
    "how.step1.title": "Choose Your Specs",
    "how.step1.desc": "Select materials, style, floors, and location",
    "how.step2.title": "Upload Inspiration",
    "how.step2.desc": "Attach reference images — AI learns your taste",
    "how.step3.title": "Download Files",
    "how.step3.desc": "Get PDF/CAD ready for contractors and permits",
    "pricing.title": "Simple, Transparent Pricing",
    "pricing.standard": "Standard",
    "pricing.premium": "Premium",
    "pricing.luxury": "Luxury",
    "pricing.store": "Ready-to-Buy Store",
    "pricing.custom1": "Custom 1-Floor",
    "pricing.custom2": "Custom 2-Floor",
    "pricing.cad": "CAD File",
    "pricing.perDesign": "per design",
    "pricing.buyNow": "Get Started",
    "pricing.feature.pdfPreview": "PDF + Preview",
    "pricing.feature.instantDownload": "Instant download",
    "pricing.feature.storeCatalog": "{price} store catalog",
    "pricing.feature.aiCustom": "AI custom design",
    "pricing.feature.oneFloorPdf": "1-floor PDF set",
    "pricing.feature.twoFloorPdf": "2-floor PDF set",
    "pricing.feature.a3Permit": "A3 permit-ready layout",
    "pricing.feature.multiAiValidation": "Multi-AI validation",
    "pricing.feature.pileFoundation": "Pile foundation included",
    "pricing.feature.structuralCheck": "Structural compliance check",
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
    "workspace.prevView": "Previous view",
    "workspace.nextView": "Next view",
    "workspace.floor1": "1st Floor Plan",
    "workspace.floor2": "2nd Floor Plan",
    "workspace.exportPdf": "Generate House Plan PDF",
    "workspace.exportCad": "Generate House Plan CAD",
    "workspace.chatPlaceholder":
      "Consult AI to edit: e.g. 'change balcony to glass', 'adjust exterior walls'",
    "workspace.generate": "Generate",
    "workspace.generateRender": "Generate 3D Render",
    "workspace.generatingRender": "Creating 3D preview...",
    "workspace.generatingPlans": "Generating permit-ready plans...",
    "workspace.generating": "Creating your dream home...",
    "workflow.step1": "1. Brief",
    "workflow.step2": "2. 3D Preview",
    "workflow.step3": "3. Options",
    "workflow.step4": "4. Plans Preview",
    "workflow.step5": "5. Download",
    "workflow.confirmPlan": "Confirm This Design",
    "workflow.confirmHint": "Happy with the 3D render? Confirm to proceed with detailed floor plans.",
    "workflow.optionsTitle": "Plan Details & Options",
    "workflow.optionsDesc": "Select materials and drawing sets before generating official plans.",
    "workflow.generatePlans": "Generate Floor Plans",
    "workflow.cancel": "Cancel",
    "workflow.watermarkHint": "Plans are ready — pay to unlock floor plans and downloads.",
    "workflow.paywallHint": "3D preview only. Pay to unlock full floor plans, details, PDF/CAD download, and auto-list on Store.",
    "workflow.payToUnlock": "Pay to Unlock",
    "workflow.preview3dOnly": "3D preview — pay to view floor plans",
    "workflow.preview3dHint": "Review your 3D render. Confirm to generate the full plan set (locked until payment).",
    "workflow.plansReadyPaywall": "Full plan set ready — pay to unlock",
    "workflow.autoListed": "Listed on Store for others (hidden from your view)",
    "workflow.unlockedHint": "Payment confirmed — floor plans, downloads, and Store listing are now active.",
    "options.wall": "Wall Material",
    "options.floor": "Floor Material",
    "options.roof": "Roof Material",
    "options.extras": "Drawing Sets & Extras",
    "options.electrical": "Electrical Plan",
    "options.plumbing": "Plumbing & Sanitary",
    "options.structural": "Structural Calculations",
    "options.evCharger": "EV Charger Outlet",
    "payment.title": "Unlock Download",
    "payment.desc": "Pay to download full-quality permit-ready files.",
    "payment.payNow": "Pay & Unlock",
    "payment.processing": "Processing...",
    "payment.failed": "Payment failed. Please try again.",
    "download.readyPdf": "PDF permit drawing set — click Export PDF to download.",
    "download.readyCad": "CAD floor plan export — click Export CAD to download.",
    "store.subtitle": "Community designs co-created by users and AI",
    "store.autoListingNote": "After you pay and unlock, your design auto-lists on the Store for others — you won't see your own listing here.",
    "store.disclaimer": "Store items are user+AI original designs only. Government reference templates (กรมโยธาธิการ) are used internally for drawing patterns and are never sold here.",
    "store.communityBadge": "AI Community Design",
    "store.empty": "No community listings yet. Create a design in Workspace to populate the store.",
    "country.select": "Country / Region",
    "language.select": "Language",
    "footer.contact": "Contact",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Service",
    "legal.lastUpdated": "Last updated: January 2026",
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
    "questionnaire.subtitle": "Complete all 4 uploads before generating",
    "questionnaire.designDirection": "Design Direction",
    "questionnaire.goldenStandard": "Golden Standard Reference",
    "questionnaire.disciplinePreset": "Drawing Set Scope",
    "questionnaire.uploads": "Required Uploads (4 slots)",
    "questionnaire.slot1": "Slot 1 — Site / Area Plan",
    "questionnaire.slot1Hint": "External plan with or without dimensions",
    "questionnaire.slot2": "Slot 2 — Elevation / Section",
    "questionnaire.slot2Hint": "Front, side, or section for proportions",
    "questionnaire.slot3": "Slot 3 — 3D Front View",
    "questionnaire.slot3Hint": "Front-facing 3D image only",
    "questionnaire.slot4": "Slot 4 — Floor Plans",
    "questionnaire.slot4Hint": "One plan per floor — must match floor count",
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
    "questionnaire.slot4Tooltip": "Upload one floor plan per level. Count must match the number of floors selected above.",
    "toast.uploading": "Uploading file…",
    "toast.uploadSuccess": "File uploaded successfully",
    "toast.uploadError": "Upload failed — please try again",
    "toast.checking": "Validating your inputs…",
    "toast.processingRender": "AI is generating your 3D preview…",
    "toast.renderReady": "3D preview ready!",
    "toast.processingPlans": "Generating permit-ready plans…",
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
    "store.filterStyle": "Architectural Style",
    "store.planLabel": "PLAN",
    "store.startingAt": "Starting at",
    "store.specSqft": "SQ FT",
    "store.specBeds": "BEDS",
    "store.specBaths": "BATHS",
    "store.specStories": "STORIES",
    "store.viewPlan": "View Plan",
    "store.viewExterior": "Exterior",
    "store.viewFloorPlan": "Floor Plan",
    "store.buyNow": "Buy Now",
    "store.checkoutTitle": "Purchase House Plan",
    "store.purchaseSuccess": "Purchase complete — download started",
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
    "store.upsell.cadBundle": "CAD Bundle Add-on",
    "store.upsell.cadBundleDesc": "Get CAD/DWG files for every plan in your cart",
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
    "landing.ctaBand": "Ready to design your dream home?",
    "landing.ctaBandDesc": "Jump straight into the AI Design Studio — no signup required to start.",
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
    "cost.bankReady": "Design is within budget and area targets — suitable for bank loan & permit submission.",
    "cost.bankReadyShort": "Bank-ready",
    "cost.permitNotReady": "Budget and area look good, but permit rules still need attention before submission.",
    "cost.permitNotReadyShort": "Permit review needed",
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
    "permit.blockSubmit": "Fix permit errors before continuing.",
  },
  th: {
    "nav.store": "ร้านค้า",
    "nav.pricing": "ราคา",
    "nav.howItWorks": "ขั้นตอนการทำงาน",
    "nav.startDesign": "เริ่มออกแบบ",
    "nav.login": "เข้าสู่ระบบด้วย Google",
    "nav.menu": "เมนู",
    "nav.closeMenu": "ปิดเมนู",
    "hero.title": "ออกแบบบ้านในฝันของคุณ ด้วยเทคโนโลยี AI มาตรฐานระดับโลก",
    "hero.subtitle":
      "แพลตฟอร์ม AI อัจฉริยะสำหรับออกแบบและเขียนแบบขออนุญาตก่อสร้างบ้าน — พร้อมพิมพ์ A3 ยื่นเทศบาล/อบต.",
    "hero.cta": "เริ่มสร้างบ้าน",
    "gallery.title": "10 สไตล์การออกแบบที่ตอบโจทย์ชีวิต",
    "how.title": "ขั้นตอนการทำงาน",
    "how.step1.title": "เลือกสเปค",
    "how.step1.desc": "เลือกวัสดุ สไตล์ จำนวนชั้น และสถานที่",
    "how.step2.title": "อัปโหลดบ้านในฝัน",
    "how.step2.desc": "แนบแบบที่ชอบ ระบบจะเรียนรู้และเจนให้",
    "how.step3.title": "ดาวน์โหลดไฟล์",
    "how.step3.desc": "ได้ไฟล์ PDF/CAD ไปให้ผู้รับเหมาทันที",
    "pricing.title": "แพ็กเกจราคา",
    "pricing.standard": "Standard",
    "pricing.premium": "Premium",
    "pricing.luxury": "Luxury",
    "pricing.store": "แบบสำเร็จรูป (Store)",
    "pricing.custom1": "สั่งทำ 1 ชั้น",
    "pricing.custom2": "สั่งทำ 2 ชั้น",
    "pricing.cad": "ไฟล์ CAD",
    "pricing.perDesign": "ต่อแบบ",
    "pricing.buyNow": "เริ่มต้นใช้งาน",
    "pricing.feature.pdfPreview": "PDF + ตัวอย่าง",
    "pricing.feature.instantDownload": "ดาวน์โหลดทันที",
    "pricing.feature.storeCatalog": "แคตตาล็อก Store {price}",
    "pricing.feature.aiCustom": "ออกแบบด้วย AI",
    "pricing.feature.oneFloorPdf": "ชุด PDF 1 ชั้น",
    "pricing.feature.twoFloorPdf": "ชุด PDF 2 ชั้น",
    "pricing.feature.a3Permit": "เลย์เอาต์ A3 พร้อมยื่นอนุญาต",
    "pricing.feature.multiAiValidation": "ตรวจสอบด้วย Multi-AI",
    "pricing.feature.pileFoundation": "รวมฐานรากเสาเข็ม",
    "pricing.feature.structuralCheck": "ตรวจสอบโครงสร้าง",
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
    "workspace.save": "SAVE",
    "workspace.share": "แชร์",
    "workspace.shareCopied": "คัดลอกลิงก์แล้ว",
    "workspace.shareFailed": "แชร์ไม่สำเร็จ — ลองคัดลอก URL เอง",
    "workspace.prevView": "มุมมองก่อนหน้า",
    "workspace.nextView": "มุมมองถัดไป",
    "workspace.floor1": "แปลนพื้นชั้นที่ 1",
    "workspace.floor2": "แปลนพื้นชั้นที่ 2",
    "workspace.exportPdf": "เขียนแบบบ้าน PDF",
    "workspace.exportCad": "เขียนแบบบ้าน CAD",
    "workspace.chatPlaceholder":
      "ปรึกษา AI เพื่อแก้ไข: เช่น 'เปลี่ยนระเบียงเป็นกระจก', 'ปรับผนังภายนอก'",
    "workspace.generate": "สร้างแบบ",
    "workspace.generateRender": "สร้าง 3D Render",
    "workspace.generatingRender": "กำลังสร้างภาพ 3D ตัวอย่าง...",
    "workspace.generatingPlans": "กำลังสร้างแปลนจริงตามมาตรฐาน...",
    "workspace.generating": "กำลังสร้างบ้านในฝันของคุณ...",
    "workflow.step1": "1. กรอกข้อมูล",
    "workflow.step2": "2. ดู 3D",
    "workflow.step3": "3. เลือกรายละเอียด",
    "workflow.step4": "4. พรีวิวแปลน",
    "workflow.step5": "5. ดาวน์โหลด",
    "workflow.confirmPlan": "ยืนยันแบบแปลน",
    "workflow.confirmHint": "พอใจกับภาพ 3D แล้วหรือยัง? กดยืนยันเพื่อสร้างแปลนจริง (อ้างอิงแพทเทิร์นมาตรฐานกรมโยธาฯ เป็นแนวทางเทคนิคเท่านั้น)",
    "workflow.optionsTitle": "เลือกรายละเอียดและตัวเลือกเสริม",
    "workflow.optionsDesc": "เลือกวัสดุและชุดแบบก่อนสร้างแปลนยื่นขออนุญาต",
    "workflow.generatePlans": "สร้างแปลนจริง",
    "workflow.cancel": "ยกเลิก",
    "workflow.watermarkHint": "แปลนพร้อมแล้ว — ชำระเงินเพื่อปลดล็อกแปลนชั้นและดาวน์โหลด",
    "workflow.paywallHint": "ดูได้เฉพาะ 3D — ชำระเงินเพื่อดูแปลนชั้น รายละเอียด ดาวน์โหลด PDF/CAD และลง Store อัตโนมัติ",
    "workflow.payToUnlock": "ชำระเงินเพื่อปลดล็อก",
    "workflow.preview3dOnly": "พรีวิว 3D — ชำระเงินเพื่อดูแปลนชั้น",
    "workflow.preview3dHint": "ตรวจสอบภาพ 3D ของคุณ ยืนยันเพื่อสร้างชุดแปลนเต็ม (ล็อกจนกว่าจะชำระเงิน)",
    "workflow.plansReadyPaywall": "ชุดแปลนพร้อมแล้ว — ชำระเงินเพื่อปลดล็อก",
    "workflow.autoListed": "ลง Store แล้ว (คนอื่นเห็นได้ คุณมองไม่เห็น)",
    "workflow.unlockedHint": "ชำระเงินเรียบร้อย — ดูแปลนชั้น ดาวน์โหลด และ Store listing เปิดใช้งานแล้ว",
    "options.wall": "วัสดุผนัง",
    "options.floor": "วัสดุพื้น",
    "options.roof": "วัสดุหลังคา",
    "options.extras": "ชุดแบบและตัวเลือกเสริม",
    "options.electrical": "แปลนระบบไฟฟ้า",
    "options.plumbing": "แปลนระบบประปา/สุขาภิบาล",
    "options.structural": "รายการคำนวณโครงสร้าง",
    "options.evCharger": "ปลั๊ก EV Charger",
    "payment.title": "ปลดล็อกการดาวน์โหลด",
    "payment.desc": "ชำระเงินเพื่อดาวน์โหลดไฟล์คุณภาพเต็มพร้อมยื่นขออนุญาต",
    "payment.payNow": "ชำระเงินและปลดล็อก",
    "payment.processing": "กำลังดำเนินการ...",
    "payment.failed": "ชำระเงินไม่สำเร็จ กรุณาลองใหม่",
    "download.readyPdf": "ชุดแบบ PDF พร้อมแล้ว — กด Export PDF เพื่อดาวน์โหลด",
    "download.readyCad": "ไฟล์ CAD พร้อมแล้ว — กด Export CAD เพื่อดาวน์โหลด",
    "store.subtitle": "แบบบ้านที่ผู้ใช้ร่วมสร้างกับ AI",
    "store.autoListingNote": "หลังชำระเงินปลดล็อก แบบจะลง Store ให้คนอื่นซื้อ — คุณจะไม่เห็นแบบของตัวเองในหน้านี้",
    "store.disclaimer": "สินค้าบนสโตร์คือแบบบ้านที่ผู้ใช้ร่วมสร้างกับ AI เท่านั้น แบบตัวอย่างกรมโยธาธิการใช้เป็นเทมเพลตอ้างอิงภายในระบบเท่านั้น ไม่ได้นำมาขาย",
    "store.communityBadge": "แบบชุมชน AI",
    "store.empty": "ยังไม่มีสินค้า — สร้างแบบใน Workspace เพื่อลงสโตร์",
    "country.select": "ประเทศ / ภูมิภาค",
    "language.select": "ภาษา",
    "footer.contact": "ติดต่อ",
    "footer.privacy": "นโยบายความเป็นส่วนตัว",
    "footer.terms": "ข้อกำหนดการใช้งาน",
    "legal.lastUpdated": "อัปเดตล่าสุด: มกราคม 2569",
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
    "questionnaire.subtitle": "อัปโหลดครบ 4 ช่องก่อนเริ่มสร้างแบบ",
    "questionnaire.designDirection": "แนวทางออกแบบ",
    "questionnaire.goldenStandard": "มาตรฐานอ้างอิง (Golden Standard)",
    "questionnaire.disciplinePreset": "ขอบเขตชุดเอกสาร",
    "questionnaire.uploads": "ช่องอัปโหลดบังคับ (4 ช่อง)",
    "questionnaire.slot1": "ช่อง 1 — แปลนพื้นที่",
    "questionnaire.slot1Hint": "แปลนจากภายนอก มีหรือไม่มีขนาดก็ได้",
    "questionnaire.slot2": "ช่อง 2 — รูปด้าน / รูปตัด",
    "questionnaire.slot2Hint": "อ้างอิงสัดส่วนทางสถาปัตยกรรม",
    "questionnaire.slot3": "ช่อง 3 — รูป 3D หน้าตรง",
    "questionnaire.slot3Hint": "มุมหน้าตรงเท่านั้น — ใช้แสดงผลหลัก",
    "questionnaire.slot4": "ช่อง 4 — แปลนพื้น",
    "questionnaire.slot4Hint": "ต้องครบตามจำนวนชั้นที่เลือก",
    "questionnaire.floorPlanUnit": "PDF, DWG หรือรูปภาพ",
    "questionnaire.preferences": "ความต้องการการออกแบบ",
    "questionnaire.projectType": "ประเภทอาคาร",
    "questionnaire.projectTypeHint": "เลือกประเภทที่ตรงกับการขออนุญาตและดัชนีต้นทุน REA",
    "questionnaire.parkingSpaces": "ที่จอดรถ",
    "questionnaire.elevators": "ลิฟต์",
    "questionnaire.floorLoad": "น้ำหนักบรรทุกพื้น (kN/m²)",
    "questionnaire.nonResidentialNote": "Workspace รองรับสูงสุด 2 ชั้น — แบบหลายชั้นเต็มรูปแบบอยู่ในชุด PDF/CAD",
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
    "questionnaire.slot4Tooltip": "อัปโหลดแปลนชั้นละ 1 ไฟล์ จำนวนต้องตรงกับจำนวนชั้นที่เลือกด้านบน",
    "toast.uploading": "กำลังอัปโหลดไฟล์…",
    "toast.uploadSuccess": "อัปโหลดสำเร็จ",
    "toast.uploadError": "อัปโหลดไม่สำเร็จ — กรุณาลองใหม่",
    "toast.checking": "กำลังตรวจสอบข้อมูล…",
    "toast.processingRender": "AI กำลังสร้างภาพ 3D…",
    "toast.renderReady": "ภาพ 3D พร้อมแล้ว!",
    "toast.processingPlans": "กำลังสร้างชุดแปลนขออนุญาต…",
    "toast.plansReady": "สร้างแปลนสำเร็จ!",
    "toast.error": "เกิดข้อผิดพลาด — กรุณาลองใหม่",
    "toast.clarifyNeeded": "AI ต้องการข้อมูลเพิ่มเติม",
    "store.pageTitle": "ร้านค้าแบบบ้าน",
    "store.searchPlaceholder": "ค้นหาแบบบ้าน…",
    "store.filters": "ตัวกรอง",
    "store.results": "รายการ",
    "store.any": "ทั้งหมด",
    "store.filterFloors": "จำนวนชั้น",
    "store.filterBeds": "ห้องนอน",
    "store.filterBaths": "ห้องน้ำ",
    "store.filterStyle": "สไตล์สถาปัตย์",
    "store.planLabel": "แบบ",
    "store.startingAt": "เริ่มต้น",
    "store.specSqft": "ตร.ม.",
    "store.specBeds": "ห้องนอน",
    "store.specBaths": "ห้องน้ำ",
    "store.specStories": "ชั้น",
    "store.viewPlan": "ดูแบบ",
    "store.viewExterior": "รูปด้าน",
    "store.viewFloorPlan": "แปลนชั้น",
    "store.buyNow": "ซื้อเลย",
    "store.checkoutTitle": "ซื้อแบบบ้าน",
    "store.purchaseSuccess": "ชำระเงินสำเร็จ — กำลังดาวน์โหลด",
    "store.autoPublished": "ชำระเงินสำเร็จ — แบบของคุณลง Store แล้ว (ซ่อนจากคุณ)",
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
    "store.upsell.cadBundle": "แพ็ก CAD เสริม",
    "store.upsell.cadBundleDesc": "รับไฟล์ CAD/DWG สำหรับทุกแบบในตะกร้า",
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
    "pwa.benefit2": "ใช้งานหน้าที่แคชไว้ได้แม้ Offline",
    "pwa.benefit3": "ประสบการณ์เต็มจอเหมือนแอปจริง",
    "pwa.installNow": "ติดตั้งแอป",
    "pwa.installing": "กำลังติดตั้ง…",
    "pwa.later": "ไว้ทีหลัง",
    "pwa.neverAsk": "ไม่ต้องถามอีก",
    "pwa.iosTitle": "ติดตั้งบน iPhone / iPad",
    "pwa.iosSteps": "แตะปุ่ม Share ใน Safari แล้วเลือก \"เพิ่มที่หน้าจอโฮม\"",
    "pwa.gotIt": "เข้าใจแล้ว",
    "pwa.androidHint": "เปิดเมนูเบราว์เซอร์ (⋮) แล้วแตะ \"ติดตั้งแอป\" หรือ \"เพิ่มไปหน้าจอหลัก\"",
    "landing.ctaBand": "พร้อมออกแบบบ้านในฝันแล้วหรือยัง?",
    "landing.ctaBandDesc": "เข้าสู่ AI Design Studio ได้ทันที — ไม่ต้องสมัครก่อนเริ่ม",
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
    "editor.roughPreviewDesc": "โครงร่างหยาบ — ตรวจสอบก่อน Render จริง",
    "editor.structureSummary": "สรุปโครงสร้าง",
    "editor.roomCount": "จำนวนห้อง",
    "editor.openingCount": "ช่องเปิด",
    "editor.grossArea": "พื้นที่รวม",
    "editor.inclContingency": "รวม contingency 10%",
    "editor.backToEdit": "กลับไปแก้ไข",
    "editor.confirmAndGenerate": "ยืนยันและสร้างแปลน",
    "editor.barHint": "ปรับห้อง ประตู หน้าต่าง และวัสดุแบบ Real-time",
    "editor.exitEdit": "ออกจากตัวแก้ไข",
    "editor.openEdit": "แก้ไขดีไซน์",
    "editor.previewStructure": "พรีวิว",
    "editor.exportDocumentation": "ส่งออกเอกสาร",
    "editor.exportDocumentationSuccess": "ดาวน์โหลด JSON เอกสารแล้ว",
    "editor.exportDocumentationFailed": "ส่งออกเอกสารไม่สำเร็จ",
    "editor.exportPreviewTitle": "ตัวอย่างเอกสาร",
    "editor.exportPreviewLoading": "กำลังสร้างสรุปเอกสาร…",
    "editor.exportPreviewProject": "สรุปโครงการ",
    "editor.exportPreviewScheduleItems": "ช่องเปิด",
    "editor.exportDownloadJson": "ดาวน์โหลด JSON",
    "editor.exportDownloadPdf": "ดาวน์โหลด PDF สรุป",
    "editor.exportPdfSuccess": "ดาวน์โหลด PDF สรุปแล้ว",
    "editor.exportPdfFailed": "สร้าง PDF สรุปไม่สำเร็จ",
    "job.exportTitle": "กำลังส่งออกไฟล์",
    "job.queued": "อยู่ในคิว — ลำดับที่ {n}",
    "job.processing": "กำลังสร้างไฟล์…",
    "job.completed": "ส่งออกเสร็จแล้ว!",
    "job.failed": "ส่งออกไม่สำเร็จ",
    "job.download": "ดาวน์โหลดไฟล์",
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
    "cost.bankReady": "ดีไซน์อยู่ในกรอบงบและพื้นที่ — พร้อมยื่นกู้ธนาคารและขออนุญาตก่อสร้าง",
    "cost.bankReadyShort": "พร้อมยื่นกู้",
    "cost.permitNotReady": "งบและพื้นที่โอเคแล้ว แต่ยังต้องแก้เรื่องกฎขออนุญาตก่อนยื่น",
    "cost.permitNotReadyShort": "ต้องตรวจสอบใบอนุญาต",
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
    "permit.blockSubmit": "แก้ข้อผิดพลาดด้านใบอนุญาตก่อนดำเนินการต่อ",
  },
  hi: {
    "nav.store": "स्टोर",
    "nav.pricing": "मूल्य",
    "nav.howItWorks": "कैसे काम करता है",
    "nav.startDesign": "डिज़ाइन शुरू करें",
    "nav.login": "Google से साइन इन",
    "nav.menu": "मेनू",
    "nav.closeMenu": "मेनू बंद करें",
    "hero.title": "विश्व-स्तरीय AI के साथ अपने सपनों का घर डिज़ाइन करें",
    "hero.subtitle":
      "स्थानीय भवन नियमों के अनुरूप AI-संचालित वास्तु योजनाएँ — A3 प्रिंट और परमिट के लिए तैयार।",
    "hero.cta": "डिज़ाइन शुरू करें",
    "gallery.title": "हर जीवनशैली के लिए 10 डिज़ाइन शैलियाँ",
    "how.title": "कैसे काम करता है",
    "how.step1.title": "विनिर्देश चुनें",
    "how.step1.desc": "सामग्री, शैली, मंजिलें और स्थान चुनें",
    "how.step2.title": "प्रेरणा अपलोड करें",
    "how.step2.desc": "संदर्भ छवियाँ संलग्न करें — AI आपकी पसंद सीखता है",
    "how.step3.title": "फ़ाइलें डाउनलोड करें",
    "how.step3.desc": "ठेकेदारों और परमिट के लिए PDF/CAD प्राप्त करें",
    "pricing.title": "सरल, पारदर्शी मूल्य",
    "pricing.standard": "Standard",
    "pricing.premium": "Premium",
    "pricing.luxury": "Luxury",
    "pricing.store": "तैयार-खरीद स्टोर",
    "pricing.custom1": "कस्टम 1-मंजिला",
    "pricing.custom2": "कस्टम 2-मंजिला",
    "pricing.cad": "CAD फ़ाइल",
    "pricing.perDesign": "प्रति डिज़ाइन",
    "pricing.buyNow": "शुरू करें",
    "pricing.feature.pdfPreview": "PDF + पूर्वावलोकन",
    "pricing.feature.instantDownload": "तुरंत डाउनलोड",
    "pricing.feature.storeCatalog": "{price} स्टोर कैटलॉग",
    "pricing.feature.aiCustom": "AI कस्टम डिज़ाइन",
    "pricing.feature.oneFloorPdf": "1-मंजिल PDF सेट",
    "pricing.feature.twoFloorPdf": "2-मंजिल PDF सेट",
    "pricing.feature.a3Permit": "A3 परमिट-तैयार लेआउट",
    "pricing.feature.multiAiValidation": "मल्टी-AI सत्यापन",
    "pricing.feature.pileFoundation": "पाइल फाउंडेशन शामिल",
    "pricing.feature.structuralCheck": "संरचनात्मक अनुपालन जांच",
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
    "workspace.prevView": "पिछला दृश्य",
    "workspace.nextView": "अगला दृश्य",
    "workspace.floor1": "पहली मंजिल की योजना",
    "workspace.floor2": "दूसरी मंजिल की योजना",
    "workspace.exportPdf": "घर की योजना PDF",
    "workspace.exportCad": "घर की योजना CAD",
    "workspace.chatPlaceholder":
      "AI से संपादन के लिए परामर्श: जैसे 'बालकनी को कांच में बदलें'",
    "workspace.generate": "जनरेट",
    "workspace.generateRender": "3D रेंडर बनाएं",
    "workspace.generatingRender": "3D पूर्वावलोकन बना रहे हैं...",
    "workspace.generatingPlans": "योजनाएँ बना रहे हैं...",
    "workspace.generating": "आपका सपनों का घर बना रहे हैं...",
    "workflow.step1": "1. Brief",
    "workflow.step2": "2. 3D Preview",
    "workflow.step3": "3. Options",
    "workflow.step4": "4. Plans Preview",
    "workflow.step5": "5. Download",
    "workflow.confirmPlan": "डिज़ाइन की पुष्टि करें",
    "workflow.confirmHint": "3D रेंडर से संतुष्ट हैं? फ़्लोर प्लान बनाने के लिए पुष्टि करें।",
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
    "store.subtitle": "Community designs co-created by users and AI",
    "store.autoListingNote": "After payment, your design auto-lists for others — hidden from your view.",
    "store.disclaimer": "Store items are user+AI originals only. Government reference templates are never sold here.",
    "store.communityBadge": "AI Community Design",
    "store.empty": "No listings yet.",
    "country.select": "देश / क्षेत्र",
    "language.select": "भाषा",
    "footer.contact": "संपर्क",
    "footer.privacy": "गोपनीयता नीति",
    "footer.terms": "सेवा की शर्तें",
    "legal.lastUpdated": "अंतिम अपडेट: जनवरी 2026",
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
    "questionnaire.subtitle": "Complete all 4 uploads before generating",
    "questionnaire.designDirection": "Design Direction",
    "questionnaire.goldenStandard": "Golden Standard",
    "questionnaire.disciplinePreset": "Drawing Set Scope",
    "questionnaire.uploads": "Required Uploads",
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
    "store.filterStyle": "Style",
    "store.planLabel": "PLAN",
    "store.startingAt": "Starting at",
    "store.specSqft": "SQ FT",
    "store.specBeds": "BEDS",
    "store.specBaths": "BATHS",
    "store.specStories": "STORIES",
    "store.viewPlan": "View Plan",
    "store.viewExterior": "Exterior",
    "store.viewFloorPlan": "Floor Plan",
    "store.buyNow": "Buy Now",
    "store.checkoutTitle": "Purchase",
    "store.purchaseSuccess": "Purchase complete",
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
    "store.upsell.cadBundle": "CAD Bundle",
    "store.upsell.cadBundleDesc": "CAD/DWG for all cart plans",
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
    "landing.ctaBand": "Ready to design?",
    "landing.ctaBandDesc": "Jump into the AI Design Studio now.",
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
    "cost.bankReady": "Within budget and area — bank & permit ready.",
    "cost.bankReadyShort": "Bank-ready",
    "cost.permitNotReady": "Budget and area look good, but permit rules still need attention.",
    "cost.permitNotReadyShort": "Permit review needed",
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
    "permit.blockSubmit": "Fix permit errors before continuing.",
  },
  vi: {
    "nav.store": "Cửa hàng",
    "nav.pricing": "Bảng giá",
    "nav.howItWorks": "Cách hoạt động",
    "nav.startDesign": "Bắt đầu thiết kế",
    "nav.login": "Đăng nhập Google",
    "nav.menu": "Menu",
    "nav.closeMenu": "Đóng menu",
    "hero.title": "Thiết kế ngôi nhà mơ ước với AI đẳng cấp thế giới",
    "hero.subtitle":
      "Bản vẽ kiến trúc AI tuân thủ quy chuẩn xây dựng địa phương — sẵn sàng in A3 và nộp hồ sơ.",
    "hero.cta": "Bắt đầu thiết kế",
    "gallery.title": "10 phong cách thiết kế cho mọi lối sống",
    "how.title": "Cách hoạt động",
    "how.step1.title": "Chọn thông số",
    "how.step1.desc": "Chọn vật liệu, phong cách, số tầng và vị trí",
    "how.step2.title": "Tải lên cảm hứng",
    "how.step2.desc": "Đính kèm hình tham khảo — AI học gu của bạn",
    "how.step3.title": "Tải xuống tệp",
    "how.step3.desc": "Nhận PDF/CAD cho nhà thầu và giấy phép",
    "pricing.title": "Bảng giá minh bạch",
    "pricing.standard": "Standard",
    "pricing.premium": "Premium",
    "pricing.luxury": "Luxury",
    "pricing.store": "Cửa hàng sẵn có",
    "pricing.custom1": "Tùy chỉnh 1 tầng",
    "pricing.custom2": "Tùy chỉnh 2 tầng",
    "pricing.cad": "Tệp CAD",
    "pricing.perDesign": "mỗi thiết kế",
    "pricing.buyNow": "Bắt đầu",
    "pricing.feature.pdfPreview": "PDF + Xem trước",
    "pricing.feature.instantDownload": "Tải xuống ngay",
    "pricing.feature.storeCatalog": "Danh mục Store {price}",
    "pricing.feature.aiCustom": "Thiết kế tùy chỉnh AI",
    "pricing.feature.oneFloorPdf": "Bộ PDF 1 tầng",
    "pricing.feature.twoFloorPdf": "Bộ PDF 2 tầng",
    "pricing.feature.a3Permit": "Bố cục A3 sẵn sàng cấp phép",
    "pricing.feature.multiAiValidation": "Xác thực Multi-AI",
    "pricing.feature.pileFoundation": "Bao gồm móng cọc",
    "pricing.feature.structuralCheck": "Kiểm tra tuân thủ kết cấu",
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
    "workspace.prevView": "Góc nhìn trước",
    "workspace.nextView": "Góc nhìn tiếp",
    "workspace.floor1": "Bản vẽ tầng 1",
    "workspace.floor2": "Bản vẽ tầng 2",
    "workspace.exportPdf": "Tạo bản vẽ PDF",
    "workspace.exportCad": "Tạo bản vẽ CAD",
    "workspace.chatPlaceholder":
      "Tư vấn AI để chỉnh sửa: vd. 'đổi ban công thành kính'",
    "workspace.generate": "Tạo",
    "workspace.generateRender": "Tạo 3D Render",
    "workspace.generatingRender": "Đang tạo xem trước 3D...",
    "workspace.generatingPlans": "Đang tạo bản vẽ...",
    "workspace.generating": "Đang tạo ngôi nhà mơ ước của bạn...",
    "workflow.step1": "1. Thông tin",
    "workflow.step2": "2. Xem 3D",
    "workflow.step3": "3. Tùy chọn",
    "workflow.step4": "4. Xem trước",
    "workflow.step5": "5. Tải xuống",
    "workflow.confirmPlan": "Xác nhận thiết kế",
    "workflow.confirmHint": "Hài lòng với 3D? Xác nhận để tạo bản vẽ chi tiết.",
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
    "store.subtitle": "Thiết kế do người dùng và AI cùng tạo",
    "store.autoListingNote": "Sau khi thanh toán, thiết kế tự động lên store — ẩn khỏi bạn.",
    "store.disclaimer": "Chỉ bán thiết kế gốc do người dùng+AI tạo. Mẫu tham chiếu chính phủ không được bán.",
    "store.communityBadge": "Thiết kế cộng đồng AI",
    "store.empty": "Chưa có sản phẩm.",
    "country.select": "Quốc gia / Khu vực",
    "language.select": "Ngôn ngữ",
    "footer.contact": "Liên hệ",
    "footer.privacy": "Chính sách bảo mật",
    "footer.terms": "Điều khoản dịch vụ",
    "legal.lastUpdated": "Cập nhật lần cuối: Tháng 1/2026",
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
    "questionnaire.subtitle": "Hoàn thành 4 ô tải lên trước khi tạo",
    "questionnaire.designDirection": "Hướng thiết kế",
    "questionnaire.goldenStandard": "Tiêu chuẩn vàng",
    "questionnaire.disciplinePreset": "Phạm vi bản vẽ",
    "questionnaire.uploads": "Tải lên bắt buộc",
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
    "store.filterStyle": "Phong cách",
    "store.planLabel": "BẢN",
    "store.startingAt": "Từ",
    "store.specSqft": "M²",
    "store.specBeds": "PN",
    "store.specBaths": "PT",
    "store.specStories": "TẦNG",
    "store.viewPlan": "Xem bản vẽ",
    "store.viewExterior": "Mặt ngoài",
    "store.viewFloorPlan": "Mặt bằng",
    "store.buyNow": "Mua ngay",
    "store.checkoutTitle": "Thanh toán",
    "store.purchaseSuccess": "Thanh toán thành công",
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
    "store.upsell.cadBundle": "Gói CAD",
    "store.upsell.cadBundleDesc": "CAD/DWG cho mọi bản vẽ trong giỏ",
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
    "landing.ctaBand": "Sẵn sàng thiết kế?",
    "landing.ctaBandDesc": "Vào AI Design Studio ngay.",
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
    "cost.bankReady": "Trong ngân sách và diện tích — sẵn sàng vay ngân hàng & xin phép.",
    "cost.bankReadyShort": "Sẵn sàng vay",
    "cost.permitNotReady": "Ngân sách và diện tích ổn, nhưng vẫn cần xử lý quy định cấp phép.",
    "cost.permitNotReadyShort": "Cần rà soát cấp phép",
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
    "permit.blockSubmit": "Sửa lỗi cấp phép trước khi tiếp tục.",
  },
};

export function t(locale: Locale, key: TranslationKey): string {
  return translations[locale][key] ?? translations.en[key] ?? key;
}

export {
  pickLocalized,
  pickLocalizedLabel,
  localeName,
  aiRespondInLocale,
  localeHtmlLang,
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
