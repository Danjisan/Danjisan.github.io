import { useState } from "react";

interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
}

/**
 * Fațadă ușoară: afișează doar thumbnail-ul; iframe-ul YouTube real
 * (care e greu, ~1MB) se încarcă abia la click pe play.
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
    </button>
  );
}
