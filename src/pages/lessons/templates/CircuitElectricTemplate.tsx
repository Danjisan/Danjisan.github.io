import { useMemo, useState } from "react";
import type { TemplateProps } from "./types";
import { parseCircuitMetadata } from "./circuit/parseMetadata";
import ChallengeBanner from "./circuit/components/ChallengeBanner";
import CircuitWorkbench from "./circuit/components/CircuitWorkbench";
import ComponentInfoPanel from "./circuit/components/ComponentInfoPanel";
import ComponentPalette from "./circuit/components/ComponentPalette";
import type { ComponentType } from "./circuit/types";

export default function CircuitElectricTemplate({ lesson }: TemplateProps) {
  const { metadata, schemaComplete } = useMemo(
    () => parseCircuitMetadata(lesson.metadata),
    [lesson.metadata],
  );

  const [selectedType, setSelectedType] = useState<ComponentType | null>(null);

  const sortedChallenges = [...metadata.challenges].sort((a, b) => a.order - b.order);
  const activeChallenge = sortedChallenges[0] ?? null;
  const lockedChallenges = sortedChallenges.slice(1);

  const selectedModel = selectedType ? metadata.models[selectedType] : null;

  return (
    <div className="template-circuit">
      <p className="template-description">{lesson.description}</p>

      {activeChallenge ? (
        <ChallengeBanner
          active={activeChallenge}
          locked={lockedChallenges}
          schemaComplete={schemaComplete}
        />
      ) : (
        <p className="circuit-schema-notice">Nicio provocare definită în metadata lecției.</p>
      )}

      <div className="circuit-workspace">
        <ComponentPalette
          components={metadata.components}
          models={metadata.models}
          selected={selectedType}
          onSelect={setSelectedType}
        />
        <CircuitWorkbench hints={metadata.workbench_hints} />
      </div>

      <ComponentInfoPanel type={selectedType} model={selectedModel} />
    </div>
  );
}
