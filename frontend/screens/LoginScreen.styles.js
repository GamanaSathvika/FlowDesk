import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F8FC',
  },
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  inner: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  shape: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.45,
  },
  shapeA: {
    width: 260,
    height: 260,
    top: -70,
    right: -80,
    backgroundColor: '#DBEAFE',
  },
  shapeB: {
    width: 240,
    height: 240,
    bottom: -90,
    left: -80,
    backgroundColor: '#BFDBFE',
  },
  shapeC: {
    width: 180,
    height: 180,
    top: 110,
    left: -60,
    backgroundColor: '#E0E7FF',
    opacity: 0.35,
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
  form: {
    marginTop: 20,
  },
  forgotWrap: {
    alignSelf: 'flex-end',
    marginTop: 2,
    marginBottom: 16,
  },
  forgot: {
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: 14,
  },
  error: {
    marginTop: 14,
    color: '#DC2626',
    fontSize: 13,
    textAlign: 'center',
  },
  footerWrap: {
    marginTop: 14,
    alignSelf: 'center',
  },
  footer: {
    textAlign: 'center',
    color: '#6B7280',
  },
  link: {
    color: '#3B82F6',
    fontWeight: 'bold',
  },
});

