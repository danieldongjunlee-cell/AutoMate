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
import { paymentMethodsService as apiPaymentMethodsService } from './api/paymentMethodsService';
import { pointsService as apiPointsService } from './api/pointsService';
import { proService as apiProService } from './api/proService';
import { quoteService as apiQuoteService } from './api/quoteService';
import { vehiclesService as apiVehiclesService } from './api/vehiclesService';
import { authService as mockAuthService } from './mock/authService';
import { communityService as mockCommunityService } from './mock/communityService';
import { compareService as mockCompareService } from './mock/compareService';
import { insuranceService as mockInsuranceService } from './mock/insuranceService';
import { maintService as mockMaintService } from './mock/maintService';
import { notificationService as mockNotificationService } from './mock/notificationService';
import { paymentMethodsService as mockPaymentMethodsService } from './mock/paymentMethodsService';
import { pointsService as mockPointsService } from './mock/pointsService';
import { proService as mockProService } from './mock/proService';
import { quoteService as mockQuoteService } from './mock/quoteService';
import { vehiclesService as mockVehiclesService } from './mock/vehiclesService';
import { communityService as supabaseCommunityService } from './supabase/communityService';
import { insuranceService as supabaseInsuranceService } from './supabase/insuranceService';
import { paymentMethodsService as supabasePaymentMethodsService } from './supabase/paymentMethodsService';
import { vehiclesService as supabaseVehiclesService } from './supabase/vehiclesService';
import { isSupabaseConfigured } from '../lib/supabase';

/** True when the app talks to the real server (EXPO_PUBLIC_API_URL set). */
export const USE_API = apiEnabled;

/**
 * True when Supabase env vars are set — the app stores real data directly in
 * Supabase (no server). Domains are migrated to Supabase one at a time; until a
 * domain has a Supabase twin it stays on the mock/api implementation.
 */
export const USE_SUPABASE = isSupabaseConfigured;

export const authService: typeof mockAuthService = USE_API ? apiAuthService : mockAuthService;
export const quoteService: typeof mockQuoteService = USE_API ? apiQuoteService : mockQuoteService;
export const maintService: typeof mockMaintService = USE_API ? apiMaintService : mockMaintService;
export const notificationService: typeof mockNotificationService = USE_API
  ? apiNotificationService
  : mockNotificationService;
export const communityService: typeof mockCommunityService = USE_SUPABASE
  ? supabaseCommunityService
  : USE_API
    ? apiCommunityService
    : mockCommunityService;
export const proService: typeof mockProService = USE_API ? apiProService : mockProService;
export const compareService: typeof mockCompareService = USE_API
  ? apiCompareService
  : mockCompareService;
export const insuranceService: typeof mockInsuranceService = USE_SUPABASE
  ? supabaseInsuranceService
  : USE_API
    ? apiInsuranceService
    : mockInsuranceService;
export const pointsService: typeof mockPointsService = USE_API
  ? apiPointsService
  : mockPointsService;
export const vehiclesService: typeof mockVehiclesService = USE_SUPABASE
  ? supabaseVehiclesService
  : USE_API
    ? apiVehiclesService
    : mockVehiclesService;
export const paymentMethodsService: typeof mockPaymentMethodsService = USE_SUPABASE
  ? supabasePaymentMethodsService
  : USE_API
    ? apiPaymentMethodsService
    : mockPaymentMethodsService;

// Shared constants/types that screens use alongside the services.
export { DEMO_EMAIL, DEMO_OTP, DEMO_PASSWORD, MOCK_PHONE } from './mock/authService';
export type { SignUpInput, VerifyChannel } from './mock/authService';
export type { Vehicle, VehicleInput } from './mock/vehiclesService';
export type { PaymentCard, PaymentCardInput } from './mock/paymentMethodsService';
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
