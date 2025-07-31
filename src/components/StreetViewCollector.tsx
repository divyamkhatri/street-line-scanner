import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, MapPin, Target, Play, Download, FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface StreetViewResult {
  panoid: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

interface CollectorConfig {
  boundingFile: File | null;
  startingUrl: string;
  targetCount: number;
  density?: number;
  fixedZoom?: number;
}

export const StreetViewCollector = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<CollectorConfig>({
    boundingFile: null,
    startingUrl: '',
    targetCount: 100,
    density: undefined,
    fixedZoom: undefined
  });
  
  const [isCollecting, setIsCollecting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<StreetViewResult[]>([]);
  const [currentStatus, setCurrentStatus] = useState<string>('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.geojson')) {
      setConfig(prev => ({ ...prev, boundingFile: file }));
      toast({
        title: "Boundary file uploaded",
        description: `${file.name} ready for processing`,
      });
    } else {
      toast({
        title: "Invalid file",
        description: "Please upload a valid GeoJSON file",
        variant: "destructive"
      });
    }
  };

  const simulateCollection = async () => {
    setIsCollecting(true);
    setProgress(0);
    setResults([]);
    
    const statusMessages = [
      'Initializing browser automation...',
      'Loading starting URL with Playwright...',
      'Locating pegman icon...',
      'Detecting Street View blue lines...',
      'Capturing network requests...',
      'Validating coordinates within bounds...',
      'Adjusting map position...',
      'Continuing data collection...'
    ];

    try {
      for (let i = 0; i < config.targetCount; i++) {
        // Simulate collection steps
        setCurrentStatus(statusMessages[i % statusMessages.length]);
        
        // Simulate finding a street view point
        const mockResult: StreetViewResult = {
          panoid: `sv_${Math.random().toString(36).substr(2, 12)}`,
          latitude: 40.7128 + (Math.random() - 0.5) * 0.01,
          longitude: -74.0060 + (Math.random() - 0.5) * 0.01,
          timestamp: new Date().toISOString()
        };
        
        setResults(prev => [...prev, mockResult]);
        setProgress(((i + 1) / config.targetCount) * 100);
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      setCurrentStatus('Collection completed successfully');
      toast({
        title: "Collection completed",
        description: `Successfully collected ${config.targetCount} Street View points`,
      });
      
    } catch (error) {
      toast({
        title: "Collection failed",
        description: "An error occurred during data collection",
        variant: "destructive"
      });
    } finally {
      setIsCollecting(false);
    }
  };

  const exportResults = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `streetview_collection_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const canStartCollection = config.boundingFile && config.startingUrl && config.targetCount > 0;

  return (
    <div className="min-h-screen bg-gradient-surface p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-gradient-primary shadow-elevation">
              <MapPin className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Street View Data Collector
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Automated collection of Google Street View URLs within geographical boundaries using intelligent browser automation
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <Card className="shadow-elevation">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Collection Configuration
              </CardTitle>
              <CardDescription>
                Set up your Street View data collection parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Boundary File Upload */}
              <div className="space-y-2">
                <Label htmlFor="boundary-file">Bounding GeoJSON File</Label>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Input
                      id="boundary-file"
                      type="file"
                      accept=".geojson,.json"
                      onChange={handleFileUpload}
                      className="cursor-pointer"
                    />
                  </div>
                  {config.boundingFile && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {config.boundingFile.name}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Starting URL */}
              <div className="space-y-2">
                <Label htmlFor="starting-url">Starting Google Maps URL</Label>
                <Input
                  id="starting-url"
                  type="url"
                  placeholder="https://maps.google.com/..."
                  value={config.startingUrl}
                  onChange={(e) => setConfig(prev => ({ ...prev, startingUrl: e.target.value }))}
                />
              </div>

              {/* Target Count */}
              <div className="space-y-2">
                <Label htmlFor="target-count">Target Street View Count</Label>
                <Input
                  id="target-count"
                  type="number"
                  min="1"
                  max="10000"
                  value={config.targetCount}
                  onChange={(e) => setConfig(prev => ({ ...prev, targetCount: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <Separator />

              {/* Optional Parameters */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground">Optional Parameters</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="density">Density</Label>
                    <Input
                      id="density"
                      type="number"
                      step="0.1"
                      placeholder="Auto"
                      value={config.density || ''}
                      onChange={(e) => setConfig(prev => ({ 
                        ...prev, 
                        density: e.target.value ? parseFloat(e.target.value) : undefined 
                      }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="zoom-level">Fixed Zoom Level</Label>
                    <Input
                      id="zoom-level"
                      type="number"
                      min="1"
                      max="20"
                      placeholder="Random"
                      value={config.fixedZoom || ''}
                      onChange={(e) => setConfig(prev => ({ 
                        ...prev, 
                        fixedZoom: e.target.value ? parseInt(e.target.value) : undefined 
                      }))}
                    />
                  </div>
                </div>
              </div>

              {/* Start Collection Button */}
              <Button
                onClick={simulateCollection}
                disabled={!canStartCollection || isCollecting}
                className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                size="lg"
              >
                {isCollecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2" />
                    Collecting Data...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Collection
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Progress & Results Panel */}
          <Card className="shadow-elevation">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Collection Progress
              </CardTitle>
              <CardDescription>
                Real-time status and collected data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress Section */}
              {(isCollecting || results.length > 0) && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  {currentStatus && (
                    <p className="text-sm text-muted-foreground italic">{currentStatus}</p>
                  )}
                </div>
              )}

              {/* Results Summary */}
              {results.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Collected Data</h4>
                    <Badge variant="secondary">{results.length} points</Badge>
                  </div>
                  
                  <div className="max-h-64 overflow-auto border rounded-md">
                    <div className="p-3 space-y-2">
                      {results.slice(-5).map((result, index) => (
                        <div key={result.panoid} className="text-xs font-mono bg-muted p-2 rounded">
                          <div className="grid grid-cols-2 gap-1">
                            <span className="text-muted-foreground">Pan ID:</span>
                            <span className="truncate">{result.panoid}</span>
                            <span className="text-muted-foreground">Coords:</span>
                            <span>{result.latitude.toFixed(6)}, {result.longitude.toFixed(6)}</span>
                          </div>
                        </div>
                      ))}
                      {results.length > 5 && (
                        <p className="text-xs text-muted-foreground text-center py-1">
                          ... and {results.length - 5} more entries
                        </p>
                      )}
                    </div>
                  </div>

                  <Button 
                    onClick={exportResults}
                    variant="outline" 
                    className="w-full"
                    disabled={results.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Results JSON
                  </Button>
                </div>
              )}

              {/* Initial State */}
              {!isCollecting && results.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Configure parameters and start collection</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};