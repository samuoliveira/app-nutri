import type { InsightRepository } from '@/core/domain/repository';
import { ViewModel } from '@/core/presentation/view-model';
import { uiData, uiEmpty, uiError, uiLoading } from '@/core/presentation/ui-state';
import { RequestInsight } from '../../domain/request-insight';
import type { InsightState } from './types';

export type { InsightState } from './types';

/** Estado do rascunho da IA. Sem React: o teste roda sem simulador. */
export class InsightViewModel extends ViewModel<InsightState> {
  private readonly requestInsight: RequestInsight;

  constructor(
    insights: InsightRepository,
    private readonly patientId: string,
  ) {
    super({ ui: uiEmpty(), creating: false, approved: false });
    this.requestInsight = new RequestInsight(insights);
  }

  async create(aiEnabled: boolean): Promise<void> {
    this.setState({ creating: true, ui: uiLoading() });

    const result = await this.requestInsight.execute(this.patientId, aiEnabled);
    if (!result.ok) {
      this.setState({ creating: false, ui: uiError(result.error) });
      return;
    }

    this.setState({ creating: false, ui: uiData(result.value) });
  }

  /** O rascunho só chega à paciente depois da aprovação da nutricionista. */
  approve(): void {
    const state = this.getSnapshot();
    if (state.ui.kind !== 'data') return;
    this.setState({ approved: true, ui: uiData({ ...state.ui.data, status: 'aprovado' }) });
  }
}
