import { useState } from 'react';
import {
  Dumbbell,
  Clock,
  Flame,
  CheckCircle,
  Circle,
  Play,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockWorkoutPlan } from '@/data/mockData';

export function MemberWorkout() {
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);

  const toggleExercise = (exerciseId: string) => {
    setCompletedExercises((prev) =>
      prev.includes(exerciseId)
        ? prev.filter((id) => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  const progress = Math.round(
    (completedExercises.length / mockWorkoutPlan.exercises.length) * 100
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">My Workout Plan</h1>
          <p className="text-muted-foreground">{mockWorkoutPlan.name}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-muted-foreground text-sm">Progress</p>
            <p className="font-display text-2xl font-bold text-lime-500">{progress}%</p>
          </div>
          <div className="w-16 h-16 relative">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#a3ff00"
                strokeWidth="3"
                strokeDasharray={`${progress}, 100`}
                className="transition-all duration-500"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Plan Info */}
      <div className="p-6 rounded-xl bg-card/50 border border-border">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1">
            <h3 className="font-display text-xl font-bold text-foreground mb-2">
              {mockWorkoutPlan.name}
            </h3>
            <p className="text-muted-foreground mb-4">{mockWorkoutPlan.description}</p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Dumbbell className="w-4 h-4" />
                <span>{mockWorkoutPlan.exercises.length} exercises</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>~45 minutes</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Flame className="w-4 h-4" />
                <span>High Intensity</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button className="bg-lime-500 text-primary-foreground hover:bg-lime-400">
              <Play className="w-4 h-4 mr-2" />
              Start Workout
            </Button>
          </div>
        </div>
      </div>

      {/* Exercises List */}
      <div className="space-y-4">
        <h3 className="font-display text-xl font-bold text-foreground">Today's Exercises</h3>
        
        {mockWorkoutPlan.exercises.map((exercise, index) => {
          const isCompleted = completedExercises.includes(exercise.id);
          
          return (
            <div
              key={exercise.id}
              className={`p-5 rounded-xl border transition-all ${
                isCompleted
                  ? 'bg-lime-500/5 border-lime-500/20'
                  : 'bg-card/50 border-border hover:border-border'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Exercise Number */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isCompleted ? 'bg-lime-500/20' : 'bg-muted/50'
                }`}>
                  <span className={`font-display text-lg font-bold ${
                    isCompleted ? 'text-lime-500' : 'text-foreground'
                  }`}>
                    {index + 1}
                  </span>
                </div>

                {/* Exercise Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className={`font-display text-xl font-bold ${
                        isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'
                      }`}>
                        {exercise.name}
                      </h4>
                      <div className="flex flex-wrap gap-3 mt-2">
                        <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm">
                          {exercise.sets} sets
                        </span>
                        <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm">
                          {exercise.reps} reps
                        </span>
                        {exercise.weight && (
                          <span className="px-3 py-1 rounded-full bg-lime-500/20 text-lime-500 text-sm">
                            {exercise.weight}
                          </span>
                        )}
                        <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm">
                          {exercise.rest} rest
                        </span>
                      </div>
                      {exercise.notes && (
                        <p className="text-muted-foreground text-sm mt-2 flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          {exercise.notes}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleExercise(exercise.id)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                          isCompleted
                            ? 'bg-lime-500 text-primary-foreground'
                            : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Workout Tips */}
      <div className="p-6 rounded-xl bg-card/50 border border-border">
        <h3 className="font-display text-xl font-bold text-foreground mb-4">Workout Tips</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            'Warm up for 5-10 minutes before starting',
            'Focus on proper form over weight',
            'Rest 60-90 seconds between sets',
            'Stay hydrated throughout your workout',
            'Cool down with light stretching after',
            'Track your progress to stay motivated',
          ].map((tip, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-lime-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-lime-500 text-xs font-bold">{index + 1}</span>
              </div>
              <span className="text-muted-foreground">{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
