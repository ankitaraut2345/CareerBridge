/**
 * CareerBridge Dynamic Eligibility Calculation Engine
 * 
 * Dynamically computes a student's eligibility for an opportunity.
 * NEVER stores 'eligible = true/false' statically on DB documents.
 */

// Canonicalize skill names for consistent comparison (e.g. 'JavaScript', 'javascript', 'JAVASCRIPT')
const normalizeSkill = (s) => {
  if (!s) return '';
  return String(s)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9#+.]/g, '');
};

// Canonicalize department names for flexible matching (e.g. 'Computer Science' vs 'computer science' vs 'CSE')
const normalizeDepartment = (dept) => {
  if (!dept) return '';
  const d = String(dept).toLowerCase().trim();
  if (d.includes('computer') || d === 'cse' || d === 'cs') return 'computer science';
  if (d.includes('information') || d === 'it') return 'information technology';
  if (d.includes('electronics') || d.includes('communication') || d === 'ece' || d === 'entc')
    return 'electronics & communication';
  if (d.includes('electrical') || d === 'ee') return 'electrical engineering';
  if (d.includes('mechanical') || d === 'me') return 'mechanical engineering';
  if (d.includes('civil')) return 'civil engineering';
  if (d.includes('data science') || d === 'ds') return 'data science';
  if (d.includes('artificial') || d.includes('machine learning') || d.includes('ai'))
    return 'ai & machine learning';
  return d;
};

/**
 * Calculate dynamic eligibility
 * @param {Object} studentProfile - Current student profile document
 * @param {Object} opportunity - Target opportunity document
 * @returns {Object} Comprehensive eligibility report
 */
const calculateEligibility = (studentProfile, opportunity) => {
  const checks = [];
  let hasIncomplete = false;
  let hasFailed = false;

  // If student profile does not exist at all
  if (!studentProfile) {
    return {
      eligible: false,
      state: 'INCOMPLETE_PROFILE',
      message: 'Student profile not created yet. Please complete your profile.',
      checks: [
        {
          criterion: 'Profile Status',
          required: 'Completed Student Profile',
          actual: 'Profile Not Found',
          passed: false,
          status: 'INCOMPLETE',
          reason: 'Please create and fill out your student profile.',
        },
      ],
    };
  }

  // 1. Department Check
  const reqDepts = opportunity.eligibleDepartments || [];
  if (reqDepts.length > 0) {
    const studentDept = studentProfile.department;
    if (!studentDept || !studentDept.trim()) {
      checks.push({
        criterion: 'Department',
        required: reqDepts.join(', '),
        actual: 'Not specified',
        passed: false,
        status: 'INCOMPLETE',
        reason: 'Department is missing from your student profile.',
      });
      hasIncomplete = true;
    } else {
      const studentNorm = normalizeDepartment(studentDept);
      const isMatch = reqDepts.some((d) => normalizeDepartment(d) === studentNorm || d.toLowerCase().includes(studentNorm));
      if (isMatch) {
        checks.push({
          criterion: 'Department',
          required: reqDepts.join(', '),
          actual: studentDept,
          passed: true,
          status: 'PASSED',
        });
      } else {
        checks.push({
          criterion: 'Department',
          required: reqDepts.join(', '),
          actual: studentDept,
          passed: false,
          status: 'FAILED',
          reason: `Your department (${studentDept}) is not among the eligible departments.`,
        });
        hasFailed = true;
      }
    }
  } else {
    checks.push({
      criterion: 'Department',
      required: 'Open to all departments',
      actual: studentProfile.department || 'All Departments',
      passed: true,
      status: 'PASSED',
    });
  }

  // 2. Graduation Year Check
  const reqYears = opportunity.eligibleGraduationYears || [];
  if (reqYears.length > 0) {
    const studentYear = studentProfile.graduationYear;
    if (!studentYear) {
      checks.push({
        criterion: 'Graduation Year',
        required: reqYears.map((y) => `Class of ${y}`).join(', '),
        actual: 'Not specified',
        passed: false,
        status: 'INCOMPLETE',
        reason: 'Graduation year is missing from your student profile.',
      });
      hasIncomplete = true;
    } else {
      const isMatch = reqYears.includes(Number(studentYear));
      if (isMatch) {
        checks.push({
          criterion: 'Graduation Year',
          required: reqYears.map((y) => `Class of ${y}`).join(', '),
          actual: `Class of ${studentYear}`,
          passed: true,
          status: 'PASSED',
        });
      } else {
        checks.push({
          criterion: 'Graduation Year',
          required: reqYears.map((y) => `Class of ${y}`).join(', '),
          actual: `Class of ${studentYear}`,
          passed: false,
          status: 'FAILED',
          reason: `Your graduation batch (${studentYear}) is not eligible for this drive.`,
        });
        hasFailed = true;
      }
    }
  } else {
    checks.push({
      criterion: 'Graduation Year',
      required: 'Open to all batches',
      actual: studentProfile.graduationYear ? `Class of ${studentProfile.graduationYear}` : 'Any Batch',
      passed: true,
      status: 'PASSED',
    });
  }

  // 3. CGPA Cutoff Check
  const minCGPA = opportunity.minimumCGPA !== undefined ? Number(opportunity.minimumCGPA) : 0;
  if (minCGPA > 0) {
    const studentCGPA = studentProfile.cgpa;
    if (studentCGPA === undefined || studentCGPA === null || isNaN(studentCGPA) || studentCGPA === '') {
      checks.push({
        criterion: 'Minimum CGPA',
        required: `${minCGPA.toFixed(1)} / 10.0`,
        actual: 'Not specified',
        passed: false,
        status: 'INCOMPLETE',
        reason: 'CGPA is not listed in your profile.',
      });
      hasIncomplete = true;
    } else {
      const numCGPA = Number(studentCGPA);
      if (numCGPA >= minCGPA) {
        checks.push({
          criterion: 'Minimum CGPA',
          required: `${minCGPA.toFixed(1)} / 10.0`,
          actual: `${numCGPA.toFixed(2)} / 10.0`,
          passed: true,
          status: 'PASSED',
        });
      } else {
        checks.push({
          criterion: 'Minimum CGPA',
          required: `${minCGPA.toFixed(1)} / 10.0`,
          actual: `${numCGPA.toFixed(2)} / 10.0`,
          passed: false,
          status: 'FAILED',
          reason: `Your CGPA (${numCGPA.toFixed(2)}) is below the required cutoff of ${minCGPA.toFixed(1)}.`,
        });
        hasFailed = true;
      }
    }
  } else {
    checks.push({
      criterion: 'Minimum CGPA',
      required: 'No minimum cutoff',
      actual: studentProfile.cgpa ? `${Number(studentProfile.cgpa).toFixed(2)} / 10.0` : 'None',
      passed: true,
      status: 'PASSED',
    });
  }

  // 4. Backlogs Check
  const maxBacklogs = opportunity.maximumBacklogs !== undefined ? Number(opportunity.maximumBacklogs) : null;
  if (maxBacklogs !== null && maxBacklogs >= 0) {
    const studentBacklogs = studentProfile.backlogs;
    if (studentBacklogs === undefined || studentBacklogs === null || isNaN(studentBacklogs)) {
      checks.push({
        criterion: 'Active Backlogs',
        required: `Maximum ${maxBacklogs} allowed`,
        actual: 'Not specified',
        passed: false,
        status: 'INCOMPLETE',
        reason: 'Backlog details are missing in your profile.',
      });
      hasIncomplete = true;
    } else {
      const numBacklogs = Number(studentBacklogs);
      if (numBacklogs <= maxBacklogs) {
        checks.push({
          criterion: 'Active Backlogs',
          required: `Maximum ${maxBacklogs} allowed`,
          actual: `${numBacklogs} active backlogs`,
          passed: true,
          status: 'PASSED',
        });
      } else {
        checks.push({
          criterion: 'Active Backlogs',
          required: `Maximum ${maxBacklogs} allowed`,
          actual: `${numBacklogs} active backlogs`,
          passed: false,
          status: 'FAILED',
          reason: `You have ${numBacklogs} active backlogs (maximum permitted: ${maxBacklogs}).`,
        });
        hasFailed = true;
      }
    }
  } else {
    checks.push({
      criterion: 'Active Backlogs',
      required: 'No backlog restriction',
      actual: studentProfile.backlogs !== undefined ? `${studentProfile.backlogs} backlogs` : 'None',
      passed: true,
      status: 'PASSED',
    });
  }

  // 5. Skills Matching Check
  const reqSkills = opportunity.requiredSkills || [];
  if (reqSkills.length > 0) {
    const studentSkills = studentProfile.skills || [];
    const normalizedStudentSkills = new Set(studentSkills.map(normalizeSkill));

    const matched = [];
    const missing = [];

    for (const req of reqSkills) {
      const normReq = normalizeSkill(req);
      if (normalizedStudentSkills.has(normReq)) {
        matched.push(req);
      } else {
        missing.push(req);
      }
    }

    if (missing.length === 0) {
      checks.push({
        criterion: 'Required Skills',
        required: `${reqSkills.length} skills required`,
        actual: `All ${matched.length} matched (${matched.join(', ')})`,
        passed: true,
        status: 'PASSED',
        matched,
        missing: [],
      });
    } else {
      checks.push({
        criterion: 'Required Skills',
        required: reqSkills.join(', '),
        actual: matched.length > 0 ? `Matched: ${matched.join(', ')}` : 'No skills matched',
        passed: false,
        status: 'FAILED',
        reason: `Missing required technical skills: ${missing.join(', ')}`,
        matched,
        missing,
      });
      hasFailed = true;
    }
  } else {
    checks.push({
      criterion: 'Required Skills',
      required: 'No mandatory skill requirements',
      actual: 'Satisfied',
      passed: true,
      status: 'PASSED',
    });
  }

  // 6. Resume Check
  const resume = studentProfile.resume;
  if (!resume || !resume.url) {
    checks.push({
      criterion: 'Resume Upload',
      required: 'Active PDF resume in profile',
      actual: 'No resume uploaded',
      passed: false,
      status: 'INCOMPLETE',
      reason: 'Please upload a resume to your student profile before applying.',
    });
    hasIncomplete = true;
  } else {
    checks.push({
      criterion: 'Resume Upload',
      required: 'Active PDF resume in profile',
      actual: resume.originalName || 'Resume available',
      passed: true,
      status: 'PASSED',
    });
  }

  // Determine overall verdict
  let state = 'ELIGIBLE';
  let message = 'You meet all academic eligibility criteria for this campus drive.';
  let eligible = true;

  if (hasIncomplete) {
    state = 'INCOMPLETE_PROFILE';
    message = 'Please update your student profile with missing criteria to verify eligibility.';
    eligible = false;
  } else if (hasFailed) {
    state = 'NOT_ELIGIBLE';
    message = 'You do not meet one or more academic criteria for this opportunity.';
    eligible = false;
  }

  return {
    eligible,
    state,
    message,
    checks,
  };
};

module.exports = {
  calculateEligibility,
  normalizeSkill,
  normalizeDepartment,
};
