import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Plus, X, Target } from 'lucide-react';

interface LearningGoalsStepProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
}

const LearningGoalsStep: React.FC<LearningGoalsStepProps> = ({ formData, updateFormData }) => {
  const [newGoal, setNewGoal] = useState({
    skillName: '',
    currentLevel: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    goal: '',
    timeline: '3_months',
    learningPreferences: [] as string[]
  });

  const skillLevels = [
    { value: 'beginner', label: 'Beginner', description: 'No prior experience' },
    { value: 'intermediate', label: 'Intermediate', description: 'Some basic knowledge' },
    { value: 'advanced', label: 'Advanced', description: 'Looking to master' }
  ];

  const timelineOptions = [
    { value: '1_month', label: '1 Month', description: 'Quick learning goal' },
    { value: '3_months', label: '3 Months', description: 'Standard timeline' },
    { value: '6_months', label: '6 Months', description: 'Comprehensive learning' },
    { value: '1_year', label: '1 Year', description: 'Long-term mastery' },
    { value: 'flexible', label: 'Flexible', description: 'No specific timeline' }
  ];

  const learningPreferenceOptions = [
    'One-on-one tutoring',
    'Group learning',
    'Video calls',
    'In-person sessions',
    'Practice exercises',
    'Project-based learning',
    'Step-by-step guidance',
    'Flexible scheduling'
  ];

  const addGoal = () => {
    if (newGoal.skillName.trim()) {
      const goal = {
        skillId: Date.now(), // Temporary ID
        skillName: newGoal.skillName,
        currentLevel: newGoal.currentLevel,
        goal: newGoal.goal,
        timeline: newGoal.timeline,
        learningPreferences: newGoal.learningPreferences
      };
      
      updateFormData('learningGoals', [...formData.learningGoals, goal]);
      setNewGoal({
        skillName: '',
        currentLevel: 'beginner',
        goal: '',
        timeline: '3_months',
        learningPreferences: []
      });
    }
  };

  const removeGoal = (index: number) => {
    const updatedGoals = formData.learningGoals.filter((_: any, i: number) => i !== index);
    updateFormData('learningGoals', updatedGoals);
  };

  const toggleLearningPreference = (preference: string) => {
    const preferences = newGoal.learningPreferences.includes(preference)
      ? newGoal.learningPreferences.filter(p => p !== preference)
      : [...newGoal.learningPreferences, preference];
    setNewGoal({ ...newGoal, learningPreferences: preferences });
  };

  const getTimelineLabel = (value: string) => {
    return timelineOptions.find(option => option.value === value)?.label || value;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Skills You Want to Learn</h3>
        <p className="text-muted-foreground mb-4">
          What skills are you excited to learn? This helps us match you with the right teachers and learning opportunities.
        </p>
      </div>

      {/* Existing Learning Goals */}
      {formData.learningGoals.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Your Learning Goals</h4>
          {formData.learningGoals.map((goal: any, index: number) => (
            <div key={index} className="border rounded-lg p-4 bg-muted/50">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h5 className="font-medium">{goal.skillName}</h5>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="secondary">
                      Current: {goal.currentLevel}
                    </Badge>
                    <Badge variant="outline">
                      Timeline: {getTimelineLabel(goal.timeline)}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeGoal(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {goal.goal && (
                <p className="text-sm text-muted-foreground mb-2">{goal.goal}</p>
              )}
              {goal.learningPreferences.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {goal.learningPreferences.map((preference: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {preference}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add New Learning Goal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Learning Goal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Skill Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Skill You Want to Learn <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="e.g., Python Programming, Spanish, Piano, Digital Marketing"
              value={newGoal.skillName}
              onChange={(e) => setNewGoal({ ...newGoal, skillName: e.target.value })}
            />
          </div>

          {/* Current Level and Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Current Level</label>
              <select
                value={newGoal.currentLevel}
                onChange={(e) => setNewGoal({ ...newGoal, currentLevel: e.target.value as any })}
                className="w-full p-2 border rounded-md"
              >
                {skillLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label} - {level.description}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Learning Timeline</label>
              <select
                value={newGoal.timeline}
                onChange={(e) => setNewGoal({ ...newGoal, timeline: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                {timelineOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label} - {option.description}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Learning Goal */}
          <div>
            <label className="block text-sm font-medium mb-2">Specific Goal (Optional)</label>
            <Textarea
              placeholder="What specifically do you want to achieve? e.g., 'Build a web application', 'Have basic conversations', 'Play my favorite songs'"
              value={newGoal.goal}
              onChange={(e) => setNewGoal({ ...newGoal, goal: e.target.value })}
              rows={3}
            />
          </div>

          {/* Learning Preferences */}
          <div>
            <label className="block text-sm font-medium mb-2">Learning Preferences</label>
            <div className="grid grid-cols-2 gap-2">
              {learningPreferenceOptions.map(preference => (
                <div key={preference} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={preference}
                    checked={newGoal.learningPreferences.includes(preference)}
                    onChange={() => toggleLearningPreference(preference)}
                    className="rounded"
                  />
                  <label htmlFor={preference} className="text-sm">{preference}</label>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={addGoal} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Learning Goal
          </Button>
        </CardContent>
      </Card>

      {formData.learningGoals.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No learning goals added yet.</p>
          <p className="text-sm">Add at least one skill you want to learn to continue.</p>
        </div>
      )}
    </div>
  );
};

export default LearningGoalsStep;
