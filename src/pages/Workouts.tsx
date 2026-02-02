import { useState } from 'react';
import { useFitTrack } from '@/contexts/FitTrackContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Dumbbell, Play, Trash2, Edit2, Calendar, ChevronRight, ChevronLeft, X } from 'lucide-react';
import { cn, generateId, formatDate, getToday } from '@/lib/utils';
import type { WorkoutTemplate, Exercise, WorkoutLog, ExerciseLog, SetLog } from '@/types/fitness';
import { motion, AnimatePresence } from 'framer-motion';
import { WorkoutCompleteCelebration, CheckmarkCelebration } from '@/components/Celebration';

export default function Workouts() {
  const { data, addWorkoutTemplate, updateWorkoutTemplate, deleteWorkoutTemplate, addWorkoutLog, t, isRTL } = useFitTrack();
  
  // RTL-aware chevron for list items
  const ListChevron = isRTL ? ChevronLeft : ChevronRight;
  
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateExercises, setTemplateExercises] = useState<Exercise[]>([]);
  const [logDate, setLogDate] = useState(getToday());
  const [logExercises, setLogExercises] = useState<ExerciseLog[]>([]);
  const [logNotes, setLogNotes] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [completedSets, setCompletedSets] = useState<Record<string, boolean>>({});

  const resetTemplateForm = () => { setTemplateName(''); setTemplateExercises([]); setEditingTemplate(null); };
  const openEditTemplate = (template: WorkoutTemplate) => { setEditingTemplate(template); setTemplateName(template.name); setTemplateExercises([...template.exercises]); setIsTemplateDialogOpen(true); };
  const addExercise = () => { setTemplateExercises([...templateExercises, { id: generateId(), name: '', sets: 3, reps: 10 }]); };
  const updateExercise = (index: number, field: keyof Exercise, value: string | number) => { const updated = [...templateExercises]; updated[index] = { ...updated[index], [field]: value }; setTemplateExercises(updated); };
  const removeExercise = (index: number) => { setTemplateExercises(templateExercises.filter((_, i) => i !== index)); };

  const saveTemplate = () => {
    if (!templateName.trim()) return;
    const now = new Date().toISOString();
    const template: WorkoutTemplate = { id: editingTemplate?.id || generateId(), name: templateName.trim(), exercises: templateExercises.filter(e => e.name.trim()), createdAt: editingTemplate?.createdAt || now, updatedAt: now };
    if (editingTemplate) { updateWorkoutTemplate(template); } else { addWorkoutTemplate(template); }
    setIsTemplateDialogOpen(false); resetTemplateForm();
  };

  const startWorkout = (template: WorkoutTemplate) => {
    setSelectedTemplate(template); setLogDate(getToday()); setLogNotes('');
    setLogExercises(template.exercises.map(ex => ({ id: generateId(), name: ex.name, sets: Array.from({ length: ex.sets }, () => ({ reps: ex.reps, weight: ex.weight, completed: false })) })));
    setIsLogDialogOpen(true);
  };

  const updateLogSet = (exerciseIndex: number, setIndex: number, field: keyof SetLog, value: number | boolean) => { 
    const updated = [...logExercises]; 
    updated[exerciseIndex].sets[setIndex] = { ...updated[exerciseIndex].sets[setIndex], [field]: value }; 
    setLogExercises(updated); 
  };
  
  const toggleSetComplete = (exerciseIndex: number, setIndex: number) => { 
    const setKey = `${exerciseIndex}-${setIndex}`;
    const isCompleting = !logExercises[exerciseIndex].sets[setIndex].completed;
    
    if (isCompleting) {
      setCompletedSets(prev => ({ ...prev, [setKey]: true }));
      setTimeout(() => setCompletedSets(prev => ({ ...prev, [setKey]: false })), 1500);
    }
    
    updateLogSet(exerciseIndex, setIndex, 'completed', isCompleting); 
  };

  const saveWorkoutLog = () => {
    const log: WorkoutLog = { id: generateId(), templateId: selectedTemplate?.id, templateName: selectedTemplate?.name, date: logDate, exercises: logExercises, notes: logNotes || undefined, createdAt: new Date().toISOString() };
    addWorkoutLog(log); 
    setIsLogDialogOpen(false); 
    setSelectedTemplate(null);
    setShowCelebration(true);
  };

  const sortedLogs = [...data.workoutLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <motion.div className="space-y-6 pb-20 lg:pb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.workouts.title}</h1>
          <p className="text-muted-foreground">{t.workouts.subtitle}</p>
        </div>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="templates">{t.workouts.templates}</TabsTrigger>
          <TabsTrigger value="history">{t.workouts.history}</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isTemplateDialogOpen} onOpenChange={(open) => { setIsTemplateDialogOpen(open); if (!open) resetTemplateForm(); }}>
              <DialogTrigger asChild><Button><Plus className="h-4 w-4 me-2" />{t.workouts.newTemplate}</Button></DialogTrigger>
              <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{editingTemplate ? t.workouts.editTemplate : t.workouts.createTemplate}</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-4">
                  <div><Label htmlFor="template-name">{t.workouts.templateName}</Label><Input id="template-name" placeholder={t.workouts.templateNamePlaceholder} value={templateName} onChange={(e) => setTemplateName(e.target.value)} /></div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between"><Label>{t.workouts.exercises}</Label><Button size="sm" variant="outline" onClick={addExercise}><Plus className="h-4 w-4 me-1" />{t.workouts.addExercise}</Button></div>
                    {templateExercises.map((exercise, index) => (
                      <div key={exercise.id} className="p-3 border rounded-lg space-y-3">
                        <div className="flex items-center gap-2"><Input placeholder={t.workouts.exerciseName} value={exercise.name} onChange={(e) => updateExercise(index, 'name', e.target.value)} className="flex-1" /><Button size="icon" variant="ghost" onClick={() => removeExercise(index)}><X className="h-4 w-4" /></Button></div>
                        <div className="grid grid-cols-3 gap-2">
                          <div><Label className="text-xs">{t.workouts.sets}</Label><Input type="number" min="1" value={exercise.sets} onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value) || 1)} /></div>
                          <div><Label className="text-xs">{t.workouts.reps}</Label><Input type="number" min="1" value={exercise.reps} onChange={(e) => updateExercise(index, 'reps', parseInt(e.target.value) || 1)} /></div>
                          <div><Label className="text-xs">{t.workouts.weightKg}</Label><Input type="number" min="0" step="0.5" value={exercise.weight || ''} onChange={(e) => updateExercise(index, 'weight', parseFloat(e.target.value) || undefined)} placeholder={t.common.optional} /></div>
                        </div>
                      </div>
                    ))}
                    {templateExercises.length === 0 && <p className="text-center text-muted-foreground py-4">{t.workouts.noExercisesAdded}</p>}
                  </div>
                  <Button onClick={saveTemplate} className="w-full">{editingTemplate ? t.workouts.updateTemplate : t.workouts.createTemplateBtn}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {data.workoutTemplates.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.workoutTemplates.map((template) => (
                <Card key={template.id} className="group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" onClick={() => openEditTemplate(template)}><Edit2 className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteWorkoutTemplate(template.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {template.exercises.slice(0, 3).map((exercise) => (<div key={exercise.id} className="flex items-center gap-2 text-sm"><Dumbbell className="h-4 w-4 text-muted-foreground" /><span>{exercise.name}</span><span className="text-muted-foreground ms-auto">{exercise.sets}×{exercise.reps}</span></div>))}
                      {template.exercises.length > 3 && <p className="text-sm text-muted-foreground">{t.workouts.moreExercises.replace('{0}', String(template.exercises.length - 3))}</p>}
                    </div>
                    <Button className="w-full" onClick={() => startWorkout(template)}><Play className="h-4 w-4 me-2" />{t.workouts.startWorkout}</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card><CardContent className="py-12 text-center"><Dumbbell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" /><h3 className="text-lg font-medium mb-2">{t.workouts.noTemplatesYet}</h3><p className="text-muted-foreground mb-4">{t.workouts.createFirstTemplate}</p></CardContent></Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {sortedLogs.length > 0 ? (
            <div className="space-y-3">
              {sortedLogs.map((log) => (
                <Card key={log.id}><CardContent className="py-4"><div className="flex items-center gap-4"><div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10"><Dumbbell className="h-6 w-6 text-primary" /></div><div className="flex-1 min-w-0"><h3 className="font-medium">{log.templateName || t.dashboard.customWorkout}</h3><div className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="h-4 w-4" />{formatDate(log.date)}<span>•</span><span>{log.exercises.length} {t.dashboard.exercises}</span></div></div><ListChevron className="h-5 w-5 text-muted-foreground" /></div>{log.notes && <p className="mt-3 text-sm text-muted-foreground ps-16">{log.notes}</p>}</CardContent></Card>
              ))}
            </div>
          ) : (
            <Card><CardContent className="py-12 text-center"><Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" /><h3 className="text-lg font-medium mb-2">{t.workouts.noWorkoutsLogged}</h3><p className="text-muted-foreground">{t.workouts.startFromTemplates}</p></CardContent></Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isLogDialogOpen} onOpenChange={setIsLogDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{selectedTemplate?.name || t.workouts.logWorkout}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div><Label htmlFor="log-date">{t.common.date}</Label><Input id="log-date" type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} /></div>
            <div className="space-y-4">
              {logExercises.map((exercise, exerciseIndex) => (
                <div key={exercise.id} className="p-3 border rounded-lg">
                  <h4 className="font-medium mb-3">{exercise.name}</h4>
                  <div className="space-y-2">
                    {exercise.sets.map((set, setIndex) => {
                      const setKey = `${exerciseIndex}-${setIndex}`;
                      return (
                        <div key={setIndex} className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground w-12">{t.workouts.set} {setIndex + 1}</span>
                          <Input type="number" placeholder={t.workouts.weight} value={set.weight || ''} onChange={(e) => updateLogSet(exerciseIndex, setIndex, 'weight', parseFloat(e.target.value))} className="w-20" />
                          <span className="text-muted-foreground">{t.common.kg}</span>
                          <Input type="number" placeholder={t.workouts.reps} value={set.reps} onChange={(e) => updateLogSet(exerciseIndex, setIndex, 'reps', parseInt(e.target.value))} className="w-16" />
                          <span className="text-muted-foreground">{t.workouts.reps}</span>
                          <div className="relative">
                            <Button 
                              size="sm" 
                              variant={set.completed ? 'default' : 'outline'} 
                              onClick={() => toggleSetComplete(exerciseIndex, setIndex)}
                              className="transition-all duration-200"
                            >
                              {set.completed ? '✓' : '○'}
                            </Button>
                            {completedSets[setKey] && (
                              <motion.div 
                                className="absolute -top-1 -right-1"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                              >
                                <CheckmarkCelebration isVisible size="sm" />
                              </motion.div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div><Label htmlFor="log-notes">{t.workouts.notesOptional}</Label><Textarea id="log-notes" placeholder={t.workouts.howDidWorkoutFeel} value={logNotes} onChange={(e) => setLogNotes(e.target.value)} /></div>
            <Button onClick={saveWorkoutLog} className="w-full">{t.workouts.saveWorkout}</Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Workout Complete Celebration */}
      <WorkoutCompleteCelebration 
        isVisible={showCelebration} 
        onClose={() => setShowCelebration(false)} 
      />
    </motion.div>
  );
}
