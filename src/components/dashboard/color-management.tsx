import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const colorVariables = [
  { name: "Primary", var: "--primary", default: "#0420bf", presets: ["#0420bf", "#2563eb", "#1e293b"] },
  { name: "Primary Foreground", var: "--primary-foreground", default: "#fbfbfb", presets: ["#fbfbfb", "#ffffff", "#f3f4f6"] },
  { name: "Secondary", var: "--secondary", default: "#fbfb40", presets: ["#fbfb40", "#fde047", "#fbbf24"] },
  { name: "Secondary Foreground", var: "--secondary-foreground", default: "#222222", presets: ["#222222", "#1e293b", "#374151"] },
  { name: "Accent", var: "--accent", default: "#f50ca0", presets: ["#f50ca0", "#db2777", "#a21caf"] },
  { name: "Accent Foreground", var: "--accent-foreground", default: "#fbfbfb", presets: ["#fbfbfb", "#ffffff", "#f3f4f6"] },
];


export function ColorManagement() {
  const [colors, setColors] = React.useState<Record<string, string>>(() =>
    colorVariables.reduce((acc, curr) => {
      acc[curr.var] = curr.default;
      return acc;
    }, {} as Record<string, string>)
  );

  const handleColorChange = (variable: string, value: string) => {
    setColors((prev: Record<string, string>) => ({ ...prev, [variable]: value }));
    // No live update; only update state
  };

  return (
  <Card className="max-w-5xl mx-auto mt-8 shadow-xl border-2 border-gray-100">
      <CardHeader>
        <CardTitle>Site Color Controls</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {colorVariables.map((color) => (
            <div key={color.var} className="flex flex-col gap-4 p-6 rounded-xl border bg-white shadow-md">
              <label className="font-semibold mb-1 text-lg" htmlFor={color.var}>{color.name}</label>
              <div className="flex gap-2 mb-2 flex-wrap">
                {color.presets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${colors[color.var] === preset ? 'border-blue-500 scale-110' : 'border-gray-300'} transition-all duration-150`}
                    style={{ background: preset }}
                    onClick={() => handleColorChange(color.var, preset)}
                    title={`Preset: ${preset}`}
                  />
                ))}
              </div>
              <input
                id={color.var}
                type="color"
                value={colors[color.var]}
                onChange={(e) => handleColorChange(color.var, e.target.value)}
                className="w-12 h-12 border-2 rounded-lg shadow"
              />
              <Badge className="mt-2 text-xs px-2 py-1 bg-gray-50 border border-gray-200" variant="outline">
                {colors[color.var]}
              </Badge>
              <div className="flex items-center justify-center mt-4">
                <div
                  className="w-full h-14 rounded-xl border flex items-center justify-center shadow-lg px-4"
                  style={{ background: colors[color.var], color: color.var.includes('foreground') ? '#222' : '#fff', borderColor: colors[color.var] }}
                >
                  <span className="font-bold text-lg drop-shadow text-center" style={{maxWidth: '100%', whiteSpace: 'normal', overflowWrap: 'break-word'}}>{color.name} Preview</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-10 justify-end">
          <Button variant="default" size="lg" onClick={() => { /* Save to backend (future) */ }}>
            Save Colors
          </Button>
          <Button variant="outline" size="lg" onClick={() => { /* Revert to default (future) */ }}>
            Revert to Default
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
