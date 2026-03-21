export type LeadTier = "exclusive" | "premium" | "standard";

export type Lead = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  language: string | null;
  country: string | null;
  city: string | null;
  preferred_area: string | null;
  property_type: string | null;
  timeframe: string | null;
  financing_status: string | null;
  seller_status: string | null;
  rental_profile: string | null;
  budget: string | null;
  user_type: string | null;
  purpose: string | null;
  urgency: string | null;
  working_with_agency: string | null;
  flexibility: string | null;
  status: string | null;
  message: string | null;
  created_at: string | null;
};

export type AgencyApplication = {
  id: string;
  agency_name: string;
  email: string;
  status: string;
  country: string | null;
  city: string | null;
  preferred_cities: string | null;
  preferred_areas: string | null;
  property_types: string[] | null;
  client_types: string[] | null;
  languages_spoken: string[] | null;
  market_segments: string[] | null;
  min_budget: string | null;
  max_budget: string | null;
  response_speed: string | null;
  international_clients: string | null;
  lead_intent: string | null;
  exclusive_leads_only: string | null;
};

export type ScoredLead = Lead & {
  match_score: number;
  match_reason: string;
  match_label: string;
  lead_tier: LeadTier;
  lead_price: number;
};

export function normalizeText(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

export function splitCommaValues(value: string | null | undefined) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export function parseBudgetNumber(value: string | null | undefined) {
  if (!value) return null;

  const cleaned = value
    .replace(/[^\d.,]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseLeadBudgetRange(budget: string | null | undefined) {
  if (!budget) {
    return { min: null as number | null, max: null as number | null };
  }

  const normalized = budget.replace(/[^\d\-–—,.\s]/g, " ");
  const matches = normalized.match(/\d[\d.,]*/g) ?? [];

  if (matches.length < 2) {
    const single = parseBudgetNumber(matches[0] ?? null);
    return { min: single, max: single };
  }

  const min = parseBudgetNumber(matches[0]);
  const max = parseBudgetNumber(matches[1]);

  return { min, max };
}

export function isSameCountry(lead: Lead, application: AgencyApplication) {
  const agencyCountry = normalizeText(application.country);
  const leadCountry = normalizeText(lead.country);

  if (!agencyCountry || !leadCountry) return false;
  return agencyCountry === leadCountry;
}

export function getCityMatchType(
  lead: Lead,
  application: AgencyApplication
): "main_city" | "covered_city" | "none" {
  const leadCity = normalizeText(lead.city);
  const mainCity = normalizeText(application.city);
  const extraCities = splitCommaValues(application.preferred_cities);

  if (!leadCity) return "none";
  if (leadCity === mainCity) return "main_city";
  if (extraCities.includes(leadCity)) return "covered_city";
  return "none";
}

export function matchesPropertyType(lead: Lead, application: AgencyApplication) {
  const agencyPropertyTypes =
    application.property_types?.map((item) => item.trim().toLowerCase()) ?? [];

  if (agencyPropertyTypes.length === 0) return false;

  const leadPropertyType = normalizeText(lead.property_type);
  return agencyPropertyTypes.includes(leadPropertyType);
}

export function matchesClientType(lead: Lead, application: AgencyApplication) {
  const agencyClientTypes =
    application.client_types?.map((item) => item.trim().toLowerCase()) ?? [];

  if (agencyClientTypes.length === 0) return false;

  const leadUserType = normalizeText(lead.user_type);
  return agencyClientTypes.includes(leadUserType);
}

export function getBudgetMatchScore(lead: Lead, application: AgencyApplication) {
  const agencyMin = parseBudgetNumber(application.min_budget);
  const agencyMax = parseBudgetNumber(application.max_budget);
  const leadBudget = parseLeadBudgetRange(lead.budget);

  if (
    agencyMin === null ||
    agencyMax === null ||
    leadBudget.min === null ||
    leadBudget.max === null
  ) {
    return 0;
  }

  const overlap =
    Math.min(agencyMax, leadBudget.max) - Math.max(agencyMin, leadBudget.min);

  const leadRange = leadBudget.max - leadBudget.min;

  if (overlap <= 0) return 0;

  if (leadRange <= 0) {
    return 10;
  }

  const overlapRatio = overlap / leadRange;

  if (overlapRatio >= 0.75) return 14;
  if (overlapRatio >= 0.45) return 10;
  return 6;
}

export function matchesLanguage(lead: Lead, application: AgencyApplication) {
  const agencyLanguages =
    application.languages_spoken?.map((item) => item.trim().toLowerCase()) ?? [];

  if (agencyLanguages.length === 0) return false;

  const leadLanguage = normalizeText(lead.language);
  if (!leadLanguage) return false;

  return agencyLanguages.includes(leadLanguage);
}

export function matchesLeadIntent(lead: Lead, application: AgencyApplication) {
  const agencyLeadIntent = normalizeText(application.lead_intent);
  const leadUrgency = normalizeText(lead.urgency);

  if (!agencyLeadIntent) return false;
  if (agencyLeadIntent === "mixed") return true;

  if (agencyLeadIntent === "high_intent_only") {
    return leadUrgency === "ready_now" || leadUrgency === "actively_searching";
  }

  return false;
}

export function matchesInternationalClientSupport(
  lead: Lead,
  application: AgencyApplication
) {
  const internationalClients = normalizeText(application.international_clients);
  const leadLanguage = normalizeText(lead.language);

  if (!leadLanguage) return false;

  if (leadLanguage === "english") return true;
  return internationalClients === "yes";
}

export function getAreaMatchScore(lead: Lead, application: AgencyApplication) {
  const leadArea = normalizeText(lead.preferred_area);
  const agencyAreas = splitCommaValues(application.preferred_areas);

  if (!leadArea || agencyAreas.length === 0) return 0;

  for (const area of agencyAreas) {
    if (leadArea.includes(area) || area.includes(leadArea)) {
      return 18;
    }
  }

  return 0;
}

export function getResponseSpeedScore(application: AgencyApplication) {
  const responseSpeed = normalizeText(application.response_speed);

  if (responseSpeed === "under_1_hour") return 6;
  if (responseSpeed === "under_24_hours") return 5;
  if (responseSpeed === "one_to_three_days") return 3;
  if (responseSpeed === "more_than_three_days") return 1;
  return 0;
}

export function getTimeframeBonus(lead: Lead) {
  const timeframe = normalizeText(lead.timeframe);

  if (timeframe === "asap") return 8;
  if (timeframe === "within_30_days") return 5;
  if (timeframe === "1_3_months") return 3;
  return 0;
}

export function getUrgencyBonus(lead: Lead) {
  const urgency = normalizeText(lead.urgency);

  if (urgency === "ready_now") return 8;
  if (urgency === "actively_searching") return 5;
  if (urgency === "evaluating_options") return 2;
  return 0;
}

export function getScoreLabel(score: number) {
  if (score >= 80) return "STRONG";
  if (score >= 60) return "GOOD";
  return "BASIC";
}

export function getLeadTier(score: number): LeadTier {
  if (score >= 85) return "exclusive";
  if (score >= 65) return "premium";
  return "standard";
}

export function calculateLeadPrice(lead: Lead, score: number) {
  let price = 12;

  if (score >= 80) {
    price = 45;
  } else if (score >= 60) {
    price = 25;
  }

  const userType = normalizeText(lead.user_type);
  const urgency = normalizeText(lead.urgency);
  const timeframe = normalizeText(lead.timeframe);
  const budgetRange = parseLeadBudgetRange(lead.budget);
  const budgetMax = budgetRange.max ?? budgetRange.min ?? 0;

  if (userType === "investor") price *= 1.2;
  if (userType === "seller") price *= 1.15;
  if (userType === "landlord") price *= 1.08;
  if (userType === "tenant") price *= 0.9;

  if (urgency === "ready_now") price *= 1.2;
  else if (urgency === "actively_searching") price *= 1.1;

  if (timeframe === "asap") price *= 1.15;
  else if (timeframe === "within_30_days") price *= 1.08;

  if (budgetMax >= 1_000_000) price *= 1.25;
  else if (budgetMax >= 500_000) price *= 1.1;

  const finalPrice = Math.max(9, Math.min(79, Math.round(price)));
  return finalPrice;
}

export function scoreLeadAgainstAgency(
  lead: Lead,
  application: AgencyApplication
): ScoredLead | null {
  if (!isSameCountry(lead, application)) return null;

  const cityMatchType = getCityMatchType(lead, application);

  if (cityMatchType === "none") return null;

  let score = 0;
  const reasons: string[] = [];

  if (cityMatchType === "main_city") {
    score += 45;
    reasons.push("primary market alignment");
  } else {
    score += 28;
    reasons.push("covered city alignment");
  }

  const areaScore = getAreaMatchScore(lead, application);
  if (areaScore > 0) {
    score += areaScore;
    reasons.push("area compatibility");
  }

  if (matchesClientType(lead, application)) {
    score += 18;
    reasons.push("client profile fit");
  }

  if (matchesPropertyType(lead, application)) {
    score += 14;
    reasons.push("property compatibility");
  }

  const budgetScore = getBudgetMatchScore(lead, application);
  if (budgetScore > 0) {
    score += budgetScore;
    reasons.push("budget compatibility");
  }

  if (matchesLanguage(lead, application)) {
    score += 10;
    reasons.push("language fit");
  }

  if (matchesInternationalClientSupport(lead, application)) {
    score += 8;
    reasons.push("international client fit");
  }

  if (matchesLeadIntent(lead, application)) {
    score += 6;
    reasons.push("intent alignment");
  }

  const responseSpeedScore = getResponseSpeedScore(application);
  if (responseSpeedScore > 0) {
    score += responseSpeedScore;
    reasons.push("response readiness");
  }

  const timeframeBonus = getTimeframeBonus(lead);
  if (timeframeBonus > 0) {
    score += timeframeBonus;
    reasons.push("timeframe priority");
  }

  const urgencyBonus = getUrgencyBonus(lead);
  if (urgencyBonus > 0) {
    score += urgencyBonus;
    reasons.push("demand urgency");
  }

  score = Math.min(score, 100);

  return {
    ...lead,
    match_score: score,
    match_reason: reasons.join(" • "),
    match_label: getScoreLabel(score),
    lead_tier: getLeadTier(score),
    lead_price: calculateLeadPrice(lead, score),
  };
}