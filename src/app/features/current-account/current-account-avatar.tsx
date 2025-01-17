import { memo } from 'react';

import { BoxProps } from '@stacks/ui';

import { useCurrentAccountDisplayName } from '@app/common/hooks/account/use-account-names';
import { useDrawers } from '@app/common/hooks/use-drawers';
import { AccountAvatar } from '@app/components/account/account-avatar/account-avatar';
import { useCurrentAccount } from '@app/store/accounts/account.hooks';

export const CurrentAccountAvatar = memo((props: BoxProps) => {
  const currentAccount = useCurrentAccount();
  const name = useCurrentAccountDisplayName();
  const { setIsShowingSwitchAccountsState } = useDrawers();
  if (!currentAccount) return null;
  return (
    <AccountAvatar
      onClick={() => setIsShowingSwitchAccountsState(true)}
      cursor="pointer"
      name={name}
      publicKey={currentAccount.stxPublicKey}
      index={currentAccount.index}
      flexShrink={0}
      {...props}
    />
  );
});
