import DateTimePicker from '@react-native-community/datetimepicker';
import { toCalendarDate } from '@streak-stats/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../../components/Button';
import { formatCalendarDate } from '../../lib/format';
import { useCreateStreak } from '../../lib/streaks';
import { colors, fonts, radius, screenPadding, spacing } from '../../theme';

/** Figma 9:2 "Add Streak". */
export default function AddStreakScreen() {
  const insets = useSafeAreaInsets();
  const [label, setLabel] = useState('');
  const [startDate, setStartDate] = useState(() => new Date());
  const [showPicker, setShowPicker] = useState(false);
  const createStreak = useCreateStreak();

  const start = toCalendarDate(startDate);
  const canSave = label.trim().length > 0 && !createStreak.isPending;

  function save() {
    if (!canSave) return;
    createStreak.mutate(
      { label: label.trim(), startDate: start },
      {
        onSuccess: () => router.back(),
        onError: (err) => Alert.alert("Couldn't save streak", err.message),
      },
    );
  }

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + spacing.sm, paddingBottom: Math.max(insets.bottom, spacing.xxxl) },
      ]}
    >
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.cancel}>Cancel</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={save} disabled={!canSave} hitSlop={12}>
          <Text style={[styles.save, !canSave && styles.disabled]}>Save</Text>
        </Pressable>
      </View>

      <Text style={styles.title}>New Streak</Text>

      <View style={styles.fields}>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>LABEL</Text>
          <TextInput
            style={[styles.inputBox, styles.inputText]}
            value={label}
            onChangeText={setLabel}
            placeholder="e.g. Days without smoking"
            placeholderTextColor={colors.textSubtle}
            maxLength={80}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={save}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>START DATE</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Start date ${formatCalendarDate(start)}. Edit`}
            onPress={() => setShowPicker((v) => !v)}
            style={[styles.inputBox, styles.dateRow]}
          >
            <View style={styles.dateLeft}>
              <Text style={styles.dateIcon}>📅</Text>
              <Text style={styles.inputText}>{formatCalendarDate(start)}</Text>
            </View>
            <Text style={styles.edit}>{showPicker && Platform.OS === 'ios' ? 'Done' : 'Edit'}</Text>
          </Pressable>
          {showPicker ? (
            <DateTimePicker
              value={startDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              maximumDate={new Date()}
              accentColor={colors.accent}
              onChange={(_event, date) => {
                if (Platform.OS === 'android') setShowPicker(false);
                if (date) setStartDate(date);
              }}
            />
          ) : null}
          <Text style={styles.hint}>
            Defaults to today — tap to pick an earlier date if your streak already started.
          </Text>
        </View>
      </View>

      <View style={styles.flexSpacer} />

      <Button title="Create Streak" onPress={save} disabled={!canSave} loading={createStreak.isPending} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: screenPadding, backgroundColor: colors.background },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cancel: { fontFamily: fonts.regular, fontSize: 16, color: colors.textSubtle },
  save: { fontFamily: fonts.semibold, fontSize: 16, color: colors.accent },
  disabled: { opacity: 0.4 },
  title: { fontFamily: fonts.semibold, fontSize: 26, color: colors.text, marginTop: 28 },
  fields: { gap: spacing.xxl, marginTop: spacing.xxxl },
  field: { gap: spacing.sm },
  fieldLabel: { fontFamily: fonts.medium, fontSize: 12, letterSpacing: 0.5, color: colors.textFieldLabel },
  inputBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radius.lg,
    padding: 14,
  },
  inputText: { fontFamily: fonts.regular, fontSize: 16, color: colors.text },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dateIcon: { fontSize: 16 },
  edit: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSubtle },
  hint: { fontFamily: fonts.regular, fontSize: 12, color: colors.textSubtle },
  flexSpacer: { flex: 1 },
});
