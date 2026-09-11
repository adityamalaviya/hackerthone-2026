/**
 * React Native + Expo Reference Implementation for Field Staff
 * 
 * Demonstrates cross-platform architecture:
 * Reuses identical `types.ts`, `stateMachine.ts`, and `useStaffIssues` logic
 * with native mobile StyleSheet layout optimized for on-site field staff.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { StaffIssue, StaffDepartment } from '../types';
import { useStaffIssues } from '../useStaffIssues';
import { getSlaInfo } from '../stateMachine';

interface StaffQueueScreenProps {
  department?: StaffDepartment;
  onSelectIssue?: (issue: StaffIssue) => void;
}

export const StaffQueueScreen: React.FC<StaffQueueScreenProps> = ({
  department = 'Roads & Infrastructure',
  onSelectIssue,
}) => {
  const { filteredIssues, isLoading, simulateIncomingIssue } = useStaffIssues(
    department,
    'STF-FIELD-01',
    'Field Officer (Gandhidham MC)'
  );
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  }, []);

  const renderIssueItem = ({ item }: { item: StaffIssue }) => {
    const sla = getSlaInfo(item.slaDeadline);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => onSelectIssue?.(item)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.idContainer}>
            <Text style={styles.issueId}>{item.id}</Text>
            <Text style={styles.categoryBadge}>{item.category}</Text>
          </View>
          <View
            style={[
              styles.severityBadge,
              item.severity === 'Critical'
                ? styles.badgeCritical
                : item.severity === 'High'
                ? styles.badgeHigh
                : styles.badgeMedium,
            ]}
          >
            <Text style={styles.severityText}>{item.severity.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {item.shortDescription}
        </Text>

        <Text style={styles.location} numberOfLines={1}>
          📍 {item.locationName}
        </Text>

        <View style={styles.cardFooter}>
          <Text style={styles.statusText}>Status: {item.status}</Text>
          <Text
            style={[
              styles.slaText,
              sla.isOverdue ? styles.slaOverdue : styles.slaNormal,
            ]}
          >
            ⏱ {sla.timeRemainingFormatted}
          </Text>
        </View>

        {item.flag?.isFlagged && (
          <View style={styles.flagBadge}>
            <Text style={styles.flagBadgeText}>⚠ Pending Admin Review</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>civicFix Field App</Text>
          <Text style={styles.departmentSubtitle}>{department}</Text>
        </View>
        <TouchableOpacity
          style={styles.demoButton}
          onPress={simulateIncomingIssue}
        >
          <Text style={styles.demoButtonText}>+ New Mock</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#d9531e" />
          <Text style={styles.loaderText}>Syncing assigned issues...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredIssues}
          keyExtractor={(item: StaffIssue) => item.id}
          renderItem={renderIssueItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>Queue Cleared</Text>
              <Text style={styles.emptySubtitle}>
                No pending issues assigned to {department}.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E4',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#191916',
  },
  departmentSubtitle: {
    fontSize: 12,
    color: '#737367',
    marginTop: 2,
  },
  demoButton: {
    backgroundColor: '#191916',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  demoButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8E8E4',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  issueId: {
    fontSize: 13,
    fontWeight: '700',
    color: '#191916',
    fontFamily: 'monospace',
  },
  categoryBadge: {
    fontSize: 11,
    color: '#525248',
    backgroundColor: '#F4F4F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeCritical: {
    backgroundColor: '#FFE4E6',
  },
  badgeHigh: {
    backgroundColor: '#FFEDD5',
  },
  badgeMedium: {
    backgroundColor: '#FEF3C7',
  },
  severityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#191916',
  },
  description: {
    fontSize: 14,
    color: '#3F3F37',
    marginBottom: 6,
    lineHeight: 20,
  },
  location: {
    fontSize: 12,
    color: '#737367',
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F4F4F2',
    paddingTop: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#525248',
  },
  slaText: {
    fontSize: 12,
    fontWeight: '600',
  },
  slaOverdue: {
    color: '#DC2626',
  },
  slaNormal: {
    color: '#16A34A',
  },
  flagBadge: {
    marginTop: 8,
    backgroundColor: '#FEF2F2',
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  flagBadgeText: {
    color: '#B91C1C',
    fontSize: 11,
    fontWeight: '600',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loaderText: {
    fontSize: 13,
    color: '#737367',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#191916',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#737367',
    textAlign: 'center',
    marginTop: 4,
  },
});
