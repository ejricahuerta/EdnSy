import sampleDental from "@/docs/references/sample-admin-demo-payload.json";
import sampleCafe from "@/docs/references/sample-test-cafe.json";
import sampleFitness from "@/docs/references/sample-test-fitness.json";
import sampleLegal from "@/docs/references/sample-test-legal.json";

export type TestSampleRecord = {
  id: string;
  label: string;
  file: string;
  payload: unknown;
};

const REGISTRY: readonly TestSampleRecord[] = [
  {
    id: "downtown-dental",
    label: "Dental clinic (Calgary)",
    file: "references/sample-admin-demo-payload.json",
    payload: sampleDental,
  },
  {
    id: "riverside-cafe",
    label: "Neighborhood cafe",
    file: "references/sample-test-cafe.json",
    payload: sampleCafe,
  },
  {
    id: "apex-fitness",
    label: "Boutique gym",
    file: "references/sample-test-fitness.json",
    payload: sampleFitness,
  },
  {
    id: "harbor-legal",
    label: "Law firm",
    file: "references/sample-test-legal.json",
    payload: sampleLegal,
  },
] as const;

const BY_ID: Record<string, TestSampleRecord> = Object.fromEntries(
  REGISTRY.map((r) => [r.id, r]),
);

export function listTestSampleMeta(): Array<{
  id: string;
  label: string;
  file: string;
}> {
  return REGISTRY.map(({ id, label, file }) => ({ id, label, file }));
}

export function resolveTestSample(
  sampleId: string | undefined,
): TestSampleRecord {
  if (sampleId != null && sampleId !== "") {
    const hit = BY_ID[sampleId];
    if (!hit) {
      throw new Error(`Unknown test sample: ${sampleId}`);
    }
    return hit;
  }
  const i = Math.floor(Math.random() * REGISTRY.length);
  return REGISTRY[i]!;
}
