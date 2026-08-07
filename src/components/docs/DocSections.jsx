import { Lightbulb } from 'lucide-react'

// Renders a doc's `sections` array. Each section may mix any of
// paragraphs / steps / bullets / tips — see src/content/docs/index.js for the shape.
export default function DocSections({ sections }) {
  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <section key={section.heading}>
          <h2 className="text-white font-semibold text-base sm:text-lg mb-3">{section.heading}</h2>

          <div className="space-y-3">
            {section.paragraphs?.map((p, i) => (
              <p key={i} className="text-sm sm:text-[15px] text-slate-300 leading-relaxed">
                {p}
              </p>
            ))}

            {section.steps?.length > 0 && (
              <ol className="space-y-2 list-decimal list-inside marker:text-green-500 marker:font-semibold">
                {section.steps.map((s, i) => (
                  <li key={i} className="text-sm sm:text-[15px] text-slate-300 leading-relaxed pl-1">
                    {s}
                  </li>
                ))}
              </ol>
            )}

            {section.bullets?.length > 0 && (
              <ul className="space-y-2 list-disc list-inside marker:text-slate-600">
                {section.bullets.map((b, i) => (
                  <li key={i} className="text-sm sm:text-[15px] text-slate-300 leading-relaxed pl-1">
                    {b}
                  </li>
                ))}
              </ul>
            )}

            {section.tips?.length > 0 && (
              <div className="space-y-2 pt-1">
                {section.tips.map((t, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 bg-green-950/20 border border-green-900/40 rounded-xl px-3.5 py-2.5"
                  >
                    <Lightbulb size={14} className="text-green-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-green-200/90 leading-relaxed">{t}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  )
}
