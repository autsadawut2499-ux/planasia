import type { HousePlanDocument } from "@/lib/plans/schema";

/** Minimal DXF export — floor plan room outlines aligned with CAD reference patterns */
export function generatePlanDxf(doc: HousePlanDocument): string {
  const lines: string[] = [
    "0", "SECTION", "2", "HEADER",
    "9", "$ACADVER", "1", "AC1015",
    "9", "$INSUNITS", "70", "6",
    "0", "ENDSEC",
    "0", "SECTION", "2", "ENTITIES",
  ];
  if (doc.cadPatternIds?.length) {
    lines.push(
      "0", "TEXT", "8", "REF",
      "10", "0", "20", "0", "40", "0.1",
      "1", `Planasia refs: ${doc.cadPatternIds.join(", ")}`,
    );
  }

  let yOffset = 0;
  for (const floor of doc.floorPlans) {
    for (const room of floor.rooms) {
      const x1 = room.x;
      const y1 = yOffset + room.y;
      const x2 = x1 + room.width;
      const y2 = y1 + room.depth;

      lines.push(
        "0", "LWPOLYLINE", "8", `FLOOR_${floor.level}`, "90", "4",
        "70", "1",
        "10", String(x1), "20", String(y1),
        "10", String(x2), "20", String(y1),
        "10", String(x2), "20", String(y2),
        "10", String(x1), "20", String(y2),
      );

      lines.push(
        "0", "TEXT", "8", `LABELS_F${floor.level}`,
        "10", String(x1 + 0.2), "20", String(y1 + room.depth / 2),
        "40", "0.3",
        "1", `${room.name} (${room.width}x${room.depth}m)`,
      );
    }
    yOffset += 20;
  }

  lines.push("0", "ENDSEC", "0", "EOF");
  return lines.join("\n");
}
