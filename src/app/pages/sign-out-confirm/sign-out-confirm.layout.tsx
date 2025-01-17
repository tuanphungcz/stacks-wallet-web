import { FC } from 'react';

import { Box, Button, Flex, Text, color } from '@stacks/ui';
import { SettingsSelectors } from '@tests/integration/settings.selectors';
import { useFormik } from 'formik';

import { useWalletType } from '@app/common/use-wallet-type';
import { BaseDrawer } from '@app/components/drawer/base-drawer';
import { Body, Caption } from '@app/components/typography';

interface SignOutConfirmLayoutProps {
  onUserDeleteWallet(): void;
  onUserSafelyReturnToHomepage(): void;
}
export const SignOutConfirmLayout: FC<SignOutConfirmLayoutProps> = props => {
  const { onUserDeleteWallet, onUserSafelyReturnToHomepage } = props;

  const { whenWallet, walletType } = useWalletType();

  const form = useFormik({
    initialValues: { confirmBackup: whenWallet({ ledger: true, software: false }) },
    onSubmit() {
      onUserDeleteWallet();
    },
  });

  return (
    <BaseDrawer title="Sign out" isShowing onClose={onUserSafelyReturnToHomepage}>
      <Box mx="loose" mb="extra-loose">
        <form onChange={form.handleChange} onSubmit={form.handleSubmit}>
          <Body>
            <p>
              When you sign out,
              {whenWallet({
                software: ` you'll need your Secret Key to sign back in. Only sign out if you've backed up your Secret Key.`,
                ledger: ` you'll need to reconnect your Ledger to sign back into your wallet.`,
              })}
            </p>
            <Text as="p" mt="loose" fontWeight="bold">
              {whenWallet({
                software:
                  "⚠️ If you haven't backed up your Secret Key, you will loose all your funds.",
                ledger: '',
              })}
            </Text>
          </Body>

          <Flex
            as="label"
            alignItems="center"
            mt="loose"
            display={walletType === 'software' ? 'flex' : 'none'}
          >
            <Box mr="tight">
              <input
                type="checkbox"
                name="confirmBackup"
                defaultChecked={form.values.confirmBackup}
                data-testid={SettingsSelectors.SignOutConfirmHasBackupCheckbox}
              />
            </Box>
            <Caption userSelect="none">I've backed up my Secret Key</Caption>
          </Flex>
          <Flex mt="loose">
            <Button
              flex={1}
              type="button"
              onClick={() => onUserSafelyReturnToHomepage()}
              mode="tertiary"
              mr="base-tight"
              data-testid={SettingsSelectors.BtnSignOutReturnToHomeScreen}
            >
              Cancel
            </Button>
            <Button
              flex={1}
              type="submit"
              mode="primary"
              background={color('feedback-error')}
              _hover={{ background: color('feedback-error') }}
              isDisabled={!form.values.confirmBackup}
              data-testid={SettingsSelectors.BtnSignOutActuallyDeleteWallet}
            >
              Sign out
            </Button>
          </Flex>
        </form>
      </Box>
    </BaseDrawer>
  );
};
