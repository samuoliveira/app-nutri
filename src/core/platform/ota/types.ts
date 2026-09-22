export interface OtaStatus {
  readonly channel: string;
  readonly runtimeVersion: string;
  readonly updateId: string | null;
  readonly checking: boolean;
  readonly message: string | null;
}
