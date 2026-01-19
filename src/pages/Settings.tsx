import { useState, useRef } from 'react';
import { useFitTrack } from '@/contexts/FitTrackContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Settings as SettingsIcon, 
  Download, 
  Upload, 
  Trash2, 
  Moon, 
  Sun,
  Monitor,
  AlertTriangle,
  CheckCircle,
  FileJson
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function Settings() {
  const { 
    data, 
    theme, 
    setTheme, 
    exportData, 
    importData, 
    clearAllData 
  } = useFitTrack();
  
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [mergeOnImport, setMergeOnImport] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    exportData();
    toast.success('Data exported successfully!');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      const success = importData(content, mergeOnImport);
      if (success) {
        toast.success(mergeOnImport ? 'Data merged successfully!' : 'Data imported successfully!');
        setImportDialogOpen(false);
      } else {
        toast.error('Failed to import data. Please check the file format.');
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearData = () => {
    clearAllData();
    setClearDialogOpen(false);
    toast.success('All data has been cleared.');
  };

  // Calculate storage stats
  const dataSize = new Blob([JSON.stringify(data)]).size;
  const dataSizeKB = (dataSize / 1024).toFixed(2);

  return (
    <motion.div 
      className="space-y-6 pb-20 lg:pb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your app preferences and data</p>
        </div>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize how FitTrack looks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-base mb-3 block">Theme</Label>
            <div className="flex gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
                className="flex-1"
              >
                <Sun className="h-4 w-4 mr-2" />
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
                className="flex-1"
              >
                <Moon className="h-4 w-4 mr-2" />
                Dark
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('system')}
                className="flex-1"
              >
                <Monitor className="h-4 w-4 mr-2" />
                System
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Export, import, or clear your fitness data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Storage Info */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Local Storage Usage</span>
              <span className="text-sm text-muted-foreground">{dataSizeKB} KB</span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              <p>• {data.workoutTemplates.length} workout templates</p>
              <p>• {data.workoutLogs.length} workout logs</p>
              <p>• {data.meals.length} meals logged</p>
              <p>• {data.weightEntries.length} weight entries</p>
              <p>• {data.progressPhotos.length} progress photos</p>
            </div>
          </div>

          <Separator />

          {/* Export */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Export Data</h4>
              <p className="text-sm text-muted-foreground">
                Download all your data as a JSON file
              </p>
            </div>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <Separator />

          {/* Import */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Import Data</h4>
              <p className="text-sm text-muted-foreground">
                Restore data from a backup file
              </p>
            </div>
            <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </div>

          <Separator />

          {/* Clear Data */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-destructive">Clear All Data</h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete all your data
              </p>
            </div>
            <Button variant="destructive" onClick={() => setClearDialogOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>About FitTrack</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            FitTrack is a personal fitness progress tracker that helps you monitor your workouts, 
            nutrition, body metrics, and goals.
          </p>
          <p>
            All your data is stored locally in your browser. No account needed, completely private.
          </p>
          <p className="pt-2 text-xs">
            Version 1.0.0
          </p>
        </CardContent>
      </Card>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Data</DialogTitle>
            <DialogDescription>
              Upload a FitTrack backup file to restore your data.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="merge-switch">Merge with existing data</Label>
                <p className="text-xs text-muted-foreground">
                  If disabled, existing data will be replaced
                </p>
              </div>
              <Switch
                id="merge-switch"
                checked={mergeOnImport}
                onCheckedChange={setMergeOnImport}
              />
            </div>
            
            {!mergeOnImport && (
              <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg text-sm">
                <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                <p className="text-warning">
                  This will replace all your current data with the imported file.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImportClick}>
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear Data Dialog */}
      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Clear All Data
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. All your fitness data including workouts, 
              meals, measurements, and progress photos will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm font-medium">You will lose:</p>
            <ul className="mt-2 text-sm text-muted-foreground space-y-1">
              <li>• {data.workoutTemplates.length} workout templates</li>
              <li>• {data.workoutLogs.length} workout logs</li>
              <li>• {data.meals.length} meals logged</li>
              <li>• {data.weightEntries.length} weight entries</li>
              <li>• {data.bodyCompositions.length} body composition records</li>
              <li>• {data.bodyMeasurements.length} body measurements</li>
              <li>• {data.progressPhotos.length} progress photos</li>
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearData}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileSelect}
      />
    </motion.div>
  );
}
