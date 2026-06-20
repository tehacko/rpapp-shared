/** Shared loyalty types (pi-kiosk-shared pattern). */
export interface KioskLoyaltyCapability {
  readonly enabled: boolean;
}

export interface LoyaltyWalletSummary {
  readonly availablePoints: number;
  readonly pendingPoints: number;
}
