import { NextRequest, NextResponse } from "next/server";
import { getCountryByCode } from "@/lib/geo/countries";
import {
  DESIGNER_SYSTEM_PROMPT,
  VALIDATOR_SYSTEM_PROMPT,
  buildDesignerContext,
} from "@/lib/ai/prompts";
import { validateProject } from "@/lib/rules/engine";
import { getChatModel, isGeminiConfigured } from "@/lib/ai/gemini";
import type { ProjectInput } from "@/lib/ai/types";

interface ChatRequestBody {
  message: string;
  project: ProjectInput;
  locale: string;
  countryCode: string;
}

import { localeName, aiRespondInLocale } from "@/lib/i18n/localized-text";

function mockDesignerReply(message: string, project: ProjectInput, locale: string): string {
  const isThai = locale === "th";

  if (/balcony|ระเบียง|ban công/i.test(message)) {
    return isThai
      ? `รับทราบครับ จะปรับระเบียงเป็นกระจก Full-height ให้กับแบบ ${project.style} ชั้น ${project.floors} ตามที่ขอ`
      : `Noted. I'll update the balcony to full-height glass for your ${project.style} ${project.floors}-floor design.`;
  }

  return isThai
    ? `สถาปนิก AI รับคำขอแล้ว: "${message}" — กำลังวิเคราะห์แบบ ${project.style} (${project.floors} ชั้น)`
    : `Designer AI received: "${message}" — analyzing your ${project.style} design (${project.floors} floors).`;
}

function ruleValidatorNotes(project: ProjectInput, countryCode: string, locale: string): string {
  const country = getCountryByCode(countryCode);
  const isThai = locale === "th";
  const validations = validateProject(project, country.buildingCode);

  return validations
    .flatMap((v) =>
      v.issues.map((issue) => {
        const icon = issue.severity === "error" ? "⚠️" : "✓";
        return `${icon} ${issue.message}`;
      }),
    )
    .concat(
      isThai
        ? `✓ ตรวจสอบตาม ${country.buildingCode}`
        : `✓ Validated against ${country.buildingCode}`,
    )
    .join("\n");
}

export async function POST(request: NextRequest) {
  const body: ChatRequestBody = await request.json();
  const { message, project, locale, countryCode } = body;

  const country = getCountryByCode(countryCode);
  const designerContext = buildDesignerContext(project, countryCode, country.buildingCode);
  const lang = localeName(locale);

  if (isGeminiConfigured()) {
    const model = getChatModel();
    if (model) {
      try {
        const designerResult = await model.generateContent({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `${DESIGNER_SYSTEM_PROMPT}\n\n${designerContext}\n\n${aiRespondInLocale(locale)}\n\nUser: ${message}`,
                },
              ],
            },
          ],
        });
        const designerText =
          designerResult.response.text() || mockDesignerReply(message, project, locale);

        let validatorText = ruleValidatorNotes(project, countryCode, locale);
        try {
          const validatorResult = await model.generateContent({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `${VALIDATOR_SYSTEM_PROMPT}\n\n${designerContext}\n\nUser design context above. ${aiRespondInLocale(locale)} Format: PASS/FAIL/WARNINGS.`,
                  },
                ],
              },
            ],
          });
          validatorText = validatorResult.response.text() || validatorText;
        } catch {
          /* keep rule-based validator */
        }

        return NextResponse.json({
          reply: `${designerText}\n\n--- Validator ---\n${validatorText}`,
          agent: "designer",
          aiMode: "gemini",
        });
      } catch {
        /* fall through */
      }
    }
  }

  const designerReply = mockDesignerReply(message, project, locale);
  const validation = ruleValidatorNotes(project, countryCode, locale);

  return NextResponse.json({
    reply: `${designerReply}\n\n--- Validator ---\n${validation}`,
    agent: "designer",
    aiMode: "fallback",
  });
}
