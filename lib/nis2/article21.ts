// Mapeo del Artículo 21.2 de la Directiva (UE) 2022/2555 (NIS2).
// Las 10 medidas obligatorias y el estado real de cobertura de VulnRadar.
// Política: no inventar coberturas (CLAUDE.md). Tres estados posibles.

export type Article21Coverage = "covered" | "partial" | "not_applicable";

export type Article21Measure = {
  /** Letra del apartado en el Art. 21.2 (a..j). */
  letter: "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j";
  /** Clave i18n bajo report.nis2.measures.<key>. */
  key:
    | "riskAnalysis"
    | "incidentHandling"
    | "businessContinuity"
    | "supplyChain"
    | "vulnerabilityHandling"
    | "effectiveness"
    | "cyberHygiene"
    | "cryptography"
    | "humanResources"
    | "authentication";
  coverage: Article21Coverage;
};

export const ARTICLE_21_MEASURES: readonly Article21Measure[] = [
  { letter: "a", key: "riskAnalysis", coverage: "partial" },
  { letter: "b", key: "incidentHandling", coverage: "partial" },
  { letter: "c", key: "businessContinuity", coverage: "not_applicable" },
  { letter: "d", key: "supplyChain", coverage: "partial" },
  { letter: "e", key: "vulnerabilityHandling", coverage: "covered" },
  { letter: "f", key: "effectiveness", coverage: "partial" },
  { letter: "g", key: "cyberHygiene", coverage: "not_applicable" },
  { letter: "h", key: "cryptography", coverage: "not_applicable" },
  { letter: "i", key: "humanResources", coverage: "partial" },
  { letter: "j", key: "authentication", coverage: "not_applicable" },
] as const;

export function summarizeCoverage(measures: readonly Article21Measure[]) {
  return measures.reduce(
    (acc, m) => {
      acc[m.coverage] += 1;
      return acc;
    },
    { covered: 0, partial: 0, not_applicable: 0 },
  );
}
