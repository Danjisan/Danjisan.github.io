import { useState } from "react";

interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
}

/**
 * Fațadă: thumbnail + play. Iframe YouTube (youtube-nocookie) doar după click —
 * reduce cookies third-party până la interacțiune explicită.
 */
export default function YouTubeEmbed({ videoId, title }: YouTubeEmbedProps) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        className="yt-iframe"
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
        title={title ?? "Video YouTube"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      className="yt-facade"
      aria-label={`Redă video: ${title ?? videoId}`}
      onClick={() => setPlaying(true)}
    >
      <img
        src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
        alt=""
        loading="lazy"
      />
      <span className="yt-play" aria-hidden="true">
        ▶
      </span>
      <span className="yt-privacy-hint">
        Play încarcă YouTube (privacy-enhanced)
      </span>
    </button>
  );
}
