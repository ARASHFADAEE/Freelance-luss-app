import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Button, Snackbar, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FREE_PLAN_LIMITS } from '@/core/constants';
import { formatJalaliDate, formatPersianNumber } from '@/core/utils/persian';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { useSubscription } from '@/hooks/useSubscription';
import { SUBSCRIPTION_PLANS } from '@/services/billing/subscriptionPlans';
import { BazaarPurchaseError } from '@/services/billing/BazaarBillingService';
import { ZibalPaymentError } from '@/services/billing/ZibalPaymentService';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

const PRO_FEATURES = [
  'مشتری، پروژه و فاکتور نامحدود',
  'صدور PDF و PNG',
  'گزارش‌های حرفه‌ای و نمودار',
  'پشتیبان‌گیری و چند ارزی',
];

export function SubscriptionScreen() {
  const theme = useAppTheme();
  const {
    isPremium,
    expiresAt,
    subscriptionType,
    purchasePlan,
    restorePurchases,
    handleWebPaymentReturn,
    isBillingSupported,
    isBazaar,
    isZibal,
    paymentProviderLabel,
  } = useSubscription();

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [snack, setSnack] = useState('');

  useEffect(() => {
    if (!isZibal) return;

    let cancelled = false;
    (async () => {
      const result = await handleWebPaymentReturn();
      if (cancelled) return;
      if (result === 'success') setSnack('اشتراک Pro با موفقیت فعال شد');
      if (result === 'failed') setSnack('پرداخت ناموفق بود یا لغو شد');
    })();

    return () => {
      cancelled = true;
    };
  }, [handleWebPaymentReturn, isZibal]);

  const handlePurchase = async (productId: string) => {
    setLoadingId(productId);
    try {
      await purchasePlan(productId);
      if (isZibal) {
        setSnack('در حال انتقال به درگاه زیبال...');
      } else {
        setSnack('اشتراک Pro با موفقیت فعال شد');
      }
    } catch (e) {
      if (e instanceof BazaarPurchaseError && e.code === 'USER_CANCELLED') {
        setSnack('خرید لغو شد');
      } else if (e instanceof ZibalPaymentError) {
        setSnack(e.message);
      } else {
        setSnack(e instanceof Error ? e.message : 'خطا در پرداخت');
      }
    } finally {
      setLoadingId(null);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const items = await restorePurchases();
      if (isZibal) {
        setSnack(isPremium ? 'وضعیت اشتراک بروزرسانی شد' : 'اشتراک فعالی یافت نشد');
      } else {
        setSnack(items.length > 0 ? 'خریدها بازیابی شد' : 'خرید فعالی یافت نشد');
      }
    } catch (e) {
      setSnack(e instanceof Error ? e.message : 'خطا در بازیابی');
    } finally {
      setRestoring(false);
    }
  };

  const purchaseButtonLabel = isZibal
    ? 'پرداخت با زیبال'
    : isBazaar
      ? 'خرید از کافه‌بازار'
      : 'خرید اشتراک';

  return (
    <ScreenContainer>
      {isPremium ? (
        <View style={[styles.activeBox, { backgroundColor: theme.custom.success + '12', borderColor: theme.custom.success }]}>
          <MaterialCommunityIcons name="crown" size={28} color={theme.custom.success} />
          <Text variant="titleMedium" style={{ fontWeight: '700', textAlign: 'right' }}>اشتراک Pro فعال است</Text>
          {subscriptionType ? (
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'right' }}>
              پلن: {subscriptionType}
            </Text>
          ) : null}
          {expiresAt ? (
            <Text variant="bodyMedium" style={{ textAlign: 'right' }}>
              انقضا: {formatJalaliDate(expiresAt.slice(0, 10))}
            </Text>
          ) : (
            <Text variant="bodyMedium" style={{ textAlign: 'right' }}>بدون تاریخ انقضا</Text>
          )}
        </View>
      ) : (
        <View style={[styles.planBox, { borderColor: theme.colors.outlineVariant }]}>
          <Text variant="titleMedium" style={styles.planTitle}>پلن رایگان (فعلی)</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'right', marginTop: 8, lineHeight: 22 }}>
            حداکثر {formatPersianNumber(FREE_PLAN_LIMITS.clients)} مشتری · {formatPersianNumber(FREE_PLAN_LIMITS.projects)} پروژه · {formatPersianNumber(FREE_PLAN_LIMITS.invoices)} فاکتور
          </Text>
        </View>
      )}

      {!isPremium && (
        <>
          <Text variant="titleMedium" style={{ fontWeight: '700', textAlign: 'right', marginVertical: 12 }}>
            انتخاب اشتراک Pro
          </Text>

          {isBillingSupported && paymentProviderLabel ? (
            <View style={[styles.providerBox, { backgroundColor: theme.colors.surfaceVariant + '40' }]}>
              <MaterialCommunityIcons
                name={isZibal ? 'credit-card-outline' : 'store-outline'}
                size={20}
                color={theme.colors.primary}
              />
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, flex: 1, textAlign: 'right' }}>
                {isZibal
                  ? 'پرداخت از طریق درگاه زیبال — مناسب نسخه وب'
                  : 'خرید درون‌برنامه‌ای از کافه‌بازار — مناسب نسخه اندروید'}
              </Text>
            </View>
          ) : null}

          {SUBSCRIPTION_PLANS.map((plan) => (
            <View
              key={plan.id}
              style={[styles.proBox, { backgroundColor: theme.colors.primary + '08', borderColor: theme.colors.primary }]}
            >
              <View style={styles.proHeader}>
                {plan.badge ? (
                  <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
                    <Text variant="labelSmall" style={{ color: '#fff' }}>{plan.badge}</Text>
                  </View>
                ) : null}
                <Text variant="titleLarge" style={{ fontWeight: '700' }}>{plan.label}</Text>
                <MaterialCommunityIcons name="crown" size={22} color={theme.colors.primary} />
              </View>
              <Text variant="bodyMedium" style={{ textAlign: 'right', color: theme.colors.onSurfaceVariant, marginBottom: 4 }}>
                مدت: {plan.durationLabel}
              </Text>
              {isZibal && plan.priceToman ? (
                <Text variant="titleMedium" style={{ textAlign: 'right', fontWeight: '700', marginBottom: 8 }}>
                  {formatPersianNumber(plan.priceToman)} تومان
                </Text>
              ) : null}
              {PRO_FEATURES.map((f) => (
                <Text key={f} variant="bodySmall" style={{ textAlign: 'right', marginBottom: 4, color: theme.colors.onSurfaceVariant }}>
                  · {f}
                </Text>
              ))}
              <Button
                mode="contained"
                onPress={() => handlePurchase(plan.productId)}
                loading={loadingId === plan.productId}
                disabled={!isBillingSupported || !!loadingId}
                style={{ marginTop: 12 }}
                icon={isZibal ? 'credit-card' : 'store'}
              >
                {purchaseButtonLabel}
              </Button>
            </View>
          ))}

          {!isBillingSupported && (
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'right', marginTop: 8 }}>
              {Platform.OS === 'ios'
                ? 'خرید اشتراک فقط در نسخه وب (زیبال) یا اندروید (کافه‌بازار) در دسترس است.'
                : 'درگاه پرداخت برای این پلتفرم فعال نیست.'}
            </Text>
          )}
        </>
      )}

      {isBazaar && (
        <Button
          mode="outlined"
          icon="restore"
          onPress={handleRestore}
          loading={restoring}
          disabled={!isBillingSupported}
          style={{ marginTop: 16 }}
        >
          بازیابی خرید
        </Button>
      )}

      {isZibal && (
        <Button
          mode="outlined"
          icon="refresh"
          onPress={handleRestore}
          loading={restoring}
          style={{ marginTop: 16 }}
        >
          بروزرسانی وضعیت اشتراک
        </Button>
      )}

      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={3500}>
        {snack}
      </Snackbar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  planBox: { borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 12 },
  planTitle: { fontWeight: '600', textAlign: 'right' },
  activeBox: { borderWidth: 1.5, borderRadius: 12, padding: 16, gap: 6, marginBottom: 12 },
  proBox: { borderWidth: 1.5, borderRadius: 12, padding: 16, marginBottom: 12 },
  proHeader: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginBottom: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginLeft: 'auto' },
  providerBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
});
