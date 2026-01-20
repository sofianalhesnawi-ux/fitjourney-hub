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
  FileJson,
  Globe
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
    clearAllData,
    t,
    language,
    setLanguage
  } = useFitTrack();
  
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [mergeOnImport, setMergeOnImport] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    exportData();
    toast.success(t.settings.dataExported);
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
        toast.success(mergeOnImport ? t.settings.dataMerged : t.settings.dataImported);
        setImportDialogOpen(false);
      } else {
        toast.error(t.settings.importFailed);
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
    toast.success(t.settings.dataCleared);
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
          <h1 className="text-2xl font-bold text-foreground">{t.settings.title}</h1>
          <p className="text-muted-foreground">{t.settings.subtitle}</p>
        </div>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            {t.settings.appearance}
          </CardTitle>
          <CardDescription>
            {t.settings.customizeLook}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Language */}
          <div>
            <Label className="text-base mb-3 block flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {t.settings.language}
            </Label>
            <div className="flex gap-2">
              <Button
                variant={language === 'en' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLanguage('en')}
                className="flex-1"
              >
                {t.settings.english}
              </Button>
              <Button
                variant={language === 'ar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLanguage('ar')}
                className="flex-1"
              >
                {t.settings.arabic}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Theme */}
          <div>
            <Label className="text-base mb-3 block">{t.settings.theme}</Label>
            <div className="flex gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
                className="flex-1"
              >
                <Sun className="h-4 w-4 me-2" />
                {t.settings.light}
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
                className="flex-1"
              >
                <Moon className="h-4 w-4 me-2" />
                {t.settings.dark}
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('system')}
                className="flex-1"
              >
                <Monitor className="h-4 w-4 me-2" />
                {t.settings.system}
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
            {t.settings.dataManagement}
          </CardTitle>
          <CardDescription>
            {t.settings.dataManagementDesc}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Storage Info */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t.settings.storageUsage}</span>
              <span className="text-sm text-muted-foreground">{dataSizeKB} KB</span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              <p>• {data.workoutTemplates.length} {t.settings.workoutTemplates}</p>
              <p>• {data.workoutLogs.length} {t.settings.workoutLogs}</p>
              <p>• {data.meals.length} {t.settings.mealsLogged}</p>
              <p>• {data.weightEntries.length} {t.settings.weightEntries}</p>
              <p>• {data.progressPhotos.length} {t.settings.progressPhotos}</p>
            </div>
          </div>

          <Separator />

          {/* Export */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{t.settings.exportData}</h4>
              <p className="text-sm text-muted-foreground">
                {t.settings.exportDataDesc}
              </p>
            </div>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 me-2" />
              {t.common.export}
            </Button>
          </div>

          <Separator />

          {/* Import */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{t.settings.importData}</h4>
              <p className="text-sm text-muted-foreground">
                {t.settings.importDataDesc}
              </p>
            </div>
            <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
              <Upload className="h-4 w-4 me-2" />
              {t.common.import}
            </Button>
          </div>

          <Separator />

          {/* Clear Data */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-destructive">{t.settings.clearAllData}</h4>
              <p className="text-sm text-muted-foreground">
                {t.settings.clearAllDataDesc}
              </p>
            </div>
            <Button variant="destructive" onClick={() => setClearDialogOpen(true)}>
              <Trash2 className="h-4 w-4 me-2" />
              {t.common.clear}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>{t.settings.aboutFitTrack}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>{t.settings.aboutDesc}</p>
          <p>{t.settings.aboutPrivacy}</p>
          <p className="pt-2 text-xs">
            {t.settings.version} 1.0.0
          </p>
        </CardContent>
      </Card>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.settings.importDialogTitle}</DialogTitle>
            <DialogDescription>
              {t.settings.importDialogDesc}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="merge-switch">{t.settings.mergeWithExisting}</Label>
                <p className="text-xs text-muted-foreground">
                  {t.settings.mergeDisabledWarning}
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
                  {t.settings.replaceWarning}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleImportClick}>
              <Upload className="h-4 w-4 me-2" />
              {t.settings.chooseFile}
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
              {t.settings.clearDialogTitle}
            </DialogTitle>
            <DialogDescription>
              {t.settings.clearDialogDesc}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm font-medium">{t.settings.youWillLose}</p>
            <ul className="mt-2 text-sm text-muted-foreground space-y-1">
              <li>• {data.workoutTemplates.length} {t.settings.workoutTemplates}</li>
              <li>• {data.workoutLogs.length} {t.settings.workoutLogs}</li>
              <li>• {data.meals.length} {t.settings.mealsLogged}</li>
              <li>• {data.weightEntries.length} {t.settings.weightEntries}</li>
              <li>• {data.bodyCompositions.length} {t.settings.bodyCompositionRecords}</li>
              <li>• {data.bodyMeasurements.length} {t.settings.bodyMeasurements}</li>
              <li>• {data.progressPhotos.length} {t.settings.progressPhotos}</li>
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearDialogOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button variant="destructive" onClick={handleClearData}>
              <Trash2 className="h-4 w-4 me-2" />
              {t.settings.deleteEverything}
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
