import { query } from '../utils/db';

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

interface TargetGradeResult {
  targetGrade: number;
  currentGrade: number | null;
  requiredAverage: number | null;
  remainingWeight: number;
  achievable: boolean;
  message: string;
}

export async function calculateCourseGrades(courseId: number): Promise<GradeData> {
  // Get all deliverables for the course
  const result = await query(
    `SELECT 
      name,
      grade_weight,
      score,
      estimated_hours,
      hours_completed
     FROM deliverables
     WHERE course_id = $1
     ORDER BY due_date ASC`,
    [courseId]
  );
  
  const deliverables = result.rows;
  
  if (deliverables.length === 0) {
    return {
      currentGrade: null,
      completedWeight: 0,
      totalWeight: 0,
      projectedGrade: null,
      deliverables: []
    };
  }
  
  // Calculate total weight
  const totalWeight = deliverables.reduce((sum, d) => sum + parseFloat(d.grade_weight), 0);
  
  // Calculate current grade (only completed deliverables with scores)
  const completedWithScores = deliverables.filter(d => 
    d.score !== null && parseFloat(d.hours_completed) >= parseFloat(d.estimated_hours)
  );
  
  let currentGrade: number | null = null;
  let completedWeight = 0;
  
  if (completedWithScores.length > 0) {
    const weightedSum = completedWithScores.reduce((sum, d) => 
      sum + (parseFloat(d.score) * parseFloat(d.grade_weight) / 100), 0
    );
    completedWeight = completedWithScores.reduce((sum, d) => sum + parseFloat(d.grade_weight), 0);
    currentGrade = (weightedSum / completedWeight) * 100;
  }
  
  // Calculate projected grade (assume 75% average on remaining work)
  let projectedGrade: number | null = null;
  const remainingWeight = totalWeight - completedWeight;
  
  if (currentGrade !== null && remainingWeight > 0) {
    const currentContribution = (currentGrade / 100) * completedWeight;
    const remainingContribution = 0.75 * remainingWeight; // Assume 75% on remaining
    projectedGrade = ((currentContribution + remainingContribution) / totalWeight) * 100;
  } else if (currentGrade !== null) {
    projectedGrade = currentGrade;
  }
  
  return {
    currentGrade,
    completedWeight,
    totalWeight,
    projectedGrade,
    deliverables: deliverables.map(d => ({
      name: d.name,
      weight: parseFloat(d.grade_weight),
      score: d.score ? parseFloat(d.score) : null,
      completed: parseFloat(d.hours_completed) >= parseFloat(d.estimated_hours)
    }))
  };
}

export async function calculateRequiredScores(
  courseId: number, 
  targetGrade: number
): Promise<TargetGradeResult> {
  const gradeData = await calculateCourseGrades(courseId);
  
  if (gradeData.totalWeight === 0) {
    return {
      targetGrade,
      currentGrade: null,
      requiredAverage: null,
      remainingWeight: 0,
      achievable: false,
      message: 'No deliverables found for this course'
    };
  }
  
  const remainingWeight = gradeData.totalWeight - gradeData.completedWeight;
  
  if (remainingWeight === 0) {
    return {
      targetGrade,
      currentGrade: gradeData.currentGrade,
      requiredAverage: null,
      remainingWeight: 0,
      achievable: gradeData.currentGrade !== null && gradeData.currentGrade >= targetGrade,
      message: gradeData.currentGrade !== null && gradeData.currentGrade >= targetGrade
        ? 'Target already achieved!'
        : 'All work completed. Target not achieved.'
    };
  }
  
  // Calculate required average on remaining work
  // targetGrade = (currentContribution + requiredAverage * remainingWeight) / totalWeight
  // requiredAverage = (targetGrade * totalWeight - currentContribution) / remainingWeight
  
  const currentContribution = gradeData.currentGrade !== null 
    ? (gradeData.currentGrade / 100) * gradeData.completedWeight 
    : 0;
  
  const requiredAverage = ((targetGrade / 100) * gradeData.totalWeight - currentContribution) / remainingWeight * 100;
  
  const achievable = requiredAverage <= 100 && requiredAverage >= 0;
  
  let message = '';
  if (!achievable && requiredAverage > 100) {
    message = 'Target grade is not achievable even with perfect scores on remaining work';
  } else if (!achievable && requiredAverage < 0) {
    message = 'Target grade is already guaranteed!';
  } else {
    message = `You need to average ${requiredAverage.toFixed(1)}% on remaining work to achieve ${targetGrade}%`;
  }
  
  return {
    targetGrade,
    currentGrade: gradeData.currentGrade,
    requiredAverage: achievable ? requiredAverage : null,
    remainingWeight,
    achievable,
    message
  };
}
