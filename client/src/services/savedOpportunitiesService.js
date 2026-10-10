/**
 * Client-side persistence and sync for Saved Opportunities
 */

const STORAGE_KEY = 'careerbridge_saved_opportunities';

export const getSavedOpportunityIds = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const isOpportunitySaved = (id) => {
  if (!id) return false;
  const ids = getSavedOpportunityIds();
  return ids.includes(id.toString());
};

export const toggleSaveOpportunity = (id) => {
  if (!id) return false;
  const strId = id.toString();
  const ids = getSavedOpportunityIds();
  let updated;
  let isSavedNow = false;

  if (ids.includes(strId)) {
    updated = ids.filter((item) => item !== strId);
    isSavedNow = false;
  } else {
    updated = [strId, ...ids];
    isSavedNow = true;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('careerbridge:saved_opportunities_changed'));
  } catch (err) {
    console.error('Failed to update saved opportunities', err);
  }

  return isSavedNow;
};

export const clearAllSavedOpportunities = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  window.dispatchEvent(new Event('careerbridge:saved_opportunities_changed'));
};
