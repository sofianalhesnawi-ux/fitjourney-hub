import { useState } from 'react';
import { useFitTrack } from '@/contexts/FitTrackContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Scale, 
  Activity, 
  Ruler, 
  Camera,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { generateId, formatDate, getToday } from '@/lib/utils';
import type { WeightEntry, BodyComposition, BodyMeasurement, ProgressPhoto } from '@/types/fitness';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { motion } from 'framer-motion';

export default function BodyMetrics() {
  const { 
    data, 
    addWeightEntry, 
    deleteWeightEntry,
    addBodyComposition,
    deleteBodyComposition,
    addBodyMeasurement,
    deleteBodyMeasurement,
    addProgressPhoto,
    deleteProgressPhoto
  } = useFitTrack();

  // Form states
  const [weightDialogOpen, setWeightDialogOpen] = useState(false);
  const [compositionDialogOpen, setCompositionDialogOpen] = useState(false);
  const [measurementDialogOpen, setMeasurementDialogOpen] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);

  const [weight, setWeight] = useState('');
  const [weightDate, setWeightDate] = useState(getToday());

  const [bodyFat, setBodyFat] = useState('');
  const [muscleMass, setMuscleMass] = useState('');
  const [waterPercentage, setWaterPercentage] = useState('');
  const [bmi, setBmi] = useState('');
  const [compositionDate, setCompositionDate] = useState(getToday());

  const [measurements, setMeasurements] = useState({
    chest: '', waist: '', hips: '', leftArm: '', rightArm: '',
    leftThigh: '', rightThigh: '', leftCalf: '', rightCalf: ''
  });
  const [measurementDate, setMeasurementDate] = useState(getToday());

  const [photoNotes, setPhotoNotes] = useState('');
  const [photoDate, setPhotoDate] = useState(getToday());

  // Get sorted data
  const sortedWeights = [...data.weightEntries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const sortedCompositions = [...data.bodyCompositions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const sortedMeasurements = [...data.bodyMeasurements].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const sortedPhotos = [...data.progressPhotos].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Chart data
  const weightChartData = sortedWeights
    .slice(0, 30)
    .reverse()
    .map(entry => ({
      date: formatDate(entry.date).split(',')[0],
      weight: entry.weight
    }));

  const bodyFatChartData = sortedCompositions
    .filter(c => c.bodyFat)
    .slice(0, 30)
    .reverse()
    .map(entry => ({
      date: formatDate(entry.date).split(',')[0],
      bodyFat: entry.bodyFat
    }));

  const currentWeight = sortedWeights[0]?.weight;
  const previousWeight = sortedWeights[1]?.weight;
  const weightChange = currentWeight && previousWeight ? currentWeight - previousWeight : null;

  const saveWeight = () => {
    if (!weight) return;
    const entry: WeightEntry = {
      id: generateId(),
      weight: parseFloat(weight),
      date: weightDate,
      createdAt: new Date().toISOString()
    };
    addWeightEntry(entry);
    setWeight('');
    setWeightDialogOpen(false);
  };

  const saveComposition = () => {
    const entry: BodyComposition = {
      id: generateId(),
      date: compositionDate,
      bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
      muscleMass: muscleMass ? parseFloat(muscleMass) : undefined,
      waterPercentage: waterPercentage ? parseFloat(waterPercentage) : undefined,
      bmi: bmi ? parseFloat(bmi) : undefined,
      createdAt: new Date().toISOString()
    };
    addBodyComposition(entry);
    setBodyFat('');
    setMuscleMass('');
    setWaterPercentage('');
    setBmi('');
    setCompositionDialogOpen(false);
  };

  const saveMeasurement = () => {
    const entry: BodyMeasurement = {
      id: generateId(),
      date: measurementDate,
      chest: measurements.chest ? parseFloat(measurements.chest) : undefined,
      waist: measurements.waist ? parseFloat(measurements.waist) : undefined,
      hips: measurements.hips ? parseFloat(measurements.hips) : undefined,
      leftArm: measurements.leftArm ? parseFloat(measurements.leftArm) : undefined,
      rightArm: measurements.rightArm ? parseFloat(measurements.rightArm) : undefined,
      leftThigh: measurements.leftThigh ? parseFloat(measurements.leftThigh) : undefined,
      rightThigh: measurements.rightThigh ? parseFloat(measurements.rightThigh) : undefined,
      leftCalf: measurements.leftCalf ? parseFloat(measurements.leftCalf) : undefined,
      rightCalf: measurements.rightCalf ? parseFloat(measurements.rightCalf) : undefined,
      createdAt: new Date().toISOString()
    };
    addBodyMeasurement(entry);
    setMeasurements({
      chest: '', waist: '', hips: '', leftArm: '', rightArm: '',
      leftThigh: '', rightThigh: '', leftCalf: '', rightCalf: ''
    });
    setMeasurementDialogOpen(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const photo: ProgressPhoto = {
        id: generateId(),
        date: photoDate,
        imageData: reader.result as string,
        notes: photoNotes || undefined,
        createdAt: new Date().toISOString()
      };
      addProgressPhoto(photo);
      setPhotoNotes('');
      setPhotoDialogOpen(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <motion.div 
      className="space-y-6 pb-20 lg:pb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Body Metrics</h1>
          <p className="text-muted-foreground">Track your body measurements and progress</p>
        </div>
      </div>

      <Tabs defaultValue="weight" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="weight">Weight</TabsTrigger>
          <TabsTrigger value="composition">Composition</TabsTrigger>
          <TabsTrigger value="measurements">Measurements</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
        </TabsList>

        {/* Weight Tab */}
        <TabsContent value="weight" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">
                {currentWeight ? `${currentWeight} kg` : 'No data yet'}
              </h2>
              {weightChange !== null && (
                <p className={`text-sm flex items-center gap-1 ${weightChange > 0 ? 'text-warning' : 'text-success'}`}>
                  {weightChange > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg from last
                </p>
              )}
            </div>
            <Dialog open={weightDialogOpen} onOpenChange={setWeightDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Log Weight
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log Weight</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={weightDate}
                      onChange={(e) => setWeightDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Weight (kg)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="70.0"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                  </div>
                  <Button onClick={saveWeight} className="w-full">Save</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Weight Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {weightChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weightChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                    {data.goals.targetWeight && (
                      <Line 
                        type="monotone" 
                        dataKey={() => data.goals.targetWeight} 
                        stroke="hsl(var(--success))" 
                        strokeDasharray="5 5"
                        dot={false}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <p>Start logging your weight to see trends</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weight History */}
          <Card>
            <CardHeader>
              <CardTitle>History</CardTitle>
            </CardHeader>
            <CardContent>
              {sortedWeights.length > 0 ? (
                <div className="space-y-2">
                  {sortedWeights.slice(0, 10).map(entry => (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{entry.weight} kg</p>
                        <p className="text-sm text-muted-foreground">{formatDate(entry.date)}</p>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => deleteWeightEntry(entry.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-6">No weight entries yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Composition Tab */}
        <TabsContent value="composition" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={compositionDialogOpen} onOpenChange={setCompositionDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Log Composition
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log Body Composition</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={compositionDate}
                      onChange={(e) => setCompositionDate(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Body Fat %</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="15.0"
                        value={bodyFat}
                        onChange={(e) => setBodyFat(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Muscle Mass (kg)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="35.0"
                        value={muscleMass}
                        onChange={(e) => setMuscleMass(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Water %</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="55.0"
                        value={waterPercentage}
                        onChange={(e) => setWaterPercentage(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>BMI</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="22.0"
                        value={bmi}
                        onChange={(e) => setBmi(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button onClick={saveComposition} className="w-full">Save</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Latest Composition */}
          {sortedCompositions.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {sortedCompositions[0].bodyFat && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Body Fat</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{sortedCompositions[0].bodyFat}%</p>
                  </CardContent>
                </Card>
              )}
              {sortedCompositions[0].muscleMass && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Muscle Mass</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{sortedCompositions[0].muscleMass} kg</p>
                  </CardContent>
                </Card>
              )}
              {sortedCompositions[0].waterPercentage && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Water</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{sortedCompositions[0].waterPercentage}%</p>
                  </CardContent>
                </Card>
              )}
              {sortedCompositions[0].bmi && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">BMI</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{sortedCompositions[0].bmi}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Body Fat Chart */}
          {bodyFatChartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Body Fat Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={bodyFatChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="bodyFat" 
                      stroke="hsl(var(--chart-2))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--chart-2))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* History */}
          <Card>
            <CardHeader>
              <CardTitle>History</CardTitle>
            </CardHeader>
            <CardContent>
              {sortedCompositions.length > 0 ? (
                <div className="space-y-2">
                  {sortedCompositions.slice(0, 10).map(entry => (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{formatDate(entry.date)}</p>
                        <p className="text-sm text-muted-foreground">
                          {entry.bodyFat && `BF: ${entry.bodyFat}%`}
                          {entry.muscleMass && ` • Muscle: ${entry.muscleMass}kg`}
                          {entry.bmi && ` • BMI: ${entry.bmi}`}
                        </p>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => deleteBodyComposition(entry.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-6">No composition data yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Measurements Tab */}
        <TabsContent value="measurements" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={measurementDialogOpen} onOpenChange={setMeasurementDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Log Measurements
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Log Body Measurements</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={measurementDate}
                      onChange={(e) => setMeasurementDate(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries({
                      chest: 'Chest',
                      waist: 'Waist',
                      hips: 'Hips',
                      leftArm: 'L Arm',
                      rightArm: 'R Arm',
                      leftThigh: 'L Thigh',
                      rightThigh: 'R Thigh',
                      leftCalf: 'L Calf',
                      rightCalf: 'R Calf'
                    }).map(([key, label]) => (
                      <div key={key}>
                        <Label className="text-xs">{label} (cm)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={measurements[key as keyof typeof measurements]}
                          onChange={(e) => setMeasurements({ ...measurements, [key]: e.target.value })}
                        />
                      </div>
                    ))}
                  </div>
                  <Button onClick={saveMeasurement} className="w-full">Save</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Latest Measurements */}
          {sortedMeasurements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Latest Measurements ({formatDate(sortedMeasurements[0].date)})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {sortedMeasurements[0].chest && <div><p className="text-sm text-muted-foreground">Chest</p><p className="font-medium">{sortedMeasurements[0].chest} cm</p></div>}
                  {sortedMeasurements[0].waist && <div><p className="text-sm text-muted-foreground">Waist</p><p className="font-medium">{sortedMeasurements[0].waist} cm</p></div>}
                  {sortedMeasurements[0].hips && <div><p className="text-sm text-muted-foreground">Hips</p><p className="font-medium">{sortedMeasurements[0].hips} cm</p></div>}
                  {sortedMeasurements[0].leftArm && <div><p className="text-sm text-muted-foreground">L Arm</p><p className="font-medium">{sortedMeasurements[0].leftArm} cm</p></div>}
                  {sortedMeasurements[0].rightArm && <div><p className="text-sm text-muted-foreground">R Arm</p><p className="font-medium">{sortedMeasurements[0].rightArm} cm</p></div>}
                  {sortedMeasurements[0].leftThigh && <div><p className="text-sm text-muted-foreground">L Thigh</p><p className="font-medium">{sortedMeasurements[0].leftThigh} cm</p></div>}
                  {sortedMeasurements[0].rightThigh && <div><p className="text-sm text-muted-foreground">R Thigh</p><p className="font-medium">{sortedMeasurements[0].rightThigh} cm</p></div>}
                  {sortedMeasurements[0].leftCalf && <div><p className="text-sm text-muted-foreground">L Calf</p><p className="font-medium">{sortedMeasurements[0].leftCalf} cm</p></div>}
                  {sortedMeasurements[0].rightCalf && <div><p className="text-sm text-muted-foreground">R Calf</p><p className="font-medium">{sortedMeasurements[0].rightCalf} cm</p></div>}
                </div>
              </CardContent>
            </Card>
          )}

          {/* History */}
          <Card>
            <CardHeader>
              <CardTitle>History</CardTitle>
            </CardHeader>
            <CardContent>
              {sortedMeasurements.length > 0 ? (
                <div className="space-y-2">
                  {sortedMeasurements.slice(0, 10).map(entry => (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <p className="font-medium">{formatDate(entry.date)}</p>
                      <Button size="icon" variant="ghost" onClick={() => deleteBodyMeasurement(entry.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-6">No measurements yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Photos Tab */}
        <TabsContent value="photos" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Photo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Progress Photo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={photoDate}
                      onChange={(e) => setPhotoDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Notes (optional)</Label>
                    <Input
                      placeholder="e.g., Front view, 2 months in"
                      value={photoNotes}
                      onChange={(e) => setPhotoNotes(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Photo</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Photo Gallery */}
          {sortedPhotos.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sortedPhotos.map(photo => (
                <Card key={photo.id} className="overflow-hidden group">
                  <div className="relative aspect-[3/4]">
                    <img
                      src={photo.imageData}
                      alt={`Progress photo from ${formatDate(photo.date)}`}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteProgressPhoto(photo.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardContent className="py-3">
                    <p className="font-medium">{formatDate(photo.date)}</p>
                    {photo.notes && (
                      <p className="text-sm text-muted-foreground">{photo.notes}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Photos Yet</h3>
                <p className="text-muted-foreground">
                  Upload progress photos to track your transformation
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
