import { useState } from 'react';
import { useFitTrack } from '@/contexts/FitTrackContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Dumbbell, 
  Play, 
  Trash2, 
  Edit2, 
  Calendar,
  ChevronRight,
  X
} from 'lucide-react';
import { generateId, formatDate, getToday } from '@/lib/utils';
import type { WorkoutTemplate, Exercise, WorkoutLog, ExerciseLog, SetLog } from '@/types/fitness';
import { motion } from 'framer-motion';

export default function Workouts() {
  const { 
    data, 
    addWorkoutTemplate, 
    updateWorkoutTemplate, 
    deleteWorkoutTemplate,
    addWorkoutLog 
  } = useFitTrack();
  
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null);
  
  // Template form state
  const [templateName, setTemplateName] = useState('');
  const [templateExercises, setTemplateExercises] = useState<Exercise[]>([]);
  
  // Workout log state
  const [logDate, setLogDate] = useState(getToday());
  const [logExercises, setLogExercises] = useState<ExerciseLog[]>([]);
  const [logNotes, setLogNotes] = useState('');

  const resetTemplateForm = () => {
    setTemplateName('');
    setTemplateExercises([]);
    setEditingTemplate(null);
  };

  const openEditTemplate = (template: WorkoutTemplate) => {
    setEditingTemplate(template);
    setTemplateName(template.name);
    setTemplateExercises([...template.exercises]);
    setIsTemplateDialogOpen(true);
  };

  const addExercise = () => {
    setTemplateExercises([
      ...templateExercises,
      { id: generateId(), name: '', sets: 3, reps: 10 }
    ]);
  };

  const updateExercise = (index: number, field: keyof Exercise, value: string | number) => {
    const updated = [...templateExercises];
    updated[index] = { ...updated[index], [field]: value };
    setTemplateExercises(updated);
  };

  const removeExercise = (index: number) => {
    setTemplateExercises(templateExercises.filter((_, i) => i !== index));
  };

  const saveTemplate = () => {
    if (!templateName.trim()) return;
    
    const now = new Date().toISOString();
    const template: WorkoutTemplate = {
      id: editingTemplate?.id || generateId(),
      name: templateName.trim(),
      exercises: templateExercises.filter(e => e.name.trim()),
      createdAt: editingTemplate?.createdAt || now,
      updatedAt: now
    };
    
    if (editingTemplate) {
      updateWorkoutTemplate(template);
    } else {
      addWorkoutTemplate(template);
    }
    
    setIsTemplateDialogOpen(false);
    resetTemplateForm();
  };

  const startWorkout = (template: WorkoutTemplate) => {
    setSelectedTemplate(template);
    setLogDate(getToday());
    setLogNotes('');
    setLogExercises(template.exercises.map(ex => ({
      id: generateId(),
      name: ex.name,
      sets: Array.from({ length: ex.sets }, () => ({
        reps: ex.reps,
        weight: ex.weight,
        completed: false
      }))
    })));
    setIsLogDialogOpen(true);
  };

  const updateLogSet = (exerciseIndex: number, setIndex: number, field: keyof SetLog, value: number | boolean) => {
    const updated = [...logExercises];
    updated[exerciseIndex].sets[setIndex] = {
      ...updated[exerciseIndex].sets[setIndex],
      [field]: value
    };
    setLogExercises(updated);
  };

  const toggleSetComplete = (exerciseIndex: number, setIndex: number) => {
    updateLogSet(exerciseIndex, setIndex, 'completed', !logExercises[exerciseIndex].sets[setIndex].completed);
  };

  const saveWorkoutLog = () => {
    const log: WorkoutLog = {
      id: generateId(),
      templateId: selectedTemplate?.id,
      templateName: selectedTemplate?.name,
      date: logDate,
      exercises: logExercises,
      notes: logNotes || undefined,
      createdAt: new Date().toISOString()
    };
    
    addWorkoutLog(log);
    setIsLogDialogOpen(false);
    setSelectedTemplate(null);
  };

  // Sort workout logs by date (newest first)
  const sortedLogs = [...data.workoutLogs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <motion.div 
      className="space-y-6 pb-20 lg:pb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Workouts</h1>
          <p className="text-muted-foreground">Create templates and log your workouts</p>
        </div>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isTemplateDialogOpen} onOpenChange={(open) => {
              setIsTemplateDialogOpen(open);
              if (!open) resetTemplateForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingTemplate ? 'Edit Template' : 'Create Workout Template'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="template-name">Template Name</Label>
                    <Input
                      id="template-name"
                      placeholder="e.g., Push Day, Leg Day"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Exercises</Label>
                      <Button size="sm" variant="outline" onClick={addExercise}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Exercise
                      </Button>
                    </div>
                    
                    {templateExercises.map((exercise, index) => (
                      <div key={exercise.id} className="p-3 border rounded-lg space-y-3">
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="Exercise name"
                            value={exercise.name}
                            onChange={(e) => updateExercise(index, 'name', e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeExercise(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label className="text-xs">Sets</Label>
                            <Input
                              type="number"
                              min="1"
                              value={exercise.sets}
                              onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value) || 1)}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Reps</Label>
                            <Input
                              type="number"
                              min="1"
                              value={exercise.reps}
                              onChange={(e) => updateExercise(index, 'reps', parseInt(e.target.value) || 1)}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Weight (kg)</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.5"
                              value={exercise.weight || ''}
                              onChange={(e) => updateExercise(index, 'weight', parseFloat(e.target.value) || undefined)}
                              placeholder="Optional"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {templateExercises.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">
                        No exercises added yet
                      </p>
                    )}
                  </div>
                  
                  <Button onClick={saveTemplate} className="w-full">
                    {editingTemplate ? 'Update Template' : 'Create Template'}
                  </Button>
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
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openEditTemplate(template)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteWorkoutTemplate(template.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {template.exercises.slice(0, 3).map((exercise) => (
                        <div key={exercise.id} className="flex items-center gap-2 text-sm">
                          <Dumbbell className="h-4 w-4 text-muted-foreground" />
                          <span>{exercise.name}</span>
                          <span className="text-muted-foreground ml-auto">
                            {exercise.sets}×{exercise.reps}
                          </span>
                        </div>
                      ))}
                      {template.exercises.length > 3 && (
                        <p className="text-sm text-muted-foreground">
                          +{template.exercises.length - 3} more exercises
                        </p>
                      )}
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => startWorkout(template)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Workout
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Dumbbell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Templates Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first workout template to get started
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {sortedLogs.length > 0 ? (
            <div className="space-y-3">
              {sortedLogs.map((log) => (
                <Card key={log.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                        <Dumbbell className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium">
                          {log.templateName || 'Custom Workout'}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {formatDate(log.date)}
                          <span>•</span>
                          <span>{log.exercises.length} exercises</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                    {log.notes && (
                      <p className="mt-3 text-sm text-muted-foreground pl-16">
                        {log.notes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Workouts Logged</h3>
                <p className="text-muted-foreground">
                  Start a workout from your templates to log it here
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Log Workout Dialog */}
      <Dialog open={isLogDialogOpen} onOpenChange={setIsLogDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.name || 'Log Workout'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="log-date">Date</Label>
              <Input
                id="log-date"
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-4">
              {logExercises.map((exercise, exerciseIndex) => (
                <div key={exercise.id} className="p-3 border rounded-lg">
                  <h4 className="font-medium mb-3">{exercise.name}</h4>
                  <div className="space-y-2">
                    {exercise.sets.map((set, setIndex) => (
                      <div key={setIndex} className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground w-12">
                          Set {setIndex + 1}
                        </span>
                        <Input
                          type="number"
                          placeholder="Weight"
                          value={set.weight || ''}
                          onChange={(e) => updateLogSet(exerciseIndex, setIndex, 'weight', parseFloat(e.target.value))}
                          className="w-20"
                        />
                        <span className="text-muted-foreground">kg</span>
                        <Input
                          type="number"
                          placeholder="Reps"
                          value={set.reps}
                          onChange={(e) => updateLogSet(exerciseIndex, setIndex, 'reps', parseInt(e.target.value))}
                          className="w-16"
                        />
                        <span className="text-muted-foreground">reps</span>
                        <Button
                          size="sm"
                          variant={set.completed ? 'default' : 'outline'}
                          onClick={() => toggleSetComplete(exerciseIndex, setIndex)}
                        >
                          {set.completed ? '✓' : '○'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div>
              <Label htmlFor="log-notes">Notes (optional)</Label>
              <Textarea
                id="log-notes"
                placeholder="How did the workout feel?"
                value={logNotes}
                onChange={(e) => setLogNotes(e.target.value)}
              />
            </div>
            
            <Button onClick={saveWorkoutLog} className="w-full">
              Save Workout
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
