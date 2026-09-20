import React from 'react';
import { Icon } from './Icon';
import { Modal, Text, View } from 'react-native';

import { CarBrandLogo } from './CarBrandLogo';
import { Tappable } from './Tappable';
import { brandOf } from '../hooks/useActiveVehicle';
import { Vehicle } from '../services';
import { useAppStore } from '../store/useAppStore';
import { radii, spacing, useTheme } from '../theme';

/** Wireframe car-sheet: pick which registered car is the active context. */
export function CarSwitcherSheet({
  visible,
  vehicles,
  activeId,
  onClose,
}: {
  visible: boolean;
  vehicles: Vehicle[];
  activeId?: string;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const setActiveVehicle = useAppStore((s) => s.setActiveVehicle);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Tappable noFeedback onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,.5)', justifyContent: 'flex-end' }}>
        <View
          onStartShouldSetResponder={() => true}
          style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: radii.sheet,
            borderTopRightRadius: radii.sheet,
            padding: spacing.lg,
            paddingBottom: spacing.xl,
          }}
        >
          <Text style={{ fontSize: 17, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.md }}>
            Switch car
          </Text>
          {vehicles.map((v) => {
            const on = v.id === (activeId ?? vehicles.find((x) => x.isPrimary)?.id ?? vehicles[0]?.id);
            return (
              <Tappable
                key={v.id}
                onPress={() => {
                  setActiveVehicle(v.id);
                  onClose();
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.sm,
                  backgroundColor: on ? colors.primarySurface : colors.surface,
                  borderWidth: 1.5,
                  borderColor: on ? colors.primary : colors.border,
                  borderRadius: radii.md,
                  padding: spacing.md,
                  marginBottom: spacing.sm,
                }}
              >
                {/* The car's own badge, so switching is recognisable at a glance. */}
                <CarBrandLogo brand={brandOf(v.name)} size={36} bg="transparent" />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>{v.name}</Text>
                  <Text style={{ fontSize: 12, color: colors.textTertiary }}>
                    {v.odometerMi.toLocaleString()} mi · {brandOf(v.name)}
                  </Text>
                </View>
                {on ? <Icon name="check" size={18} color={colors.primary} strokeWidth={2.4} /> : null}
              </Tappable>
            );
          })}
        </View>
      </Tappable>
    </Modal>
  );
}
