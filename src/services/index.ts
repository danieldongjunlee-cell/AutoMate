/**
 * Service-layer mode switch.
 *
 * Screens import services from here, never from ./mock or ./api directly.
 * With EXPO_PUBLIC_API_URL set the real API twins (./api, backed by server/)
 * are active; without it the app keeps running fully on the mocks.
 *
 * The `typeof mock*` annotations pin the api twins to the exact mock
 * signatures, so the two sets can never drift apart.
 */
import { authService as apiAuthService } from './api/authService';
import { apiEnabled } from './api/client';
import { communityService as apiCommunityService } from './api/communityService';
import { compareService as apiCompareService } from './api/compareService';
import { insuranceService as apiInsuranceService } from './api/insuranceService';
import { maintService as apiMaintService } from './api/maintService';
import { notificationService as apiNotificationService } from './api/notificationService';
import { pointsService as apiPointsService } from './api/pointsService';
import { proService as apiProService } from './api/proService';
import { quoteService as apiQuoteService } from './api/quoteService';
import { authService as mockAuthService } from './mock/authService';
import { communityService as mockCommunityService } from './mock/communityService';
import { compareService as mockCompareService } from './mock/compareService';
import { insuranceService as mockInsuranceService } from './mock/insuranceService';
import { maintService as mockMaintService } from './mock/maintService';
import { notificationService as mockNotificationService } from './mock/notificationService';
import { pointsService as mockPointsService } from './mock/pointsService';
import { proService as mockProService } from './mock/proService';
import { quoteService as mockQuoteService } from './mock/quoteService';

/** True when the app talks to the real server (EXPO_PUBLIC_API_URL set). */
export const USE_API = apiEnabled;

export const authService: typeof mockAuthService = USE_API ? apiAuthService : mockAuthService;
export const quoteService: typeof mockQuoteService = USE_API ? apiQuoteService : mockQuoteService;
export const maintService: typeof mockMaintService = USE_API ? apiMaintService : mockMaintService;
export const notificationService: typeof mockNotificationService = USE_API
  ? apiNotificationService
  : mockNotificationService;
export const communityService: typeof mockCommunityService = USE_API
  ? apiCommunityService
  : mockCommunityService;
export const proService: typeof mockProService = USE_API ? apiProService : mockProService;
export const compareService: typeof mockCompareService = USE_API
  ? apiCompareService
  : mockCompareService;
export const insuranceService: typeof mockInsuranceService = USE_API
  ? apiInsuranceService
  : mockInsuranceService;
export const pointsService: typeof mockPointsService = USE_API
  ? apiPointsService
  : mockPointsService;

// Shared constants/types that screens use alongside the services.
export { DEMO_EMAIL, DEMO_OTP, DEMO_PASSWORD, MOCK_PHONE } from './mock/authService';
export type { SignUpInput } from './mock/authService';
export { isAfterHours } from './mock/quoteService';
export type { AppNotification } from './mock/notificationService';
export type { Comparison, ComparisonRequest } from './mock/compareService';
export type {
  ConnectResult,
  InsuranceProviderInfo,
  Policy,
  PolicyInput,
  ScannedInsuranceCard,
} from './mock/insuranceService';
export type { CheckInResult, PointsLedgerEntry } from './mock/pointsService';
