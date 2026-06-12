import { notFound } from 'next/navigation'
import connectDB from '@/lib/db/mongoose'
import Race from '@/lib/db/models/Race'
import ReactMarkdown from 'react-markdown'

interface Props {
  params: Promise<{ slug: string }>
}

const cardClass = 'rounded-xl border border-slate-700 bg-slate-900/60 p-5'
const sectionTitle = 'text-base font-semibold text-white mb-3'
const mdComponents = {
  p: ({ children }: any) => (
    <p className="mb-3 last:mb-0 text-slate-300">{children}</p>
  ),
  strong: ({ children }: any) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
}

export default async function RacePage({ params }: Props) {
  const { slug } = await params
  await connectDB()
  const race = await Race.findOne({ slug }).lean()
  if (!race) notFound()
  const r = race as any

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-white">
          {r.name_uk || r.name_en}
        </h1>
        {r.name_uk && <p className="text-slate-400">{r.name_en}</p>}
        {r.document_title && (
          <p className="text-xs text-slate-600 mt-1">{r.document_title}</p>
        )}
      </div>

      <div className={cardClass}>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-slate-500">Швидкість: </span>
            <span className="text-slate-300">{r.speed} фут.</span>
          </div>
          {(r.asi_desc_uk || r.asi_desc) && (
            <div className="text-slate-300">
              <ReactMarkdown components={mdComponents}>
                {r.asi_desc_uk || r.asi_desc}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>

      {[
        { title: 'Розмір', en: r.size, uk: r.size_uk },
        { title: 'Мови', en: r.languages, uk: r.languages_uk },
        { title: 'Зір', en: r.vision, uk: r.vision_uk },
        { title: 'Вік', en: r.age, uk: r.age_uk },
        { title: 'Мировозрення', en: r.alignment, uk: r.alignment_uk },
        { title: 'Расові риси', en: r.traits, uk: r.traits_uk },
      ]
        .filter((s) => s.en || s.uk)
        .map((section) => (
          <div key={section.title} className={cardClass}>
            <h2 className={sectionTitle}>{section.title}</h2>
            <div className="text-sm leading-relaxed">
              <ReactMarkdown components={mdComponents}>
                {section.uk || section.en}
              </ReactMarkdown>
            </div>
          </div>
        ))}

      {r.subraces?.length > 0 && (
        <div className={cardClass}>
          <h2 className={sectionTitle}>Підраси</h2>
          <div className="space-y-6">
            {r.subraces.map((sub: any, i: number) => (
              <div
                key={i}
                className="border-t border-slate-700 pt-4 first:border-0 first:pt-0"
              >
                <h3 className="font-semibold text-white mb-2">
                  {sub.name_uk || sub.name}
                </h3>
                {[
                  sub.desc_uk || sub.desc,
                  sub.asi_desc_uk || sub.asi_desc,
                  sub.traits_uk || sub.traits,
                ]
                  .filter(Boolean)
                  .map((text, j) => (
                    <div key={j} className="text-sm mb-2">
                      <ReactMarkdown components={mdComponents}>
                        {text}
                      </ReactMarkdown>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
