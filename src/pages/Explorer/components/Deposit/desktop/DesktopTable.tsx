import Grid from '@mui/material/Grid';
import TooltipInfo from '../../../../../components/TooltipInfo/TooltipInfo';
import { getAssetIcon, formatNumber } from '../../../../../utils';
import Loader from '../../../../../components/Loader/Loader';
import { IDepositTable } from '../interfaces';
import Formatter from '../../../../../utils/formatter';

import * as S from './styles';

const DesktopTable = (props: IDepositTable) => {
  const {
    c3Assets,
    C3Address,
    userCash,
    isLoading,
    totalValueLocked,
    totalAccountValue,
    getUSDPrice,
  } = props;
  return (
    <S.Container>
      <S.Title>
        {C3Address ? 'Account Assets' : "C3's Total Deposits"}
        {C3Address && (
          <S.AccountValue>
            ${formatNumber(totalAccountValue)}
            <TooltipInfo message="The net balance of assets in your C3 account, including liabilities. Account Assets = Assets in your account + Earn holdings - Borrow Position" />
          </S.AccountValue>
        )}
      </S.Title>
      <S.AssetInfo container>
        {C3Address ? (
          <>
            <Grid item desktop={3}>
              Asset
            </Grid>
            <S.RightAlignedGrid item desktop={3}>
              Amount
            </S.RightAlignedGrid>
            <S.RightAlignedGrid item desktop={4}>
              Value
            </S.RightAlignedGrid>
          </>
        ) : (
          <>
            <Grid item desktop={2}>
              Asset
            </Grid>
            <Grid item desktop={2}>
              Price
            </Grid>
            <S.RightAlignedGrid item desktop={3}>
              Amount
            </S.RightAlignedGrid>
            <S.RightAlignedGrid item desktop={3}>
              Value
            </S.RightAlignedGrid>
          </>
        )}
      </S.AssetInfo>
      <S.ScrollableContent>
        {isLoading && <Loader />}
        {C3Address
          ? userCash.map((asset) => (
              <S.Row container key={asset.instrument.id}>
                <S.AssetIconContainer item desktop={3}>
                  <S.IconContainer>{getAssetIcon(asset.instrument.id)}</S.IconContainer>
                  {asset.instrument.id}
                </S.AssetIconContainer>
                <S.RightAlignedGrid item desktop={3}>
                  {Formatter.fromInstrumentAmount(asset.amount).precision().formatted()}{' '}
                  {asset.instrument.id}
                </S.RightAlignedGrid>
                <S.RightAlignedGrid item desktop={4}>
                  $ {formatNumber(asset.value)}
                </S.RightAlignedGrid>
              </S.Row>
            ))
          : c3Assets?.map((asset) => (
              <S.Row container key={asset.instrument.id}>
                <S.AssetIconContainer item desktop={2}>
                  <S.IconContainer>{getAssetIcon(asset.instrument.id)}</S.IconContainer>
                  {asset.instrument.id}
                </S.AssetIconContainer>
                <Grid item desktop={2}>
                  {'$ '}
                  {Formatter.fromNumber(getUSDPrice(asset.instrument.id))
                    .precision(4)
                    .formatted()}
                </Grid>
                <S.RightAlignedGrid item desktop={3}>
                  {formatNumber(asset.amount)} {asset.instrument.id}
                </S.RightAlignedGrid>
                <S.RightAlignedGrid item desktop={3}>
                  $ {formatNumber(asset.value)}
                </S.RightAlignedGrid>
              </S.Row>
            ))}
      </S.ScrollableContent>
      {!C3Address && totalValueLocked && (
        <S.Footer>
          <S.TVLContainer item desktop={10}>
            <S.TVLLabel _isFullForm>Total Value Locked (</S.TVLLabel>
            <S.TVLLabel>TVL</S.TVLLabel>
            <S.TVLLabel _isFullForm>)</S.TVLLabel>
            <S.TVLLabel _isUSDValue>: ${formatNumber(totalValueLocked)}</S.TVLLabel>
            <TooltipInfo
              message="The total value of all available assets inside the C3 exchange platform."
              placement="bottom-end"
            />
          </S.TVLContainer>
        </S.Footer>
      )}
    </S.Container>
  );
};

export default DesktopTable;
