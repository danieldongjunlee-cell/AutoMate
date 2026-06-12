/** Real insurance service (server /profile/policies + /insurance) — mirrors services/mock/insuranceService. */
import {
  ConnectResult,
  InsuranceProviderInfo,
  Policy,
  PolicyInput,
  ScannedInsuranceCard,
} from '../mock/insuranceService';
import { request } from './client';

/** Raw insurance_policies row (nullable text columns). */
interface ServerPolicy {
  id: string;
  carrier: string;
  coverage: string;
  policyNumber: string;
  deductible: number;
  premiumPerYear: number;
  covers: string | null;
  renewal: string | null;
  status: string;
}

const toPolicy = (p: ServerPolicy): Policy => ({
  id: p.id,
  carrier: p.carrier,
  coverage: p.coverage,
  policyNumber: p.policyNumber,
  deductible: p.deductible,
  premiumPerYear: p.premiumPerYear,
  covers: p.covers ?? '',
  renewal: p.renewal ?? '',
  status: p.status,
});

export const insuranceService = {
  async listPolicies(): Promise<Policy[]> {
    return (await request<ServerPolicy[]>('/profile/policies')).map(toPolicy);
  },

  async addPolicy(input: PolicyInput): Promise<{ ok: boolean; policy: Policy }> {
    const r = await request<{ ok: boolean; policy: ServerPolicy }>('/profile/policies', {
      body: input,
    });
    return { ok: r.ok, policy: toPolicy(r.policy) };
  },

  async updatePolicy(
    id: string,
    patch: Partial<PolicyInput>,
  ): Promise<{ ok: boolean; policy: Policy }> {
    const r = await request<{ ok: boolean; policy: ServerPolicy }>(`/profile/policies/${id}`, {
      method: 'PUT',
      body: patch,
    });
    return { ok: r.ok, policy: toPolicy(r.policy) };
  },

  async removePolicy(id: string): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>(`/profile/policies/${id}`, { method: 'DELETE' });
  },

  async scanCard(): Promise<ScannedInsuranceCard> {
    // The RN camera is still simulated, so no file is attached yet; the
    // server forwards a placeholder to damage-ai /insurance-card and returns
    // the extracted fields (with its deterministic TS fallback if the
    // service is down).
    const card = await request<ScannedInsuranceCard & { modelMode: string }>(
      '/insurance/scan-card',
      { body: {} },
    );
    return {
      provider: card.provider,
      policyNumber: card.policyNumber,
      deductible: card.deductible,
      premiumPerYear: card.premiumPerYear,
      coverageType: card.coverageType,
      renewalDate: card.renewalDate,
    };
  },

  async getProviders(): Promise<InsuranceProviderInfo[]> {
    return request<InsuranceProviderInfo[]>('/insurance/providers');
  },

  async connect(providerId?: string): Promise<ConnectResult> {
    const r = await request<Omit<ConnectResult, 'policies'> & { policies: ServerPolicy[] }>(
      '/insurance/connect',
      { body: providerId ? { providerId } : {} },
    );
    return { ...r, policies: r.policies.map(toPolicy) };
  },
};
