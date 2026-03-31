import { StyleSheet } from 'react-native';

export const palette = {
  blue: '#3B82F6',
  blueDark: '#2563EB',
  bgTop: '#F6F8FC',
  bgBottom: '#E8F0FF',
  card: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  white: '#FFFFFF',
  danger: '#DC2626',
};

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.bgTop,
  },
  flex: {
    flex: 1,
  },
  backgroundRoot: {
    ...StyleSheet.absoluteFillObject,
  },
  abstractShape: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: '#DBEAFE',
    opacity: 0.42,
  },
  abstractShapeTop: {
    width: 250,
    height: 250,
    top: -60,
    right: -70,
  },
  abstractShapeMid: {
    width: 180,
    height: 180,
    top: 120,
    left: -60,
    backgroundColor: '#E0E7FF',
    opacity: 0.32,
  },
  abstractShapeBottom: {
    width: 240,
    height: 240,
    bottom: -80,
    left: -70,
    backgroundColor: '#BFDBFE',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
    shadowColor: '#0F172A',
    shadowOpacity: 0.1,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  subheading: {
    marginTop: 10,
    fontSize: 14,
    color: palette.textSecondary,
    textAlign: 'center',
  },
  formWrap: {
    marginTop: 22,
  },
  formPanel: {
    gap: 12,
  },
  forgotWrap: {
    alignSelf: 'flex-end',
    marginTop: 2,
    marginBottom: 16,
  },
  forgotText: {
    color: palette.blue,
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    marginTop: 12,
    color: palette.danger,
    fontSize: 13,
    textAlign: 'center',
  },
  footerSwitch: {
    marginTop: 14,
    alignSelf: 'center',
  },
  footerText: {
    color: palette.textSecondary,
    fontSize: 14,
  },
  footerAction: {
    color: palette.blue,
    fontWeight: '700',
  },
  primaryBtn: {
    marginTop: 6,
  },
});

