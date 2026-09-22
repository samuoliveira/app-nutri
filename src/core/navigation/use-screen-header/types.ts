export interface ScreenHeaderSpec {
  /** Título em linguagem de domínio; a tradução para a lib fica em withScreenHeader. */
  readonly title: string;
  readonly subtitle?: string;
  readonly largeTitle?: boolean;
  readonly showBack?: boolean;
  readonly transparent?: boolean;
}
