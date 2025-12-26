import { useState, useEffect } from 'react';
import { courseApi } from '../services/api';
import type { Course } from '../types';
import { TrendingUp, Target, Award } from 'lucide-react';

interface GradeData {
  currentGrade: number | null;
  completedWeight: number;
  totalWeight: number;
  projectedGrade: number | null;
  deliverables: Array<{
    name: string;
    weight: number;
    score: number | null;
    completed: boolean;
  }>;
}

interface TargetResult {
  targetGrade: number;
  currentGrade: number | null;
  requiredAverage: number | null;
  remainingWeight: number;
  achievable: boolean;
  message: string;
}

export default function GradesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [gradeData, setGradeData] = useState<GradeData | null>(null);
  const [targetGrade, setTargetGrade] = useState<string>('');
  const [targetResult, setTargetResult] = useState<TargetResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadGradeData(selectedCourse);
      setTargetResult(null);
      setTargetGrade('');
    }
  }, [selectedCourse]);

  const loadCourses = async () => {
    try {
      const response = await courseApi.getAll();
      setCourses(response.data);
      if (response.data.length > 0) {
        setSelectedCourse(response.data[0].id);
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGradeData = async (courseId: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/grades/${courseId}`);
      const data = await response.json();
      setGradeData(data);
    } catch (error) {
      console.error('Failed to load grade data:', error);
    }
  };

  const calculateTarget = async () => {
    if (!selectedCourse || !targetGrade) return;

    try {
      const response = await fetch(`http://localhost:3000/api/grades/${selectedCourse}/target`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetGrade: parseFloat(targetGrade) })
      });
      const data = await response.json();
      setTargetResult(data);
    } catch (error) {
      console.error('Failed to calculate target:', error);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  if (courses.length === 0) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-dashed border-gray-200">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses yet</h3>
          <p className="text-gray-600">Add courses and deliverables to track your grades</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Grade Projections</h1>
        <p className="text-gray-600 mt-2">Track your progress and plan for success</p>
      </div>

      {/* Course Selector */}
      <div className="flex flex-wrap gap-3">
        {courses.map(course => (
          <button
            key={course.id}
            onClick={() => setSelectedCourse(course.id)}
            className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors shadow-sm ${
              selectedCourse === course.id
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <span>{course.code || course.name}</span>
          </button>
        ))}
      </div>

      {gradeData && (
        <>
          {/* Current Grade Card */}
          <div className="rounded-xl p-8 shadow-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: '4px solid var(--primary)' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Current Grade</h2>
            </div>

            {gradeData.currentGrade !== null ? (
              <div className="space-y-5">
                <div className="flex items-baseline gap-3">
                  <span className="text-6xl font-bold text-blue-600">
                    {gradeData.currentGrade.toFixed(1)}%
                  </span>
                  <span className="text-gray-500 text-lg">
                    ({gradeData.completedWeight.toFixed(0)}% <span>of course completed</span>)
                  </span>
                </div>

                {gradeData.projectedGrade !== null && gradeData.completedWeight < gradeData.totalWeight && (
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">
                      <span>Projected final grade:</span> <span className="font-semibold text-blue-900">{gradeData.projectedGrade.toFixed(1)}%</span>
                      <span className="text-sm text-gray-500 ml-2">(assuming 75% on remaining work)</span>
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg">
                <div className="text-5xl mb-3">🎓</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No grades yet</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Add scores to deliverables to see projections
                </p>
              </div>
            )}
          </div>

          {/* Target Grade Calculator */}
          <div className="rounded-xl p-8 shadow-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: '4px solid var(--success)' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-50 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Target Grade Calculator</h2>
            </div>

            <div className="space-y-5">
              <p className="text-sm text-gray-600">
                We'll show what scores you need on remaining work to reach your goal.
              </p>
              <div className="flex gap-3">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={targetGrade}
                  onChange={(e) => setTargetGrade(e.target.value)}
                  placeholder="Enter target grade (e.g., 90)"
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <button
                  onClick={calculateTarget}
                  disabled={!targetGrade}
                  className="px-8 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 shadow-sm"
                >
                  Calculate
                </button>
              </div>

              {targetResult && (
                <div className={`p-5 rounded-xl ${
                  targetResult.achievable ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'
                }`}>
                  <p className={`font-semibold text-lg mb-2 ${targetResult.achievable ? 'text-green-900' : 'text-red-900'}`}>
                    {targetResult.message}
                  </p>
                  {targetResult.requiredAverage !== null && targetResult.achievable && (
                    <>
                      <p className="text-sm text-gray-600 mt-2">
                        Remaining work weight: {targetResult.remainingWeight.toFixed(1)}%
                      </p>
                      <div className="mt-4 p-4 bg-white rounded-lg border border-green-200">
                        <div className="text-sm font-semibold text-gray-900 mb-2">💡 What this means:</div>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• You need ~{targetResult.requiredAverage.toFixed(0)}% on remaining work</li>
                          <li>• Suggested study increase: +{Math.max(0, Math.ceil((targetResult.requiredAverage - 75) / 10))}h/week</li>
                          <li>• Focus on high-weight deliverables first</li>
                        </ul>
                      </div>
                    </>
                  )}
                  {targetResult.requiredAverage !== null && !targetResult.achievable && (
                    <p className="text-sm text-gray-600 mt-2">
                      Remaining work weight: {targetResult.remainingWeight.toFixed(1)}%
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Deliverables Breakdown */}
          <div className="rounded-xl p-8 shadow-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Deliverables Breakdown</h2>
            
            {gradeData.deliverables.length === 0 ? (
              <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">No deliverables for this course yet.</p>
            ) : (
              <div className="space-y-3">
                {gradeData.deliverables.map((deliverable, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-4 px-5 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">{deliverable.name}</span>
                      <span className="text-sm text-gray-500 ml-3">({deliverable.weight}%)</span>
                    </div>
                    <div className="text-right">
                      {deliverable.score !== null ? (
                        <span className={`font-semibold text-lg ${
                          deliverable.score >= 80 ? 'text-green-600' :
                          deliverable.score >= 60 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {deliverable.score.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">
                          {deliverable.completed ? 'Completed (no score)' : 'Not completed'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
