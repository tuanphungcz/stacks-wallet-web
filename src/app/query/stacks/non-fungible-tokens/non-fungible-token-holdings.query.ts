import { useQueries, useQuery } from '@tanstack/react-query';

import { AppUseQueryConfig } from '@app/query/query-config';
import { StacksClient } from '@app/query/stacks/stacks-client';
import { AccountWithAddress } from '@app/store/accounts/account.models';
import { useStacksClient } from '@app/store/common/api-clients.hooks';
import { useCurrentNetworkState } from '@app/store/networks/networks.hooks';

const staleTime = 15 * 60 * 1000; // 15 min

const queryOptions = {
  cacheTime: staleTime,
  staleTime,
} as const;

function fetchNonFungibleTokenHoldings(client: StacksClient) {
  return (address?: string) => {
    if (!address) return;
    return client.nonFungibleTokensApi.getNftHoldings({ principal: address, limit: 50 });
  };
}

type FetchNonFungibleTokenHoldingsResp = Awaited<
  ReturnType<ReturnType<typeof fetchNonFungibleTokenHoldings>>
>;

export function useGetNonFungibleTokenHoldingsQuery<
  T extends unknown = FetchNonFungibleTokenHoldingsResp
>(address?: string, options?: AppUseQueryConfig<FetchNonFungibleTokenHoldingsResp, T>) {
  const client = useStacksClient();
  const network = useCurrentNetworkState();

  return useQuery({
    queryKey: ['get-nft-holdings', address, network.chain.stacks.url],
    queryFn: () => fetchNonFungibleTokenHoldings(client)(address),
    ...queryOptions,
    ...options,
  });
}

export function useGetNonFungibleTokenHoldingsListQuery<
  T extends unknown = FetchNonFungibleTokenHoldingsResp
>(
  accounts?: AccountWithAddress[],
  options?: AppUseQueryConfig<FetchNonFungibleTokenHoldingsResp, T>
) {
  const client = useStacksClient();
  const network = useCurrentNetworkState();

  return useQueries({
    queries: (accounts ?? []).map(account => ({
      queryKey: ['get-nft-holdings', account.address, network.chain.stacks.url],
      queryFn: () => fetchNonFungibleTokenHoldings(client)(account.address),
      ...queryOptions,
      ...options,
    })),
  });
}
