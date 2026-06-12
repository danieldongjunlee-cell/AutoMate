/**
 * Payment-methods service, api twin.
 *
 * TODO(server): there is no payment_methods table/route yet — a real PCI
 * integration (Stripe SetupIntents or similar) lands in a later phase. Until
 * then api mode shares the mock's module-state list so the UI stays fully
 * functional either way.
 */
export { paymentMethodsService } from '../mock/paymentMethodsService';
