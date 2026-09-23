import type { InsightRepository } from '@/core/domain/repository';
import { DomainError } from '@/core/domain/domain-error';
import { ViewModel } from '@/core/presentation/view-model';
import { uiData, uiEmpty, uiError, uiLoading } from '@/core/presentation/ui-state';
import { RequestInsight } from '../../domain/request-insight';
import type { InsightState } from './types';

export type { InsightState } from './types';

/** Estado do rascunho da IA. Sem React: o teste roda sem simulador. */
export class InsightViewModel extends ViewModel<InsightState> {
  private readonly requestInsight: RequestInsight;
  private readonly insights: InsightRepository;

  constructor(
    insights: InsightRepository,
    private readonly patientId: string,
  ) {
    super({ ui: uiEmpty(), creating: false, approving: false, approved: false, approveError: null });
    this.requestInsight = new RequestInsight(insights);
    this.insights = insights;
  }

  async create(aiEnabled: boolean): Promise<void> {
    this.setState({ creating: true, ui: uiLoading() });

    const result = await this.requestInsight.execute(this.patientId, aiEnabled);
    if (!result.ok) {
      this.setState({ creating: false, ui: uiError(result.error) });
      return;
    }

    this.setState({
      creating: false,
      ui: uiData(result.value),
      approved: result.value.status === 'aprovado',
      approveError: null,
    });
  }

  /**
   * O rascunho só chega à paciente depois da aprovação da nutricionista, e a
   * decisão fica no servidor. Otimista na tela, revertida se o servidor recusar.
   */
  async approve(): Promise<void> {
    const state = this.getSnapshot();
    if (state.ui.kind !== 'data' || state.approving || state.approved) return;

    const before = state.ui.data;
    this.setState({
      approving: true,
      approved: true,
      approveError: null,
      ui: uiData({ ...before, status: 'aprovado' }),
    });

    const result = await this.insights.approve(before.id);
    if (!result.ok) {
      this.setState({
        approving: false,
        approved: false,
        approveError: DomainError.from(result.error),
        ui: uiData(before),
      });
      return;
    }

    this.setState({ approving: false, approved: true, ui: uiData(result.value) });
  }
}
