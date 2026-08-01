"use client";

import { Select } from "@/components/vendor/ui";

const THAI_MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
] as const;

/** Buddhist Era year = Common Era + 543 */
function toBe(ceYear: number): number {
  return ceYear + 543;
}

function toCe(beYear: number): number {
  return beYear - 543;
}

function daysInMonth(ceYear: number, month1to12: number): number {
  return new Date(ceYear, month1to12, 0).getDate();
}

function parseIso(iso: string): { day: number; month: number; ceYear: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return null;
  const ceYear = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (!ceYear || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const maxDay = daysInMonth(ceYear, month);
  if (day > maxDay) return null;
  return { day, month, ceYear };
}

function toIso(day: number, month: number, ceYear: number): string {
  return `${String(ceYear).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Thai-friendly date of birth picker.
 * Display: วว / เดือนไทย / ปี พ.ศ. (ค.ศ. in parentheses)
 * Value stored as ISO `yyyy-mm-dd` (ค.ศ.) for the API.
 */
export function ThaiDateOfBirthField({
  value,
  onChange,
}: {
  /** ISO date `yyyy-mm-dd` or empty */
  value: string;
  onChange: (isoDate: string) => void;
}) {
  const parsed = value ? parseIso(value) : null;
  const now = new Date();
  const currentCe = now.getFullYear();
  // Allow roughly ages 18–100 (Thai ID / KYC).
  const minCe = currentCe - 100;
  const maxCe = currentCe - 18;

  const day = parsed?.day ?? 0;
  const month = parsed?.month ?? 0;
  const ceYear = parsed?.ceYear ?? 0;
  const beYear = ceYear ? toBe(ceYear) : 0;

  const yearOptions: number[] = [];
  for (let ce = maxCe; ce >= minCe; ce -= 1) {
    yearOptions.push(ce);
  }

  const maxDay =
    month && ceYear ? daysInMonth(ceYear, month) : month ? daysInMonth(2000, month) : 31;

  function emit(nextDay: number, nextMonth: number, nextCe: number) {
    if (!nextDay || !nextMonth || !nextCe) {
      onChange("");
      return;
    }
    const clampedDay = Math.min(nextDay, daysInMonth(nextCe, nextMonth));
    onChange(toIso(clampedDay, nextMonth, nextCe));
  }

  const selectClass =
    "w-full rounded-lg border border-border bg-white px-2.5 py-2 text-sm text-text-primary outline-none transition focus:border-[#1e40af] focus:ring-2 focus:ring-[#1e40af]/20";

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <span className="mb-1 block text-[10px] font-medium text-text-muted">วัน (วว)</span>
          <Select
            className={selectClass}
            value={day || ""}
            onChange={(e) => {
              const d = Number(e.target.value) || 0;
              emit(d, month || 1, ceYear || maxCe);
            }}
            aria-label="วันเกิด — วัน"
          >
            <option value="">วว</option>
            {Array.from({ length: maxDay }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                {String(d).padStart(2, "0")}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <span className="mb-1 block text-[10px] font-medium text-text-muted">เดือน (ดด)</span>
          <Select
            className={selectClass}
            value={month || ""}
            onChange={(e) => {
              const m = Number(e.target.value) || 0;
              emit(day || 1, m, ceYear || maxCe);
            }}
            aria-label="วันเกิด — เดือน"
          >
            <option value="">เดือน</option>
            {THAI_MONTHS.map((name, i) => (
              <option key={name} value={i + 1}>
                {name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <span className="mb-1 block text-[10px] font-medium text-text-muted">ปี พ.ศ.</span>
          <Select
            className={selectClass}
            value={beYear || ""}
            onChange={(e) => {
              const be = Number(e.target.value) || 0;
              emit(day || 1, month || 1, be ? toCe(be) : 0);
            }}
            aria-label="วันเกิด — ปี พ.ศ."
          >
            <option value="">ปปปป</option>
            {yearOptions.map((ce) => {
              const be = toBe(ce);
              return (
                <option key={ce} value={be}>
                  พ.ศ. {be} (ค.ศ. {ce})
                </option>
              );
            })}
          </Select>
        </div>
      </div>

      <p className="mt-1.5 text-[11px] text-text-muted">
        รูปแบบไทย วว/ดด/ปปปป · ปีเป็น พ.ศ. ตามบัตรประชาชน (แสดง ค.ศ. ในวงเล็บเพื่ออ้างอิง)
        {parsed ? (
          <>
            {" "}
            · ที่เลือก:{" "}
            <span className="font-medium text-text-secondary">
              {String(parsed.day).padStart(2, "0")}/
              {String(parsed.month).padStart(2, "0")}/
              {toBe(parsed.ceYear)} พ.ศ.
            </span>
          </>
        ) : null}
      </p>
    </div>
  );
}
