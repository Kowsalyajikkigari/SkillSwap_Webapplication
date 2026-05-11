/**
 * Skills Manager Component
 * 
 * This component allows users to manage their teaching and learning skills
 * by connecting to the Django backend API.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Edit, Save, X } from "lucide-react";
import { 
  TeachingSkill, 
  LearningSkill, 
  Skill, 
  SkillCategory 
} from '@/types';
import {
  getTeachingSkills,
  getLearningSkills,
  getAllSkills,
  getSkillCategories,
  createTeachingSkill,
  createLearningSkill,
  updateTeachingSkill,
  updateLearningSkill,
  deleteTeachingSkill,
  deleteLearningSkill
} from '@/services/skills';

const SkillsManager: React.FC = () => {
  // State for skills data
  const [teachingSkills, setTeachingSkills] = useState<TeachingSkill[]>([]);
  const [learningSkills, setLearningSkills] = useState<LearningSkill[]>([]);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<SkillCategory[]>([]);

  // State for UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSkill, setEditingSkill] = useState<number | null>(null);

  // State for new skill forms
  const [showAddTeaching, setShowAddTeaching] = useState(false);
  const [showAddLearning, setShowAddLearning] = useState(false);

  // Form state for new teaching skill
  const [newTeachingSkill, setNewTeachingSkill] = useState({
    skill: 0,
    experience_level: 'beginner' as const,
    description: ''
  });

  // Form state for new learning skill
  const [newLearningSkill, setNewLearningSkill] = useState({
    skill: 0,
    current_level: 'beginner' as const,
    goal: ''
  });

  // Load data on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all data in parallel
      const [teachingData, learningData, skillsData, categoriesData] = await Promise.all([
        getTeachingSkills(),
        getLearningSkills(),
        getAllSkills(),
        getSkillCategories()
      ]);

      setTeachingSkills(teachingData);
      setLearningSkills(learningData);
      setAvailableSkills(skillsData);
      setCategories(categoriesData);
    } catch (err: any) {
      console.error('Error loading skills data:', err);
      setError('Failed to load skills data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle creating new teaching skill
  const handleCreateTeachingSkill = async () => {
    try {
      if (!newTeachingSkill.skill || !newTeachingSkill.description.trim()) {
        setError('Please fill in all required fields');
        return;
      }

      const createdSkill = await createTeachingSkill(newTeachingSkill);
      setTeachingSkills(prev => [...prev, createdSkill]);
      setNewTeachingSkill({ skill: 0, experience_level: 'beginner', description: '' });
      setShowAddTeaching(false);
      setError(null);
    } catch (err: any) {
      console.error('Error creating teaching skill:', err);
      setError('Failed to create teaching skill. Please try again.');
    }
  };

  // Handle creating new learning skill
  const handleCreateLearningSkill = async () => {
    try {
      if (!newLearningSkill.skill || !newLearningSkill.goal.trim()) {
        setError('Please fill in all required fields');
        return;
      }

      const createdSkill = await createLearningSkill(newLearningSkill);
      setLearningSkills(prev => [...prev, createdSkill]);
      setNewLearningSkill({ skill: 0, current_level: 'beginner', goal: '' });
      setShowAddLearning(false);
      setError(null);
    } catch (err: any) {
      console.error('Error creating learning skill:', err);
      setError('Failed to create learning skill. Please try again.');
    }
  };

  // Handle deleting teaching skill
  const handleDeleteTeachingSkill = async (skillId: number) => {
    try {
      await deleteTeachingSkill(skillId);
      setTeachingSkills(prev => prev.filter(skill => skill.id !== skillId));
      setError(null);
    } catch (err: any) {
      console.error('Error deleting teaching skill:', err);
      setError('Failed to delete teaching skill. Please try again.');
    }
  };

  // Handle deleting learning skill
  const handleDeleteLearningSkill = async (skillId: number) => {
    try {
      await deleteLearningSkill(skillId);
      setLearningSkills(prev => prev.filter(skill => skill.id !== skillId));
      setError(null);
    } catch (err: any) {
      console.error('Error deleting learning skill:', err);
      setError('Failed to delete learning skill. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading your skills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Manage Your Skills</h1>
        <p className="text-gray-600">Add and manage the skills you can teach and want to learn.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <Tabs defaultValue="teaching" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="teaching">Skills I Can Teach ({teachingSkills.length})</TabsTrigger>
          <TabsTrigger value="learning">Skills I Want to Learn ({learningSkills.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="teaching" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Teaching Skills</h2>
            <Button 
              onClick={() => setShowAddTeaching(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Teaching Skill
            </Button>
          </div>

          {/* Add new teaching skill form */}
          {showAddTeaching && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Teaching Skill</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="teaching-skill">Skill</Label>
                  <Select 
                    value={newTeachingSkill.skill.toString()} 
                    onValueChange={(value) => setNewTeachingSkill(prev => ({ ...prev, skill: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a skill" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSkills.map(skill => (
                        <SelectItem key={skill.id} value={skill.id.toString()}>
                          {skill.name} ({skill.category})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="experience-level">Experience Level</Label>
                  <Select 
                    value={newTeachingSkill.experience_level} 
                    onValueChange={(value: any) => setNewTeachingSkill(prev => ({ ...prev, experience_level: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your experience and what you can teach..."
                    value={newTeachingSkill.description}
                    onChange={(e) => setNewTeachingSkill(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleCreateTeachingSkill}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddTeaching(false)}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Teaching skills list */}
          <div className="space-y-4">
            {teachingSkills.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">No teaching skills added yet.</p>
                  <p className="text-sm text-gray-400 mt-2">Add skills you can teach to help others learn!</p>
                </CardContent>
              </Card>
            ) : (
              teachingSkills.map(skill => (
                <Card key={skill.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{skill.skill_name}</h3>
                          <Badge variant="secondary">{skill.category_name}</Badge>
                          <Badge variant="outline">{skill.experience_level}</Badge>
                        </div>
                        <p className="text-gray-600 text-sm">{skill.description}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          Added {new Date(skill.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteTeachingSkill(skill.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="learning" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Learning Skills</h2>
            <Button 
              onClick={() => setShowAddLearning(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Learning Goal
            </Button>
          </div>

          {/* Add new learning skill form */}
          {showAddLearning && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Learning Goal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="learning-skill">Skill</Label>
                  <Select 
                    value={newLearningSkill.skill.toString()} 
                    onValueChange={(value) => setNewLearningSkill(prev => ({ ...prev, skill: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a skill" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSkills.map(skill => (
                        <SelectItem key={skill.id} value={skill.id.toString()}>
                          {skill.name} ({skill.category})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="current-level">Current Level</Label>
                  <Select 
                    value={newLearningSkill.current_level} 
                    onValueChange={(value: any) => setNewLearningSkill(prev => ({ ...prev, current_level: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="goal">Learning Goal</Label>
                  <Textarea
                    id="goal"
                    placeholder="What do you want to achieve with this skill?"
                    value={newLearningSkill.goal}
                    onChange={(e) => setNewLearningSkill(prev => ({ ...prev, goal: e.target.value }))}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleCreateLearningSkill}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddLearning(false)}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Learning skills list */}
          <div className="space-y-4">
            {learningSkills.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">No learning goals added yet.</p>
                  <p className="text-sm text-gray-400 mt-2">Add skills you want to learn to find teachers!</p>
                </CardContent>
              </Card>
            ) : (
              learningSkills.map(skill => (
                <Card key={skill.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{skill.skill_name}</h3>
                          <Badge variant="secondary">{skill.category_name}</Badge>
                          <Badge variant="outline">{skill.current_level}</Badge>
                        </div>
                        <p className="text-gray-600 text-sm">{skill.goal}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          Added {new Date(skill.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteLearningSkill(skill.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SkillsManager;
