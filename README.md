# AutoMate

Two-sided consumer auto-care marketplace app: car owners submit damage photos,
get real dealer quotes, compare cash vs. insurance, book maintenance, and earn
reward points. Launching in the Northern Virginia / Fairfax corridor.

Built with **Expo + TypeScript** from `AutoMate_Interactive_Wireframe_v15.html`
(55 screens — see `docs/wireframe-analysis.md` for the full screen inventory,
navigation map, and design-token extraction, and `SCREENS.md` for the
wireframe-id → component checklist).

## Run it

```bash
npm install
npx expo start        # then press i (iOS simulator) / a (Android) or scan the QR
```

Type-check with `npm run typecheck`.

## Architecture

| Layer | Where | Notes |
|---|---|---|
| Navigation | `src/navigation/` | Bottom tabs (`MainTabs`) + a native stack per tab; auth gate in `RootNavigator`. Tab press always resets to the tab root (`popToTopOnBlur`). Cross-tab jumps and notification deep links go through `navigateCrossTab`. |
| Theme | `src/theme/` | Design tokens extracted from the wireframe (colors, 4-pt spacing, radii, type scale). Light + dark palettes; the Settings dark-mode toggle re-themes navigation and every screen. |
| App state | `src/store/useAppStore.ts` | Zustand: auth session, dark mode, reward points, damage-flow selections (parts/photos/type), multi-service booking cart. |
| Server state | React Query + `src/services/mock/` | All "API" calls go through mock services (quotes, bookings, maintenance history, community, notifications) with simulated latency — swap these for the real backend later. Mutable mock state (saved records, created posts, read notifications) is module-level "server" state. |
| Screens | `src/screens/{auth,home,maint,compare,community,profile}/` | One file per wireframe screen (small settings sub-screens share files). |
| Shared UI | `src/components/` | DealerCard, QuoteCard, ServiceSelectRow, NotificationCard, SettingsRow/TogglePill, FilterChips/PointsBadge, PostCard, CalendarMonth/TimeSlots, ProLockOverlay, Confirmation pieces, ui primitives (Screen/Card/Badge/SectionLabel/AvatarCircle). |

## Intentional mocks / stubs

Camera capture, receipt OCR, phone calls, calendar export, social sign-in,
maps, push notifications, and Pro purchases are mock interactions (Alerts or
stylized placeholders) until the backend and native modules are wired. The
after-hours submission variant triggers between 9 PM and 7 AM
(`isAfterHours` in `src/services/mock/quoteService.ts`).
