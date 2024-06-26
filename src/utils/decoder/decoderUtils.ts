import { DecodedMessage } from '../../interfaces/interfaces';
import { IPackedInfo, Instrument, ServerInstrument } from '@c3exchange/common';

export const packABIString = (format: IPackedInfo): string => {
  const internalPackABIString = (format: IPackedInfo): string[] => {
    return Object.entries(format).map(([, type]) => {
      switch (type.type) {
        case 'object':
        case 'hash':
          return '(' + internalPackABIString(type.info) + ')';
        case 'array':
          return internalPackABIString({ value: type.info }) + '[]';
        case 'address':
          return 'address';
        case 'byte':
          return 'byte';
        case 'bytes':
        case 'string':
        case 'base64':
          return 'byte[' + (type.size ?? '') + ']';
        case 'number':
        case 'uint':
          return 'uint' + (type.size ?? 8) * 8;
        case 'fixed':
          if (type.valueHex.length === 2) {
            return 'byte';
          }
          return 'byte[' + type.valueHex.length / 2 + ']';
        default:
          throw new Error(`Type ${type.type} is not supported or recognized`);
      }
    });
  };
  return '(' + internalPackABIString(format).join(',') + ')';
};

const defaultInstrument = {
  id: '',
  asaId: 0,
  asaName: '',
  asaUnitName: '',
  asaDecimals: 0,
  chains: [],
};

export function getInstrumentfromSlotId(
  id: number,
  appState: ServerInstrument[]
): Instrument {
  for (let instrument of appState) {
    if (instrument.slotId === id) {
      return instrument.instrument;
    }
  }
  return defaultInstrument;
}

export const keyToLabelMapping: { [key in keyof DecodedMessage]?: string } = {
  amount: 'Amount',
  target: 'Destination',
  instrumentName: 'Asset',
  operationType: 'Type',
  userID: 'User ID',
  creationTime: 'Creation Time',
  account: 'Account',
  expiresOn: 'Expiration Time',
  buyAmount: 'Buy Amount',
  buyAssetId: 'Buy Asset',
  maxBorrow: 'Max Borrow',
  maxRepay: 'Max Repay',
  nonce: 'Nonce',
  sellAmount: 'Sell Amount',
  sellAssetId: 'Sell Asset',
  chain: 'Chain',
  delegateAddress: 'Delegate Address',
};

export const getEnumKeyByEnumValue = (
  enumObj: any,
  enumValue: number
): string | undefined => {
  let keys = Object.keys(enumObj).filter((x) => enumObj[x] === enumValue);
  return keys.length > 0 ? keys[0] : undefined;
};

export const processDecodedMessageValue = (key: string, value: any) => {
  let primaryValue: string = '';
  let secondaryValue: string = '';

  if (typeof value !== 'object') {
    primaryValue = value;
    return { primaryValue, secondaryValue };
  }
  switch (key) {
    case 'chain':
      primaryValue = value?.chainId;
      secondaryValue = ' - ' + value?.chainName;
      break;
    case 'account':
      primaryValue = value?.account;
      secondaryValue = value?.modifier;
      break;
    default:
      primaryValue = JSON.stringify(value);
  }

  return { primaryValue, secondaryValue };
};

/**
 * Converts a URL parameter to a base64 encoded string.
 * Replacing certain url characters with their base64 equivalent.
 *
 * @param {string} urlParam - The URL parameter.
 * @returns {string} - The base64 encoded string.
 */
export const urlParamToBase64 = (urlParam: string | null): string => {
  if (!urlParam) return '';
  const welcomeRegex = /^\s*Welcome to C3/;
  if (welcomeRegex.test(urlParam)) return urlWelcomeMsgToBase64(urlParam);
  return urlParam.replace(/ /g, '+');
};

export const urlWelcomeMsgToBase64 = (urlWelcomeMsg: string): string => {
  const finalWordMatcher = /([A-Za-z0-9+/= ]+)\s*$/;
  const match = urlWelcomeMsg.match(finalWordMatcher);
  if (!match) return '';
  const welcomeString = `Welcome to C3:
Click to sign and accept the C3 Terms of Service (https://c3.io/terms)
This request will not trigger a blockchain transaction or cost any gas fees.
`;
  const operation = match[1].trim().replace(/ /g, '+');
  return `${welcomeString}${operation}`;
};
