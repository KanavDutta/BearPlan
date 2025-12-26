import { useState, useEffect } from 'react';
import { availabilityApi } from '../services/api';
import type { WeeklyAvailability } from '../types';
import { Input } from '../components/ui/input';
import { Clock } from 'lucide-react';

export default function AvailabilityPage() {
  const [availability, setAvailability] = useState<WeeklyAvailability>({
    sunday: 0,
    monday: 0,
    tuesday: 0,
    wednesday: 0,
    thursday: 0,
    friday: 0,
    saturday: 0
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      const response = await availabilityApi.get();
      setAvailability(response.data);
    } catch (error) {
      console.error('Failed to load availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await availabilityApi.set(availability);
      alert('Availability saved successfully!');
    } catch (error) {
      console.error('Failed to save availability:', error);
      alert('Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (day: keyof WeeklyAvailability, value: string) => {
    const hours = parseFloat(value) || 0;
    if (hours >= 0 && hours <= 24) {
      setAvailability({ ...availability, [day]: hours });
    }
  };

  const totalHours = Object.values(availability).reduce((sum: number, hours: number) => sum + hours, 0);

  const days = [
    { key: 'monday' as keyof WeeklyAvailability, label: 'Monday' },
    { key: 'tuesday' as keyof WeeklyAvailability, label: 'Tuesday' },
    { key: 'wednesday' as keyof WeeklyAvailability, label: 'Wednesday' },
    { key: 'thursday' as keyof WeeklyAvailability, label: 'Thursday' },
    { key: 'friday' as keyof WeeklyAvailability, label: 'Friday' },
    { key: 'saturday' as keyof WeeklyAvailability, label: 'Saturday' },
    { key: 'sunday' as keyof WeeklyAvailability, label: 'Sunday' }
  ];

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Weekly Availability</h1>
        <p className="text-gray-600 mt-2">Set how many hours you can study each day</p>
      </div>

      <div className="rounded-xl p-8 shadow-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5">
            {days.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-6 py-4 border-b border-gray-100 last:border-0">
                <label className="text-base font-medium text-gray-700 w-32">{label}</label>
                <div className="flex items-center gap-4 flex-1">
                  <Input
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    value={availability[key]}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="w-20 text-center text-base"
                  />
                  <span className="text-sm text-gray-500 w-12">hours</span>
                  <div className="flex-1 max-w-xs bg-gray-100 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${(availability[key] / 24) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-blue-600" />
                <span className="text-lg font-semibold text-gray-900">Total Weekly Hours:</span>
              </div>
              <span className="text-3xl font-bold text-blue-600">{totalHours.toFixed(1)}h</span>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
            >
              {saving ? 'Saving...' : 'Save Availability'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <span className="text-xl">💡</span>
          Tips for Setting Availability
        </h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Be realistic about your available study time each day</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>BearPlan will never schedule more than your available hours</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>You can update this anytime as your schedule changes</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
