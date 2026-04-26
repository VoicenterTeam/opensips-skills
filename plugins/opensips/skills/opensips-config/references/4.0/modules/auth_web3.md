# auth_web3 Module Reference
<!-- generated-from: data/4.0/modules/auth_web3.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 auth_web3 module. Read this file when configuring or debugging the auth_web3 module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

The auth_web3 module provides Web3-based authentication for OpenSIPS, enabling SIP authentication through blockchain technology and ENS (Ethereum Name Service) resolution. This module integrates with the Oasis Sapphire blockchain network to verify SIP digest authentication responses and resolve ENS names to wallet addresses.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

- `OpenSSL` — For cryptographic operations
- `libcurl` — For HTTP RPC calls to blockchain networks

## Exported Parameters

### `authentication_contract_address` (string)

Address of the smart contract that handles authentication verification. This contract must implement the authenticateUser function for digest verification.

*Default value is None (must be configured).*

**Example.** 0xE773BB79689379d32Ad1Db839868b6756B493aea.

```opensips
modparam("auth_web3", "authentication_contract_address", "0xE773BB79689379d32Ad1Db839868b6756B493aea")
```
### `authentication_rpc_url` (string)

RPC URL for the blockchain network (e.g., Oasis Sapphire testnet or mainnet). This parameter specifies the endpoint for blockchain communication.

*Default value is None (must be configured).*

**Example.** https://testnet.sapphire.oasis.dev.

```opensips
modparam("auth_web3", "authentication_rpc_url", "https://testnet.sapphire.oasis.dev")
```
### `contract_debug_mode` (integer)

Enable debug logging for blockchain contract interactions. When enabled, detailed logs are generated for debugging purposes.

*Default value is 0 (disabled).*

**Example.** 1.

```opensips
modparam("auth_web3", "contract_debug_mode", 1)
```
### `ens_registry_address` (string)

Address of the ENS registry contract on Ethereum mainnet. This is used for resolving ENS names to wallet addresses.

*Default value is 0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e (ENS Registry).*

**Example.** 0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e.

```opensips
modparam("auth_web3", "ens_registry_address", "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e")
```
### `ens_rpc_url` (string)

RPC URL for the Ethereum network used for ENS resolution. This should point to an Ethereum mainnet RPC endpoint for ENS name resolution.

*Default value is None (must be configured).*

**Example.** https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY.

```opensips
modparam("auth_web3", "ens_rpc_url", "https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY")
```
### `rpc_timeout` (integer)

Timeout in seconds for blockchain RPC calls. This parameter controls how long to wait for blockchain responses.

*Default value is 10 seconds.*

**Example.** 15.

```opensips
modparam("auth_web3", "rpc_timeout", 15)
```

## Exported Functions

### `web3_proxy_authenticate(realm, method)`

Performs Web3-based authentication for Proxy-Authenticate challenges. Similar to web3_www_authenticate but for proxy authentication scenarios.

This function works identically to web3_www_authenticate but is designed for proxy authentication flows where Proxy-Authorization headers are used.

**Parameters:**

- `method` *(string, optional)* — SIP method (REGISTER, INVITE, etc.). If not provided, uses the actual SIP method from the request
- `realm` *(string, required)* — Authentication realm (usually the domain name)

**Return codes:**

- `1` — AUTHORIZED - Authentication successful
- `-1` — ERROR - Authentication failed or error occurred

**Usable from:** REQUEST_ROUTE

**Related:**

- `proxy_challenge`

**Example.** INVITE authentication with proxy auth.

```opensips
# INVITE authentication with proxy auth
if (is_method("INVITE")) {
    if (!$hdr(Authorization)) {
        www_challenge("$fd", "0");
        exit;
    }
    if (web3_proxy_authenticate("$fd", "INVITE")) {
        # Authentication successful
    } else {
        send_reply(407, "Proxy Authentication Required");
        exit;
    }
}
```

### `web3_www_authenticate(realm, method)`

Performs Web3-based authentication for WWW-Authenticate challenges. Verifies SIP digest authentication through blockchain contracts and ENS resolution.

This function extracts digest parameters from the Authorization header, resolves ENS names to wallet addresses, and verifies the digest response on the blockchain.

**Parameters:**

- `method` *(string, optional)* — SIP method (REGISTER, INVITE, etc.). If not provided, uses the actual SIP method from the request
- `realm` *(string, required)* — Authentication realm (usually the domain name)

**Return codes:**

- `1` — AUTHORIZED - Authentication successful
- `-1` — ERROR - Authentication failed or error occurred

**Usable from:** REQUEST_ROUTE

**Related:**

- `www_challenge`

**Example.** REGISTER authentication.

```opensips
# REGISTER authentication
if (is_method("REGISTER")) {
    if (!$hdr(Authorization)) {
        www_challenge("$td", "0");
        exit;
    }
    if (web3_www_authenticate("$td", "REGISTER")) {
        # Authentication successful
        save("location");
        exit;
    } else {
        send_reply(401, "Unauthorized");
        exit;
    }
}
```

## Configuration Examples

### Single Network Mode (Fallback)

When web3_ens_rpc_url is not configured, all blockchain operations use the same RPC endpoint specified in web3_authentication_rpc_url. This mode is suitable when both ENS and authentication contracts are deployed on the same network.

```opensips
# Single network configuration
modparam("auth_web3", "web3_authentication_rpc_url", "https://ethereum-sepolia-rpc.publicnode.com")
modparam("auth_web3", "web3_authentication_contract_address", "0xYourContract")
# ens_rpc_url not set - will use authentication_rpc_url for ENS
```
### Dual Network Mode

When web3_ens_rpc_url is configured, ENS resolution queries use the specified Ethereum RPC endpoint while authentication queries use the Oasis Sapphire RPC endpoint. This is the recommended production configuration.

```opensips
# Dual network configuration
# Authentication on Oasis Sapphire
modparam("auth_web3", "web3_authentication_rpc_url", "https://testnet.sapphire.oasis.dev")
modparam("auth_web3", "web3_authentication_contract_address", "0xYourOasisContract")

# ENS resolution on Ethereum
modparam("auth_web3", "web3_ens_rpc_url", "https://eth.drpc.org")
modparam("auth_web3", "web3_ens_registry_address", "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e")
```
### Production Setup

Production deployments typically use Ethereum mainnet for ENS and Oasis Sapphire mainnet for authentication:

```opensips
loadmodule "auth_web3.so"

# Oasis Sapphire Mainnet
modparam("auth_web3", "web3_authentication_rpc_url", "https://sapphire.oasis.io")
modparam("auth_web3", "web3_authentication_contract_address", "0xYourProductionContract")

# Ethereum Mainnet for ENS
modparam("auth_web3", "web3_ens_rpc_url", "https://eth.drpc.org")
modparam("auth_web3", "web3_ens_registry_address", "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e")

# Optional: Enable debug logging
modparam("auth_web3", "web3_contract_debug_mode", 0)
```
### Testing Setup

For testing and development, use Sepolia testnet for ENS and Oasis Sapphire testnet for authentication:

```opensips
loadmodule "auth_web3.so"

# Oasis Sapphire Testnet
modparam("auth_web3", "web3_authentication_rpc_url", "https://testnet.sapphire.oasis.dev")
modparam("auth_web3", "web3_authentication_contract_address", "0xYourTestContract")

# Ethereum Sepolia for ENS
modparam("auth_web3", "web3_ens_rpc_url", "https://ethereum-sepolia-rpc.publicnode.com")
modparam("auth_web3", "web3_ens_registry_address", "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e")

# Enable debug logging for testing
modparam("auth_web3", "web3_contract_debug_mode", 1)
```
