import { useMemo } from 'react';

import { SuggestedFirstStepStatus, SuggestedFirstSteps } from '@shared/models/onboarding-types';

import { useCurrentAccountAvailableStxBalance } from '@app/query/stacks/balance/balance.hooks';
import { useAllAccountsAvailableStxBalance } from '@app/query/stacks/balance/balance.hooks';
import { useAccountsNonFungibleTokenHoldings } from '@app/query/stacks/non-fungible-tokens/non-fungible-token-holdings.hooks';
import { useGetNonFungibleTokenHoldingsQuery } from '@app/query/stacks/non-fungible-tokens/non-fungible-token-holdings.query';
import { useAccounts, useCurrentAccount } from '@app/store/accounts/account.hooks';
import {
  useHideSuggestedFirstSteps,
  useSuggestedFirstStepsStatus,
} from '@app/store/onboarding/onboarding.selectors';

export function useSuggestedFirstSteps() {
  const accounts = useAccounts();
  const currentAccount = useCurrentAccount();
  const hasHiddenSuggestedFirstSteps = useHideSuggestedFirstSteps();
  const stepsStatus = useSuggestedFirstStepsStatus();
  const availableStxBalance = useCurrentAccountAvailableStxBalance();
  const { data: nonFungibleTokenHoldings } = useGetNonFungibleTokenHoldingsQuery(
    currentAccount?.address
  );

  const firstFiveAccounts = accounts?.slice(0, 5);
  const accountsAvailableStxBalance = useAllAccountsAvailableStxBalance(firstFiveAccounts);
  const accountsNonFungibleTokenHoldings = useAccountsNonFungibleTokenHoldings(firstFiveAccounts);

  const isAddFundsStepComplete = useMemo(
    () => accountsAvailableStxBalance?.isGreaterThan(0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [availableStxBalance]
  );

  const isBuyNftStepComplete = useMemo(
    () => accountsNonFungibleTokenHoldings.isGreaterThan(0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nonFungibleTokenHoldings]
  );

  // This is the only step we need to persist
  const isExploreAppsStepComplete = useMemo(
    () => stepsStatus[SuggestedFirstSteps.ExploreApps] === SuggestedFirstStepStatus.Complete,
    [stepsStatus]
  );

  // The first step loads completed, so check the last three
  const hasCompletedSuggestedFirstSteps =
    isAddFundsStepComplete && isBuyNftStepComplete && isExploreAppsStepComplete;

  const showSuggestedFirstSteps =
    accounts &&
    accounts.length <= 5 &&
    !hasCompletedSuggestedFirstSteps &&
    !hasHiddenSuggestedFirstSteps;

  return {
    isAddFundsStepComplete,
    isBuyNftStepComplete,
    isExploreAppsStepComplete,
    showSuggestedFirstSteps,
  };
}
