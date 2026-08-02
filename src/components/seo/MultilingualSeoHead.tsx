import { ASIA_POSITIONING, ALL_ASIA_POSITIONING } from "@/lib/seo/multilingual-positioning";

/**
 * Injects lang-tagged meta descriptions into <head>
 * so Googlebot and AI crawlers see Asia-wide multilingual positioning.
 * Keywords are emitted via root Metadata; render this inside the root layout <head>.
 */
export function MultilingualSeoHead() {
  return (
    <>
      {/* Lang-tagged descriptions — supplements the primary Metadata.description */}
      {ALL_ASIA_POSITIONING.map((entry) => (
        <meta
          key={`desc-${entry.lang}`}
          name="description"
          lang={entry.lang}
          content={entry.description}
        />
      ))}
      {ASIA_POSITIONING.map((entry) =>
        entry.ogLocale ? (
          <meta
            key={`og-alt-${entry.ogLocale}`}
            property="og:locale:alternate"
            content={entry.ogLocale}
          />
        ) : null,
      )}
      {/* Explicit translation / availability signal for crawlers */}
      <meta
        name="available-languages"
        content={ALL_ASIA_POSITIONING.map((e) => e.lang).join(",")}
      />
    </>
  );
}
