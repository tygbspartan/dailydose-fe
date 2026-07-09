"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ROUTES } from "@/constants/routes";

const LEFT_CONCERNS = [
  { label: "Acne & Breakouts", id: "acne" },
  { label: "Dryness", id: "dryness" },
  { label: "Oil Control", id: "oil-control" },
  { label: "Large Pores", id: "large-pores" },
  { label: "Dehydration", id: "dehydration" },
  { label: "Dark Spots & Hyperpigmentation", id: "dark-spots" },
  { label: "Sensitivity & Redness", id: "sensitivity" },
  { label: "Uneven Skin Tone", id: "uneven-skin-tone" },
] as const;

const RIGHT_CONCERNS = [
  { label: "Sun Protection", id: "sun-protection" },
  { label: "Dullness & Brightening", id: "dullness" },
  { label: "Uneven Texture", id: "uneven-texture" },
  { label: "Fine Lines & Wrinkles", id: "fine-lines" },
  { label: "Firmness & Elasticity", id: "firmness" },
  { label: "Dark Circles", id: "dark-circles" },
  { label: "Puffiness", id: "puffiness" },
] as const;

function ConcernItem({ label }: { label: string }) {
  return (
    <Link
      href={`${ROUTES.PRODUCTS}?skinConcern=${encodeURIComponent(label)}`}
      className="flex items-center gap-2 group"
    >
      <ChevronRight
        className="w-3.5 h-3.5 shrink-0 text-[#B9B9B9]"
        strokeWidth={2}
      />
      <span className="font-montserrat font-normal text-[12px] md:text-[14px] lg:text-[14px] xl:text-[18px] leading-none capitalize text-[#484848] group-hover:text-primary transition-colors">
        {label}
      </span>
    </Link>
  );
}

export default function SkinConcerns() {
  return (
    <section className="w-full bg-[#FFFBF4]">
      {/* ── Desktop (lg+) ── 40/60 split: image + straddling title left,
          options right (two columns) ── */}
      <div
        className="hidden lg:flex items-start"
        style={{
          paddingTop: 120,
          paddingBottom: 120,
          // Image stays flush-left; options end at the page's right gutter.
          paddingRight: "clamp(1.5rem, 8.333vw - 2.5rem, 7.5rem)",
          // Cap the width on very wide (2k+) screens, left-aligned, so the
          // image/text stay flush-left while the right-aligned options land
          // around the middle of the screen (extra space goes to the right).
          // Raising the cap shifts the right-aligned options further right
          // (~+200px vs the previous 1700). Below 1900 this is a no-op.
          maxWidth: 2000,
        }}
      >
        {/* LEFT 40% — image + overlaid title/subtitle.
            Everything is sized off a single --iw (image width) that scales with
            the viewport, so the "Skin"-ends-at-edge alignment and the gradient
            colour split stay correct at any width. --iw is kept small enough
            that the title/subtitle overflow clears the right-hand options even
            at tablet width. Ratios from the full-size design: 343px wide,
            height ×1.3411, title anchored ×0.7376, edge/split ×0.2624, title
            font ×0.1166, subtitle font ×0.0525. Inline styles on purpose — the
            project's Tailwind HMR doesn't reliably regenerate arbitrary values. */}
        <div style={{ width: "40%" }}>
          <div
            className="relative"
            style={{
              ["--iw" as string]: "clamp(170px, 21vw, 343px)",
              width: "var(--iw)",
            }}
          >
            <img
              src="/assets/concerns.png"
              alt="Skin concerns"
              className="block object-cover"
              style={{
                width: "var(--iw)",
                height: "calc(var(--iw) * 1.3411)",
                borderRadius: 10,
              }}
            />
            <div
              className="absolute whitespace-nowrap"
              style={{ left: "calc(var(--iw) * 0.7376)", top: "38%" }}
            >
              <p
                className="font-montserrat font-normal leading-none"
                style={{ fontSize: "calc(var(--iw) * 0.1166)" }}
              >
                <span className="text-white">Skin</span>{" "}
                <span className="text-black">Concerns</span>
              </p>
              <p
                className="font-montserrat font-normal"
                style={{
                  marginTop: 10,
                  fontSize: "calc(var(--iw) * 0.0525)",
                  lineHeight: 1.44,
                  backgroundImage:
                    "linear-gradient(to right, #ffffff 0, #ffffff calc(var(--iw) * 0.2624), #747373 calc(var(--iw) * 0.2624))",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                Discover products tailored to your skin concerns.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT 60% — options, right-aligned; the column gap shrinks with the
            viewport so it never crowds the title overflow. */}
        <div style={{ width: "60%", display: "flex", justifyContent: "flex-end" }}>
          <div className="gap-x-[80px] xl:gap-x-[100px] 2xl:gap-x-[150px]" style={{ display: "flex" }}>
            <div className="gap-y-6 xl:gap-y-[30px]" style={{ display: "flex", flexDirection: "column" }}>
              {LEFT_CONCERNS.map((c) => (
                <ConcernItem key={c.id} label={c.label} />
              ))}
            </div>
            <div
              className="gap-y-6 xl:gap-y-[30px]"
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: 75,
              }}
            >
              {RIGHT_CONCERNS.map((c) => (
                <ConcernItem key={c.id} label={c.label} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Phone only (below md) ── 20/80: left image strip (cropped to the
          left of the face) + text stack on the right. Image flush-left; text
          ends at the page gutter. ── */}
      <div
        className="md:hidden flex items-stretch"
        style={{
          paddingTop: 25,
          paddingBottom: 48,
          paddingRight: "clamp(1.5rem, 8.333vw - 2.5rem, 7.5rem)",
          columnGap: 30,
        }}
      >
        {/* Left 20% — narrow strip showing only the left side of the image.
            115px top/bottom padding insets the image; the image flexes to fill
            what's left, so the component height stays driven by the text and
            doesn't grow. Only the right corners are rounded (it's flush-left). */}
        <div
          className="shrink-0"
          style={{
            width: "20%",
            display: "flex",
            flexDirection: "column",
            paddingTop: 95,
            paddingBottom: 70,
          }}
        >
          <img
            src="/assets/concerns.png"
            alt="Skin concerns"
            className="block w-full object-cover"
            style={{
              flex: 1,
              minHeight: 0,
              objectPosition: "left",
              borderTopRightRadius: 10,
              borderBottomRightRadius: 10,
            }}
          />
        </div>

        {/* Right 80% — title, subtitle, then options 30px below */}
        <div style={{ flex: 1 }}>
          <p className="font-montserrat font-normal leading-none text-black text-[18px]">
            Skin Concerns
          </p>
          <p
            className="font-montserrat font-normal text-[10px]"
            style={{ marginTop: 6, lineHeight: "14px", color: "#747373" }}
          >
            Discover products tailored to your skin concerns.
          </p>
          <div
            style={{ marginTop: 30, display: "flex", flexDirection: "column", rowGap: 5 }}
          >
            {[...LEFT_CONCERNS, ...RIGHT_CONCERNS].map((c) => (
              <ConcernItem key={c.id} label={c.label} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Tablet (md only) ── image strip with the title/subtitle straddling
          its right edge; single-column options 30px to the right of the
          subtitle. The text block is pulled left (marginLeft) so its first 50px
          sits over the image (white) and the rest is dark; because it's in flow,
          the options land 30px past the subtitle's end. ── */}
      <div
        className="hidden md:flex lg:hidden items-stretch"
        style={{
          paddingTop: 25,
          paddingBottom: 48,
          paddingRight: "clamp(1.5rem, 8.333vw - 2.5rem, 7.5rem)",
        }}
      >
        {/* Image strip — same 20% size, cropped to the left of the face */}
        <div
          className="shrink-0"
          style={{
            width: "20%",
            display: "flex",
            flexDirection: "column",
            paddingTop: 95,
            paddingBottom: 70,
          }}
        >
          <img
            src="/assets/concerns.png"
            alt="Skin concerns"
            className="block w-full object-cover"
            style={{
              flex: 1,
              minHeight: 0,
              objectPosition: "left",
              borderTopRightRadius: 10,
              borderBottomRightRadius: 10,
            }}
          />
        </div>

        {/* Title + subtitle — straddle the image's right edge */}
        <div
          className="whitespace-nowrap"
          style={{ alignSelf: "center", marginLeft: -50 }}
        >
          <p className="font-montserrat font-normal leading-none" style={{ fontSize: 22 }}>
            <span className="text-white">Skin</span>{" "}
            <span className="text-black">Concerns</span>
          </p>
          <p
            className="font-montserrat font-normal"
            style={{
              marginTop: 6,
              fontSize: 12,
              lineHeight: "16px",
              backgroundImage:
                "linear-gradient(to right, #ffffff 0, #ffffff 50px, #747373 50px)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Discover products tailored to your skin concerns.
          </p>
        </div>

        {/* Options — single column, 60px to the right of the subtitle */}
        <div
          style={{
            marginLeft: 90,
            alignSelf: "center",
            display: "flex",
            flexDirection: "column",
            rowGap: 10,
          }}
        >
          {[...LEFT_CONCERNS, ...RIGHT_CONCERNS].map((c) => (
            <ConcernItem key={c.id} label={c.label} />
          ))}
        </div>
      </div>
    </section>
  );
}
