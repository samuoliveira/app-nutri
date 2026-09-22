import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { brandIds, brandById } from '@/core/designsystem/brands';
import { Divider, Screen, SegmentedControl, Text, type Segment } from '@/core/designsystem/native';
import { spacing } from '@/core/designsystem/tokens';
import { useFlags } from '@/core/flags/use-flag';
import { publishFlag } from '@/core/network/flag-sync';
import { getNetworkConfig, setNetworkConfig } from '@/core/network/network-config';
import { queryKeys } from '@/core/query/query-keys';
import { useOta } from '@/core/platform/ota';
import { useBrandStore } from '@/core/state/brand-store';
import { useSessionStore } from '@/core/state/session-store';
import { SettingRow } from '../SettingRow';

const BRAND_SEGMENTS: ReadonlyArray<Segment<string>> = brandIds.map((id) => ({
  value: id,
  label: brandById(id).displayName.split(' ')[0] ?? id,
}));

/** Painel de operação: marca, kill switch, offline, OTA e biometria. */
export function SettingsScreen() {
  const queryClient = useQueryClient();
  const flags = useFlags();
  const brandId = useBrandStore((state) => state.brandId);
  const setBrand = useBrandStore((state) => state.setBrand);
  const setUnlocked = useSessionStore((state) => state.setUnlocked);
  const ota = useOta();
  const [offline, setOffline] = useState(getNetworkConfig().forcedOffline);

  const flipFlag = (key: 'ai_insights' | 'agenda_tab' | 'biometric_lock', value: boolean) => {
    void publishFlag(key, value).finally(() => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.flags.snapshot() });
    });
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text token="title1">Mais</Text>

        <View style={styles.section}>
          <Text token="footnote" tone="muted" weight="500">
            Marca
          </Text>
          <SegmentedControl
            segments={BRAND_SEGMENTS}
            selected={brandId}
            onSelect={(value) => setBrand(value as typeof brandId)}
            accessibilityLabel="Trocar marca"
          />
          <Text token="footnote" tone="subtle">
            Telas, regras e API são as mesmas: muda cor, tipografia, forma e nome do assistente.
          </Text>
        </View>

        <Divider />

        <View style={styles.section}>
          <Text token="footnote" tone="muted" weight="500">
            Recursos remotos
          </Text>
          <SettingRow
            title="Assistente de IA"
            description="Kill switch: desligado, o card some e o servidor recusa."
            value={flags.ai_insights}
            onToggle={(value) => flipFlag('ai_insights', value)}
          />
          <SettingRow
            title="Aba Agenda"
            description="Some da barra de abas em até 1 minuto."
            value={flags.agenda_tab}
            onToggle={(value) => flipFlag('agenda_tab', value)}
          />
          <SettingRow
            title="Bloqueio por biometria"
            description="Pede Face ID / digital ao abrir e após 1 min em segundo plano."
            value={flags.biometric_lock}
            onToggle={(value) => {
              flipFlag('biometric_lock', value);
              if (!value) setUnlocked(true);
            }}
          />
        </View>

        <Divider />

        <View style={styles.section}>
          <Text token="footnote" tone="muted" weight="500">
            Rede
          </Text>
          <SettingRow
            title="Simular offline"
            description="A carteira salva no aparelho continua abrindo."
            value={offline}
            onToggle={(value) => {
              setOffline(value);
              setNetworkConfig({ forcedOffline: value });
              void queryClient.invalidateQueries();
            }}
          />
        </View>

        <Divider />

        <View style={styles.section}>
          <Text token="footnote" tone="muted" weight="500">
            Atualização do app
          </Text>
          <SettingRow
            title="Buscar atualização OTA"
            description={ota.message ?? `Canal ${ota.channel} · runtime ${ota.runtimeVersion}`}
            trailingLabel={ota.checking ? 'Buscando…' : 'Buscar'}
            onPress={ota.check}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.screenX, paddingTop: spacing.lg, paddingBottom: 150, gap: spacing.lg },
  section: { gap: spacing.sm },
});
