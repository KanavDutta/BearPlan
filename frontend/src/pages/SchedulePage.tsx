import { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';

interface ScheduleSession {
  id: number;
  deliverable_id: number;
  deliverable_name: string;
  course_name: string;
  scheduled_date: string;
  allocated_hours: number;
  status: 'planned' | 'completed' | 'partial' | 'missed';
  actual_hours: number | null;
}

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [partialHours, setPartialHours] = useState<string>('');
  const [weeklyInsights, setWeeklyInsights] = useState<{
    totalHours: number;
    workloadStatus: string;
    heaviestCourse: string;
    deadlineRisk: string;
    recommendedFocusDay: string;
  } | null>(null);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    setLoading(true);
    try {
      const startDate = new Date().toISOString().split('T')[0];
      const response = await fetch(`http://localhost:3000/api/schedule?startDate=${startDate}`);
      const data = await response.json();
      
      // Convert allocated_hours from string to number if needed
      const sessions = data.map((session: any) => ({
        ...session,
        allocated_hours: parseFloat(session.allocated_hours)
      }));
      
      setSchedule(sessions);
      calculateWeeklyInsights(sessions);
    } catch (error) {
      console.error('Failed to load schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateWeeklyInsights = (sessions: ScheduleSession[]) => {
    if (sessions.length === 0) {
      setWeeklyInsights(null);
      return;
    }

    const totalHours = sessions.reduce((sum, s) => sum + s.allocated_hours, 0);
    
    // Find heaviest course
    const courseHours: Record<string, number> = {};
    sessions.forEach(s => {
      courseHours[s.course_name] = (courseHours[s.course_name] || 0) + s.allocated_hours;
    });
    const heaviestCourse = Object.entries(courseHours).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    
    // Workload status
    let workloadStatus = 'Balanced ✅';
    if (totalHours > 40) workloadStatus = 'Heavy ⚠️';
    else if (totalHours > 30) workloadStatus = 'Moderate 📊';
    else if (totalHours < 10) workloadStatus = 'Light 🌤️';
    
    // Deadline risk (check if any sessions are within 3 days)
    const today = new Date();
    const hasUrgentDeadlines = sessions.some(s => {
      const sessionDate = new Date(s.scheduled_date);
      const daysAway = Math.ceil((sessionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysAway <= 3;
    });
    const deadlineRisk = hasUrgentDeadlines ? 'High ⚠️' : 'Low ✅';
    
    // Recommended focus day (day with most hours)
    const dayHours: Record<string, number> = {};
    sessions.forEach(s => {
      const date = s.scheduled_date.split('T')[0];
      dayHours[date] = (dayHours[date] || 0) + s.allocated_hours;
    });
    const focusDate = Object.entries(dayHours).sort((a, b) => b[1] - a[1])[0]?.[0];
    const recommendedFocusDay = focusDate 
      ? new Date(focusDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' })
      : 'N/A';
    
    setWeeklyInsights({
      totalHours,
      workloadStatus,
      heaviestCourse,
      deadlineRisk,
      recommendedFocusDay
    });
  };

  const generateSchedule = async () => {
    setGenerating(true);
    try {
      const response = await fetch('http://localhost:3000/api/schedule/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to generate schedule');
        return;
      }
      
      await loadSchedule();
      alert('Schedule generated successfully!');
    } catch (error) {
      console.error('Failed to generate schedule:', error);
      alert('Failed to generate schedule');
    } finally {
      setGenerating(false);
    }
  };

  const updateProgress = async (sessionId: number, status: 'completed' | 'partial' | 'missed', actualHours?: number) => {
    try {
      const response = await fetch('http://localhost:3000/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          status,
          actualHours: status === 'partial' ? actualHours : undefined
        })
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to update progress');
        return;
      }

      await loadSchedule();
      setSelectedSession(null);
      setPartialHours('');
      alert('Progress updated! Schedule has been regenerated.');
    } catch (error) {
      console.error('Failed to update progress:', error);
      alert('Failed to update progress');
    }
  };

  const handlePartialSubmit = () => {
    if (selectedSession && partialHours) {
      updateProgress(selectedSession, 'partial', parseFloat(partialHours));
    }
  };

  // Group sessions by date
  const sessionsByDate = schedule.reduce((acc, session) => {
    const date = session.scheduled_date.split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(session);
    return acc;
  }, {} as Record<string, ScheduleSession[]>);

  const dates = Object.keys(sessionsByDate).sort();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': 
        return { 
          background: 'var(--success-soft)', 
          borderColor: 'var(--success)',
          borderLeft: '4px solid var(--success)'
        };
      case 'partial': 
        return { 
          background: 'var(--warning-soft)', 
          borderColor: 'var(--warning)',
          borderLeft: '4px solid var(--warning)'
        };
      case 'missed': 
        return { 
          background: 'var(--danger-soft)', 
          borderColor: 'var(--danger)',
          borderLeft: '4px solid var(--danger)'
        };
      default: 
        return { 
          background: 'var(--surface)', 
          borderColor: 'var(--border)',
          borderLeft: '4px solid var(--primary)'
        };
    }
  };

  if (loading) return <div className="text-center py-8">Loading schedule...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Weekly Schedule</h1>
          <p className="text-gray-600 mt-2">This schedule respects your availability and priorities</p>
        </div>
        <button
          onClick={generateSchedule}
          disabled={generating}
          className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
        >
          <Calendar className="w-4 h-4 mr-2" />
          {generating ? 'Generating...' : 'Generate Schedule'}
        </button>
      </div>

      {/* Weekly Health Insight Card */}
      {weeklyInsights && dates.length > 0 && (
        <div className="rounded-xl p-6 shadow-sm" style={{ 
          background: 'linear-gradient(135deg, var(--primary-soft) 0%, var(--surface) 100%)',
          border: '1px solid var(--primary-light)',
          borderLeft: '4px solid var(--primary)'
        }}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">📊</span>
            <h2 className="text-xl font-bold text-gray-900">This Week at a Glance</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Workload</div>
              <div className="font-semibold text-gray-900">{weeklyInsights.workloadStatus}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Heaviest Course</div>
              <div className="font-semibold text-gray-900">{weeklyInsights.heaviestCourse}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Deadline Risk</div>
              <div className="font-semibold text-gray-900">{weeklyInsights.deadlineRisk}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Focus Day</div>
              <div className="font-semibold text-gray-900">{weeklyInsights.recommendedFocusDay}</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              💡 <span className="font-medium">You're on track this week.</span> This plan respects your availability and priorities.
            </p>
          </div>
        </div>
      )}

      {dates.length === 0 && !loading && (
        <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-dashed border-gray-200">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No schedule yet</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">Generate your weekly study plan to get started</p>
          <button
            onClick={generateSchedule}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Generate Schedule
          </button>
        </div>
      )}

      <div className="space-y-6">
        {dates.map(date => {
          const sessions = sessionsByDate[date];
          const totalHours = sessions.reduce((sum, s) => sum + s.allocated_hours, 0);
          const dateObj = new Date(date + 'T00:00:00');
          const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
          const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

          return (
            <div key={date} className="rounded-xl p-6 shadow-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-100">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{dayName}</h2>
                  <p className="text-sm text-gray-500 mt-1">{dateStr}</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-blue-900">{totalHours.toFixed(1)}h total</span>
                </div>
              </div>

              <div className="space-y-3">
                {sessions.map(session => (
                  <div
                    key={session.id}
                    className="group border-2 rounded-xl p-5 transition-all hover:shadow-md"
                    style={getStatusColor(session.status)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-gray-900 text-lg">{session.deliverable_name}</h3>
                          {session.status === 'completed' && <span className="text-green-600 text-sm">✓ Complete</span>}
                          {session.status === 'partial' && <span className="text-yellow-600 text-sm">⚡ Partial</span>}
                          {session.status === 'missed' && <span className="text-red-600 text-sm">✗ Missed</span>}
                        </div>
                        <p className="text-sm text-gray-500 mb-3">{session.course_name}</p>
                        
                        {/* Progress Bar for completed/partial sessions */}
                        {(session.status === 'completed' || session.status === 'partial') && session.actual_hours && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                              <span>Progress</span>
                              <span>{Math.round((session.actual_hours / session.allocated_hours) * 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  session.status === 'completed' ? 'bg-green-600' : 'bg-yellow-600'
                                }`}
                                style={{ width: `${Math.min(100, (session.actual_hours / session.allocated_hours) * 100)}%` }}
                              />
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="font-medium">{session.allocated_hours}h allocated</span>
                          {session.actual_hours && (
                            <span className="text-gray-600">
                              • <span className="font-medium">{session.actual_hours}h completed</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {session.status === 'planned' && (
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => updateProgress(session.id, 'completed')}
                            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => setSelectedSession(session.id)}
                            className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors shadow-sm"
                          >
                            Partial
                          </button>
                          <button
                            onClick={() => updateProgress(session.id, 'missed')}
                            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                          >
                            Missed
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Partial Hours Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Partial Completion</h3>
            <p className="text-sm text-gray-600 mb-5">How many hours did you actually complete?</p>
            <input
              type="number"
              min="0"
              step="0.5"
              value={partialHours}
              onChange={(e) => setPartialHours(e.target.value)}
              placeholder="Hours completed"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handlePartialSubmit}
                disabled={!partialHours}
                className="flex-1 px-5 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
              >
                Submit
              </button>
              <button
                onClick={() => { setSelectedSession(null); setPartialHours(''); }}
                className="flex-1 px-5 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
