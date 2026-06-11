import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { View } from 'react-native';

import { DealerCard } from '../../components/DealerCard';
import { FilterChips } from '../../components/FilterChips';
import { Screen, SectionLabel } from '../../components/ui';
import { MaintStackParamList } from '../../navigation/types';
import {
  DEALER_SERVICE_CHIPS,
  DEALERS,
  SCHEDULE_SERVICE_FILTERS,
} from '../../services/mock/data';
import { useAppStore } from '../../store/useAppStore';
import { spacing } from '../../theme';

type Nav = NativeStackNavigationProp<MaintStackParamList, 'MaintSchedule'>;

/** Wireframe s-maint-schedule: service-type filter + partner dealer cards. */
export function MaintScheduleScreen() {
  const navigation = useNavigation<Nav>();
  const startBooking = useAppStore((s) => s.startBooking);
  const [filter, setFilter] = useState(SCHEDULE_SERVICE_FILTERS[0]);

  const dealers = DEALERS.filter((d) => {
    const chips = DEALER_SERVICE_CHIPS[d.id];
    if (!chips) return false;
    if (filter === 'All') return true;
    const key = filter === 'Oil change' ? 'Oil' : filter;
    return chips.some((c) => c.startsWith(key));
  });

  return (
    <Screen>
      <FilterChips options={SCHEDULE_SERVICE_FILTERS} selected={filter} onSelect={setFilter} />
      <View style={{ marginTop: spacing.xs }}>
        <SectionLabel>Partner dealerships near Fairfax, VA</SectionLabel>
      </View>
      {dealers.map((dealer) => (
        <DealerCard
          key={dealer.id}
          dealer={dealer}
          serviceChips={DEALER_SERVICE_CHIPS[dealer.id]}
          onPress={() => {
            startBooking(dealer.id);
            navigation.navigate('MaintScheduleBook');
          }}
        />
      ))}
    </Screen>
  );
}
