import type { CSSProperties } from "react";
import type { MediaContent } from "./types";
import YouTubeEmbed from "./YouTubeEmbed";
import ModelBox from "./ModelBox";

interface MediaBoxProps {
  media: MediaContent;
  /**
   * Raport lățime/înălțime al casetei, ex. 1 (pătrat), 16/9.
   * Default: model 3D → 1 (pătrat), YouTube → 16/9, imagine → proporția naturală.
   */
  aspect?: number;
}

/**
 * Caseta nu depășește niciodată ~72% din înălțimea ecranului: dacă nu
 * încape (ex. mobil în landscape), se micșorează și se centrează, ca să
 * rămână mereu vizibilă întreagă și cu pagină în jurul ei.
 */
function frameStyle(aspect: number): CSSProperties {
  return {
    aspectRatio: aspect,
    maxWidth: `min(100%, calc(72svh * ${aspect}))`,
    marginInline: "auto",
  };
}

export default function MediaBox({ media, aspect }: MediaBoxProps) {
  switch (media.kind) {
    case "image":
      return (
        <figure
          className="media-box"
          style={aspect ? frameStyle(aspect) : undefined}
        >
          <img src={media.src} alt={media.alt} loading="lazy" />
        </figure>
      );
    case "youtube":
      return (
        <div className="media-box" style={frameStyle(aspect ?? 16 / 9)}>
          <YouTubeEmbed videoId={media.videoId} title={media.title} />
        </div>
      );
    case "model":
      return (
        <div className="media-box media-box-3d" style={frameStyle(aspect ?? 1)}>
          <ModelBox src={media.src} settings={media.settings} />
        </div>
      );
  }
}
