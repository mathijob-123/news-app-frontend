import React from 'react';
import { MainBottomNav } from './BottomNav';
import { OlxBottomNav, OlxTabType } from './OlxBottomNav';
import { JobsBottomNav, JobsTabType } from './JobsBottomNav';
import { RealEstateBottomNav, RealEstateTabType } from './RealEstateBottomNav';
import type { TabType } from '../../types';

export type AppModule = 'main' | 'olx' | 'jobs' | 'realEstate';

export interface ContextualBottomNavProps {
  activeModule: AppModule;
  // Main nav props
  mainTab: TabType;
  onChangeMainTab: (tab: TabType) => void;
  onOpenMainCreate: () => void;
  // OLX nav props
  olxTab: OlxTabType;
  onChangeOlxTab: (tab: OlxTabType) => void;
  onOpenOlxPostAd: () => void;
  olxUnreadAlertsCount?: number;
  // Jobs nav props
  jobsTab: JobsTabType;
  onChangeJobsTab: (tab: JobsTabType) => void;
  onOpenJobsPostJob: () => void;
  jobsApplicationsCount?: number;
  // Real Estate nav props
  realEstateTab: RealEstateTabType;
  onChangeRealEstateTab: (tab: RealEstateTabType) => void;
  onOpenRealEstatePostProperty: () => void;
  realEstateSavedCount?: number;
}

export const ContextualBottomNav: React.FC<ContextualBottomNavProps> = ({
  activeModule,
  mainTab,
  onChangeMainTab,
  onOpenMainCreate,
  olxTab,
  onChangeOlxTab,
  onOpenOlxPostAd,
  olxUnreadAlertsCount = 0,
  jobsTab,
  onChangeJobsTab,
  onOpenJobsPostJob,
  jobsApplicationsCount = 0,
  realEstateTab,
  onChangeRealEstateTab,
  onOpenRealEstatePostProperty,
  realEstateSavedCount = 0
}) => {
  if (activeModule === 'olx') {
    return (
      <OlxBottomNav
        activeTab={olxTab}
        onChangeTab={onChangeOlxTab}
        onOpenPostAd={onOpenOlxPostAd}
        unreadAlertsCount={olxUnreadAlertsCount}
      />
    );
  }

  if (activeModule === 'jobs') {
    return (
      <JobsBottomNav
        activeTab={jobsTab}
        onChangeTab={onChangeJobsTab}
        onOpenPostJob={onOpenJobsPostJob}
        applicationsCount={jobsApplicationsCount}
      />
    );
  }

  if (activeModule === 'realEstate') {
    return (
      <RealEstateBottomNav
        activeTab={realEstateTab}
        onChangeTab={onChangeRealEstateTab}
        onOpenPostProperty={onOpenRealEstatePostProperty}
        savedCount={realEstateSavedCount}
      />
    );
  }

  // Default: Main LocalPlus navigation
  return (
    <MainBottomNav
      activeTab={mainTab}
      onChangeTab={onChangeMainTab}
      onOpenCreate={onOpenMainCreate}
    />
  );
};
