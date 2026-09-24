import { Modal, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, spacing } from '../theme';
import { Button } from './Button';

type Props = {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Figma 7:25 "Confirm Dialog" over the 7:24 dim overlay. */
export function ConfirmModal({ visible, title, message, confirmLabel, loading, onConfirm, onCancel }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.dialog} accessibilityViewIsModal>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.actions}>
            <Button title="Cancel" variant="secondary" onPress={onCancel} style={styles.action} />
            <Button
              title={confirmLabel}
              variant="danger"
              onPress={onConfirm}
              loading={loading}
              style={styles.action}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  dialog: {
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xxl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 12,
  },
  title: { fontFamily: fonts.semibold, fontSize: 18, color: colors.text, textAlign: 'center' },
  message: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSubtle, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: 10, paddingTop: spacing.md, alignSelf: 'stretch' },
  action: { flex: 1 },
});
