import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useTheme } from '@/core/designsystem/ThemeProvider';
import { Button, Divider, ErrorView, Icon, Screen, SkeletonList, Text } from '@/core/designsystem/native';
import { spacing } from '@/core/designsystem/tokens';
import { useContainer } from '@/core/di/container';
import { useFlag } from '@/core/flags/use-flag';
import { useViewModel } from '@/core/presentation/use-view-model';
import { InsightViewModel } from '../InsightViewModel';
import type { InsightSheetProps } from './types';

/** Sheet nativo do assistente. Com a flag desligada, nem chega a pedir. */
export function InsightSheet({ patientId }: InsightSheetProps) {
  const theme = useTheme();
  const container = useContainer();
  const aiEnabled = useFlag('ai_insights');

  const [state, viewModel] = useViewModel(
    () => new InsightViewModel(container.insights, patientId),
    [container, patientId],
  );

  useEffect(() => {
    void viewModel.create(aiEnabled);
  }, [aiEnabled, viewModel]);

  return (
    <Screen edges="none">
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.label}>
          <Icon name="sparkle" size={14} color={theme.palette.textMuted} />
          <Text token="footnote" tone="muted" weight="500">
            {theme.assistantName}
          </Text>
        </View>

        {state.ui.kind === 'loading' ? <SkeletonList rows={3} /> : null}

        {state.ui.kind === 'error' ? (
          state.ui.error.code === 'feature-disabled' ? (
            <View style={styles.disabled}>
              <Icon name="lock" size={26} color={theme.palette.textMuted} />
              <Text token="headline">Assistente indisponível</Text>
              <Text token="subhead" tone="muted" style={styles.centered}>
                O recurso está desligado para esta conta. As medições continuam disponíveis na ficha.
              </Text>
            </View>
          ) : (
            <ErrorView error={state.ui.error} onRetry={() => void viewModel.create(aiEnabled)} />
          )
        ) : null}

        {state.ui.kind === 'data' ? (
          <>
            <Text token="headline" style={styles.headline}>
              {state.ui.data.headline}
            </Text>

            <View style={styles.section}>
              <Text token="footnote" tone="muted" weight="500">
                O que encontramos
              </Text>
              <Text token="body">{state.ui.data.body}</Text>
            </View>

            <View style={styles.section}>
              <Text token="footnote" tone="muted" weight="500">
                Dados considerados
              </Text>
              {state.ui.data.consideredData.map((item) => (
                <View key={item.label} style={styles.dataRow}>
                  <Text token="footnote">{item.label}</Text>
                  <Text token="footnote" tone="muted">
                    {item.detail}
                  </Text>
                </View>
              ))}
            </View>

            <Divider />

            <View style={styles.footer}>
              <Text token="footnote" tone="muted" weight="500">
                Próximo passo
              </Text>
              <Text token="headline" weight="500">
                {state.approved ? 'Rascunho aprovado' : 'Criar orientação personalizada'}
              </Text>
              <Button
                label={state.approved ? 'Aprovado' : 'Aprovar rascunho'}
                onPress={viewModel.approve.bind(viewModel)}
                disabled={state.approved}
              />
              <Text token="footnote" tone="subtle">
                Gerado a partir de dados anonimizados ({state.ui.data.source === 'regras' ? 'regras clínicas' : 'IA'}).
                O rascunho só chega à paciente depois da sua revisão.
              </Text>
            </View>
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.screenX, paddingTop: spacing.lg, paddingBottom: 48, gap: spacing.md },
  label: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headline: { marginTop: spacing.sm },
  section: { gap: spacing.xs, paddingTop: spacing.md },
  dataRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7 },
  footer: { gap: spacing.md, paddingTop: spacing.lg },
  disabled: { alignItems: 'center', gap: spacing.sm, paddingTop: 80 },
  centered: { textAlign: 'center' },
});
