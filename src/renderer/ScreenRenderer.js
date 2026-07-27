import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { ComponentRenderer } from './ComponentRenderer';
import { ScanView as ScanViewComponent } from '../components/ScanView';
import { fetchProductByBarcode } from '../services/productApi';
import { saveScan, selectSavedScans, selectIsScanSaved } from '../redux/slices/scansSlice';
import { saveItem, selectSavedItems } from '../redux/slices/savedItemsSlice';
import { COLORS } from '../utils/constants';

const nutriscoreColors = {
  a: '#038141',
  b: '#85BB2F',
  c: '#FECB02',
  d: '#EE8200',
  e: '#E63E11',
};

/**
 * Maps a screen factory descriptor object to React Native views.
 *
 * Screen detection uses `testID` (when present) or a heuristic based on
 * the descriptor's characteristic keys.
 */
export const ScreenRenderer = ({ descriptor, screenName }) => {
  if (!descriptor) {
    return <FallbackScreen message="No screen data" />;
  }

  const { testID } = descriptor;

  // ── Auth screens ──────────────────────────────────────────────
  if (testID === 'login-screen') {
    return <LoginView descriptor={descriptor} />;
  }

  if (testID === 'signup-screen') {
    return <SignupView descriptor={descriptor} />;
  }

  // ── Characteristic-key heuristics ─────────────────────────────

  // HomeScreen: has `greeting` and `scanButton`
  if (descriptor.greeting && descriptor.scanButton) {
    return <HomeView descriptor={descriptor} />;
  }

  // ScanScreen: has `mode` getter (checks via descriptor getters)
  if (descriptor.scanButton && descriptor.instructionText) {
    return <ScanView descriptor={descriptor} />;
  }

  // ProductResultScreen: has `badge` and `productName` getter
  if (descriptor.badge && descriptor.productName !== undefined) {
    return <ProductResultView descriptor={descriptor} />;
  }

  // SavedItemsScreen: has `emptyIllustration` and `items`
  if (descriptor.emptyIllustration && descriptor.items) {
    return <SavedItemsView descriptor={descriptor} />;
  }

  // HealthGoalsScreen: has `goals` array and `toggle` function
  if (Array.isArray(descriptor.goals) && typeof descriptor.toggle === 'function') {
    return <HealthGoalsView descriptor={descriptor} />;
  }

  // OnboardingWelcomeScreen: has `hero` and `continue`
  if (descriptor.hero && typeof descriptor.continue === 'function') {
    return <OnboardingWelcomeView descriptor={descriptor} />;
  }

  // CorrectionSubmissionScreen: has `submitIcon` and `issueOptions`
  if (descriptor.submitIcon && Array.isArray(descriptor.issueOptions)) {
    return <CorrectionSubmissionView descriptor={descriptor} />;
  }

  // ComparisonScreen: has `title` === 'Product Comparison' and `summary`
  if (descriptor.title === 'Product Comparison' && descriptor.summary) {
    return <ComparisonView descriptor={descriptor} />;
  }

  // ForgotPasswordScreen: has `submit` and no testID (no other distinguishing keys)
  if (typeof descriptor.submit === 'function' && !descriptor.goSignup) {
    return <ForgotPasswordView descriptor={descriptor} />;
  }

  // PasswordResetScreen: has `submit` that takes password
  // ReviewProfileScreen: has `complete`
  if (typeof descriptor.complete === 'function') {
    return <ReviewProfileView descriptor={descriptor} />;
  }

  // FamilyProfilesScreen: has `add`
  if (typeof descriptor.add === 'function') {
    return <FamilyProfilesView descriptor={descriptor} />;
  }

  // AllergySetupScreen: has `setSeverity`
  if (typeof descriptor.setSeverity === 'function') {
    return <AllergySetupView descriptor={descriptor} />;
  }

  // Fallback for unknown screens — render keys we understand
  return <GenericView descriptor={descriptor} screenName={screenName} />;
};

// ═══════════════════════════════════════════════════════════════
// Individual screen view components
// ═══════════════════════════════════════════════════════════════

const FallbackScreen = ({ message }) => (
  <View style={styles.centered}>
    <Text style={styles.fallbackText}>{message}</Text>
  </View>
);

// ── Login ──────────────────────────────────────────────────────
const LoginView = ({ descriptor }) => (
  <ScrollView contentContainerStyle={styles.screen}>
    <Text style={styles.screenTitle}>Login</Text>
    <FieldRow label="Locked" value={descriptor.locked ? 'Yes' : 'No'} />
    {descriptor.goSignup && (
      <TouchableOpacity style={styles.linkButton} onPress={descriptor.goSignup}>
        <Text style={styles.linkText}>Create account</Text>
      </TouchableOpacity>
    )}
    {descriptor.goForgot && (
      <TouchableOpacity style={styles.linkButton} onPress={descriptor.goForgot}>
        <Text style={styles.linkText}>Forgot password?</Text>
      </TouchableOpacity>
    )}
  </ScrollView>
);

// ── Signup ─────────────────────────────────────────────────────
const SignupView = ({ descriptor }) => (
  <ScrollView contentContainerStyle={styles.screen}>
    <Text style={styles.screenTitle}>Sign Up</Text>
    <Text style={styles.label}>Create your ScanWise account</Text>
  </ScrollView>
);

// ── Home ───────────────────────────────────────────────────────
const HomeView = ({ descriptor }) => (
  <ScrollView contentContainerStyle={styles.screen}>
    <Text style={styles.screenTitle}>{descriptor.greeting}</Text>
    <TouchableOpacity 
      style={styles.primaryButton}
      onPress={descriptor.onScanPress || (() => {})}
    >
      <Text style={styles.primaryButtonText}>{descriptor.scanButton}</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.secondaryButton}
      onPress={descriptor.onSavedPress || (() => {})}
    >
      <Text style={styles.secondaryButtonText}>Saved Items</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.secondaryButton}
      onPress={descriptor.onProfilePress || (() => {})}
    >
      <Text style={styles.secondaryButtonText}>Profile</Text>
    </TouchableOpacity>
    {descriptor.recentScans && descriptor.recentScans.length > 0 && (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Scans</Text>
        {descriptor.recentScans.map((scan, i) => (
          <Text key={i} style={styles.listItem}>
            {scan.name || scan.barcode || `Scan ${i + 1}`}
          </Text>
        ))}
      </View>
    )}
    {descriptor.familyMembers && descriptor.familyMembers.length > 0 && (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Family Members</Text>
        {descriptor.familyMembers.map((m, i) => (
          <Text key={i} style={styles.listItem}>
            {m.name || `Member ${i + 1}`}
          </Text>
        ))}
      </View>
    )}
  </ScrollView>
);

// ── Scan ───────────────────────────────────────────────────────
const ScanView = ({ descriptor }) => {
  // If no camera view props are present, fall back to the simple UI
  if (!descriptor.onBarcodeDetected && !descriptor.handleBarcodeDetected) {
    return (
      <View style={styles.screen}>
        <Text style={styles.screenTitle}>Scan Product</Text>
        <Text style={styles.label}>{descriptor.instructionText}</Text>
        {descriptor.scanOverlay && (
          <ComponentRenderer descriptor={descriptor.scanOverlay} />
        )}
        <View style={styles.buttonRow}>
          {descriptor.cancelButtonModel && (
            <ComponentRenderer descriptor={descriptor.cancelButtonModel} />
          )}
        </View>
        {descriptor.error && (
          <Text style={styles.error}>{descriptor.error}</Text>
        )}
      </View>
    );
  }

  // Real camera view — pass descriptor callbacks as props
  return (
    <View style={styles.scanContainer}>
      {/* Error banner above camera */}
      {descriptor.error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{descriptor.error}</Text>
          {typeof descriptor.retry === 'function' && (
            <TouchableOpacity onPress={() => descriptor.retry()}>
              <Text style={styles.retryLink}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : null}

      <ScanViewComponent
        onBarcodeDetected={
          descriptor.handleBarcodeDetected || descriptor.onBarcodeDetected
        }
        scanning={descriptor.scanning}
        cameraPermission={descriptor.permission || descriptor.cameraPermission}
        onRequestPermission={
          descriptor.requestPermission || descriptor.ensureCameraPermission
            ? async () => {
                const result = descriptor.ensureCameraPermission
                  ? await descriptor.ensureCameraPermission()
                  : await descriptor.requestPermission();
                return result ? 'granted' : 'denied';
              }
            : undefined
        }
        instructionText={descriptor.instructionText}
        onCancel={
          descriptor.cancelButtonModel?.onPress
            ? descriptor.cancelButtonModel.onPress
            : undefined
        }
      />
    </View>
  );
};

// ── Product Result ─────────────────────────────────────────────
const ProductResultView = ({ descriptor }) => {
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  // Immediate auto-save whenever product data is present on mount,
  // regardless of how it arrived (scan, navigation params, etc.)
  useEffect(() => {
    console.log('[SAVE-DEBUG] ProductResultView mount — barcode:', descriptor.barcode, 'productName:', descriptor.productName, 'searching:', descriptor.searching);
    if (descriptor.barcode && descriptor.productName) {
      console.log('[SAVE-DEBUG] ProductResultView dispatching saveScan+saveItem for:', descriptor.barcode, descriptor.productName);
      dispatch(
        saveScan({
          barcode: descriptor.barcode,
          productName: descriptor.productName,
          brand: descriptor.brand,
          image: descriptor.image,
          nutriscore: descriptor.nutriscore,
          category: descriptor.categories,
        })
      );
      dispatch(
        saveItem({
          barcode: descriptor.barcode,
          productName: descriptor.productName,
          brand: descriptor.brand,
          image: descriptor.image,
          nutriscore: descriptor.nutriscore,
          category: descriptor.categories,
          timestamp: new Date().toISOString(),
        })
      );
    }
  }, []); // empty deps = fires exactly once on mount

  const needsLookup = descriptor.searching && descriptor.barcode;
  const isSaved = useSelector(selectIsScanSaved(descriptor.barcode));

  useEffect(() => {
    if (!needsLookup) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setNotFound(false);

    fetchProductByBarcode(descriptor.barcode)
      .then((data) => {
        if (cancelled) return;
        if (data) {
          setProduct(data);
          setNotFound(false);
          // Auto-save the scan to Redux (both slices)
          dispatch(
            saveScan({
              barcode: descriptor.barcode,
              productName: data.name,
              brand: data.brand,
              image: data.image,
              nutriscore: data.nutriscore,
              category: data.categories,
            })
          );
          dispatch(
            saveItem({
              barcode: descriptor.barcode,
              productName: data.name,
              brand: data.brand,
              image: data.image,
              nutriscore: data.nutriscore,
              category: data.categories,
              timestamp: new Date().toISOString(),
            })
          );
        } else {
          setNotFound(true);
          setProduct(null);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || 'Failed to look up product');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [descriptor.barcode, needsLookup, dispatch]);

  // ── Not searching — descriptor already has product data ────────
  if (!needsLookup) {
    return (
      <ScrollView contentContainerStyle={styles.screen}>
        <Text style={styles.screenTitle}>
          {descriptor.productName || 'Product'}
        </Text>
        {descriptor.badge && <ComponentRenderer descriptor={descriptor.badge} />}
        {descriptor.image ? (
          <Image
            source={{ uri: descriptor.image }}
            style={styles.productImage}
            resizeMode="contain"
          />
        ) : null}
        <FieldRow label="Brand" value={descriptor.brand} />
        <FieldRow label="Barcode" value={descriptor.barcode} />
        {descriptor.nutriscore ? (
          <View style={styles.nutriscoreRow}>
            <Text style={styles.fieldLabel}>Nutri-Score</Text>
            <View
              style={[
                styles.nutriscoreBadge,
                {
                  backgroundColor:
                    nutriscoreColors[descriptor.nutriscore] || '#9CA3AF',
                },
              ]}
            >
              <Text style={styles.nutriscoreText}>
                {descriptor.nutriscore.toUpperCase()}
              </Text>
            </View>
          </View>
        ) : null}
        {descriptor.categories ? (
          <FieldRow label="Categories" value={descriptor.categories} />
        ) : null}
        <FieldRow label="Confidence" value={descriptor.confidence} />
        <SaveButton
          isSaved={isSaved}
          onSave={() => {
            dispatch(
              saveScan({
                barcode: descriptor.barcode,
                productName: descriptor.productName,
                brand: descriptor.brand,
                image: descriptor.image,
                nutriscore: descriptor.nutriscore,
                category: descriptor.categories,
              })
            );
            dispatch(
              saveItem({
                barcode: descriptor.barcode,
                productName: descriptor.productName,
                brand: descriptor.brand,
                image: descriptor.image,
                nutriscore: descriptor.nutriscore,
                category: descriptor.categories,
                timestamp: new Date().toISOString(),
              })
            );
          }}
          saveIcon={descriptor.saveIcon}
        />
        {descriptor.compareButton && (
          <ComponentRenderer descriptor={descriptor.compareButton} />
        )}
      </ScrollView>
    );
  }

  // ── Searching: render based on local fetch state ───────────────

  // Loading state
  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.screenTitle}>Product Lookup</Text>
        <FieldRow label="Barcode" value={descriptor.barcode} />
        <View style={styles.searchingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.searchingText}>Looking up product...</Text>
        </View>
      </View>
    );
  }

  // Not found state
  if (notFound) {
    return (
      <View style={styles.centered}>
        <Text style={styles.screenTitle}>Product Not Found</Text>
        <FieldRow label="Barcode" value={descriptor.barcode} />
        <View style={styles.searchingContainer}>
          <Text style={styles.notFoundText}>
            Product not found in database
          </Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.screenTitle}>Lookup Error</Text>
        <FieldRow label="Barcode" value={descriptor.barcode} />
        <View style={styles.searchingContainer}>
          <Text style={styles.errorText}>Could not look up product</Text>
        </View>
      </View>
    );
  }

  // Success: product data fetched
  if (product) {
    return (
      <ScrollView contentContainerStyle={styles.screen}>
        <Text style={styles.screenTitle}>
          {product.name || descriptor.productName || 'Product'}
        </Text>
        {descriptor.badge && <ComponentRenderer descriptor={descriptor.badge} />}
        {product.image ? (
          <Image
            source={{ uri: product.image }}
            style={styles.productImage}
            resizeMode="contain"
          />
        ) : null}
        <FieldRow label="Brand" value={product.brand || descriptor.brand} />
        <FieldRow label="Barcode" value={descriptor.barcode} />
        {product.nutriscore ? (
          <View style={styles.nutriscoreRow}>
            <Text style={styles.fieldLabel}>Nutri-Score</Text>
            <View
              style={[
                styles.nutriscoreBadge,
                {
                  backgroundColor:
                    nutriscoreColors[product.nutriscore] || '#9CA3AF',
                },
              ]}
            >
              <Text style={styles.nutriscoreText}>
                {product.nutriscore.toUpperCase()}
              </Text>
            </View>
          </View>
        ) : descriptor.nutriscore ? (
          <View style={styles.nutriscoreRow}>
            <Text style={styles.fieldLabel}>Nutri-Score</Text>
            <View
              style={[
                styles.nutriscoreBadge,
                {
                  backgroundColor:
                    nutriscoreColors[descriptor.nutriscore] || '#9CA3AF',
                },
              ]}
            >
              <Text style={styles.nutriscoreText}>
                {descriptor.nutriscore.toUpperCase()}
              </Text>
            </View>
          </View>
        ) : null}
        {product.categories ? (
          <FieldRow label="Categories" value={product.categories} />
        ) : descriptor.categories ? (
          <FieldRow label="Categories" value={descriptor.categories} />
        ) : null}
        <FieldRow label="Confidence" value={descriptor.confidence} />
        <SaveButton
          isSaved={isSaved}
          onSave={() => {
            dispatch(
              saveScan({
                barcode: descriptor.barcode,
                productName: product.name,
                brand: product.brand,
                image: product.image,
                nutriscore: product.nutriscore,
                category: product.categories,
              })
            );
            dispatch(
              saveItem({
                barcode: descriptor.barcode,
                productName: product.name,
                brand: product.brand,
                image: product.image,
                nutriscore: product.nutriscore,
                category: product.categories,
                timestamp: new Date().toISOString(),
              })
            );
          }}
          saveIcon={descriptor.saveIcon}
        />
        {descriptor.compareButton && (
          <ComponentRenderer descriptor={descriptor.compareButton} />
        )}
      </ScrollView>
    );
  }

  // Initial searching state (before fetch fires)
  return (
    <View style={styles.centered}>
      <Text style={styles.screenTitle}>Product Found</Text>
      <FieldRow label="Barcode" value={descriptor.barcode} />
      <View style={styles.searchingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.searchingText}>Looking up product...</Text>
      </View>
    </View>
  );
};

// ── Saved Items ────────────────────────────────────────────────
const SavedItemsView = ({ descriptor }) => {
  const savedItems = useSelector(selectSavedItems);
  const savedScans = useSelector(selectSavedScans);
  console.log('[SAVE-DEBUG] SavedItemsView — savedItems:', savedItems.length, 'savedScans:', savedScans.length);
  const fullState = useSelector(s => s);
  console.log('[STATE-DUMP] Full Redux state at SavedItemsView render:', JSON.stringify({
    savedItems: fullState.savedItems,
    scans: {
      savedScans: fullState.scans?.savedScans,
      currentScan: fullState.scans?.currentScan ? 'present' : null,
      scanHistory: fullState.scans?.scanHistory?.length,
    },
  }, null, 2));
  // Use whichever slice has data — bypasses the factory descriptor entirely
  const items = savedItems.length > 0 ? savedItems : savedScans;

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.screenTitle}>Saved Items</Text>
      {items.length === 0 ? (
        <Text style={styles.emptyText}>No saved items yet</Text>
      ) : (
        items.map((item) => (
          <View key={item.barcode || item.id} style={styles.savedItemCard}>
            {item.image ? (
              <Image
                source={
                  typeof item.image === 'string'
                    ? { uri: item.image }
                    : item.image
                }
                style={styles.savedItemThumb}
                resizeMode="contain"
              />
            ) : null}
            <View style={styles.savedItemInfo}>
              <Text style={styles.cardTitle}>
                {item.name || item.productName || 'Unknown'}
              </Text>
              <Text style={styles.cardSubtitle}>{item.brand || ''}</Text>
              <Text style={styles.cardMeta}>
                Barcode: {item.barcode || item.id}
              </Text>
              {(item.lastScannedDate || item.timestamp) && (
                <Text style={styles.cardMeta}>
                  Saved:{' '}
                  {new Date(
                    item.lastScannedDate || item.timestamp
                  ).toLocaleDateString()}
                </Text>
              )}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
};

// ── Health Goals ───────────────────────────────────────────────
const HealthGoalsView = ({ descriptor }) => (
  <ScrollView contentContainerStyle={styles.screen}>
    <Text style={styles.screenTitle}>Health Goals</Text>
    {descriptor.goals.map((goal) => (
      <TouchableOpacity
        key={goal}
        style={styles.goalItem}
        onPress={() => descriptor.toggle(goal)}
      >
        <Text style={styles.goalText}>{goal}</Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

// ── Onboarding Welcome ─────────────────────────────────────────
const OnboardingWelcomeView = ({ descriptor }) => (
  <View style={styles.screen}>
    <Text style={styles.screenTitle}>Welcome to ScanWise</Text>
    <TouchableOpacity style={styles.primaryButton} onPress={descriptor.continue}>
      <Text style={styles.primaryButtonText}>Get Started</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.linkButton} onPress={descriptor.skip}>
      <Text style={styles.linkText}>Skip</Text>
    </TouchableOpacity>
  </View>
);

// ── Forgot Password ────────────────────────────────────────────
const ForgotPasswordView = ({ descriptor }) => (
  <View style={styles.screen}>
    <Text style={styles.screenTitle}>Forgot Password</Text>
    <Text style={styles.label}>Enter your email to reset your password</Text>
  </View>
);

// ── Correction Submission ──────────────────────────────────────
const CorrectionSubmissionView = ({ descriptor }) => (
  <ScrollView contentContainerStyle={styles.screen}>
    <Text style={styles.screenTitle}>Submit Correction</Text>
    {descriptor.issueOptions.map((opt) => (
      <Text key={opt} style={styles.listItem}>
        {opt}
      </Text>
    ))}
  </ScrollView>
);

// ── Comparison ─────────────────────────────────────────────────
const ComparisonView = ({ descriptor }) => (
  <ScrollView contentContainerStyle={styles.screen}>
    <Text style={styles.screenTitle}>{descriptor.title}</Text>
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Original</Text>
      <Text>{descriptor.original?.name || 'N/A'}</Text>
    </View>
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Alternative</Text>
      <Text>{descriptor.alternative?.name || 'N/A'}</Text>
    </View>
  </ScrollView>
);

// ── Review Profile ─────────────────────────────────────────────
const ReviewProfileView = ({ descriptor }) => (
  <View style={styles.screen}>
    <Text style={styles.screenTitle}>Review Profile</Text>
    <TouchableOpacity style={styles.primaryButton} onPress={descriptor.complete}>
      <Text style={styles.primaryButtonText}>Complete Setup</Text>
    </TouchableOpacity>
  </View>
);

// ── Family Profiles ────────────────────────────────────────────
const FamilyProfilesView = ({ descriptor }) => (
  <View style={styles.screen}>
    <Text style={styles.screenTitle}>Family Profiles</Text>
    <Text style={styles.label}>Add family members to track their health</Text>
  </View>
);

// ── Allergy Setup ──────────────────────────────────────────────
const AllergySetupView = ({ descriptor }) => (
  <View style={styles.screen}>
    <Text style={styles.screenTitle}>Allergy Setup</Text>
    <Text style={styles.label}>Set your allergen sensitivities</Text>
  </View>
);

// ── Generic fallback ───────────────────────────────────────────
const GenericView = ({ descriptor, screenName }) => {
  // Render string/bool/number fields
  const fields = Object.entries(descriptor).filter(
    ([, v]) =>
      typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean'
  );

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.screenTitle}>
        {screenName || descriptor.title || 'Screen'}
      </Text>
      {fields.map(([key, value]) => (
        <FieldRow key={key} label={key} value={String(value)} />
      ))}
    </ScrollView>
  );
};

// ── Save Button (Redux-aware) ──────────────────────────────────
const SaveButton = ({ isSaved, onSave, saveIcon }) => {
  if (isSaved) {
    return (
      <View style={styles.saveButtonSaved}>
        <Text style={styles.saveButtonSavedText}>Saved ✓</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.saveButton} onPress={onSave}>
      {saveIcon && (
        <Image
          source={saveIcon}
          style={styles.saveButtonIcon}
          resizeMode="contain"
        />
      )}
      <Text style={styles.saveButtonText}>Save</Text>
    </TouchableOpacity>
  );
};

// ── Shared helpers ─────────────────────────────────────────────
const FieldRow = ({ label, value }) => {
  if (value === undefined || value === null) return null;
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{String(value)}</Text>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════
// Styles
// ═══════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  fallbackText: {
    fontSize: 16,
    color: '#6B7280',
  },
  screen: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
  },
  section: {
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  listItem: {
    fontSize: 14,
    color: '#4B5563',
    paddingVertical: 4,
  },
  card: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
  },
  cardTitle: {
    fontWeight: '600',
    fontSize: 16,
  },
  cardSubtitle: {
    color: '#6B7280',
    fontSize: 14,
  },
  cardMeta: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  secondaryButtonText: {
    color: '#374151',
    fontWeight: '500',
    fontSize: 15,
  },
  linkButton: {
    padding: 10,
    alignItems: 'center',
  },
  linkText: {
    color: COLORS.secondary,
    fontWeight: '500',
  },
  buttonRow: {
    marginTop: 16,
  },
  error: {
    color: '#EF4444',
    marginTop: 12,
    fontSize: 14,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  goalItem: {
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginVertical: 4,
  },
  goalText: {
    fontWeight: '500',
    color: '#374151',
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  fieldLabel: {
    fontWeight: '500',
    color: '#374151',
  },
  fieldValue: {
    color: '#6B7280',
    maxWidth: '60%',
    textAlign: 'right',
  },
  // Scan screen camera view
  scanContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorBannerText: {
    color: '#991B1B',
    fontSize: 14,
    flex: 1,
  },
  retryLink: {
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 12,
  },
  // Searching state for ProductResult
  searchingContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  searchingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  // Product result states
  productImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginVertical: 12,
    backgroundColor: '#F3F4F6',
  },
  nutriscoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  nutriscoreBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  nutriscoreText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  notFoundText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginTop: 12,
    textAlign: 'center',
  },
  // Save button (Redux-aware)
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButtonIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  saveButtonSaved: {
    backgroundColor: '#D1FAE5',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  saveButtonSavedText: {
    color: '#065F46',
    fontWeight: '600',
    fontSize: 16,
  },
  // Saved Items list
  savedItemCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  savedItemThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#F3F4F6',
  },
  savedItemInfo: {
    flex: 1,
  },
});
