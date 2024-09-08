import mermaid from "mermaid";
import { useEffect, useRef } from "react";

const MermaidDiagram = ({ chart }: { chart: string }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    mermaid.initialize({
      theme: "forest", // or 'forest', 'dark', 'neutral', etc.
      themeVariables: {
        primaryColor: "#ff6347",
        edgeLabelBackground: "#ffffff",
        tertiaryColor: "#eeeeee",
      },
      startOnLoad: true,
    });
    mermaid.contentLoaded(); // Render the diagram when the component is mounted
  }, [chart]);

  return (
    <div ref={chartRef} className="mermaid">
      {chart}
    </div>
  );
};

export default MermaidDiagram;
