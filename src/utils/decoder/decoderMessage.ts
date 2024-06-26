import { DecodedMessage, OnChainRequestOp } from '../../interfaces/interfaces';
import {
  decodeBase64,
  IPackedInfo,
  decodeUint16,
  decodeUint,
  CHAIN_UTILS,
  CHAIN_ID_ALGORAND,
  InstrumentAmount,
  ServerInstrument,
  convertUint64toInt64,
  getChainNameByChainId,
  ChainId,
  decodeABIValue,
  SupportedChainId,
} from '@c3exchange/common';
import { truncateText } from '../utils';
import {
  getEnumKeyByEnumValue,
  getInstrumentfromSlotId,
  packABIString,
} from './decoderUtils';
import { decodeAddress } from 'algosdk';

export const withdrawFormat = '(byte,uint8,uint64,(uint16,address),uint64,uint64)';
export const poolMoveFormat = '(byte,uint8,uint64)';
export const delegateFormat = '(byte,address,uint64,uint64)';
export const accountMoveFormat = '(byte,address,(uint8,uint64)[],(uint8,uint64)[])';
export const ORDER_OPERATION_STR = '06';

const orderDataFormat: IPackedInfo = {
  operation: { type: 'fixed', valueHex: ORDER_OPERATION_STR },
  account: { type: 'base64', size: 32 },
  nonce: { type: 'number' },
  expiresOn: { type: 'number' },
  sellSlotId: { type: 'byte' },
  sellAmount: { type: 'uint' },
  maxBorrow: { type: 'uint' },
  buySlotId: { type: 'byte' },
  buyAmount: { type: 'uint' },
  maxRepay: { type: 'uint' },
};

export const settleFormat = packABIString(orderDataFormat);

/**
 * Decodes the welcome message.
 *
 * @param {string} encodedMessage - The encoded message.
 * @returns {Object} - An object containing the operation type, user ID, and creation time.
 */
const decodeWelcomeMessage = (encodedMessage: string) => {
  const finalWordMatcher = /([A-Za-z0-9+/=]+)\s*$/;
  const match = encodedMessage.match(finalWordMatcher);
  if (!match) return;
  const operation = match[1];
  const decodedNonce = Buffer.from(operation, 'base64').toString();
  const parts = decodedNonce.split('-');
  if (parts.length < 2) return;
  const userID = parts[0];
  const extractedCreationTime = parts[1];
  const creationTime = new Date(parseInt(extractedCreationTime)).toLocaleString();
  const operationType = getEnumKeyByEnumValue(OnChainRequestOp, OnChainRequestOp.Login);
  return { operationType, userID, creationTime };
};

interface UnpackedData {
  result: Record<string, any>;
  bytesRead: number;
}

/**
 * Decodes the partial data of the header of a signed message.
 *
 * @param {Uint8Array} data - The data to decode.
 * @returns {UnpackedData} - An object containing the result and the number of bytes read.
 */
export const unpackPartialData = (data: Uint8Array): UnpackedData => {
  const formatOpt: IPackedInfo = {
    target: { type: 'address' },
    lease: { type: 'bytes', size: 32 },
    lastValid: { type: 'number' },
  };
  let bytesRead = 0;
  const result: Record<string, any> = {};
  for (const [key, packedInfo] of Object.entries(formatOpt)) {
    if (bytesRead >= data.length) {
      throw new Error(
        `Unpack data length was not enough for the format provided. Data: ${data}, format: ${JSON.stringify(
          formatOpt
        )}`
      );
    }
    let value;
    switch (packedInfo.type) {
      case 'address':
        //value = encodeAddress(data.slice(bytesRead, bytesRead + 32));
        value = CHAIN_UTILS[CHAIN_ID_ALGORAND].getAddressByPublicKey(
          data.slice(bytesRead, bytesRead + 32)
        );
        bytesRead += 32;
        break;
      case 'bytes': {
        let size: number;
        if (packedInfo.size === undefined) {
          size = decodeUint16(data.slice(bytesRead, bytesRead + 2));
          bytesRead += 2;
        } else {
          size = packedInfo.size;
        }
        value = new Uint8Array(data.slice(bytesRead, bytesRead + size));
        bytesRead += size;
        break;
      }
      case 'number': {
        const length = packedInfo.size ?? 8;
        value = Number(decodeUint(data.slice(bytesRead, bytesRead + length), length));
        bytesRead += length;
        break;
      }
      default:
        throw new Error(`Unknown decode type: ${packedInfo}`);
    }
    result[key] = value;
  }

  return { result, bytesRead };
};

export function decodeWithdraw(operation: Uint8Array, appState: ServerInstrument[]) {
  const withdrawResult = decodeABIValue(operation, withdrawFormat);
  const operationType = getEnumKeyByEnumValue(
    OnChainRequestOp,
    OnChainRequestOp.Withdraw
  );
  const instrumentSlotId = Number(withdrawResult[1]);
  const encodedAmount = withdrawResult[2];
  const chainId = Number(withdrawResult[3][0]);
  const chainName = getChainNameByChainId(chainId as ChainId);
  const chain = { chainId, chainName };
  const encodedMaxBorrow = withdrawResult[4];

  // The decodeABIValue function retrieves the value of the 'address' field of withdrawFormat, which corresponds
  // to a public key of a wallet. Then it converts it into an Algorand address and returns this address.
  // However, this public key may be from another chain, so we need to extract the public key from
  // the address and calculate the correct address for the target chain.
  const algorandAddress = withdrawResult[3][1];
  const publicKey = decodeAddress(algorandAddress).publicKey;
  const targetAddress =
    CHAIN_UTILS[chainId as SupportedChainId].getAddressByPublicKey(publicKey);
  const target = truncateText(targetAddress, [8, 8]);

  const amount = Number(
    InstrumentAmount.fromContract(
      getInstrumentfromSlotId(instrumentSlotId, appState),
      BigInt(encodedAmount)
    ).toDecimal()
  );
  const instrumentName = getInstrumentfromSlotId(instrumentSlotId, appState).id;
  const maxBorrow = Number(
    InstrumentAmount.fromContract(
      getInstrumentfromSlotId(instrumentSlotId, appState),
      BigInt(encodedMaxBorrow)
    ).toDecimal()
  );

  const withdrawDecoded: DecodedMessage = {
    operationType,
    target,
    chain,
    instrumentName,
    amount,
  };
  if (maxBorrow > 0) withdrawDecoded.maxBorrow = maxBorrow;
  return withdrawDecoded;
}

export function decodePoolMove(operation: Uint8Array, appState: ServerInstrument[]) {
  const poolResult = decodeABIValue(operation, poolMoveFormat);
  const instrumentSlotId = Number(poolResult[1]);
  const encodedAmount = convertUint64toInt64(poolResult[2]);
  const instrumentAmount = InstrumentAmount.fromContract(
    getInstrumentfromSlotId(instrumentSlotId, appState),
    encodedAmount
  );
  const amount = Number(
    (instrumentAmount.isZeroOrLess()
      ? instrumentAmount.neg()
      : instrumentAmount
    ).toDecimal()
  );
  const operationType = encodedAmount > 0 ? 'Subscribe' : 'Redeem';
  const instrumentName = getInstrumentfromSlotId(instrumentSlotId, appState).id;
  return { operationType, instrumentName, amount };
}

export function decodeSettle(operation: Uint8Array, appState: ServerInstrument[]) {
  const settleResult = decodeABIValue(operation, settleFormat);
  const operationType = getEnumKeyByEnumValue(OnChainRequestOp, OnChainRequestOp.Settle);
  const nonce = Number(settleResult[2]);
  const extractedExpirationTime = settleResult[3];
  const expiresOn = new Date(parseInt(extractedExpirationTime) * 1000).toLocaleString();
  const sellSlotId = settleResult[4];
  const sellAsset = getInstrumentfromSlotId(sellSlotId, appState);
  const sellAmount = Number(
    InstrumentAmount.fromContract(sellAsset, settleResult[5]).toDecimal()
  );
  const maxBorrow = Number(
    InstrumentAmount.fromContract(sellAsset, settleResult[6]).toDecimal()
  );
  const buySlotId = settleResult[7];
  const buyAsset = getInstrumentfromSlotId(buySlotId, appState);
  const buyAmount = Number(
    InstrumentAmount.fromContract(buyAsset, settleResult[8]).toDecimal()
  );
  const maxRepay = Number(
    InstrumentAmount.fromContract(buyAsset, settleResult[9]).toDecimal()
  );

  return {
    operationType,
    nonce,
    expiresOn,
    sellAssetId: sellAsset.id,
    sellAmount,
    buyAssetId: buyAsset.id,
    buyAmount,
    maxBorrow,
    maxRepay,
  };
}

function decodeDelegate(operation: Uint8Array) {
  const operationType = getEnumKeyByEnumValue(
    OnChainRequestOp,
    OnChainRequestOp.Delegate
  );
  const delegateResult = decodeABIValue(operation, delegateFormat);
  const extractedDelegateAddress = delegateResult[1];
  const delegateAddress = truncateText(extractedDelegateAddress, [8, 8]);
  const nonce = Number(delegateResult[2]);
  const extractedExpirationTime = delegateResult[3];
  const expiresOn = new Date(parseInt(extractedExpirationTime) * 1000).toLocaleString();

  const isEphemeralKeyDelegateMsg = nonce === 0;
  return {
    operationType: isEphemeralKeyDelegateMsg ? 'Ephemeral Key Delegate' : operationType,
    delegateAddress,
    expiresOn,
    ...(isEphemeralKeyDelegateMsg ? {} : { nonce }),
  };
}

/**
 * Decodes a message corresponding to it's operation type.
 *
 * @param {string} encodeMessage - The encoded message.
 * @param {ServerInstrument[]} serverInstruments - The server instruments.
 * @returns {DecodedMessage} - An object containing the decoded message.
 */
export const decodeMessage = (
  encodeMessage: string,
  serverInstruments: ServerInstrument[]
): DecodedMessage | undefined => {
  try {
    const welcomeRegex = /^\s*Welcome to C3/;
    if (welcomeRegex.test(encodeMessage)) return decodeWelcomeMessage(encodeMessage);
    const byteArray: Uint8Array = new Uint8Array(Buffer.from(encodeMessage, 'utf-8'));
    const buffer: Buffer = Buffer.from(byteArray);
    const bytesToDecode: Uint8Array = decodeBase64(buffer.toString('base64'));
    const decoder = new TextDecoder('utf-8');
    const base64String = decoder.decode(bytesToDecode);
    const bytesArray = Array.from(atob(base64String), (char) => char.charCodeAt(0));
    const fullMessage = new Uint8Array(bytesArray).slice(8);
    const decodedHeader = unpackPartialData(fullMessage);
    const operation = fullMessage.slice(decodedHeader.bytesRead);
    const account: string = truncateText(decodedHeader.result.target, [8, 8]);
    switch (operation[0]) {
      case OnChainRequestOp.Withdraw:
        const withdrawDecoded = decodeWithdraw(operation, serverInstruments);
        return { ...withdrawDecoded, account };
      case OnChainRequestOp.PoolMove:
        const poolMoveDecoded = decodePoolMove(operation, serverInstruments);
        return { ...poolMoveDecoded, account };
      case OnChainRequestOp.Settle:
        const settleDecoded = decodeSettle(operation, serverInstruments);
        return { ...settleDecoded, account };
      case OnChainRequestOp.Delegate:
        const delegateDecoded = decodeDelegate(operation);
        return { ...delegateDecoded, account };
      default:
        throw new Error(`Unknown operation type: ${operation[0]}`);
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};
