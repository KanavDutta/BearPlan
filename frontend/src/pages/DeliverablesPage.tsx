import { useState, useEffect } from 'react';
import { deliverableApi, courseApi } from '../services/api';
import type { Deliverable, Course, DeliverableInput } from '../types';
import { Input } from '../components/ui/input';
import { Plus, Trash2, Edit2 } from 'lucide-react';

export default function DeliverablesPage() {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [formData, setFormData] = useState<DeliverableInput>({
    course_id: 0,
    name: '',
    type: 'Assignment',
    due_date: '',
    grade_weight: 0,
    estimated_hours: 0,
    score: null
  });

  useEffect(() => {
    loadData();
  }, [selectedCourse]);

  const loadData = async () => {
    try {
      const [delivsRes, coursesRes] = await Promise.all([
        selectedCourse ? deliverableApi.getAll(selectedCourse) : deliverableApi.getAll(),
        courseApi.getAll()
      ]);
      setDeliverables(delivsRes.data);
      setCourses(coursesRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await deliverableApi.update(editingId, formData);
      } else {
        await deliverableApi.create(formData);
      }
      setFormData({ course_id: 0, name: '', type: 'Assignment', due_date: '', grade_weight: 0, estimated_hours: 0, score: null });
      setShowForm(false);
      setEditingId(null);
      loadData();
    } catch (error) {
      console.error('Failed to save deliverable:', error);
    }
  };

  const handleEdit = (deliverable: Deliverable) => {
    setFormData({
      course_id: deliverable.course_id,
      name: deliverable.name,
      type: deliverable.type,
      due_date: deliverable.due_date.split('T')[0],
      grade_weight: deliverable.grade_weight,
      estimated_hours: deliverable.estimated_hours,
      score: deliverable.score
    });
    setEditingId(deliverable.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this deliverable?')) {
      try {
        await deliverableApi.delete(id);
        loadData();
      } catch (error) {
        console.error('Failed to delete deliverable:', error);
      }
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deliverables</h1>
          <p className="text-gray-600 mt-2">Track assignments, exams, and projects</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ course_id: courses[0]?.id || 0, name: '', type: 'Assignment', due_date: '', grade_weight: 0, estimated_hours: 0, score: null }); }}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Deliverable
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCourse(null)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedCourse === null ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          All Courses
        </button>
        {courses.map(course => (
          <button
            key={course.id}
            onClick={() => setSelectedCourse(course.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCourse === course.id ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {course.code || course.name}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="rounded-xl p-6 shadow-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {editingId ? 'Edit Deliverable' : 'New Deliverable'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course *</label>
                <select
                  value={formData.course_id}
                  onChange={(e) => setFormData({ ...formData, course_id: parseInt(e.target.value) })}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value={0}>Select a course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="Assignment">Assignment</option>
                  <option value="Exam">Exam</option>
                  <option value="Lab">Lab</option>
                  <option value="Project">Project</option>
                  <option value="Quiz">Quiz</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Assignment 1"
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Grade Weight (%) *</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.grade_weight}
                  onChange={(e) => setFormData({ ...formData, grade_weight: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Hours *</label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.estimated_hours}
                  onChange={(e) => setFormData({ ...formData, estimated_hours: parseFloat(e.target.value) })}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Score (%) - Optional</label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.score ?? ''}
                onChange={(e) => setFormData({ ...formData, score: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="Enter score after completion"
              />
              <p className="text-xs text-gray-500 mt-1">Add your score after completing the deliverable to track your grade</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                {editingId ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {deliverables.map((deliverable) => {
          const dueDate = new Date(deliverable.due_date);
          const today = new Date();
          const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          let bgColor = 'var(--surface)';
          let borderColor = 'var(--border)';
          let accentColor = 'var(--primary)';
          
          if (daysUntilDue < 0) {
            bgColor = 'var(--danger-soft)';
            borderColor = 'var(--danger)';
            accentColor = 'var(--danger)';
          } else if (daysUntilDue <= 3) {
            bgColor = '#fff7ed'; // amber-50
            borderColor = '#fed7aa'; // amber-200
            accentColor = 'var(--warning)';
          } else if (daysUntilDue <= 7) {
            bgColor = 'var(--warning-soft)';
            borderColor = '#fde68a'; // yellow-200
            accentColor = 'var(--warning)';
          }
          
          return (
            <div 
              key={deliverable.id} 
              className="group border-2 rounded-xl p-5 hover:shadow-md transition-all"
              style={{ 
                background: bgColor,
                borderColor: borderColor,
                borderLeft: `4px solid ${accentColor}`
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{deliverable.name}</h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full uppercase tracking-wide">{deliverable.type}</span>
                  </div>
                  <p className="text-sm text-gray-600">{deliverable.course_name}</p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(deliverable)} className="p-2.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(deliverable.id)} className="p-2.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-100">
                  <span className="text-2xl">📅</span>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Due</div>
                    <div className="font-semibold text-gray-900">{dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-100">
                  <span className="text-2xl">⚖️</span>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Weight</div>
                    <div className="font-semibold text-gray-900">{deliverable.grade_weight}%</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-100">
                  <span className="text-2xl">⏱</span>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Remaining</div>
                    <div className="font-semibold text-gray-900">{deliverable.hours_remaining}h</div>
                  </div>
                </div>
                
                {deliverable.score !== null && (
                  <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-100">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Score</div>
                      <div className={`font-semibold ${
                        deliverable.score >= 80 ? 'text-green-600' :
                        deliverable.score >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>{deliverable.score}%</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {deliverables.length === 0 && !showForm && (
        <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-dashed border-gray-200">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No deliverables due this week</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">Enjoy the lighter workload! Add upcoming assignments to stay ahead.</p>
          <button onClick={() => setShowForm(true)} className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            <Plus className="w-5 h-5 mr-2" />
            Add Deliverable
          </button>
        </div>
      )}
    </div>
  );
}
