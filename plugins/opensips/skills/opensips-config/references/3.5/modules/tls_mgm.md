# tls_mgm Module Reference
<!-- generated-from: data/3.5/modules/tls_mgm.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 tls_mgm module. Read this file when configuring or debugging the tls_mgm module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported Pseudo-Variables](#exported-pseudo-variables)
- [Exported MI Functions](#exported-mi-functions)
- [Configuration Examples](#configuration-examples)

## Overview

This module is a management module for TLS certificates and parameters. It provides an interface for all the modules that use the TLS protocol. It also exports pseudo variables with certificate and TLS parameters.

## How It Works

This module is used to provision TLS certificates and parameters for all the modules that use TLS transport (like proto_tls or proto_wss). The module supports multiple virtual domains that can be assigned to different listeners (servers) or new connections (clients). Each TLS module that uses this management module should assign itself to one or more domains.

The module allows the definition of the TLS domains both via module parameters (script level) and via an SQL table.

Besides TLS certificates and parameters, this module also acts as an inteface between the actual TLS implemenation (provided by openSSL or wolfSSL libraries) and transport protocol modules like proto_tls or proto_wss. The tls_mgm module transparently exposes the TLS operations implemented by tls_openssl and tls_wolfssl modules to the higher-level OpenSIPS transport modules.

The TLS library selection ca be configured through the tls_library module parameter.

The wording 'TLS domain' means that this TLS connection will have different parameters than another TLS connection (from another TLS domain). Thus, TLS domains are not directly related to different SIP domains, although they are often used in conjunction. Depending on the direction of the TLS handshake, a TLS domain is called 'client domain' (=outgoing TLS connection) or 'server domain' (= incoming TLS connection).

If you run several SIP domains you can specify some parameters for each of them separately (regardless if you have only one or multiple socket=tls:ip:port entries in the config file).

For example, TLS domains can be used in virtual hosting scenarios with TLS. OpenSIPS offers SIP service for multiple domains, e.g. atlanta.com and biloxi.com. Altough both domains will be hosted on a single SIP proxy, the SIP proxy needs 2 certificates: One for atlanta.com and one for biloxi.com. For incoming TLS connections, the SIP proxy has to present the respective certificate during the TLS handshake. As the SIP proxy does not have a received SIP message yet (this is done after the TLS handshake), the SIP proxy can not retrieve the target domain from SIP (which would have been usually retrieved from the domain in the request URI). Thus, distinction for these domains must be done by using multiple listening sockets or by having clients that send the Servername TLS extension(SNI) in the handshake process.

For outgoing TLS connections, the TLS domain is chosen based on the destination socket of the underlying outgoing TCP connection and/or by taking a decision at script level via an AVP. For example, you can inspect headers like RURI or From and match the domain in the SIP header with filters that you have set up for the TLS domains.

NOTE: Except tls_handshake_timeout and tls_send_timeout all TLS parameters can be set per TLS domain.

TLS domains can be defined in two ways:

* by setting the server_domain or client_domain module parameters
* by provisioning in DB

For the domains defined in the DB, the certificate, private key, list of trusted CAs and Diffie-Hellman parameters are provisioned as BLOB values while for script defined domains you must provide path to files.

You can define domains both in the DB and script at the same time.

For any TLS domain (defined through script or DB) if not specified otherwise, the default settings are:

* method - SSLv23
* verify_cert - 1
* require_cert - 1
* certificate - CFG_DIR/tls/cert.pem
* private_key - CFG_DIR/tls/ckey.pem
* crl_check_all - 0
* crl_dir - none
* ca_list - none
* ca_dir - /etc/pki/CA/
* cipher_list - the OpenSSL default ciphers
* dh_params - none
* ec_curve - none

## Dependencies

### OpenSIPs Modules

- `tls_openssl` — Must be loaded before this module unless tls_library is set to 'none'.
- `tls_wolfssl` — Must be loaded before this module unless tls_library is set to 'none'.

### External Libraries

None.

## Exported Parameters

### `ca_dir` (string)

Directory storing trusted CAs. The certificates in the directory must be in hashed form, as described in the openssl documentation for the Hashed Directory Method. The domain part represents the name of the TLS domain.

*Default value is /etc/pki/CA/.*

**Example.** [dom]/mycerts/certs.

```opensips
modparam("tls_mgm", "ca_dir", "[dom]/mycerts/certs")
```
### `ca_dir_col` (string)

Sets the CA directory column name.

*Default value is ca_dir.*

**Example.** ca_dir.

```opensips
modparam("tls_mgm", "ca_dir_col", "ca_dir")
```
### `ca_list` (string)

List of trusted CAs. The file contains the certificates accepted, one after the other. It MUST be a file, not a folder. The domain part represents the name of the TLS domain.

**Example.** [dom]/mycerts/certs/ca_list.pem.

```opensips
modparam("tls_mgm", "ca_list", "[dom]/mycerts/certs/ca_list.pem")
```
### `ca_list_col` (string)

Sets the CA list column name.

*Default value is ca_list.*

**Example.** ca_list.

```opensips
modparam("tls_mgm", "ca_list_col", "ca_list")
```
### `certificate` (string)

Public certificate file for OpenSIPS. It will be used as server-side certificate for incoming TLS connections, and as a client-side certificate for outgoing TLS connections. The domain part represents the name of the TLS domain.

*Default value is CFG_DIR/tls/cert.pem.*

**Example.** Set the `certificate` parameter.

```opensips
...
modparam("tls_mgm", "certificate", "[dom]/mycerts/certs/opensips_server_cert.pem")
...
```
### `certificate_col` (string)

Sets the certificate column name.

*Default value is certificate.*

**Example.** certificate.

```opensips
modparam("tls_mgm", "certificate_col", "certificate")
```
### `cipher_list_col` (string)

Sets the cipher list column name.

*Default value is cipher_list.*

**Example.** cipher_list.

```opensips
modparam("tls_mgm", "cipher_list_col", "cipher_list")
```
### `ciphers_list` (string)

You can specify the list of algorithms for authentication and encryption that you allow. The domain part represents the name of the TLS domain. To obtain a list of ciphers and then choose, use the openssl application: openssl ciphers 'ALL:eNULL:!LOW:!EXPORT'

*Default value is OpenSSL default ciphers.*

**Notes:** Do not use the NULL algorithms (no encryption) ... only for testing!!!

**Example.** [dom]NULL.

```opensips
modparam("tls_mgm", "ciphers_list", "[dom]NULL")
```
### `client_domain` (string)

You can define virtual TLS domains through these parameters. The value of these parameters represents the virtual tls domain's name which is only used for identification.

**Notes:** For the domains defined in the DB, the certificate, private key, list of trusted CAs and Diffie-Hellman parameters are provisioned as BLOB values while for script defined domains you must provide path to files.

**Example.** dom4.

```opensips
...
socket=tls:10.0.0.10:5061
...
# set the TLS client domain AVP
modparam("tls_mgm", "client_sip_domain_avp", "tls_sip_dom")
...

# 'atlanta' server domain
modparam("tls_mgm", "server_domain", "dom1")
modparam("tls_mgm", "match_ip_address", "[dom1]10.0.0.10:5061")
modparam("tls_mgm", "match_sip_domain", "[dom1]atlanta.com")

modparam("tls_mgm", "certificate", "[dom1]/certs/atlanta.com/cert.pem")
modparam("tls_mgm", "private_key", "[dom1]/certs/atlanta.com/privkey.pem")
modparam("tls_mgm", "ca_list", "[dom1]/certs/wellknownCAs")
modparam("tls_mgm", "tls_method", "[dom1]tlsv1")
modparam("tls_mgm", "verify_cert", "[dom1]1")
modparam("tls_mgm", "require_cert", "[dom1]1")

#'biloxi' server domain
modparam("tls_mgm", "server_domain", "dom2")
modparam("tls_mgm", "match_ip_address", "[dom2]10.0.0.10:5061")
modparam("tls_mgm", "match_sip_domain", "[dom2]biloxi.com")

modparam("tls_mgm", "certificate", "[dom2]/certs/biloxi.com/cert.pem")
modparam("tls_mgm", "private_key", "[dom2]/certs/biloxi.com/privkey.pem")
modparam("tls_mgm", "ca_list", "[dom2]/certs/wellknownCAs")
modparam("tls_mgm", "tls_method", "[dom2]tlsv1")
modparam("tls_mgm", "verify_cert", "[dom2]1")
modparam("tls_mgm", "require_cert", "[dom2]1")

# generic TLS server domain, if the client does not provide SNI
modparam("tls_mgm", "server_domain", "dom3")
modparam("tls_mgm", "match_ip_address", "[dom3]10.0.0.10:5061")
modparam("tls_mgm", "match_sip_domain", "[dom3]none")

modparam("tls_mgm", "certificate", "[dom3]/certs/generic/cert.pem")
modparam("tls_mgm", "private_key", "[dom3]/certs/generic/privkey.pem")
modparam("tls_mgm", "ca_list", "[dom3]/certs/wellknownCAs")
modparam("tls_mgm", "tls_method", "[dom3]tlsv1")
modparam("tls_mgm", "verify_cert", "[dom3]1")
modparam("tls_mgm", "require_cert", "[dom3]1")

# 'atlanta' client domain
modparam("tls_mgm", "client_domain", "dom4")
modparam("tls_mgm", "match_ip_address", "[dom4]*")
modparam("tls_mgm", "match_sip_domain", "[dom4]atlanta.com")

modparam("tls_mgm", "certificate", "[dom4]/certs/atlanta.com/cert.pem")
modparam("tls_mgm", "private_key", "[dom4]/certs/atlanta.com/privkey.pem")
modparam("tls_mgm", "ca_list", "[dom4]/certs/wellknownCAs")
modparam("tls_mgm", "tls_method", "[dom4]tlsv1")
modparam("tls_mgm", "verify_cert", "[dom4]1")
modparam("tls_mgm", "require_cert", "[dom4]1")

# 'biloxi' client domain
modparam("tls_mgm", "client_domain", "dom5")
modparam("tls_mgm", "match_ip_address", "[dom5]*")
modparam("tls_mgm", "match_sip_domain", "[dom5]biloxi.com")

modparam("tls_mgm", "certificate", "[dom5]/certs/biloxi.com/cert.pem")
modparam("tls_mgm", "private_key", "[dom5]/certs/biloxi.com/privkey.pem")
modparam("tls_mgm", "ca_list", "[dom5]/certs/wellknownCAs")
modparam("tls_mgm", "tls_method", "[dom5]tlsv1")
modparam("tls_mgm", "verify_cert", "[dom5]1")
modparam("tls_mgm", "require_cert", "[dom5]1")

# TLS client domain for GW provider
modparam("tls_mgm", "client_domain", "dom6")
modparam("tls_mgm", "match_ip_address", "[dom6]1.2.3.4:6677")
modparam("tls_mgm", "match_sip_domain", "[dom6]*")

modparam("tls_mgm", "certificate", "[dom6]/certs/gw/cert.pem")
modparam("tls_mgm", "private_key", "[dom6]/certs/gw/privkey.pem")
modparam("tls_mgm", "ca_list", "[dom6]/certs/wellknownCAs")
modparam("tls_mgm", "tls_method", "[dom6]tlsv1")
modparam("tls_mgm", "verify_cert", "[dom6]0")

...
route{
...
    # we match the TLS client domain using the SIP domain in the RURI
    $avp(tls_sip_dom) = $rd;
    t_relay();
    exit;
...
    # calls to the PSTN GW, will match the correct TLS domain by IP
    t_relay("tls:1.2.3.4:6677");
    exit;
...

```
### `client_sip_domain_avp` (string)

Name of the AVP that sets the SIP domain used in the TLS client domain matching process.

**Notes:** Note: If there is already an existing TLS connection to the remote target, it will be reused and setting this AVP has no effect.

Note: You can force a particular SIP domain to be used just for a particular branch by setting the _$bavp_ variable with the same name. When both _$bavp_ and _$avp_ variables are set, the first one takes precedence.

**Example.** sip_match_dom.

```opensips
modparam("tls_mgm", "client_sip_domain_avp", "sip_match_dom")
```
### `client_tls_domain_avp` (string)

Name of the AVP used for enforcing the selection of a specific TLS client domain. Setting this AVP to the name of a TLS client domain will result in using that specific domain regardless of the standard matching mechanism.

*Default value is No default value..*

**Notes:** If there is already an existing TLS connection to the remote target, it will be reused and setting this AVP has no effect. You can force a particular domain to be used just for a particular branch by setting the $bavp variable with the same name. When both $bavp and $avp variables are set, the first one takes precedence.

**Example.** tls_match_dom.

```opensips
modparam("tls_mgm", "client_tls_domain_avp", "tls_match_dom")
```
### `crl_check_all` (string)

Setting this parameter with a non-zero integer value enables CRL checking for the entire certificate chain. By default, only the leaf certificate in the certificate chain is checked.

*Default value is 0.*

**Example.** [dom]1.

```opensips
modparam("tls_mgm", "crl_check_all", "[dom]1")
```
### `crl_check_all_col` (string)

Sets the crl_check_all column name.

*Default value is crl_check_all.*

**Example.** crl_check.

```opensips
modparam("tls_mgm", "crl_check_all_col", "crl_check")
```
### `crl_dir` (string)

Directory storing certificate revocation lists (CRLs). The domain part represents the name of the TLS domain.

*Default value is none.*

**Example.** [dom]/mycerts/crls.

```opensips
modparam("tls_mgm", "crl_dir", "[dom]/mycerts/crls")
```
### `crl_dir_col` (string)

Sets the crl directory column name.

*Default value is crl_dir.*

**Example.** crl_dir.

```opensips
modparam("tls_mgm", "crl_dir_col", "crl_dir")
```
### `db_table` (string)

Sets the database table name.

*Default value is tls_mgm.*

**Example.** tls_mgm.

```opensips
modparam("tls_mgm", "db_table", "tls_mgm")
```
### `db_url` (string)

The database url. It cannot be NULL.

**Notes:** You cannot use the "tls_domain=_dom_name_" URL parameter for a TLS connection to the database for the tls_mgm module itself.

**Example.** mysql://root:admin@localhost/opensips.

```opensips
modparam("tls_mgm", "db_url", "mysql://root:admin@localhost/opensips")
```
### `dh_params` (string)

You can specify a file which contains Diffie-Hellman parameters as a PEM-file. This is needed if you would like to specify ciphers including Diffie-Hellman mode. The domain part represents the name of the TLS domain.

*Default value is not set.*

**Example.** [dom]/etc/pki/CA/dh1024.pem.

```opensips
modparam("tls_mgm", "dh_params", "[dom]/etc/pki/CA/dh1024.pem")
```
### `dh_params_col` (string)

Sets the Diffie-Hellmann parameters column name.

*Default value is dh_params.*

**Example.** dh_parms.

```opensips
modparam("tls_mgm", "dh_params_col", "dh_parms")
```
### `domain_col` (string)

Sets the name for the TLS domain column.

*Default value is domain.*

**Example.** tls_domain.

```opensips
modparam("tls_mgm", "domain_col", "tls_domain")
```
### `ec_curve` (string)

You can specify an elliptic curve which should be used for ciphers which demand an elliptic curve. The domain part represents the name of the TLS domain. It's usable only if TLS v1.1/1.2 support was compiled. A list of curves which can be used you can get by openssl ecparam -list_curves

*Default value is not set.*
### `ec_curve_col` (string)

Sets the ec_curve column name.

*Default value is ec_curve.*

**Example.** ec_curve.

```opensips
modparam("tls_mgm", "ec_curve_col", "ec_curve")
```
### `listen` (string)

Not specific to TLS. Allows to specify the protocol (udp, tcp, tls), the IP address and the port where the listening server will be.

**Example.** Set the `listen` parameter.

```opensips
...
socket= tls:1.2.3.4:5061
...
```
### `match_ip_address` (string)

The IP addresses and ports used to match a TLS connection with a virtual TLS domain. For TLS server domains, these values will be mathced against the socket on which the connection is received. For TLS client domains, the values will be compared with the destination socket of the connection. The parameter accepts a list of values, and the special value "*" means: match any address.

*Default value is *.*

**Example.** [dom1]10.0.0.10:5061, 10.0.0.11:5061.

```opensips
modparam("tls_mgm", "match_ip_address", "[dom1]10.0.0.10:5061, 10.0.0.11:5061")
```
### `match_ip_address_col` (string)

Sets the IP address matching column name.

*Default value is match_ip_address.*

**Example.** addr.

```opensips
modparam("tls_mgm", "match_ip_address_col", "addr")
```
### `match_sip_domain` (string)

The SIP domains used to match a TLS connection with a virtual TLS domain. For TLS server domains, these values will be matched against the hostname provided in the TLS Servername extension(SNI). For TLS client domains, the values will be compared with the value of the client_sip_domain_avp AVP. The parameter accepts a list of FQDNs or the special values: * - match any sip domain( including no SNI provided, in case of TLS server domains); none - match the TLS domain when there is no SNI provided (make sense only for TLS server domains). Note that if a SNI is provided, but does not match any other SIP domain filter, the connection will be rejected. The FQDNs can be specified as with Unix shell-style wildcards. If there are multiple potential matches, the most specific domain will be selected(eg. a request for "foo.bar.com" is matched with the domain specified with "foo.bar.com" versus the one with "*.bar.com").

*Default value is *.*

**Possible values:**

- *
- none
- FQDNs with wildcards

**Example.** [dom1]foo.com, bar.com, *.baz.com.

```opensips
modparam("tls_mgm", "match_sip_domain", "[dom1]foo.com, bar.com, *.baz.com")
```
### `match_sip_domain_col` (string)

Sets the SIP domain matching column name.

*Default value is match_sip_domain.*

**Example.** addr.

```opensips
modparam("tls_mgm", "match_sip_domain_col", "addr")
```
### `private_key` (string)

Private key of the above certificate. I must be kept in a safe place with tight permissions! The domain part represents the name of the TLS omain.

*Default value is CFG_DIR/tls/ckey.pem.*

**Example.** Set the `private_key` parameter.

```opensips
...
modparam("tls_mgm", "private_key", "[dom]/mycerts/private/prik.pem")
...
```
### `private_key_col` (string)

Sets the private key column name.

*Default value is private_key.*

**Example.** pk.

```opensips
modparam("tls_mgm", "private_key_col", "pk")
```
### `require_cert` (string)

Activates SSL_VERIFY_FAIL_IF_NO_PEER_CERT in the ssl_context. For a detailed explanation, check the openssl documentation. The domain part represents the name of the TLS domain.

*Default value is 1.*

**Notes:** This parameter only makes sense for server domains and if the verify_cert parameter is also set.

**Example.** [dom]0.

```opensips
modparam("tls_mgm", "require_cert", "[dom]0")
```
### `require_cert_col` (string)

Sets the require certificate column name.

*Default value is require_cert.*

**Example.** req.

```opensips
modparam("tls_mgm", "require_cert_col", "req")
```
### `server_domain` (string)

You can define virtual TLS domains through these parameters. The value of these parameters represents the virtual tls domain's name which is only used for identification.

**Notes:** For the domains defined in the DB, the certificate, private key, list of trusted CAs and Diffie-Hellman parameters are provisioned as BLOB values while for script defined domains you must provide path to files.

**Example.** dom1.

```opensips
...
socket=tls:10.0.0.10:5061
...
# set the TLS client domain AVP
modparam("tls_mgm", "client_sip_domain_avp", "tls_sip_dom")
...

# 'atlanta' server domain
modparam("tls_mgm", "server_domain", "dom1")
modparam("tls_mgm", "match_ip_address", "[dom1]10.0.0.10:5061")
modparam("tls_mgm", "match_sip_domain", "[dom1]atlanta.com")

modparam("tls_mgm", "certificate", "[dom1]/certs/atlanta.com/cert.pem")
modparam("tls_mgm", "private_key", "[dom1]/certs/atlanta.com/privkey.pem")
modparam("tls_mgm", "ca_list", "[dom1]/certs/wellknownCAs")
modparam("tls_mgm", "tls_method", "[dom1]tlsv1")
modparam("tls_mgm", "verify_cert", "[dom1]1")
modparam("tls_mgm", "require_cert", "[dom1]1")

#'biloxi' server domain
modparam("tls_mgm", "server_domain", "dom2")
modparam("tls_mgm", "match_ip_address", "[dom2]10.0.0.10:5061")
modparam("tls_mgm", "match_sip_domain", "[dom2]biloxi.com")

modparam("tls_mgm", "certificate", "[dom2]/certs/biloxi.com/cert.pem")
modparam("tls_mgm", "private_key", "[dom2]/certs/biloxi.com/privkey.pem")
modparam("tls_mgm", "ca_list", "[dom2]/certs/wellknownCAs")
modparam("tls_mgm", "tls_method", "[dom2]tlsv1")
modparam("tls_mgm", "verify_cert", "[dom2]1")
modparam("tls_mgm", "require_cert", "[dom2]1")

# generic TLS server domain, if the client does not provide SNI
modparam("tls_mgm", "server_domain", "dom3")
modparam("tls_mgm", "match_ip_address", "[dom3]10.0.0.10:5061")
modparam("tls_mgm", "match_sip_domain", "[dom3]none")

modparam("tls_mgm", "certificate", "[dom3]/certs/generic/cert.pem")
modparam("tls_mgm", "private_key", "[dom3]/certs/generic/privkey.pem")
modparam("tls_mgm", "ca_list", "[dom3]/certs/wellknownCAs")
modparam("tls_mgm", "tls_method", "[dom3]tlsv1")
modparam("tls_mgm", "verify_cert", "[dom3]1")
modparam("tls_mgm", "require_cert", "[dom3]1")

# 'atlanta' client domain
modparam("tls_mgm", "client_domain", "dom4")
modparam("tls_mgm", "match_ip_address", "[dom4]*")
modparam("tls_mgm", "match_sip_domain", "[dom4]atlanta.com")

modparam("tls_mgm", "certificate", "[dom4]/certs/atlanta.com/cert.pem")
modparam("tls_mgm", "private_key", "[dom4]/certs/atlanta.com/privkey.pem")
modparam("tls_mgm", "ca_list", "[dom4]/certs/wellknownCAs")
modparam("tls_mgm", "tls_method", "[dom4]tlsv1")
modparam("tls_mgm", "verify_cert", "[dom4]1")
modparam("tls_mgm", "require_cert", "[dom4]1")

# 'biloxi' client domain
modparam("tls_mgm", "client_domain", "dom5")
modparam("tls_mgm", "match_ip_address", "[dom5]*")
modparam("tls_mgm", "match_sip_domain", "[dom5]biloxi.com")

modparam("tls_mgm", "certificate", "[dom5]/certs/biloxi.com/cert.pem")
modparam("tls_mgm", "private_key", "[dom5]/certs/biloxi.com/privkey.pem")
modparam("tls_mgm", "ca_list", "[dom5]/certs/wellknownCAs")
modparam("tls_mgm", "tls_method", "[dom5]tlsv1")
modparam("tls_mgm", "verify_cert", "[dom5]1")
modparam("tls_mgm", "require_cert", "[dom5]1")

# TLS client domain for GW provider
modparam("tls_mgm", "client_domain", "dom6")
modparam("tls_mgm", "match_ip_address", "[dom6]1.2.3.4:6677")
modparam("tls_mgm", "match_sip_domain", "[dom6]*")

modparam("tls_mgm", "certificate", "[dom6]/certs/gw/cert.pem")
modparam("tls_mgm", "private_key", "[dom6]/certs/gw/privkey.pem")
modparam("tls_mgm", "ca_list", "[dom6]/certs/wellknownCAs")
modparam("tls_mgm", "tls_method", "[dom6]tlsv1")
modparam("tls_mgm", "verify_cert", "[dom6]0")

...
route{
...
    # we match the TLS client domain using the SIP domain in the RURI
    $avp(tls_sip_dom) = $rd;
    t_relay();
    exit;
...
    # calls to the PSTN GW, will match the correct TLS domain by IP
    t_relay("tls:1.2.3.4:6677");
    exit;
...

```
### `tls_library` (string)

Selects which TLS library to use.

*Default value is auto.*

**Possible values:**

- auto
- none
- openssl
- wolfssl

**Example.** Set the `tls_library` parameter.

```opensips
...
modparam("tls_mgm", "tls_library", "none")
...
```
### `tls_method` (string)

Sets the TLS protocol. The domain part represents the name of the TLS domain. The supported TLS methods are: TLSv1_3 - means OpenSIPS will accept only TLSv1.3 connections. This version is only available starting with OpenSSL 1.1.1 version. TLSv1_2 - means OpenSIPS will accept only TLSv1.2 connections (rfc3261 conformant). TLSv1 - means OpenSIPS will accept only TLSv1 connections (rfc3261 conformant). SSLv23 - means OpenSIPS will accept any of the above methods, but the initial SSL hello must be v2 (in the initial hello all the supported protocols are advertised enabling switching to a higher and more secure version). The initial v2 hello means it will not accept connections from SSLv3 or TLSv1 only clients.

*Default value is SSLv23.*

**Possible values:**

- TLSv1_3
- TLSv1_2
- TLSv1
- SSLv23

**Notes:** If you are using an OpenSSL library newer than 1.1.0, you can also specify a range of accepted TLS versions as [VLOW]-[VHIGH]. If VLOW is not specified it will use the minimum supported protocol version and if VHIGH is not specified it will use the maximum supported protocol version. This means that using a range where both the low and high values are missing, will accept all the supported methods, but unlike SSLv23 will not require the initial hello to be SSLv2. For extended compatibility with older system, best use SSLv23. If you want RFC3261 conformance and all your clients support TLSv1 (or you are planning to use encrypted "tunnels" only between different OpenSIPS proxies) use TLSv1. If you want to support older clients use SSLv23 (in fact most of the applications with SSL support use the SSLv23 method).

**Example.** Set the `tls_method` parameter.

```opensips
...
modparam("tls_mgm", "tls_method", "[dom]TLSv1")
...
```
### `tls_method_col` (string)

Sets the method column name.

*Default value is method.*

**Example.** method.

```opensips
modparam("tls_mgm", "tls_method_col", "method")
```
### `verify_cert` (string)

Activates SSL_VERIFY_PEER in the ssl_context. For a detailed explanation, check the openssl documentation. The domain part represents the name of the TLS domain.

*Default value is 1.*

**Example.** [dom]0.

```opensips
modparam("tls_mgm", "verify_cert", "[dom]0")
```
### `verify_cert_col` (string)

Sets the verrify certificate column name.

*Default value is verify_cert.*

**Example.** verify_cert.

```opensips
modparam("tls_mgm", "verify_cert_col", "verify_cert")
```

## Exported Functions

### `is_peer_verified()`

Returns 1 if the message is received via TLS and the peer was verified during TLS connection handshake, otherwise it returns -1

**Return codes:**

- `1` — message is received via TLS and the peer was verified during TLS connection handshake
- `-1` — otherwise

**Usable from:** REQUEST_ROUTE

**Example.** `is_peer_verified` usage.

```opensips
if (is_peer_verified()) {
        xlog("L_INFO","request from verified TLS peer\n");
} else {
        xlog("L_INFO","request not verified\n");
}
```

## Exported Pseudo-Variables

### `$tls_[peer|my]_[subject|issuer]`

ASCII dump of the fields in the issuer/subject section of the certificate.

- **Type:** string
- **Read/write:** read-only
- **Scope:** 
### `$tls_[peer|my]_[subject|issuer]_cn`

commonName in the issuer/subject section of the certificate.

- **Type:** string
- **Read/write:** read-only
- **Scope:** 
### `$tls_[peer|my]_[subject|issuer]_country`

countryName in the issuer/subject section of the certificate.

- **Type:** string
- **Read/write:** read-only
- **Scope:** 
### `$tls_[peer|my]_[subject|issuer]_locality`

localityName in the issuer/subject section of the certificate.

- **Type:** string
- **Read/write:** read-only
- **Scope:** 
### `$tls_[peer|my]_[subject|issuer]_organization`

organizationName in the issuer/subject section of the certificate.

- **Type:** string
- **Read/write:** read-only
- **Scope:** 
### `$tls_[peer|my]_[subject|issuer]_state`

stateOrProvinceName in the issuer/subject section of the certificate.

- **Type:** string
- **Read/write:** read-only
- **Scope:** 
### `$tls_[peer|my]_[subject|issuer]_unit`

organizationalUnitName in the issuer/subject section of the certificate.

- **Type:** string
- **Read/write:** read-only
- **Scope:** 
### `$tls_[peer|my]_san_email`

email address in the “subject alternative name” extension.

- **Type:** string
- **Read/write:** read-only
- **Scope:** 
### `$tls_[peer|my]_san_hostname`

hostname (DNS) in the “subject alternative name” extension.

- **Type:** string
- **Read/write:** read-only
- **Scope:** 
### `$tls_[peer|my]_san_ip`

ip address in the “subject alternative name” extension.

- **Type:** string
- **Read/write:** read-only
- **Scope:** 
### `$tls_[peer|my]_san_uri`

URI in the “subject alternative name” extension.

- **Type:** string
- **Read/write:** read-only
- **Scope:** 
### `$tls_[peer|my]_serial`

the serial number of the certificate.

- **Type:** string, integer
- **Read/write:** read-only
- **Scope:** 
### `$tls_[peer|my]_version`

the version of the certificate.

- **Type:** string
- **Read/write:** read-only
- **Scope:** 
### `$tls_cipher_bits`

the number of cipher bits which are used on the TLS connection from which the message was received.

- **Type:** string, integer
- **Read/write:** read-only
- **Scope:** 
### `$tls_cipher_info`

the TLS/SSL cipher which is used on the TLS connection from which the message was received.

- **Type:** string
- **Read/write:** read-only
- **Scope:** 
### `$tls_description`

the TLS/SSL description of the TLS connection from which the message was received.

- **Type:** string
- **Read/write:** read-only
- **Scope:** 
### `$tls_peer_expired`

Returns 1 if the peer's certificate is expired. Otherwise it returns 0.

- **Type:** string, integer
- **Read/write:** read-only
- **Scope:** 

**Possible values:**

- 0
- 1
### `$tls_peer_notAfter`

Returns the notAfter validity date of the peer's certificate.

- **Type:** string
- **Read/write:** read-only
- **Scope:** 
### `$tls_peer_notBefore`

Returns the notBefore validity date of the peer's certificate.

- **Type:** string
- **Read/write:** read-only
- **Scope:** 
### `$tls_peer_revoked`

Returns 1 if the peer's certificate was revoked. Otherwise it returns 0.

- **Type:** string, integer
- **Read/write:** read-only
- **Scope:** 

**Possible values:**

- 0
- 1
### `$tls_peer_selfsigned`

Returns 1 if the peer's certificate is selfsigned. Otherwise it returns 0.

- **Type:** string, integer
- **Read/write:** read-only
- **Scope:** 

**Possible values:**

- 0
- 1
### `$tls_peer_verified`

Returns 1 if the peer's certificate was successful verified. Otherwise it returns 0.

- **Type:** string, integer
- **Read/write:** read-only
- **Scope:** 

**Possible values:**

- 0
- 1
### `$tls_version`

the TLS/SSL version which is used on the TLS connection from which the message was received.

- **Type:** string
- **Read/write:** read-only
- **Scope:** 

## Exported MI Functions

### `tls_list`

List all domains information.

### `tls_reload`

Reloads the TLS domains information from the database. The previous DB defined domains are discarded but the script defined domains are preserved.

## Configuration Examples

### Set `listen` variable

Not specific to TLS. Allows to specify the protocol (udp, tcp, tls), the IP address and the port where the listening server will be.

```opensips
...
socket= tls:1.2.3.4:5061
...
```
### Set `tls_library` variable

Selects which TLS library to use. Possible values are:
* _auto_ - auto-detect which TLS library module (_tls_openssl_ or _tls_wolfssl_) was loaded. OpenSIPS will not start if no module, or both modules are found.
* _none_ - do not use any TLS library; this is useful when the _tls_mgm_ module is required only for the management of TLS certificates and parameters by modules like _db_mysql_, _rabbitmq_ etc. ( and not for TLS operations by transport modules like _proto_tls_ etc.)
* _openssl_ - use the _openSSL_ library through the _tls_openssl_ module.
* _wolfssl_ - use the _wolfSSL_ library through the _tls_wolfssl_ module.

Default value is _auto_.

```opensips
...
modparam("tls_mgm", "tls_library", "none")
...
```
### Set `tls_method` variable

Sets the TLS protocol. The domain part represents the name of the TLS domain. The supported TLS methods are:
* _TLSv1_3_ - means OpenSIPS will accept only TLSv1.3 connections. This version is only available starting with OpenSSL 1.1.1 version.
* _TLSv1_2_ - means OpenSIPS will accept only TLSv1.2 connections (rfc3261 conformant).
* _TLSv1_ - means OpenSIPS will accept only TLSv1 connections (rfc3261 conformant).
* _SSLv23_ - means OpenSIPS will accept any of the above methods, but the initial SSL hello must be v2 (in the initial hello all the supported protocols are advertised enabling switching to a higher and more secure version). The initial v2 hello means it will not accept connections from SSLv3 or TLSv1 only clients.

_If you are using an OpenSSL library newer than 1.1.0, you can also specify a range of accepted TLS versions as [VLOW]-[VHIGH]. If VLOW is not specified it will use the minimum supported protocol version and if VHIGH is not specified it will use the maximum supported protocol version. This means that using a range where both the low and high values are missing, will accept all the supported methods, but unlike SSLv23 will not require the initial hello to be SSLv2._

_Default value is SSLv23._

```opensips
...
modparam("tls_mgm", "tls_method", "[dom]TLSv1")
...
```
### Set `tls_method` range variable

Sets the TLS protocol range.

```opensips
...
modparam("tls_mgm", "tls_method", "[dom]TLSv1-TLSv1_3")  # between v1 and v1.3
modparam("tls_mgm", "tls_method", "[dom]TLSv1-")         # v1 or higher
modparam("tls_mgm", "tls_method", "[dom]-TLSv1_2")       # up to v1.2
modparam("tls_mgm", "tls_method", "[dom]-")              # all supported
...
```
### Set `certificate` variable

Public certificate file for OpenSIPS. It will be used as server-side certificate for incoming TLS connections, and as a client-side certificate for outgoing TLS connections. The domain part represents the name of the TLS domain.

_Default value is "CFG_DIR/tls/cert.pem"._

```opensips
...
modparam("tls_mgm", "certificate", "[dom]/mycerts/certs/opensips_server_cert.pem")
...
```
### Set `private_key` variable

Private key of the above certificate. I must be kept in a safe place with tight permissions! The domain part represents the name of the TLS omain.

_Default value is "CFG_DIR/tls/ckey.pem"._

```opensips
...
modparam("tls_mgm", "private_key", "[dom]/mycerts/private/prik.pem")
...
```
### Set `ca_list` variable

List of trusted CAs. The file contains the certificates accepted, one after the other. It MUST be a file, not a folder. The domain part represents the name of the TLS domain.

_Default value is ""._

```opensips
...
modparam("tls_mgm", "ca_list", "[dom]/mycerts/certs/ca_list.pem")
...
```
### Set `ca_dir` variable

Directory storing trusted CAs. The certificates in the directory must be in hashed form, as described in the [_openssl documentation_](https://www.openssl.org/docs/manmaster/man3/X509_LOOKUP_hash_dir.html) for the _Hashed Directory Method_. The domain part represents the name of the TLS domain.

_Default value is "/etc/pki/CA/"._

```opensips
...
modparam("tls_mgm", "ca_dir", "[dom]/mycerts/certs")
...
```
### Set `crl_dir` variable

Directory storing certificate revocation lists (CRLs). The domain part represents the name of the TLS domain.

_If this parameter is not set, no CRLs will be used._

```opensips
...
modparam("tls_mgm", "crl_dir", "[dom]/mycerts/crls")
...
```
### Set `crl_check_all` variable

Setting this parameter with a non-zero integer value enables CRL checking for the entire certificate chain.

_By default, only the leaf certificate in the certificate chain is checked._

```opensips
...
modparam("tls_mgm", "crl_check_all", "[dom]1")
...
```
### Set `ciphers_list` variable

You can specify the list of algorithms for authentication and encryption that you allow. The domain part represents the name of the TLS domain. To obtain a list of ciphers and then choose, use the openssl application:

* openssl ciphers 'ALL:eNULL:!LOW:!EXPORT'

### Warning

Do not use the NULL algorithms (no encryption) ... only for testing!!!

_It defaults to the OpenSSL default ciphers._

```opensips
...
modparam("tls_mgm", "ciphers_list", "[dom]NULL")
...
```
### Set `dh_params` variable

You can specify a file which contains Diffie-Hellman parameters as a PEM-file. This is needed if you would like to specify ciphers including Diffie-Hellman mode. The domain part represents the name of the TLS domain.

_It defaults to not set a dh param file._

```opensips
...
modparam("tls_mgm", "dh_params", "[dom]/etc/pki/CA/dh1024.pem")
...
```
### Set `verify_cert` variable

Activates SSL_VERIFY_PEER in the ssl_context. For a detailed explanation, check the _openssl_ documentation.

The domain part represents the name of the TLS domain.

Default value is _1_.

```opensips
...
modparam("tls_mgm", "verify_cert", "[dom]0")
...
```
### Set `require_cert` variable

Activates SSL_VERIFY_FAIL_IF_NO_PEER_CERT in the ssl_context. For a detailed explanation, check the _openssl_ documentation. This parameter only makes sense for server domains and if the [verify_cert](#param_verify_cert "1.9.13.verify_cert ([domain](string)") parameter is also set.

The domain part represents the name of the TLS domain.

Default value is _1_.

```opensips
...
modparam("tls_mgm", "require_cert", "[dom]0")
...
```
### Set `client_tls_domain_avp` variable

Name of the AVP used for enforcing the selection of a specific TLS client domain. Setting this AVP to the name of a TLS client domain will result in using that specific domain regardless of the standard matching mechanism.

Note: If there is already an existing TLS connection to the remote target, it will be reused and setting this AVP has no effect.

Note: You can force a particular domain to be used just for a particular branch by setting the _$bavp_ variable with the same name. When both _$bavp_ and _$avp_ variables are set, the first one takes precedence.

_No default value._

```opensips
...
modparam("tls_mgm", "client_tls_domain_avp", "tls_match_dom")
...
```
### Set `client_sip_domain_avp` variable

Name of the AVP that sets the SIP domain used in the TLS client domain matching process.

Note: If there is already an existing TLS connection to the remote target, it will be reused and setting this AVP has no effect.

Note: You can force a particular SIP domain to be used just for a particular branch by setting the _$bavp_ variable with the same name. When both _$bavp_ and _$avp_ variables are set, the first one takes precedence.

For the AVP usage example, refer to [Section1.9.36, “`server_domain, client_domain` (string)”](#domains-param "1.9.36.server_domain, client_domain (string)").

_No default value._

```opensips
...
modparam("tls_mgm", "client_sip_domain_avp", "sip_match_dom")
...
```
### Usage of `db_url` block

The database url. It cannot be NULL.

You cannot use the "tls_domain=_dom_name_" URL parameter for a TLS connection to the database for the tls_mgm module itself.

```opensips
modparam("tls_mgm", "db_url", "mysql://root:admin@localhost/opensips")
```
### Usage of `db_table` block

Sets the database table name.

Default value is "tls_mgm".

```opensips
modparam("tls_mgm", "db_table", "tls_mgm")
```
### Usage of `domain_col` block

Sets the name for the TLS domain column.

Default value is "domain".

```opensips
modparam("tls_mgm", "domain_col", "tls_domain")
```
### Usage of `match_ip_address_col` block

Sets the IP address matching column name.

Default value is "match_ip_address".

```opensips
modparam("tls_mgm", "match_ip_address_col", "addr")
```
### Usage of `match_sip_domain_col` block

Sets the SIP domain matching column name.

Default value is "match_sip_domain".

```opensips
modparam("tls_mgm", "match_sip_domain_col", "addr")
```
### Usage of `tls_method_col` block

Sets the method column name.

Default value is "method".

```opensips
modparam("tls_mgm", "tls_method_col", "method")
```
### Usage of `vertify_cert_col` block

Sets the verrify certificate column name.

Default value is "verify_cert".

```opensips
modparam("tls_mgm", "verify_cert_col", "verify_cert")
```
### Usage of `require_cert_col` block

Sets the require certificate column name.

Default value is "require_cert".

```opensips
modparam("tls_mgm", "require_cert_col", "req")
```
### Usage of `certificate_col` block

Sets the certificate column name.

Default value is "certificate".

```opensips
modparam("tls_mgm", "certificate_col", "certificate")
```
### Usage of `private_key_col` block

Sets the private key column name.

Default value is "private_key".

```opensips
modparam("tls_mgm", "private_key_col", "pk")
```
### Usage of `crl_check_all` block

Sets the crl_check_all column name.

Default value is "crl_check_all".

```opensips
modparam("tls_mgm", "crl_check_all_col", "crl_check")
```
### Usage of `crl_dir_col` block

Sets the crl directory column name.

Default value is "crl_dir".

```opensips
modparam("tls_mgm", "crl_dir_col", "crl_dir")
```
### Usage of `ca_list_col` block

Sets the CA list column name.

Default value is "ca_list".

```opensips
modparam("tls_mgm", "ca_list_col", "ca_list")
```
### Usage of `ca_dir_col` block

Sets the CA directory column name.

Default value is "ca_dir".

```opensips
modparam("tls_mgm", "ca_dir_col", "ca_dir")
```
### Usage of `cipher_list_col` block

Sets the cipher list column name.

Default value is "cipher_list".

```opensips
modparam("tls_mgm", "cipher_list_col", "cipher_list")
```
### Usage of `dh_params_col` block

Sets the Diffie-Hellmann parameters column name.

Default value is "dh_params".

```opensips
modparam("tls_mgm", "dh_params_col", "dh_parms")
```
### Usage of `ec_curve_col` block

Sets the ec_curve column name.

Default value is "ec_curve".

```opensips
modparam("tls_mgm", "ec_curve_col", "ec_curve")
```
### Set `match_ip_address` variable

The IP addresses and ports used to match a TLS connection with a virtual TLS domain. For TLS server domains, these values will be mathced against the socket on which the connection is received. For TLS client domains, the values will be compared with the destination socket of the connection.

The parameter accepts a list of values, and the special value "*" means: match any address.

_Default value is "*" (match any address)._

```opensips
...
modparam("tls_mgm", "match_ip_address", "[dom1]10.0.0.10:5061, 10.0.0.11:5061")
...
```
### Set `match_sip_domain` variable

The SIP domains used to match a TLS connection with a virtual TLS domain. For TLS server domains, these values will be matched against the hostname provided in the TLS Servername extension(SNI). For TLS client domains, the values will be compared with the value of the [client_sip_domain_avp](#param_client_sip_domain_avp "1.9.16.client_sip_domain_avp (string)") AVP.

The parameter accepts a list of FQDNs or the special values:

* _*_ - match any sip domain( including no SNI provided, in case of TLS server domains);
* _none_ - match the TLS domain when there is no SNI provided (make sense only for TLS server domains). Note that if a SNI is provided, but does not match any other SIP domain filter, the connection will be rejected.

The FQDNs can be specified as with Unix shell-style wildcards. If there are multiple potential matches, the most specific domain will be selected(eg. a request for "foo.bar.com" is matched with the domain specified with "foo.bar.com" versus the one with "*.bar.com").

_Default value is "*" (match any sip domain)._

```opensips
...
modparam("tls_mgm", "match_sip_domain", "[dom1]foo.com, bar.com, *.baz.com")
modparam("tls_mgm", "match_sip_domain", "[default_dom]*")
...
```
### Usage of `tls_client_domain` and `tls_server_domain` block

You can define virtual TLS domains through these parameters.

The value of these parameters represents the virtual tls domain's name which is only used for identification.

```opensips
...
socket=tls:10.0.0.10:5061
...
# set the TLS client domain AVP
modparam("tls_mgm", "client_sip_domain_avp", "tls_sip_dom")
...

# 'atlanta' server domain
modparam("tls_mgm", "server_domain", "dom1")
modparam("tls_mgm", "match_ip_address", "[dom1]10.0.0.10:5061")
modparam("tls_mgm", "match_sip_domain", "[dom1]atlanta.com")

modparam("tls_mgm", "certificate", "[dom1]/certs/atlanta.com/cert.pem")
modparam("tls_mgm", "private_key", "[dom1]/certs/atlanta.com/privkey.pem")
modparam("tls_mgm", "ca_list", "[dom1]/certs/wellknownCAs")
modparam("tls_mgm", "tls_method", "[dom1]tlsv1")
modparam("tls_mgm", "verify_cert", "[dom1]1")
modparam("tls_mgm", "require_cert", "[dom1]1")

#'biloxi' server domain
modparam("tls_mgm", "server_domain", "dom2")
modparam("tls_mgm", "match_ip_address", "[dom2]10.0.0.10:5061")
modparam("tls_mgm", "match_sip_domain", "[dom2]biloxi.com")

modparam("tls_mgm", "certificate", "[dom2]/certs/biloxi.com/cert.pem")
modparam("tls_mgm", "private_key", "[dom2]/certs/biloxi.com/privkey.pem")
modparam("tls_mgm", "ca_list", "[dom2]/certs/wellknownCAs")
modparam("tls_mgm", "tls_method", "[dom2]tlsv1")
modparam("tls_mgm", "verify_cert", "[dom2]1")
modparam("tls_mgm", "require_cert", "[dom2]1")

# generic TLS server domain, if the client does not provide SNI
modparam("tls_mgm", "server_domain", "dom3")
modparam("tls_mgm", "match_ip_address", "[dom3]10.0.0.10:5061")
modparam("tls_mgm", "match_sip_domain", "[dom3]none")

modparam("tls_mgm", "certificate", "[dom3]/certs/generic/cert.pem")
modparam("tls_mgm", "private_key", "[dom3]/certs/generic/privkey.pem")
modparam("tls_mgm", "ca_list", "[dom3]/certs/wellknownCAs")
modparam("tls_mgm", "tls_method", "[dom3]tlsv1")
modparam("tls_mgm", "verify_cert", "[dom3]1")
modparam("tls_mgm", "require_cert", "[dom3]1")

# 'atlanta' client domain
modparam("tls_mgm", "client_domain", "dom4")
modparam("tls_mgm", "match_ip_address", "[dom4]*")
modparam("tls_mgm", "match_sip_domain", "[dom4]atlanta.com")

modparam("tls_mgm", "certificate", "[dom4]/certs/atlanta.com/cert.pem")
modparam("tls_mgm", "private_key", "[dom4]/certs/atlanta.com/privkey.pem")
modparam("tls_mgm", "ca_list", "[dom4]/certs/wellknownCAs")
modparam("tls_mgm", "tls_method", "[dom4]tlsv1")
modparam("tls_mgm", "verify_cert", "[dom4]1")
modparam("tls_mgm", "require_cert", "[dom4]1")

# 'biloxi' client domain
modparam("tls_mgm", "client_domain", "dom5")
modparam("tls_mgm", "match_ip_address", "[dom5]*")
modparam("tls_mgm", "match_sip_domain", "[dom5]biloxi.com")

modparam("tls_mgm", "certificate", "[dom5]/certs/biloxi.com/cert.pem")
modparam("tls_mgm", "private_key", "[dom5]/certs/biloxi.com/privkey.pem")
modparam("tls_mgm", "ca_list", "[dom5]/certs/wellknownCAs")
modparam("tls_mgm", "tls_method", "[dom5]tlsv1")
modparam("tls_mgm", "verify_cert", "[dom5]1")
modparam("tls_mgm", "require_cert", "[dom5]1")

# TLS client domain for GW provider
modparam("tls_mgm", "client_domain", "dom6")
modparam("tls_mgm", "match_ip_address", "[dom6]1.2.3.4:6677")
modparam("tls_mgm", "match_sip_domain", "[dom6]*")

modparam("tls_mgm", "certificate", "[dom6]/certs/gw/cert.pem")
modparam("tls_mgm", "private_key", "[dom6]/certs/gw/privkey.pem")
modparam("tls_mgm", "ca_list", "[dom6]/certs/wellknownCAs")
modparam("tls_mgm", "tls_method", "[dom6]tlsv1")
modparam("tls_mgm", "verify_cert", "[dom6]0")

...
route{
...
    # we match the TLS client domain using the SIP domain in the RURI
    $avp(tls_sip_dom) = $rd;
    t_relay();
    exit;
...
    # calls to the PSTN GW, will match the correct TLS domain by IP
    t_relay("tls:1.2.3.4:6677");
    exit;
...

```
### Script with TLS support

IMPORTANT: The TLS support is based on TCP, and for allowing OpenSIPS to use TCP, it must be started in multi-process mode. So, there is a must to have the "fork" parameter set to "yes":

NOTE: Since the TLS engine is quite memory consuming, increase the used memory by the run time parameter "-m" (see OpenSIPS -h for more details).
* fork = yes

```opensips
  # ----------- global configuration parameters ------------------------
  log_level=3
  stderror_enabled=no
  syslog_enabled=yes

  check_via=no
  dns=no
  rev_dns=no
  socket=udp:your_serv_IP:5060
  socket=tls:your_serv_IP:5061
  udp_workers=4

  # ------------------ module loading ----------------------------------

  loadmodule "proto_tls.so"
  loadmodule "proto_udp.so"

  #TLS specific settings
  loadmodule "tls_mgm.so"

  modparam("tls_mgm", "certificate", "/path/opensipsX_cert.pem")
  modparam("tls_mgm", "private_key", "/path/privkey.pem")
  modparam("tls_mgm", "ca_list", "/path/calist.pem")
  modparam("tls_mgm", "ca_list", "/path/calist.pem")
  modparam("tls_mgm", "require_cert", "1")
  modparam("tls_mgm", "verify_cert", "1")

  alias=_DNS_ALIAS_

loadmodule "sl.so"
  loadmodule "rr.so"
  loadmodule "maxfwd.so"
  loadmodule "mysql.so"
  loadmodule "usrloc.so"
  loadmodule "registrar.so"
  loadmodule "tm.so"
  loadmodule "auth.so"
  loadmodule "auth_db.so"
  loadmodule "textops.so"
  loadmodule "sipmsgops.so"
  loadmodule "signaling.so"
  loadmodule "uri_db.so"

  # ----------------- setting module-specific parameters ---------------

  # -- auth_db params --
  modparam("auth_db", "db_url", "sql_url")
  modparam("auth_db", "password_column", "password")
  modparam("auth_db", "calculate_ha1", 1)

  # -- registrar params --
  # no multiple registrations
  modparam("registrar", "append_branches", 0)

  # -------------------------  request routing logic -------------------

  # main routing logic

  route{

  # initial sanity checks
  if (!mf_process_maxfwd_header("10")) {
      send_reply(483,"Too Many Hops");
      exit;
  };

  # if somene claims to belong to our domain in From,
  # challenge him (skip REGISTERs -- we will chalenge them later)
  if (is_myself("$fd")) {
      setflag(1);
      if ( is_method("INVITE|SUBSCRIBE|MESSAGE")
      && !(is_myself("$si")) ) {
          if  (!(proxy_authorize( "domA.net", "subscriber" ))) {
              proxy_challenge("domA.net","0"/*no-qop*/);
              exit;
          };
          if ($au!=$fU) {
              xlog("FROM hdr Cheating attempt in INVITE\n");
              send_reply(403,
                  "That is ugly -- use From=id next time (OB)");
              exit;
          };
      }; # non-REGISTER from other domain
  } else if ( is_method("INVITE") && !is_myself("$rd") ) {
      send_reply(403, "No relaying");
      exit;
  };

  /* ********   do record-route and loose-route ******** */
  if (!is_method("REGISTER"))
      record_route();

  if (loose_route()) {
      append_hf("P-hint: rr-enforced\r\n");
      t_relay();
      exit;
  };

  /* ******** check for requests targeted out of our domain ******** */
  if ( !is_myself("$rd") ) {
      append_hf("P-hint: OUTBOUND\r\n");
      if ($rd=="domB.net") {
          t_relay("tls:domB.net:5061");
      } else if ($rd=="domC.net") {
          t_relay("tls:domC.net:5061");
      } else {
          t_relay();
      };
      exit;
  };

  /* ******** divert to other domain according to prefixes ******** */
  if (!is_method("REGISTER")) {
      if ( $ru=~"sip:201") {
          strip(3);
          $rd = "domB.net";
          t_relay("tls:domB.net:5061");
          exit;
      } else if ( $ru=~"sip:202" ) {
          strip(3);
          $rd = "domC.net";
          t_relay("tls:domC.net:5061");
          exit;
      };
  };

  /* ************* requests for our domain ************* */
  if (is_method("REGISTER")) {
      if (!www_authorize( "domA.net", "subscriber" )) {
          # challenge if none or invalid credentials
          www_challenge( "domA.net" /* realm */,
              "0" /* no qop -- some phones can't deal with it */);
          exit;
      };
      if ($au!=$tU) {
          xlog("TO hdr Cheating attempt\n");
          send_reply(403, "That is ugly -- use To=id in REGISTERs");
          exit;
      };
      # it is an authenticated request, update Contact database now
      if (!save("location")) {
          sl_reply_error();
      };
      exit;
  };

  # native SIP destinations are handled using USRLOC DB
  if (!lookup("location")) {
      # handle user which was not found
      send_reply(404, "Not Found");
      exit;
  };

  # remove all present Alert-info headers
  remove_hf("Alert-Info");

  if (is_method("INVITE") && ($rP=="TLS" || isflagset(1))) {
      append_hf("Alert-info: 1\r\n");                     # cisco 7960
      append_hf("Alert-info: Bellcore-dr4\r\n");          # cisco ATA
      append_hf("Alert-info: http://foo.bar/x.wav\r\n");  # snom
  };

  # do forwarding
  if (!t_relay()) {
      sl_reply_error();
  };

  #end of script
  }
```
### Example of TLS logging

If you want to debug TLS connections, put the following log statements into your OpenSIPS.cfg. This will dump all available TLS pseudo variables.

```opensips
xlog("L_INFO","================= start TLS pseudo variables ===============\n");
xlog("L_INFO","$$tls_version                   = '$tls_version'\n");
xlog("L_INFO","$$tls_description               = '$tls_description'\n");
xlog("L_INFO","$$tls_cipher_info               = '$tls_cipher_info'\n");
xlog("L_INFO","$$tls_cipher_bits               = '$tls_cipher_bits'\n");
xlog("L_INFO","$$tls_peer_subject              = '$tls_peer_subject'\n");
xlog("L_INFO","$$tls_peer_issuer               = '$tls_peer_issuer'\n");
xlog("L_INFO","$$tls_my_subject                = '$tls_my_subject'\n");
xlog("L_INFO","$$tls_my_issuer                 = '$tls_my_issuer'\n");
xlog("L_INFO","$$tls_peer_version              = '$tls_peer_version'\n");
xlog("L_INFO","$$tls_my_version                = '$tls_my_version'\n");
xlog("L_INFO","$$tls_peer_serial               = '$tls_peer_serial'\n");
xlog("L_INFO","$$tls_my_serial                 = '$tls_my_serial'\n");
xlog("L_INFO","$$tls_peer_subject_cn           = '$tls_peer_subject_cn'\n");
xlog("L_INFO","$$tls_peer_issuer_cn            = '$tls_peer_issuer_cn'\n");
xlog("L_INFO","$$tls_my_subject_cn             = '$tls_my_subject_cn'\n");
xlog("L_INFO","$$tls_my_issuer_cn              = '$tls_my_issuer_cn'\n");
xlog("L_INFO","$$tls_peer_subject_locality     = '$tls_peer_subject_locality'\n");
xlog("L_INFO","$$tls_peer_issuer_locality      = '$tls_peer_issuer_locality'\n");
xlog("L_INFO","$$tls_my_subject_locality       = '$tls_my_subject_locality'\n");
xlog("L_INFO","$$tls_my_issuer_locality        = '$tls_my_issuer_locality'\n");
xlog("L_INFO","$$tls_peer_subject_country      = '$tls_peer_subject_country'\n");
xlog("L_INFO","$$tls_peer_issuer_country       = '$tls_peer_issuer_country'\n");
xlog("L_INFO","$$tls_my_subject_country        = '$tls_my_subject_country'\n");
xlog("L_INFO","$$tls_my_issuer_country         = '$tls_my_issuer_country'\n");
xlog("L_INFO","$$tls_peer_subject_state        = '$tls_peer_subject_state'\n");
xlog("L_INFO","$$tls_peer_issuer_state         = '$tls_peer_issuer_state'\n");
xlog("L_INFO","$$tls_my_subject_state          = '$tls_my_subject_state'\n");
xlog("L_INFO","$$tls_my_issuer_state           = '$tls_my_issuer_state'\n");
xlog("L_INFO","$$tls_peer_subject_organization = '$tls_peer_subject_organization'\n");
xlog("L_INFO","$$tls_peer_issuer_organization  = '$tls_peer_issuer_organization'\n");
xlog("L_INFO","$$tls_my_subject_organization   = '$tls_my_subject_organization'\n");
xlog("L_INFO","$$tls_my_issuer_organization    = '$tls_my_issuer_organization'\n");
xlog("L_INFO","$$tls_peer_subject_unit         = '$tls_peer_subject_unit'\n");
xlog("L_INFO","$$tls_peer_issuer_unit          = '$tls_peer_issuer_unit'\n");
xlog("L_INFO","$$tls_my_subject_unit           = '$tls_my_subject_unit'\n");
xlog("L_INFO","$$tls_my_issuer_unit            = '$tls_my_issuer_unit'\n");
xlog("L_INFO","$$tls_peer_san_email            = '$tls_peer_san_email'\n");
xlog("L_INFO","$$tls_my_san_email              = '$tls_my_san_email'\n");
xlog("L_INFO","$$tls_peer_san_hostname         = '$tls_peer_san_hostname'\n");
xlog("L_INFO","$$tls_my_san_hostname           = '$tls_my_san_hostname'\n");
xlog("L_INFO","$$tls_peer_san_uri              = '$tls_peer_san_uri'\n");
xlog("L_INFO","$$tls_my_san_uri                = '$tls_my_san_uri'\n");
xlog("L_INFO","$$tls_peer_san_ip               = '$tls_peer_san_ip'\n");
xlog("L_INFO","$$tls_my_san_ip                 = '$tls_my_san_ip'\n");
xlog("L_INFO","$$tls_peer_verified             = '$tls_peer_verified'\n");
xlog("L_INFO","$$tls_peer_revoked              = '$tls_peer_revoked'\n");
xlog("L_INFO","$$tls_peer_expired              = '$tls_peer_expired'\n");
xlog("L_INFO","$$tls_peer_selfsigned           = '$tls_peer_selfsigned'\n");
xlog("L_INFO","$$tls_peer_notBefore            = '$tls_peer_notBefore'\n");
xlog("L_INFO","$$tls_peer_notAfter             = '$tls_peer_notAfter'\n");
xlog("L_INFO","================= end TLS pseudo variables ===============\n");
```
