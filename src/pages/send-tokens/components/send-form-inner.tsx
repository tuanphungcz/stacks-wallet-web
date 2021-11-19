import React, { Suspense, useCallback, useEffect } from 'react';
import { useFormikContext } from 'formik';
import { Box, Text, Button, Stack } from '@stacks/ui';

import { HIGH_FEE_AMOUNT_STX } from '@common/constants';
import { useDrawers } from '@common/hooks/use-drawers';
import { LoadingKeys, useLoading } from '@common/hooks/use-loading';
import { useNextTxNonce } from '@common/hooks/account/use-next-tx-nonce';
import { useSelectedAsset } from '@common/hooks/use-selected-asset';
import { microStxToStx } from '@common/stacks-utils';
import { TransactionFormValues } from '@common/types';
import { isEmpty } from '@common/utils';
import { ErrorLabel } from '@components/error-label';
import { ShowEditNonceAction } from '@components/show-edit-nonce';
import { FeeRow } from '@features/fee-row/fee-row';
import { Estimations } from '@models/fees-types';
import { AssetSearch } from '@pages/send-tokens/components/asset-search/asset-search';
import { AmountField } from '@pages/send-tokens/components/amount-field';
import { useTransferableAssets } from '@store/assets/asset.hooks';
import { RecipientField } from '@pages/send-tokens/components/recipient-field';
import { MemoField } from '@pages/send-tokens/components/memo-field';
import { useFeeEstimationsState, useFeeState } from '@store/transactions/fees.hooks';
import { SendFormSelectors } from '@tests/page-objects/send-form.selectors';
import { useLocalStxTransactionAmount } from '@store/transactions/local-transactions.hooks';
import {
  useEstimatedTransactionByteLengthState,
  useSerializedTransactionPayloadState,
} from '@store/transactions/transaction.hooks';

import { SendFormMemoWarning } from './memo-warning';

interface SendFormProps {
  assetError: string | undefined;
}

export function SendFormInner(props: SendFormProps) {
  const { assetError } = props;
  useNextTxNonce();
  const { isLoading } = useLoading(LoadingKeys.SEND_TOKENS_FORM);
  const { showHighFeeConfirmation, setShowHighFeeConfirmation } = useDrawers();
  const serializedTxPayload = useSerializedTransactionPayloadState();
  const estimatedTxByteLength = useEstimatedTransactionByteLengthState();
  const { data: feeEstimationsResp, isError } = useFeeEstimationsQuery(
    serializedTxPayload,
    estimatedTxByteLength
  );
  const [, setFeeEstimations] = useFeeEstimationsState();
  const [fee, setFee] = useFeeState();
  const [amount, setAmount] = useLocalStxTransactionAmount();
  const { selectedAsset } = useSelectedAsset();
  const assets = useTransferableAssets();

  const { handleSubmit, values, setValues, errors, setFieldError, setFieldValue, validateForm } =
    useFormikContext<TransactionFormValues>();

  useEffect(() => {
    if (!fee && feeEstimationsResp && feeEstimationsResp.estimations) {
      setFeeEstimations(feeEstimationsResp.estimations);
      setFee(feeEstimationsResp.estimations[Estimations.Middle].fee);
      setFieldValue('txFee', microStxToStx(feeEstimationsResp.estimations[Estimations.Middle].fee));
    }
  }, [fee, feeEstimationsResp, setFee, setFeeEstimations, setFieldValue]);

  useEffect(() => {
    return () => {
      if (amount) setAmount(null);
    };
  }, [amount, setAmount]);

  const onSubmit = useCallback(async () => {
    if (values.amount && values.recipient && values.txFee && selectedAsset) {
      selectedAsset.type === 'stx' && setAmount(values.amount);
      // We need to check for errors here before we show the high fee confirmation
      const formErrors = await validateForm();
      if (isEmpty(formErrors) && values.txFee > HIGH_FEE_AMOUNT_STX) {
        return setShowHighFeeConfirmation(!showHighFeeConfirmation);
      }
      handleSubmit();
    }
  }, [
    handleSubmit,
    selectedAsset,
    setAmount,
    setShowHighFeeConfirmation,
    showHighFeeConfirmation,
    validateForm,
    values.amount,
    values.recipient,
    values.txFee,
  ]);

  const onItemSelect = useCallback(() => {
    if (assets.length === 1) return;
    setValues({ ...values, amount: '', txFee: '' });
    setFieldError('amount', undefined);
    setFeeEstimations([]);
    setFee(null);
    if (amount) setAmount(null);
  }, [
    assets.length,
    setValues,
    values,
    setFieldError,
    setFeeEstimations,
    setFee,
    amount,
    setAmount,
  ]);

  const hasValues = values.amount && values.recipient !== '' && (values.txFee || fee);

  const symbol = selectedAsset?.type === 'stx' ? 'STX' : selectedAsset?.meta?.symbol;

  return (
    <Stack spacing="loose" flexDirection="column" flexGrow={1} shouldWrapChildren>
      <AssetSearch onItemClick={onItemSelect} />
      <Suspense fallback={<></>}>
        <AmountField
          error={errors.amount}
          feeQueryError={!!feeEstimationsResp?.error}
          value={values.amount || 0}
        />
      </Suspense>
      <RecipientField error={errors.recipient} value={values.recipient} />
      {selectedAsset?.hasMemo && <MemoField value={values.memo} error={errors.memo} />}
      {selectedAsset?.hasMemo && symbol && <SendFormMemoWarning symbol={symbol} />}
      {feeEstimationsResp && (
        <FeeRow feeEstimationsQueryError={isError || feeEstimationsResp?.error} />
      )}
      <Box mt="auto">
        {assetError && (
          <ErrorLabel mb="base">
            <Text textStyle="caption">{assetError}</Text>
          </ErrorLabel>
        )}
        <Button
          type="submit"
          borderRadius="12px"
          width="100%"
          isDisabled={!hasValues}
          onClick={onSubmit}
          data-testid={SendFormSelectors.BtnPreviewSendTx}
          isLoading={isLoading}
        >
          Preview
        </Button>
      </Box>
      <ShowEditNonceAction />
    </Stack>
  );
}