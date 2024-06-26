import {
  CHAIN_UTILS,
  SUPPORTED_CHAIN_IDS,
  UserAddress,
  isValidAddress,
  isValidAccountId,
  userAddressToAccountId,
  accountIdToUserAddress,
  AccountId,
} from '@c3exchange/common';

const getChainUtilityByAddress = (address: UserAddress) => {
  const chainUtility = SUPPORTED_CHAIN_IDS.map((key) => CHAIN_UTILS[key]).find(
    (utility) => utility.isValidAddress(address)
  );
  if (!chainUtility) {
    throw new Error(`Invalid address: ${address}`);
  }
  return chainUtility;
};

export const getPublicKeyByAddress = (address: UserAddress): Uint8Array => {
  const chainUtility = getChainUtilityByAddress(address);
  return chainUtility.getPublicKey(address);
};

export const getC3Address = (address: UserAddress): AccountId => {
  if (isValidAccountId(address)) {
    return address;
  }
  if (isValidAddress(address)) {
    return userAddressToAccountId(address);
  }
  throw new Error(`Invalid address: ${address}`);
};

export const getUserAddress = (address: AccountId): UserAddress => {
  if (isValidAccountId(address)) {
    return accountIdToUserAddress(address);
  }
  if (isValidAddress(address)) {
    return address;
  }
  throw new Error(`Invalid address: ${address}`);
};
