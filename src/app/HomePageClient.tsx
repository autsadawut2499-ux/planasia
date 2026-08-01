"use client";

import { LandingHeader } from "@/components/landing/LandingHeader";
import { HeroSearch } from "@/components/landing/HeroSearch";
import { PartnerBrandMarquee } from "@/components/landing/PartnerBrandMarquee";
import { FeaturedStyles } from "@/components/landing/FeaturedStyles";
import { FeaturedCollections } from "@/components/landing/FeaturedCollections";
import { FeaturedPlans } from "@/components/landing/FeaturedPlans";
import { PopularPlans } from "@/components/landing/PopularPlans";
import { RecommendedForYou } from "@/components/store/RecommendedForYou";
import { ExclusiveBand } from "@/components/landing/ExclusiveBand";
import { PlanInfoBand } from "@/components/landing/PlanInfoBand";
import { PlanValueBand } from "@/components/landing/PlanValueBand";

export default function HomePageClient() {
  return (
    <div className="page-canvas scroll-smooth">
      <LandingHeader />
      <main>
        <HeroSearch />
        <PartnerBrandMarquee />
        <PopularPlans className="section-pad border-b border-border/70" />
        <RecommendedForYou className="section-pad border-b border-border/70" />
        <FeaturedStyles />
        <FeaturedCollections />
        <FeaturedPlans />
        <ExclusiveBand />
        <FeaturedPlans exclusive />
        <PlanInfoBand />
        <PlanValueBand />
      </main>
    </div>
  );
}
