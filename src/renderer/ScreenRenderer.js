import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { ComponentRenderer } from './ComponentRenderer';
import { ScanView as ScanViewComponent } from '../components/ScanView';
import { fetchProductByBarcode } from '../services/productApi';
import { saveScan, selectIsScanSaved } from '../redux/slices/scansSlice';
import { saveItem, selectSavedItems, selectSavedItemsLoading, selectSavedItemsError, fetchSavedItems } from '../redux/slices/savedItemsSlice';
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
  const [manualBarcode, setManualBarcode] = useState('');

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

      {/* Manual barcode entry for simulator testing */}
      <View style={styles.manualEntryContainer}>
        <TextInput
          style={styles.manualEntryInput}
          placeholder="Enter barcode (e.g. 3017620422003)"
          placeholderTextColor="#9CA3AF"
          value={manualBarcode}
          onChangeText={setManualBarcode}
          onSubmitEditing={() => {
            const text = manualBarcode.trim();
            if (text && descriptor.handleBarcodeDetected) {
              descriptor.handleBarcodeDetected(text);
              setManualBarcode('');
            }
          }}
          returnKeyType="go"
        />
        <TouchableOpacity
          style={styles.manualEntryButton}
          onPress={() => {
            const text = manualBarcode.trim();
            if (text && descriptor.handleBarcodeDetected) {
              descriptor.handleBarcodeDetected(text);
              setManualBarcode('');
            }
          }}
        >
          <Text style={styles.manualEntryButtonText}>Scan</Text>
        </TouchableOpacity>
      </View>

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
    // No product data available — show "no results" state
    if (!descriptor.productName || descriptor.productName === 'Unknown Product') {
      return (
        <View style={styles.centered}>
          <Text style={styles.screenTitle}>No Results</Text>
          {descriptor.barcode && (
            <FieldRow label="Barcode" value={descriptor.barcode} />
          )}
          <Text style={styles.emptyStateText}>
            No product data available for this scan
          </Text>
        </View>
      );
    }

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
  const dispatch = useDispatch();
  const savedItems = useSelector(selectSavedItems);
  const loading = useSelector(selectSavedItemsLoading);
  const error = useSelector(selectSavedItemsError);

  // Loading state
  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.screenTitle}>Saved Items</Text>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.searchingText}>Loading saved items...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.screenTitle}>Saved Items</Text>
        <Text style={styles.errorText}>Could not load saved items</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => dispatch(fetchSavedItems())}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Empty state
  if (savedItems.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.screenTitle}>Saved Items</Text>
        <Image
          source={descriptor.emptyIllustration}
          style={styles.emptyIllustration}
          resizeMode="contain"
        />
        <Text style={styles.emptyStateText}>
          {descriptor.emptyStateText || 'No saved items yet'}
        </Text>
      </View>
    );
  }

  // Items list
  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.screenTitle}>Saved Items</Text>
      {savedItems.map((item) => {
        const hasLimitedData =
          !item.brand || item.brand === 'Unknown Brand' || !item.brand;
        const fallbackImage = require('../assets/icon-scan.png');
        return (
          <View key={item.barcode || item.id} style={styles.savedItemCard}>
            <View style={styles.savedItemThumbWrap}>
              <Image
                source={
                  item.image
                    ? typeof item.image === 'string'
                      ? { uri: item.image }
                      : item.image
                    : fallbackImage
                }
                style={styles.savedItemThumb}
                resizeMode="contain"
              />
            </View>
            <View style={styles.savedItemInfo}>
              <Text style={styles.savedItemName} numberOfLines={2}>
                {item.name || item.productName || 'Unknown Product'}
              </Text>
              <Text style={styles.savedItemBrand} numberOfLines={1}>
                {item.brand && item.brand !== 'Unknown Brand'
                  ? item.brand
                  : 'Brand not available'}
              </Text>
              <View style={styles.savedItemMetaRow}>
                <Text style={styles.savedItemBarcode} numberOfLines={1}>
                  {item.barcode || item.id}
                </Text>
                {(item.lastScannedDate || item.timestamp) && (
                  <Text style={styles.savedItemDate}>
                    {new Date(
                      item.lastScannedDate || item.timestamp
                    ).toLocaleDateString()}
                  </Text>
                )}
              </View>
              {hasLimitedData && (
                <View style={styles.limitedDataBadge}>
                  <Text style={styles.limitedDataBadgeText}>Limited info</Text>
                </View>
              )}
            </View>
          </View>
        );
      })}
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
  // Manual barcode entry
  manualEntryContainer: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    zIndex: 100,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  manualEntryInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  manualEntryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 8,
  },
  manualEntryButtonText: {
    color: '#fff',
    fontWeight: '600',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  savedItemThumbWrap: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  savedItemThumb: {
    width: '90%',
    height: '90%',
  },
  savedItemInfo: {
    flex: 1,
    minHeight: 80,
  },
  savedItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  savedItemBrand: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
  },
  savedItemMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  savedItemBarcode: {
    fontSize: 12,
    color: '#374151',
    fontFamily: 'Courier',
    flex: 1,
  },
  savedItemDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  limitedDataBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 6,
  },
  limitedDataBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#92400E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Empty state illustration
  emptyIllustration: {
    width: 160,
    height: 160,
    marginVertical: 24,
    opacity: 0.6,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  // Retry button for error states
  retryButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
});
