import type { QueryClient } from '@tanstack/react-query';

import { DomainError } from '@/core/domain/domain-error';
import type { Patient } from '@/core/domain/model';
import type { PatientRepository, PatientStatusFilter } from '@/core/domain/repository';
import { ViewModel } from '@/core/presentation/view-model';
import { uiData, uiEmpty, uiError, uiLoading } from '@/core/presentation/ui-state';
import { queryKeys } from '@/core/query/query-keys';
import { ListPatients } from '../../domain/list-patients';
import { TogglePin } from '../../domain/toggle-pin';
import type { PatientsListData, PatientsState } from './types';

export type { PatientsListData, PatientsState } from './types';

/** Espera o usuário parar de digitar antes de buscar. */
export const SEARCH_DEBOUNCE_MS = 300;

/** ViewModel puro: sem React, sem navegação. Testado sem renderizar tela. */
export class PatientsViewModel extends ViewModel<PatientsState> {
  private readonly listPatients: ListPatients;
  private readonly togglePin: TogglePin;
  private cursor: string | null = null;
  /** Só a resposta da requisição mais recente entra na tela. */
  private latestRequest = 0;
  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly patients: PatientRepository,
    private readonly queryClient: QueryClient,
    initial: { filter: PatientStatusFilter; search: string },
  ) {
    super({ ui: uiLoading(), filter: initial.filter, search: initial.search, loadingMore: false });
    this.listPatients = new ListPatients(patients);
    this.togglePin = new TogglePin(patients);
  }

  async load(): Promise<void> {
    this.cancelPendingSearch();
    this.cursor = null;
    this.setState({ ui: uiLoading() });
    await this.fetchPage(true);
  }

  async loadMore(): Promise<void> {
    const state = this.getSnapshot();
    if (state.loadingMore || this.cursor === null || state.ui.kind !== 'data') return;

    this.setState({ loadingMore: true });
    await this.fetchPage(false);
    this.setState({ loadingMore: false });
  }

  setFilter(filter: PatientStatusFilter): void {
    if (filter === this.getSnapshot().filter) return;
    this.setState({ filter });
    void this.load();
  }

  setSearch(search: string): void {
    this.setState({ search });
    this.cancelPendingSearch();
    this.searchTimer = setTimeout(() => void this.load(), SEARCH_DEBOUNCE_MS);
  }

  override dispose(): void {
    this.cancelPendingSearch();
    super.dispose();
  }

  /** Update otimista: a lista muda na hora e volta atrás se o servidor recusar. */
  async togglePinned(patient: Patient): Promise<void> {
    const before = this.getSnapshot().ui;
    this.patchPatient({ ...patient, pinned: !patient.pinned });

    const result = await this.togglePin.execute(patient);
    if (!result.ok) {
      this.setState({ ui: before });
      return;
    }

    this.patchPatient(result.value);
    await this.queryClient.invalidateQueries({ queryKey: queryKeys.patients.counts() });
  }

  private cancelPendingSearch(): void {
    if (this.searchTimer === null) return;
    clearTimeout(this.searchTimer);
    this.searchTimer = null;
  }

  private async fetchPage(replace: boolean): Promise<void> {
    const request = ++this.latestRequest;
    const { filter, search } = this.getSnapshot();
    const result = await this.listPatients.execute({
      query: { status: filter, search },
      cursor: replace ? null : this.cursor,
    });
    if (request !== this.latestRequest) return;

    if (!result.ok) {
      this.setState({ ui: uiError(result.error) });
      return;
    }

    this.cursor = result.value.nextCursor;
    const current = this.getSnapshot().ui;
    const previous: ReadonlyArray<Patient> =
      !replace && current.kind === 'data' ? current.data.items : [];
    const items = [...previous, ...result.value.items];

    this.setState({
      ui: items.length === 0
        ? uiEmpty<PatientsListData>()
        : uiData<PatientsListData>({ items, total: result.value.total }),
    });
  }

  private patchPatient(patient: Patient): void {
    const state = this.getSnapshot();
    if (state.ui.kind !== 'data') return;

    this.setState({
      ui: uiData({
        ...state.ui.data,
        items: state.ui.data.items.map((item) => (item.id === patient.id ? patient : item)),
      }),
    });
  }

  /** Usado pelos testes para verificar tradução de erro sem passar por rede. */
  static errorOf(cause: unknown): DomainError {
    return DomainError.from(cause);
  }
}
