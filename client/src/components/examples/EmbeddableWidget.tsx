import { useState } from "react";
import { EmbeddableWidget } from "../EmbeddableWidget";

export default function EmbeddableWidgetExample() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="h-screen bg-background relative">
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Example Website</h2>
        <p className="text-muted-foreground mb-4">
          This demonstrates how the embeddable widget would appear on a client's website.
          The widget is positioned in the bottom-right corner.
        </p>
        <div className="space-y-4">
          <div className="bg-card p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Sample Content</h3>
            <p className="text-sm text-muted-foreground">
              This is example content on the host website. Users can interact with the 
              AI widget to get help and search through documentation.
            </p>
          </div>
        </div>
      </div>
      
      <EmbeddableWidget
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        title="AI Assistant"
        showPoweredBy={true}
      />
    </div>
  );
}