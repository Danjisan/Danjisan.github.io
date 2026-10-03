import { useState } from "react";

interface YouTubeEmbedProps {
  /** Clip singular (pagina Proiecte etc.). */
  videoId?: string;
  /** Playlist YouTube — ex. homepage ambient. */
  playlistId?: string;
  title?: string;
  /**
   * Autoplay + mute + loop, fără fațadă.
   * Respectă prefers-reduced-motion (atunci rămâne click-to-play).
   */
  ambient?: boolean;
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function buildEmbedSrc(
  videoId: string | undefined,
  playlistId: string | undefined,
  ambient: boolean,
) {
  const params = new URLSearchParams({ autoplay: "1" });

  if (ambient) {
    params.set("mute", "1");
    params.set("loop", "1");
    params.set("playsinline", "1");
    params.set("rel", "0");
    params.set("modestbranding", "1");
    // Controale vizibile ca să poți da unmute / pauză / skip în playlist
    params.set("controls", "1");
    params.set("iv_load_policy", "3");
  }

  if (playlistId) {
    params.set("list", playlistId);
    return `https://www.youtube-nocookie.com/embed/videoseries?${params}`;
  }

  if (!videoId) {
    throw new Error("YouTubeEmbed: videoId sau playlistId este obligatoriu");
  }

  if (ambient) {
    params.set("playlist", videoId);
  }

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params}`;
}

/**
 * Implicit: thumbnail + play, iframe doar după click.
 * Cu ambient: pornește automat pe mute, în loop (clip sau playlist).
 */
export default function YouTubeEmbed({
  videoId,
  playlistId,
  title = "Video YouTube",
  ambient = false,
}: YouTubeEmbedProps) {
  const [playing, setPlaying] = useState(
    () => ambient && !prefersReducedMotion(),
  );

  if (playing) {
    return (
      <iframe
        className="yt-iframe"
        src={buildEmbedSrc(videoId, playlistId, ambient)}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      className="yt-facade"
      aria-label={`Redă video: ${title}`}
      onClick={() => setPlaying(true)}
    >
      {videoId ? (
        <img
          src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
          alt=""
          loading="lazy"
        />
      ) : (
        <span className="yt-facade-blank" aria-hidden="true" />
      )}
      <span className="yt-play" aria-hidden="true">
        ▶
      </span>
      <span className="yt-privacy-hint">
        Play încarcă YouTube (privacy-enhanced)
      </span>
    </button>
  );
}
