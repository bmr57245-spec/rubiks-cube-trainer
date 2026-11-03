"use client";

import { useState } from "react";
import { LESSON_VIDEOS, OWAIS_CHANNEL_URL } from "@/lib/videos";

// خانة الفيديو داخل الدرس: تعرض صورة مصغّرة خفيفة ولا تحمّل مشغّل يوتيوب إلا عند الضغط
export function VideoLesson({ lessonId }: { lessonId: string }) {
  const videos = LESSON_VIDEOS[lessonId] ?? [];
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const v = videos[idx];

  return (
    <section className="card overflow-hidden" aria-label="شرح بالفيديو">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3">
        <h2 className="flex items-center gap-2 text-lg font-extrabold">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#ff0033] text-sm text-white">▶</span>
          شرح بالفيديو — أويس روبيك
        </h2>
        <a href={OWAIS_CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-accent hover:underline">
          زيارة القناة ↗
        </a>
      </div>

      {v ? (
        <>
          <div className="relative aspect-video w-full bg-black">
            {playing ? (
              <iframe
                className="absolute inset-0 h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0&hl=ar`}
                title={v.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <button
                className="group absolute inset-0 h-full w-full"
                onClick={() => setPlaying(true)}
                aria-label={`تشغيل: ${v.title}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover opacity-90 transition group-hover:opacity-100"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <span className="absolute inset-0 m-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#ff0033] text-2xl text-white shadow-lg transition group-hover:scale-110">
                  ▶
                </span>
                <span className="absolute inset-x-0 bottom-0 p-4 text-start font-bold text-white">{v.title}</span>
              </button>
            )}
          </div>
          {videos.length > 1 && (
            <div className="flex flex-wrap gap-2 p-3">
              {videos.map((x, i) => (
                <button
                  key={x.id + i}
                  onClick={() => {
                    setIdx(i);
                    setPlaying(false);
                  }}
                  className={`btn btn-sm ${i === idx ? "!border-accent text-accent" : ""}`}
                >
                  🎬 {i + 1}. {x.title}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="p-5 text-muted">
          لا يوجد فيديو مخصّص لهذا الدرس بعد. تصفّح شروحات قناة أويس روبيك على يوتيوب للمزيد.
        </div>
      )}
    </section>
  );
}
