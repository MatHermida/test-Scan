import { useMemo, useRef, useState } from 'react';
import Grid from '@mui/material/Grid';
import CustomButton from '../../../../components/CustomButton/CustomButton';
import Icon from '../../../../components/Icon/Icon';
import CustomInput from '../../../../components/CustomInput/CustomInput';
import { useWindowSize } from '../../../../hooks/useWindowSize';
import { breakpoints } from '../../../../theme';

import * as S from './styles';
import usePaste from '../../../../hooks/usePaste';

interface IHero {
  address: string;
  hasC3Address: boolean;
  wrongAddress: boolean;
  enableRefresh: boolean;
  onSearch: () => void;
  onRefreshAddress: () => void;
  onChangeAddress: (address: string) => void;
  onClear: () => void;
}
const Hero = ({
  address,
  hasC3Address,
  wrongAddress,
  enableRefresh,
  onSearch,
  onRefreshAddress,
  onChangeAddress,
  onClear,
}: IHero) => {
  const windowSize = useWindowSize();
  const isMobile = useMemo(
    () => windowSize.width < breakpoints.desktop,
    [windowSize.width]
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const [focusedInput, setFocusedInput] = useState(false);

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && address.length) {
      onSearch();
      setFocusedInput(false);
      inputRef.current?.blur();
    }
  };

  const { paste } = usePaste();
  const onPaste = (event: React.MouseEvent) => {
    event.preventDefault();
    inputRef.current?.focus();
    paste((text) => {
      onChangeAddress(text);
    });
  };

  const onClearInput = (event: React.MouseEvent) => {
    event.preventDefault();
    inputRef.current?.focus();
    onClear();
  };

  const onBackArrow = (event: React.MouseEvent) => {
    event.preventDefault();
    setFocusedInput(false);
    inputRef.current?.blur();
  };

  return (
    <S.Container
      container
      direction="column"
      _isResultPage={hasC3Address || wrongAddress}
      onKeyUp={handleKeyPress}
    >
      <Grid container>
        <S.Title _isResultPage={hasC3Address || wrongAddress}>
          Search C3 data directly from the Blockchain
        </S.Title>
      </Grid>
      <Grid item>
        <Grid container direction="row">
          <Grid item mobile={12} desktop="auto">
            <S.InputContainer _isMobile={isMobile} _isInputFocused={focusedInput}>
              <CustomInput
                inputRef={inputRef}
                value={address}
                onChange={(ev) => onChangeAddress(ev.target.value)}
                onFocus={() => setFocusedInput(true)}
                onBlur={() => setFocusedInput(false)}
                placeholder="Search by address or account id"
                endAdornment={
                  !!address ? (
                    <div onMouseDown={onClearInput}>
                      <Icon name="close" height={20} width={20} />
                    </div>
                  ) : (
                    isMobile &&
                    focusedInput && (
                      <div onMouseDown={onPaste}>
                        <Icon name="paste" height={20} width={20} />
                      </div>
                    )
                  )
                }
                startAdornment={
                  isMobile &&
                  (!focusedInput ? (
                    <div style={{ cursor: 'default' }}>
                      <Icon name="search" width={16} height={16} />
                    </div>
                  ) : (
                    <div onMouseDown={onBackArrow}>
                      <Icon name="backArrow" width={16} height={16} />
                    </div>
                  ))
                }
              />
            </S.InputContainer>
          </Grid>
          {!isMobile && (
            <Grid item desktop>
              <S.SearchContainer>
                <CustomButton
                  _height="56px"
                  _maxWidth="144px"
                  onClick={onSearch}
                  disabled={!address.length || enableRefresh}
                >
                  <S.SearchBtn>
                    <Icon name="search" width={16} height={16} />
                    <S.SearchTxt>Search</S.SearchTxt>
                  </S.SearchBtn>
                </CustomButton>
                <CustomButton
                  _height="56px"
                  _maxWidth="144px"
                  onClick={onRefreshAddress}
                  disabled={!enableRefresh}
                >
                  <S.SearchBtn>
                    <Icon name="refresh" width={16} height={16} />
                    <S.SearchTxt>Refresh</S.SearchTxt>
                  </S.SearchBtn>
                </CustomButton>
              </S.SearchContainer>
            </Grid>
          )}
        </Grid>
      </Grid>
    </S.Container>
  );
};

export default Hero;
