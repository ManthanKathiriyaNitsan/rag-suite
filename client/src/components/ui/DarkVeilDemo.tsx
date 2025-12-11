import { useState } from 'react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Slider } from './slider';
import ResponsiveDarkVeil from './ResponsiveDarkVeil';

export function DarkVeilDemo() {
  const [showDemo, setShowDemo] = useState(false);
  const [hueShift, setHueShift] = useState(0);
  const [speed, setSpeed] = useState(0.5);
  const [warpAmount, setWarpAmount] = useState(0.5);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>DarkVeil Background Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This demo shows how to use the DarkVeil background effect. 
            The background is theme-aware and responsive.
          </p>
          
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium">Hue Shift: {hueShift}°</label>
              <Slider
                value={[hueShift]}
                onValueChange={(value) => setHueShift(value[0])}
                max={360}
                min={0}
                step={1}
                className="mt-2"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Speed: {speed.toFixed(1)}x</label>
              <Slider
                value={[speed]}
                onValueChange={(value) => setSpeed(value[0])}
                max={2}
                min={0.1}
                step={0.1}
                className="mt-2"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Warp Amount: {warpAmount.toFixed(1)}</label>
              <Slider
                value={[warpAmount]}
                onValueChange={(value) => setWarpAmount(value[0])}
                max={1}
                min={0}
                step={0.1}
                className="mt-2"
              />
            </div>
          </div>

          <Button onClick={() => setShowDemo(!showDemo)}>
            {showDemo ? 'Hide Demo' : 'Show Demo'}
          </Button>
        </CardContent>
      </Card>

      {showDemo && (
        <div className="relative h-96 rounded-lg overflow-hidden border">
          <ResponsiveDarkVeil 
            className="absolute inset-0"
            hueShift={hueShift}
            speed={speed}
            warpAmount={warpAmount}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Card className="bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold">Content Over DarkVeil</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  This content appears over the animated background
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
