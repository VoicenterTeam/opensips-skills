# TLS\_MGM module

---

**List of Tables**

3.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp6159536)

3.2. [Most recently active contributors(1) to this module](#idp6261696)

**List of Examples**

1.1. [`is_peer_verified` usage](#idp5534368)

1.2. [Set `listen` variable](#idp5545824)

1.3. [Set `tls_library` variable](#idp5559040)

1.4. [Set `tls_method` variable](#idp5570912)

1.5. [Set `tls_method` range variable](#idp5573248)

1.6. [Set `certificate` variable](#idp5578000)

1.7. [Set `private_key` variable](#idp5582464)

1.8. [Set `ca_list` variable](#idp5586944)

1.9. [Set `ca_dir` variable](#idp5592768)

1.10. [Set `crl_dir` variable](#idp5597248)

1.11. [Set `crl_check_all` variable](#idp5601728)

1.12. [Set `ciphers_list` variable](#idp5608000)

1.13. [Set `dh_params` variable](#idp5612512)

1.14. [Set `verify_cert` variable](#idp5621632)

1.15. [Set `require_cert` variable](#idp5627632)

1.16. [Set `client_tls_domain_avp` variable](#idp5634416)

1.17. [Set `client_sip_domain_avp` variable](#idp5641968)

1.18. [Usage of `db_url` block](#idp5646608)

1.19. [Usage of `db_table` block](#idp5650496)

1.20. [Usage of `domain_col` block](#idp5654384)

1.21. [Usage of `match_ip_address_col` block](#idp5658272)

1.22. [Usage of `match_sip_domain_col` block](#idp5662160)

1.23. [Usage of `tls_method_col` block](#idp5666048)

1.24. [Usage of `vertify_cert_col` block](#idp5669936)

1.25. [Usage of `require_cert_col` block](#idp5673824)

1.26. [Usage of `certificate_col` block](#idp5677712)

1.27. [Usage of `private_key_col` block](#idp5681600)

1.28. [Usage of `crl_check_all` block](#idp5685488)

1.29. [Usage of `crl_dir_col` block](#idp5689376)

1.30. [Usage of `ca_list_col` block](#idp5693264)

1.31. [Usage of `ca_dir_col` block](#idp5697152)

1.32. [Usage of `cipher_list_col` block](#idp5701040)

1.33. [Usage of `dh_params_col` block](#idp5704944)

1.34. [Usage of `ec_curve_col` block](#idp5708832)

1.35. [Set `match_ip_address` variable](#idp5713952)

1.36. [Set `match_sip_domain` variable](#idp5722464)

1.37. [Usage of `tls_client_domain` and `tls_server_domain` block](#idp5726656)

1.38. [Example of `$tls_[peer|my]_[subject|issuer]`](#idp5750000)

1.39. [Script with TLS support](#idp5782672)

1.40. [Example of TLS logging](#idp5796944)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module is a management module for TLS certificates and parameters. It provides an interface for all the modules that use the TLS protocol. It also exports pseudo variables with certificate and TLS parameters.

## 1.2.�Usage

This module is used to provision TLS certificates and parameters for all the modules that use TLS transport (like _proto\_tls_ or _proto\_wss_). The module supports multiple virtual domains that can be assigned to different listeners (servers) or new connections (clients). Each TLS module that uses this management module should assign itself to one or more domains.

The module allows the definition of the TLS domains both via module parameters (script level) and via an SQL table.

A script example which details this module's usage can be found in [Section�1.11, “OpenSIPS with TLS - script example”](#tls-example "1.11.�OpenSIPS with TLS - script example").

## 1.3.�TLS libraries

Besides TLS certificates and parameters, this module also acts as an inteface between the actual TLS implemenation (provided by _openSSL_ or _wolfSSL_ libraries) and transport protocol modules like _proto\_tls_ or _proto\_wss_. The _tls\_mgm_ module transparently exposes the TLS operations implemented by _tls\_openssl_ and _tls\_wolfssl_ modules to the higher-level OpenSIPS transport modules.

The TLS library selection ca be configured through the [tls\_library](#param_tls_library "1.9.2.�tls_library (string)") module parameter.

## 1.4.�TLS domains

The wording 'TLS domain' means that this TLS connection will have different parameters than another TLS connection (from another TLS domain). Thus, TLS domains are not directly related to different SIP domains, although they are often used in conjunction. Depending on the direction of the TLS handshake, a TLS domain is called 'client domain' (=outgoing TLS connection) or 'server domain' (= incoming TLS connection).

If you run several SIP domains you can specify some parameters for each of them separately (regardless if you have only one or multiple socket=tls:ip:port entries in the config file).

For example, TLS domains can be used in virtual hosting scenarios with TLS. OpenSIPS offers SIP service for multiple domains, e.g. atlanta.com and biloxi.com. Altough both domains will be hosted on a single SIP proxy, the SIP proxy needs 2 certificates: One for atlanta.com and one for biloxi.com. For incoming TLS connections, the SIP proxy has to present the respective certificate during the TLS handshake. As the SIP proxy does not have a received SIP message yet (this is done after the TLS handshake), the SIP proxy can not retrieve the target domain from SIP (which would have been usually retrieved from the domain in the request URI). Thus, distinction for these domains must be done by using multiple listening sockets or by having clients that send the Servername TLS extension(SNI) in the handshake process.

For outgoing TLS connections, the TLS domain is chosen based on the destination socket of the underlying outgoing TCP connection and/or by taking a decision at script level via an AVP. For example, you can inspect headers like RURI or From and match the domain in the SIP header with filters that you have set up for the TLS domains.

NOTE: Except tls\_handshake\_timeout and tls\_send\_timeout all TLS parameters can be set per TLS domain.

## 1.5.�Defining TLS domains

TLS domains can be defined in two ways:

*   by setting the _server\_domain_ or _client\_domain_ module parameters
    
*   by provisioning in DB
    

For the domains defined in the DB, the certificate, private key, list of trusted CAs and Diffie-Hellman parameters are provisioned as BLOB values while for script defined domains you must provide path to files.

You can define domains both in the DB and script at the same time.

For any TLS domain (defined through script or DB) if not specified otherwise, the default settings are:

*   method - _SSLv23_
    
*   verify\_cert - _1_
    
*   require\_cert - _1_
    
*   certificate - _CFG\_DIR/tls/cert.pem_
    
*   private\_key - _CFG\_DIR/tls/ckey.pem_
    
*   crl\_check\_all - _0_
    
*   crl\_dir - none
    
*   ca\_list - none
    
*   ca\_dir - _/etc/pki/CA/_
    
*   cipher\_list - the OpenSSL default ciphers
    
*   dh\_params - none
    
*   ec\_curve - none
    

## 1.6.�Dependencies

### 1.6.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _tls\_openssl_ or _tls\_wolfssl_, unless [tls\_library](#param_tls_library "1.9.2.�tls_library (string)") is set to 'none'.
    

### 1.6.2.�Dependencies of external libraries

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.7.�Exported Functions

### 1.7.1.� `is_peer_verified`

Returns 1 if the message is received via TLS and the peer was verified during TLS connection handshake, otherwise it returns -1

This function can be used from REQUEST\_ROUTE.

**Example�1.1.�`is_peer_verified` usage**

...
if (is\_peer\_verified()) {
        xlog("L\_INFO","request from verified TLS peer\\n");
} else {
        xlog("L\_INFO","request not verified\\n");
}
...

  

## 1.8.�Exported MI Functions

### 1.8.1.� `tls_list`

List all domains information.

### 1.8.2.� `tls_reload`

Reloads the TLS domains information from the database. The previous DB defined domains are discarded but the script defined domains are preserved.

## 1.9.�OpenSIPS Exported parameters

All these parameters can be used from the opensips.cfg file, to configure the behavior of OpenSIPS-TLS.

### 1.9.1.�`listen`\=interface

Not specific to TLS. Allows to specify the protocol (udp, tcp, tls), the IP address and the port where the listening server will be.

**Example�1.2.�Set `listen` variable**

...
socket= tls:1.2.3.4:5061
...
				

  

### 1.9.2.�`tls_library` (string)

Selects which TLS library to use. Possible values are:

*   _auto_ - auto-detect which TLS library module (_tls\_openssl_ or _tls\_wolfssl_) was loaded. OpenSIPS will not start if no module, or both modules are found.
    
*   _none_ - do not use any TLS library; this is useful when the _tls\_mgm_ module is required only for the management of TLS certificates and parameters by modules like _db\_mysql_, _rabbitmq_ etc. ( and not for TLS operations by transport modules like _proto\_tls_ etc.)
    
*   _openssl_ - use the _openSSL_ library through the _tls\_openssl_ module.
    
*   _wolfssl_ - use the _wolfSSL_ library through the _tls\_wolfssl_ module.
    

Default value is _auto_.

**Example�1.3.�Set `tls_library` variable**

...
modparam("tls\_mgm", "tls\_library", "none")
...
				

  

### 1.9.3.�`tls_method` (\[domain\]string)

Sets the TLS protocol. The domain part represents the name of the TLS domain. The supported TLS methods are:

*   _TLSv1\_3_ - means OpenSIPS will accept only TLSv1.3 connections. This version is only available starting with OpenSSL 1.1.1 version.
    
*   _TLSv1\_2_ - means OpenSIPS will accept only TLSv1.2 connections (rfc3261 conformant).
    
*   _TLSv1_ - means OpenSIPS will accept only TLSv1 connections (rfc3261 conformant).
    
*   _SSLv23_ - means OpenSIPS will accept any of the above methods, but the initial SSL hello must be v2 (in the initial hello all the supported protocols are advertised enabling switching to a higher and more secure version). The initial v2 hello means it will not accept connections from SSLv3 or TLSv1 only clients.
    

_If you are using an OpenSSL library newer than 1.1.0, you can also specify a range of accepted TLS versions as \[VLOW\]-\[VHIGH\]. If VLOW is not specified it will use the minimum supported protocol version and if VHIGH is not specified it will use the maximum supported protocol version. This means that using a range where both the low and high values are missing, will accept all the supported methods, but unlike SSLv23 will not require the initial hello to be SSLv2._

_Default value is SSLv23._

### Warning

For extended compatibility with older system, best use SSLv23.

If you want RFC3261 conformance and all your clients support TLSv1 (or you are planning to use encrypted "tunnels" only between different OpenSIPS proxies) use TLSv1. If you want to support older clients use SSLv23 (in fact most of the applications with SSL support use the SSLv23 method).

**Example�1.4.�Set `tls_method` variable**

...
modparam("tls\_mgm", "tls\_method", "\[dom\]TLSv1")
...
				

  

**Example�1.5.�Set `tls_method` range variable**

...
modparam("tls\_mgm", "tls\_method", "\[dom\]TLSv1-TLSv1\_3")  # between v1 and v1.3
modparam("tls\_mgm", "tls\_method", "\[dom\]TLSv1-")         # v1 or higher
modparam("tls\_mgm", "tls\_method", "\[dom\]-TLSv1\_2")       # up to v1.2
modparam("tls\_mgm", "tls\_method", "\[dom\]-")              # all supported
...
				

  

### 1.9.4.�`certificate` (\[domain\](string)

Public certificate file for OpenSIPS. It will be used as server-side certificate for incoming TLS connections, and as a client-side certificate for outgoing TLS connections. The domain part represents the name of the TLS domain.

_Default value is "CFG\_DIR/tls/cert.pem"._

**Example�1.6.�Set `certificate` variable**

...
modparam("tls\_mgm", "certificate", "\[dom\]/mycerts/certs/opensips\_server\_cert.pem")
...
				

  

### 1.9.5.�`private_key` (\[domain\](string)

Private key of the above certificate. I must be kept in a safe place with tight permissions! The domain part represents the name of the TLS omain.

_Default value is "CFG\_DIR/tls/ckey.pem"._

**Example�1.7.�Set `private_key` variable**

...
modparam("tls\_mgm", "private\_key", "\[dom\]/mycerts/private/prik.pem")
...
				

  

### 1.9.6.�`ca_list` (\[domain\](string)

List of trusted CAs. The file contains the certificates accepted, one after the other. It MUST be a file, not a folder. The domain part represents the name of the TLS domain.

_Default value is ""._

**Example�1.8.�Set `ca_list` variable**

...
modparam("tls\_mgm", "ca\_list", "\[dom\]/mycerts/certs/ca\_list.pem")
...
				

  

### 1.9.7.�`ca_dir` (\[domain\](string)

Directory storing trusted CAs. The certificates in the directory must be in hashed form, as described in the [_openssl documentation_](https://www.openssl.org/docs/manmaster/man3/X509_LOOKUP_hash_dir.html) for the _Hashed Directory Method_. The domain part represents the name of the TLS domain.

_Default value is "/etc/pki/CA/"._

**Example�1.9.�Set `ca_dir` variable**

...
modparam("tls\_mgm", "ca\_dir", "\[dom\]/mycerts/certs")
...
				

  

### 1.9.8.�`crl_dir` (\[domain\](string)

Directory storing certificate revocation lists (CRLs). The domain part represents the name of the TLS domain.

_If this parameter is not set, no CRLs will be used._

**Example�1.10.�Set `crl_dir` variable**

...
modparam("tls\_mgm", "crl\_dir", "\[dom\]/mycerts/crls")
...
				

  

### 1.9.9.�`crl_check_all` (\[domain\](string)

Setting this parameter with a non-zero integer value enables CRL checking for the entire certificate chain.

_By default, only the leaf certificate in the certificate chain is checked._

**Example�1.11.�Set `crl_check_all` variable**

...
modparam("tls\_mgm", "crl\_check\_all", "\[dom\]1")
...
				

  

### 1.9.10.�`ciphers_list` (\[domain\](string)

You can specify the list of algorithms for authentication and encryption that you allow. The domain part represents the name of the TLS domain. To obtain a list of ciphers and then choose, use the openssl application:

*   openssl ciphers 'ALL:eNULL:!LOW:!EXPORT'
    

### Warning

Do not use the NULL algorithms (no encryption) ... only for testing!!!

_It defaults to the OpenSSL default ciphers._

**Example�1.12.�Set `ciphers_list` variable**

...
modparam("tls\_mgm", "ciphers\_list", "\[dom\]NULL")
...
				

  

### 1.9.11.�`dh_params` (\[domain\](string)

You can specify a file which contains Diffie-Hellman parameters as a PEM-file. This is needed if you would like to specify ciphers including Diffie-Hellman mode. The domain part represents the name of the TLS domain.

_It defaults to not set a dh param file._

**Example�1.13.�Set `dh_params` variable**

...
modparam("tls\_mgm", "dh\_params", "\[dom\]/etc/pki/CA/dh1024.pem")
...
				

  

### 1.9.12.�`ec_curve` (\[domain\](string)

You can specify an elliptic curve which should be used for ciphers which demand an elliptic curve. The domain part represents the name of the TLS domain.

It's usable only if TLS v1.1/1.2 support was compiled. A list of curves which can be used you can get by

				openssl ecparam -list\_curves
			

_It defaults to not set a elliptic curve._

### 1.9.13.�`verify_cert` (\[domain\](string)

Activates SSL\_VERIFY\_PEER in the ssl\_context. For a detailed explanation, check the _openssl_ documentation.

The domain part represents the name of the TLS domain.

Default value is _1_.

**Example�1.14.�Set `verify_cert` variable**

...
modparam("tls\_mgm", "verify\_cert", "\[dom\]0")
...
				

  

### 1.9.14.�`require_cert` (\[domain\](string)

Activates SSL\_VERIFY\_FAIL\_IF\_NO\_PEER\_CERT in the ssl\_context. For a detailed explanation, check the _openssl_ documentation. This parameter only makes sense for server domains and if the [verify\_cert](#param_verify_cert "1.9.13.�verify_cert ([domain](string)") parameter is also set.

The domain part represents the name of the TLS domain.

Default value is _1_.

**Example�1.15.�Set `require_cert` variable**

...
modparam("tls\_mgm", "require\_cert", "\[dom\]0")
...
				

  

### 1.9.15.�`client_tls_domain_avp` (string)

Name of the AVP used for enforcing the selection of a specific TLS client domain. Setting this AVP to the name of a TLS client domain will result in using that specific domain regardless of the standard matching mechanism.

Note: If there is already an existing TLS connection to the remote target, it will be reused and setting this AVP has no effect.

Note: You can force a particular domain to be used just for a particular branch by setting the _$bavp_ variable with the same name. When both _$bavp_ and _$avp_ variables are set, the first one takes precedence.

_No default value._

**Example�1.16.�Set `client_tls_domain_avp` variable**

...
modparam("tls\_mgm", "client\_tls\_domain\_avp", "tls\_match\_dom")
...
				

  

### 1.9.16.�`client_sip_domain_avp` (string)

Name of the AVP that sets the SIP domain used in the TLS client domain matching process.

Note: If there is already an existing TLS connection to the remote target, it will be reused and setting this AVP has no effect.

Note: You can force a particular SIP domain to be used just for a particular branch by setting the _$bavp_ variable with the same name. When both _$bavp_ and _$avp_ variables are set, the first one takes precedence.

For the AVP usage example, refer to [Section�1.9.36, “`server_domain, client_domain` (string)”](#domains-param "1.9.36.�server_domain, client_domain (string)").

_No default value._

**Example�1.17.�Set `client_sip_domain_avp` variable**

...
modparam("tls\_mgm", "client\_sip\_domain\_avp", "sip\_match\_dom")
...
				

  

### 1.9.17.�`db_url` (string)

The database url. It cannot be NULL.

You cannot use the "tls\_domain=_dom\_name_" URL parameter for a TLS connection to the database for the tls\_mgm module itself.

**Example�1.18.�Usage of `db_url` block**

modparam("tls\_mgm", "db\_url", "mysql://root:admin@localhost/opensips")
				

  

### 1.9.18.� `db_table` (string)

Sets the database table name.

Default value is "tls\_mgm".

**Example�1.19.�Usage of `db_table` block**

modparam("tls\_mgm", "db\_table", "tls\_mgm")
                                

  

### 1.9.19.� `domain_col` (string)

Sets the name for the TLS domain column.

Default value is "domain".

**Example�1.20.�Usage of `domain_col` block**

modparam("tls\_mgm", "domain\_col", "tls\_domain")
                                

  

### 1.9.20.� `match_ip_address_col` (string)

Sets the IP address matching column name.

Default value is "match\_ip\_address".

**Example�1.21.�Usage of `match_ip_address_col` block**

modparam("tls\_mgm", "match\_ip\_address\_col", "addr")
                                

  

### 1.9.21.� `match_sip_domain_col` (string)

Sets the SIP domain matching column name.

Default value is "match\_sip\_domain".

**Example�1.22.�Usage of `match_sip_domain_col` block**

modparam("tls\_mgm", "match\_sip\_domain\_col", "addr")
                                

  

### 1.9.22.� `tls_method_col` (string)

Sets the method column name.

Default value is "method".

**Example�1.23.�Usage of `tls_method_col` block**

modparam("tls\_mgm", "tls\_method\_col", "method")
                                

  

### 1.9.23.� `verify_cert_col` (string)

Sets the verrify certificate column name.

Default value is "verify\_cert".

**Example�1.24.�Usage of `vertify_cert_col` block**

modparam("tls\_mgm", "verify\_cert\_col", "verify\_cert")
                                

  

### 1.9.24.� `require_cert_col` (string)

Sets the require certificate column name.

Default value is "require\_cert".

**Example�1.25.�Usage of `require_cert_col` block**

modparam("tls\_mgm", "require\_cert\_col", "req")
                                

  

### 1.9.25.� `certificate_col` (string)

Sets the certificate column name.

Default value is "certificate".

**Example�1.26.�Usage of `certificate_col` block**

modparam("tls\_mgm", "certificate\_col", "certificate")
                                

  

### 1.9.26.� `private_key_col` (string)

Sets the private key column name.

Default value is "private\_key".

**Example�1.27.�Usage of `private_key_col` block**

modparam("tls\_mgm", "private\_key\_col", "pk")
                                

  

### 1.9.27.� `crl_check_all_col` (string)

Sets the crl\_check\_all column name.

Default value is "crl\_check\_all".

**Example�1.28.�Usage of `crl_check_all` block**

modparam("tls\_mgm", "crl\_check\_all\_col", "crl\_check")
                                

  

### 1.9.28.� `crl_dir_col` (string)

Sets the crl directory column name.

Default value is "crl\_dir".

**Example�1.29.�Usage of `crl_dir_col` block**

modparam("tls\_mgm", "crl\_dir\_col", "crl\_dir")
                                

  

### 1.9.29.� `ca_list_col` (string)

Sets the CA list column name.

Default value is "ca\_list".

**Example�1.30.�Usage of `ca_list_col` block**

modparam("tls\_mgm", "ca\_list\_col", "ca\_list")
                                

  

### 1.9.30.� `ca_dir_col` (string)

Sets the CA directory column name.

Default value is "ca\_dir".

**Example�1.31.�Usage of `ca_dir_col` block**

modparam("tls\_mgm", "ca\_dir\_col", "ca\_dir")
                                

  

### 1.9.31.� `cipher_list_col` (string)

Sets the cipher list column name.

Default value is "cipher\_list".

**Example�1.32.�Usage of `cipher_list_col` block**

modparam("tls\_mgm", "cipher\_list\_col", "cipher\_list")
                                

  

### 1.9.32.� `dh_params_col` (string)

Sets the Diffie-Hellmann parameters column name.

Default value is "dh\_params".

**Example�1.33.�Usage of `dh_params_col` block**

modparam("tls\_mgm", "dh\_params\_col", "dh\_parms")
                                

  

### 1.9.33.� `ec_curve_col` (string)

Sets the ec\_curve column name.

Default value is "ec\_curve".

**Example�1.34.�Usage of `ec_curve_col` block**

modparam("tls\_mgm", "ec\_curve\_col", "ec\_curve")
                                

  

### 1.9.34.�`match_ip_address` (string)

The IP addresses and ports used to match a TLS connection with a virtual TLS domain. For TLS server domains, these values will be mathced against the socket on which the connection is received. For TLS client domains, the values will be compared with the destination socket of the connection.

The parameter accepts a list of values, and the special value "\*" means: match any address.

_Default value is "\*" (match any address)._

**Example�1.35.�Set `match_ip_address` variable**

...
modparam("tls\_mgm", "match\_ip\_address", "\[dom1\]10.0.0.10:5061, 10.0.0.11:5061")
...
				

  

### 1.9.35.�`match_sip_domain` (string)

The SIP domains used to match a TLS connection with a virtual TLS domain. For TLS server domains, these values will be matched against the hostname provided in the TLS Servername extension(SNI). For TLS client domains, the values will be compared with the value of the [client\_sip\_domain\_avp](#param_client_sip_domain_avp "1.9.16.�client_sip_domain_avp (string)") AVP.

The parameter accepts a list of FQDNs or the special values:

*   _\*_ - match any sip domain( including no SNI provided, in case of TLS server domains);
    
*   _none_ - match the TLS domain when there is no SNI provided (make sense only for TLS server domains). Note that if a SNI is provided, but does not match any other SIP domain filter, the connection will be rejected.
    

The FQDNs can be specified as with Unix shell-style wildcards. If there are multiple potential matches, the most specific domain will be selected(eg. a request for "foo.bar.com" is matched with the domain specified with "foo.bar.com" versus the one with "\*.bar.com").

_Default value is "\*" (match any sip domain)._

**Example�1.36.�Set `match_sip_domain` variable**

...
modparam("tls\_mgm", "match\_sip\_domain", "\[dom1\]foo.com, bar.com, \*.baz.com")
modparam("tls\_mgm", "match\_sip\_domain", "\[default\_dom\]\*")
...
				

  

### 1.9.36.�`server_domain, client_domain` (string)

You can define virtual TLS domains through these parameters.

The value of these parameters represents the virtual tls domain's name which is only used for identification.

**Example�1.37.�Usage of `tls_client_domain` and `tls_server_domain` block**

...
socket=tls:10.0.0.10:5061
...
# set the TLS client domain AVP
modparam("tls\_mgm", "client\_sip\_domain\_avp", "tls\_sip\_dom")
...

# 'atlanta' server domain
modparam("tls\_mgm", "server\_domain", "dom1")
modparam("tls\_mgm", "match\_ip\_address", "\[dom1\]10.0.0.10:5061")
modparam("tls\_mgm", "match\_sip\_domain", "\[dom1\]atlanta.com")

modparam("tls\_mgm", "certificate", "\[dom1\]/certs/atlanta.com/cert.pem")
modparam("tls\_mgm", "private\_key", "\[dom1\]/certs/atlanta.com/privkey.pem")
modparam("tls\_mgm", "ca\_list", "\[dom1\]/certs/wellknownCAs")
modparam("tls\_mgm", "tls\_method", "\[dom1\]tlsv1")
modparam("tls\_mgm", "verify\_cert", "\[dom1\]1")
modparam("tls\_mgm", "require\_cert", "\[dom1\]1")

#'biloxi' server domain
modparam("tls\_mgm", "server\_domain", "dom2")
modparam("tls\_mgm", "match\_ip\_address", "\[dom2\]10.0.0.10:5061")
modparam("tls\_mgm", "match\_sip\_domain", "\[dom2\]biloxi.com")

modparam("tls\_mgm", "certificate", "\[dom2\]/certs/biloxi.com/cert.pem")
modparam("tls\_mgm", "private\_key", "\[dom2\]/certs/biloxi.com/privkey.pem")
modparam("tls\_mgm", "ca\_list", "\[dom2\]/certs/wellknownCAs")
modparam("tls\_mgm", "tls\_method", "\[dom2\]tlsv1")
modparam("tls\_mgm", "verify\_cert", "\[dom2\]1")
modparam("tls\_mgm", "require\_cert", "\[dom2\]1")

# generic TLS server domain, if the client does not provide SNI
modparam("tls\_mgm", "server\_domain", "dom3")
modparam("tls\_mgm", "match\_ip\_address", "\[dom3\]10.0.0.10:5061")
modparam("tls\_mgm", "match\_sip\_domain", "\[dom3\]none")

modparam("tls\_mgm", "certificate", "\[dom3\]/certs/generic/cert.pem")
modparam("tls\_mgm", "private\_key", "\[dom3\]/certs/generic/privkey.pem")
modparam("tls\_mgm", "ca\_list", "\[dom3\]/certs/wellknownCAs")
modparam("tls\_mgm", "tls\_method", "\[dom3\]tlsv1")
modparam("tls\_mgm", "verify\_cert", "\[dom3\]1")
modparam("tls\_mgm", "require\_cert", "\[dom3\]1")

# 'atlanta' client domain
modparam("tls\_mgm", "client\_domain", "dom4")
modparam("tls\_mgm", "match\_ip\_address", "\[dom4\]\*")
modparam("tls\_mgm", "match\_sip\_domain", "\[dom4\]atlanta.com")


modparam("tls\_mgm", "certificate", "\[dom4\]/certs/atlanta.com/cert.pem")
modparam("tls\_mgm", "private\_key", "\[dom4\]/certs/atlanta.com/privkey.pem")
modparam("tls\_mgm", "ca\_list", "\[dom4\]/certs/wellknownCAs")
modparam("tls\_mgm", "tls\_method", "\[dom4\]tlsv1")
modparam("tls\_mgm", "verify\_cert", "\[dom4\]1")
modparam("tls\_mgm", "require\_cert", "\[dom4\]1")

# 'biloxi' client domain
modparam("tls\_mgm", "client\_domain", "dom5")
modparam("tls\_mgm", "match\_ip\_address", "\[dom5\]\*")
modparam("tls\_mgm", "match\_sip\_domain", "\[dom5\]biloxi.com")

modparam("tls\_mgm", "certificate", "\[dom5\]/certs/biloxi.com/cert.pem")
modparam("tls\_mgm", "private\_key", "\[dom5\]/certs/biloxi.com/privkey.pem")
modparam("tls\_mgm", "ca\_list", "\[dom5\]/certs/wellknownCAs")
modparam("tls\_mgm", "tls\_method", "\[dom5\]tlsv1")
modparam("tls\_mgm", "verify\_cert", "\[dom5\]1")
modparam("tls\_mgm", "require\_cert", "\[dom5\]1")

# TLS client domain for GW provider
modparam("tls\_mgm", "client\_domain", "dom6")
modparam("tls\_mgm", "match\_ip\_address", "\[dom6\]1.2.3.4:6677")
modparam("tls\_mgm", "match\_sip\_domain", "\[dom6\]\*")

modparam("tls\_mgm", "certificate", "\[dom6\]/certs/gw/cert.pem")
modparam("tls\_mgm", "private\_key", "\[dom6\]/certs/gw/privkey.pem")
modparam("tls\_mgm", "ca\_list", "\[dom6\]/certs/wellknownCAs")
modparam("tls\_mgm", "tls\_method", "\[dom6\]tlsv1")
modparam("tls\_mgm", "verify\_cert", "\[dom6\]0")

...
route{
...
    # we match the TLS client domain using the SIP domain in the RURI
    $avp(tls\_sip\_dom) = $rd;
    t\_relay();
    exit;
...
    # calls to the PSTN GW, will match the correct TLS domain by IP
    t\_relay("tls:1.2.3.4:6677");
    exit;
...
				

  

## 1.10.�Variables

This module exports the follong variables:

Some variables are available for both, the peer'S certificate and the local certificate. Further, some parameters can be read from the “Subject” field or the “Issuer” field.

### 1.10.1.�$tls\_version

_$tls\_version_ - the TLS/SSL version which is used on the TLS connection from which the message was received. String type.

### 1.10.2.�$tls\_description

_$tls\_description_ - the TLS/SSL description of the TLS connection from which the message was received. String type.

### 1.10.3.�$tls\_cipher\_info

_$tls\_cipher\_info_ - the TLS/SSL cipher which is used on the TLS connection from which the message was received. String type.

### 1.10.4.�$tls\_cipher\_bits

_$tls\_cipher\_bits_ - the number of cipher bits which are used on the TLS connection from which the message was received. String and Integer type.

### 1.10.5.�$tls\_\[peer|my\]\_version

_$tls\_\[peer|my\]\_version_ - the version of the certificate. String type.

### 1.10.6.�$tls\_\[peer|my\]\_serial

_$tls\_\[peer|my\]\_serial_ - the serial number of the certificate. String and Integer type.

### 1.10.7.�$tls\_\[peer|my\]\_\[subject|issuer\]

_$tls\_\[peer|my\]\_\[subject|issuer\]_ - ASCII dump of the fields in the issuer/subject section of the certificate. String type.

**Example�1.38.�Example of `$tls_[peer|my]_[subject|issuer]`**

/C=AT/ST=Vienna/L=Vienna/O=enum.at/CN=enum.at

  

### 1.10.8.�$tls\_\[peer|my\]\_\[subject|issuer\]\_cn

_$tls\_\[peer|my\]\_\[subject|issuer\]\_cn_ - commonName in the issuer/subject section of the certificate. String type.

### 1.10.9.�$tls\_\[peer|my\]\_\[subject|issuer\]\_locality

_$tls\_\[peer|my\]\_\[subject|issuer\]\_locality_ - localityName in the issuer/subject section of the certificate. String type.

### 1.10.10.�$tls\_\[peer|my\]\_\[subject|issuer\]\_country

_$tls\_\[peer|my\]\_\[subject|issuer\]\_country_ - countryName in the issuer/subject section of the certificate. String type.

### 1.10.11.�$tls\_\[peer|my\]\_\[subject|issuer\]\_state

_$tls\_\[peer|my\]\_\[subject|issuer\]\_state_ - stateOrProvinceName in the issuer/subject section of the certificate. String type.

### 1.10.12.�$tls\_\[peer|my\]\_\[subject|issuer\]\_organization

_$tls\_\[peer|my\]\_\[subject|issuer\]\_organization_ - organizationName in the issuer/subject section of the certificate. String type.

### 1.10.13.�$tls\_\[peer|my\]\_\[subject|issuer\]\_unit

_$tls\_\[peer|my\]\_\[subject|issuer\]\_unit_ - organizationalUnitName in the issuer/subject section of the certificate. String type.

### 1.10.14.�$tls\_\[peer|my\]\_san\_email

_$tls\_\[peer|my\]\_san\_email_ - email address in the “subject alternative name” extension. String type.

### 1.10.15.�$tls\_\[peer|my\]\_san\_hostname

_$tls\_\[peer|my\]\_san\_hostname_ - hostname (DNS) in the “subject alternative name” extension. String type.

### 1.10.16.�$tls\_\[peer|my\]\_san\_uri

_$tls\_\[peer|my\]\_san\_uri_ - URI in the “subject alternative name” extension. String type.

### 1.10.17.�$tls\_\[peer|my\]\_san\_ip

_$tls\_\[peer|my\]\_san\_ip_ - ip address in the “subject alternative name” extension. String type.

### 1.10.18.�$tls\_peer\_verified

_$tls\_peer\_verified_ - Returns 1 if the peer's certificate was successful verified. Otherwise it returns 0. String and Integer type.

### 1.10.19.�$tls\_peer\_revoked

_$tls\_peer\_revoked_ - Returns 1 if the peer's certificate was revoked. Otherwise it returns 0. String and Integer type.

### 1.10.20.�$tls\_peer\_expired

_$tls\_peer\_expired_ - Returns 1 if the peer's certificate is expired. Otherwise it returns 0. String and Integer type.

### 1.10.21.�$tls\_peer\_selfsigned

_$tls\_peer\_selfsigned_ - Returns 1 if the peer's certificate is selfsigned. Otherwise it returns 0. String and Integer type.

### 1.10.22.�$tls\_peer\_notBefore

_$tls\_peer\_notBefore_ - Returns the notBefore validity date of the peer's certificate. String type.

### 1.10.23.�$tls\_peer\_notAfter

_$tls\_peer\_notAfter_ - Returns the notAfter validity date of the peer's certificate. String type.

## 1.11.�OpenSIPS with TLS - script example

IMPORTANT: The TLS support is based on TCP, and for allowing OpenSIPS to use TCP, it must be started in multi-process mode. So, there is a must to have the "fork" parameter set to "yes":

NOTE: Since the TLS engine is quite memory consuming, increase the used memory by the run time parameter "-m" (see OpenSIPS -h for more details).

*   fork = yes
    

**Example�1.39.�Script with TLS support**

  # ----------- global configuration parameters ------------------------
  log\_level=3
  stderror\_enabled=no
  syslog\_enabled=yes

  check\_via=no
  dns=no
  rev\_dns=no
  socket=udp:your\_serv\_IP:5060
  socket=tls:your\_serv\_IP:5061
  udp\_workers=4

  # ------------------ module loading ----------------------------------

  loadmodule "proto\_tls.so"
  loadmodule "proto\_udp.so"

  #TLS specific settings
  loadmodule "tls\_mgm.so"

  modparam("tls\_mgm", "certificate", "/path/opensipsX\_cert.pem")
  modparam("tls\_mgm", "private\_key", "/path/privkey.pem")
  modparam("tls\_mgm", "ca\_list", "/path/calist.pem")
  modparam("tls\_mgm", "ca\_list", "/path/calist.pem")
  modparam("tls\_mgm", "require\_cert", "1")
  modparam("tls\_mgm", "verify\_cert", "1")

  alias=\_DNS\_ALIAS\_


  loadmodule "sl.so"
  loadmodule "rr.so"
  loadmodule "maxfwd.so"
  loadmodule "mysql.so"
  loadmodule "usrloc.so"
  loadmodule "registrar.so"
  loadmodule "tm.so"
  loadmodule "auth.so"
  loadmodule "auth\_db.so"
  loadmodule "textops.so"
  loadmodule "sipmsgops.so"
  loadmodule "signaling.so"
  loadmodule "uri\_db.so"

  # ----------------- setting module-specific parameters ---------------

  # -- auth\_db params --
  modparam("auth\_db", "db\_url", "sql\_url")
  modparam("auth\_db", "password\_column", "password")
  modparam("auth\_db", "calculate\_ha1", 1)

  # -- registrar params --
  # no multiple registrations
  modparam("registrar", "append\_branches", 0)

  # -------------------------  request routing logic -------------------

  # main routing logic

  route{

  # initial sanity checks
  if (!mf\_process\_maxfwd\_header("10")) {
      send\_reply(483,"Too Many Hops");
      exit;
  };

  # if somene claims to belong to our domain in From,
  # challenge him (skip REGISTERs -- we will chalenge them later)
  if (is\_myself("$fd")) {
      setflag(1);
      if ( is\_method("INVITE|SUBSCRIBE|MESSAGE")
      && !(is\_myself("$si")) ) {
          if  (!(proxy\_authorize( "domA.net", "subscriber" ))) {
              proxy\_challenge("domA.net","0"/\*no-qop\*/);
              exit;
          };
          if ($au!=$fU) {
              xlog("FROM hdr Cheating attempt in INVITE\\n");
              send\_reply(403,
                  "That is ugly -- use From=id next time (OB)");
              exit;
          };
      }; # non-REGISTER from other domain
  } else if ( is\_method("INVITE") && !is\_myself("$rd") ) {
      send\_reply(403, "No relaying");
      exit;
  };

  /\* \*\*\*\*\*\*\*\*   do record-route and loose-route \*\*\*\*\*\*\* \*/
  if (!is\_method("REGISTER"))
      record\_route();

  if (loose\_route()) {
      append\_hf("P-hint: rr-enforced\\r\\n");
      t\_relay();
      exit;
  };

  /\* \*\*\*\*\*\*\* check for requests targeted out of our domain \*\*\*\*\*\*\* \*/
  if ( !is\_myself("$rd") ) {
      append\_hf("P-hint: OUTBOUND\\r\\n");
      if ($rd=="domB.net") {
          t\_relay("tls:domB.net:5061");
      } else if ($rd=="domC.net") {
          t\_relay("tls:domC.net:5061");
      } else {
          t\_relay();
      };
      exit;
  };

  /\* \*\*\*\*\*\*\* divert to other domain according to prefixes \*\*\*\*\*\*\* \*/
  if (!is\_method("REGISTER")) {
      if ( $ru=~"sip:201") {
          strip(3);
          $rd = "domB.net";
          t\_relay("tls:domB.net:5061");
          exit;
      } else if ( $ru=~"sip:202" ) {
          strip(3);
          $rd = "domC.net";
          t\_relay("tls:domC.net:5061");
          exit;
      };
  };

  /\* \*\*\*\*\*\*\*\*\*\*\*\* requests for our domain \*\*\*\*\*\*\*\*\*\* \*/
  if (is\_method("REGISTER")) {
      if (!www\_authorize( "domA.net", "subscriber" )) {
          # challenge if none or invalid credentials
          www\_challenge( "domA.net" /\* realm \*/,
              "0" /\* no qop -- some phones can't deal with it \*/);
          exit;
      };
      if ($au!=$tU) {
          xlog("TO hdr Cheating attempt\\n");
          send\_reply(403, "That is ugly -- use To=id in REGISTERs");
          exit;
      };
      # it is an authenticated request, update Contact database now
      if (!save("location")) {
          sl\_reply\_error();
      };
      exit;
  };

  # native SIP destinations are handled using USRLOC DB
  if (!lookup("location")) {
      # handle user which was not found
      send\_reply(404, "Not Found");
      exit;
  };

  # remove all present Alert-info headers
  remove\_hf("Alert-Info");

  if (is\_method("INVITE") && ($rP=="TLS" || isflagset(1))) {
      append\_hf("Alert-info: 1\\r\\n");                     # cisco 7960
      append\_hf("Alert-info: Bellcore-dr4\\r\\n");          # cisco ATA
      append\_hf("Alert-info: http://foo.bar/x.wav\\r\\n");  # snom
  };

  # do forwarding
  if (!t\_relay()) {
      sl\_reply\_error();
  };

  #end of script
  }
		

  

## 1.12.�Debug TLS connections

If you want to debug TLS connections, put the following log statements into your OpenSIPS.cfg. This will dump all available TLS pseudo variables.

**Example�1.40.�Example of TLS logging**

xlog("L\_INFO","================= start TLS pseudo variables ===============\\n");
xlog("L\_INFO","$$tls\_version                   = '$tls\_version'\\n");
xlog("L\_INFO","$$tls\_description               = '$tls\_description'\\n");
xlog("L\_INFO","$$tls\_cipher\_info               = '$tls\_cipher\_info'\\n");
xlog("L\_INFO","$$tls\_cipher\_bits               = '$tls\_cipher\_bits'\\n");
xlog("L\_INFO","$$tls\_peer\_subject              = '$tls\_peer\_subject'\\n");
xlog("L\_INFO","$$tls\_peer\_issuer               = '$tls\_peer\_issuer'\\n");
xlog("L\_INFO","$$tls\_my\_subject                = '$tls\_my\_subject'\\n");
xlog("L\_INFO","$$tls\_my\_issuer                 = '$tls\_my\_issuer'\\n");
xlog("L\_INFO","$$tls\_peer\_version              = '$tls\_peer\_version'\\n");
xlog("L\_INFO","$$tls\_my\_version                = '$tls\_my\_version'\\n");
xlog("L\_INFO","$$tls\_peer\_serial               = '$tls\_peer\_serial'\\n");
xlog("L\_INFO","$$tls\_my\_serial                 = '$tls\_my\_serial'\\n");
xlog("L\_INFO","$$tls\_peer\_subject\_cn           = '$tls\_peer\_subject\_cn'\\n");
xlog("L\_INFO","$$tls\_peer\_issuer\_cn            = '$tls\_peer\_issuer\_cn'\\n");
xlog("L\_INFO","$$tls\_my\_subject\_cn             = '$tls\_my\_subject\_cn'\\n");
xlog("L\_INFO","$$tls\_my\_issuer\_cn              = '$tls\_my\_issuer\_cn'\\n");
xlog("L\_INFO","$$tls\_peer\_subject\_locality     = '$tls\_peer\_subject\_locality'\\n");
xlog("L\_INFO","$$tls\_peer\_issuer\_locality      = '$tls\_peer\_issuer\_locality'\\n");
xlog("L\_INFO","$$tls\_my\_subject\_locality       = '$tls\_my\_subject\_locality'\\n");
xlog("L\_INFO","$$tls\_my\_issuer\_locality        = '$tls\_my\_issuer\_locality'\\n");
xlog("L\_INFO","$$tls\_peer\_subject\_country      = '$tls\_peer\_subject\_country'\\n");
xlog("L\_INFO","$$tls\_peer\_issuer\_country       = '$tls\_peer\_issuer\_country'\\n");
xlog("L\_INFO","$$tls\_my\_subject\_country        = '$tls\_my\_subject\_country'\\n");
xlog("L\_INFO","$$tls\_my\_issuer\_country         = '$tls\_my\_issuer\_country'\\n");
xlog("L\_INFO","$$tls\_peer\_subject\_state        = '$tls\_peer\_subject\_state'\\n");
xlog("L\_INFO","$$tls\_peer\_issuer\_state         = '$tls\_peer\_issuer\_state'\\n");
xlog("L\_INFO","$$tls\_my\_subject\_state          = '$tls\_my\_subject\_state'\\n");
xlog("L\_INFO","$$tls\_my\_issuer\_state           = '$tls\_my\_issuer\_state'\\n");
xlog("L\_INFO","$$tls\_peer\_subject\_organization = '$tls\_peer\_subject\_organization'\\n");
xlog("L\_INFO","$$tls\_peer\_issuer\_organization  = '$tls\_peer\_issuer\_organization'\\n");
xlog("L\_INFO","$$tls\_my\_subject\_organization   = '$tls\_my\_subject\_organization'\\n");
xlog("L\_INFO","$$tls\_my\_issuer\_organization    = '$tls\_my\_issuer\_organization'\\n");
xlog("L\_INFO","$$tls\_peer\_subject\_unit         = '$tls\_peer\_subject\_unit'\\n");
xlog("L\_INFO","$$tls\_peer\_issuer\_unit          = '$tls\_peer\_issuer\_unit'\\n");
xlog("L\_INFO","$$tls\_my\_subject\_unit           = '$tls\_my\_subject\_unit'\\n");
xlog("L\_INFO","$$tls\_my\_issuer\_unit            = '$tls\_my\_issuer\_unit'\\n");
xlog("L\_INFO","$$tls\_peer\_san\_email            = '$tls\_peer\_san\_email'\\n");
xlog("L\_INFO","$$tls\_my\_san\_email              = '$tls\_my\_san\_email'\\n");
xlog("L\_INFO","$$tls\_peer\_san\_hostname         = '$tls\_peer\_san\_hostname'\\n");
xlog("L\_INFO","$$tls\_my\_san\_hostname           = '$tls\_my\_san\_hostname'\\n");
xlog("L\_INFO","$$tls\_peer\_san\_uri              = '$tls\_peer\_san\_uri'\\n");
xlog("L\_INFO","$$tls\_my\_san\_uri                = '$tls\_my\_san\_uri'\\n");
xlog("L\_INFO","$$tls\_peer\_san\_ip               = '$tls\_peer\_san\_ip'\\n");
xlog("L\_INFO","$$tls\_my\_san\_ip                 = '$tls\_my\_san\_ip'\\n");
xlog("L\_INFO","$$tls\_peer\_verified             = '$tls\_peer\_verified'\\n");
xlog("L\_INFO","$$tls\_peer\_revoked              = '$tls\_peer\_revoked'\\n");
xlog("L\_INFO","$$tls\_peer\_expired              = '$tls\_peer\_expired'\\n");
xlog("L\_INFO","$$tls\_peer\_selfsigned           = '$tls\_peer\_selfsigned'\\n");
xlog("L\_INFO","$$tls\_peer\_notBefore            = '$tls\_peer\_notBefore'\\n");
xlog("L\_INFO","$$tls\_peer\_notAfter             = '$tls\_peer\_notAfter'\\n");
xlog("L\_INFO","================= end TLS pseudo variables ===============\\n");

  

## Chapter�2.�Developer Guide

## 2.1.�API Functions

### 2.1.1.�find\_server\_domain

struct tls\_domain \*find\_server\_domain(struct ip\_addr \*ip, unsigned short port);

Find a TLS server domain with given ip and port (local listening socket).

### 2.1.2.�find\_client\_domain

struct tls\_domain \*find\_client\_domain(struct ip\_addr \*ip, unsigned short port);

Find TLS client domain.

### 2.1.3.�get\_handshake\_timeout

int get\_handshake\_timeout(void);

Returns the handshanke timeout.

### 2.1.4.�get\_send\_timeout

int get\_send\_timeout(void);

Returns the send timeout.

## 2.2.�TLS\_CONFIG

It contains configuration variables for OpenSIPS's TLS (timeouts, file paths, etc).

## 2.3.�TLS\_INIT

Initialization related functions and parameters.

### 2.3.1.�ssl context

extern SSL\_CTX \*default\_client\_ctx;

The ssl context is a member of the TLS domain strcuture. Thus, every TLS domain, default and virtual - servers and clients, have its own SSL context.

### 2.3.2.�pre\_init\_tls

int init\_tls(void);

Called once to pre\_initialize the tls subsystem, from the main(). Called before parsing the configuration file.

### 2.3.3.�init\_tls

int init\_tls(void);

Called once to initialize the tls subsystem, from the main(). Called after parsing the configuration file.

### 2.3.4.�destroy\_tls

void destroy\_tls(void);

Called once, just before cleanup.

### 2.3.5.�tls\_init

int tls\_init(struct socket\_info \*c);

Called once for each tls socket created, from main.c

### 2.3.6.�os\_malloc, os\_realloc, os\_free

Wrapper functions around the shm\_\* functions. OpenSSL uses non-shared memory to create its objects, thus it would not work in OpenSIPS. By creating these wrappers and configuring OpenSSL to use them instead of its default memory functions, we have all OpenSSL objects in shared memory, ready to use.

## 2.4.�TLS\_DOMAIN

### 2.4.1.�tls\_domains

extern struct tls\_domain \*tls\_default\_server\_domain;

The default TLS server domain.

extern struct tls\_domain \*tls\_default\_client\_domain;

The default TLS client domain.

extern struct tls\_domain \*tls\_server\_domains;

List with defined server domains.

extern struct tls\_domain \*tls\_client\_domains;

List with defined client domains.

### 2.4.2.�tls\_find\_server\_domain

struct tls\_domain \*tls\_find\_server\_domain(struct ip\_addr \*ip, unsigned short port);

Find a TLS server domain with given ip and port (local listening socket).

### 2.4.3.�tls\_find\_client\_domain

struct tls\_domain \*tls\_find\_client\_domain(struct ip\_addr \*ip, unsigned short port);

Find TLS client domain.

### 2.4.4.�tls\_find\_client\_domain\_addr

struct tls\_domain \*tls\_find\_client\_domain\_addr(struct ip\_addr \*ip, unsigned short port);

Find TLS client domain with given ip and port (socket of the remote destination).

### 2.4.5.�tls\_find\_client\_domain\_name

struct tls\_domain \*tls\_find\_client\_name(str name);

Find TLS client domain with given name.

### 2.4.6.�tls\_new\_\_domain

struct tls\_domain \*tls\_new\_domain(int type);

Creates new TLS: allocate memory, set the type and initialize members

### 2.4.7.�tls\_new\_server\_domain

int tls\_new\_server\_domain(struct ip\_addr \*ip, unsigned short port);

Creates and adds to the list of TLS server domains a new domain.

### 2.4.8.�tls\_new\_client\_domain

int tls\_new\_client\_domain(struct ip\_addr \*ip, unsigned short port);

Creates and adds to the list of TLS client domains a new socket based domain.

### 2.4.9.�tls\_new\_client\_domain\_name

int tls\_new\_client\_domain\_name(char \*s, int len);

Creates and adds to the list of TLS client domains a new name based domain.

### 2.4.10.�tls\_free\_domains

void tls\_free\_domains(void);

Cleans up the entire domain lists.

## Chapter�3.�Contributors

## 3.1.�By Commit Statistics

**Table�3.1.�Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)**

�

Name

DevScore

Commits

Lines ++

Lines --

1.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

178

58

4821

4882

2.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

81

57

1415

724

3.

Eseanu Marius Cristian ([@eseanucristian](https://github.com/eseanucristian))

52

11

4268

321

4.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

26

20

175

236

5.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

24

13

291

460

6.

Dan Pascu ([@danpascu](https://github.com/danpascu))

17

13

90

176

7.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

16

9

383

169

8.

Ionel Cerghit ([@ionel-cerghit](https://github.com/ionel-cerghit))

8

1

494

109

9.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

5

3

9

23

10.

Alexey Vasilyev ([@vasilevalex](https://github.com/vasilevalex))

4

2

33

19

  

**All remaining contributors**: Callum Guy ([@spacetourist](https://github.com/spacetourist)), Aleksei Vasilev, jupiter, Fabian Gast ([@fgast](https://github.com/fgast)), Nick Altmann ([@nikbyte](https://github.com/nikbyte)), Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Jupiter Tang.

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 3.2.�By Commit Activity

**Table�3.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Jupiter Tang

Nov 2025 - Nov 2025

2.

jupiter

Apr 2025 - Apr 2025

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Oct 2015 - May 2023

4.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

Apr 2017 - May 2023

5.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Mar 2016 - Feb 2023

6.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Sep 2015 - Apr 2022

7.

Nick Altmann ([@nikbyte](https://github.com/nikbyte))

May 2021 - May 2021

8.

Aleksei Vasilev

Apr 2021 - Apr 2021

9.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Mar 2016 - Apr 2020

10.

Dan Pascu ([@danpascu](https://github.com/danpascu))

Jun 2019 - Feb 2020

  

**All remaining contributors**: Fabian Gast ([@fgast](https://github.com/fgast)), Alexey Vasilyev ([@vasilevalex](https://github.com/vasilevalex)), Callum Guy ([@spacetourist](https://github.com/spacetourist)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Ionel Cerghit ([@ionel-cerghit](https://github.com/ionel-cerghit)), Eseanu Marius Cristian ([@eseanucristian](https://github.com/eseanucristian)).

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�4.�Documentation

## 4.1.�Contributors

**Last edited by:** Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Dan Pascu ([@danpascu](https://github.com/danpascu)), Callum Guy ([@spacetourist](https://github.com/spacetourist)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Eseanu Marius Cristian ([@eseanucristian](https://github.com/eseanucristian)).

_Documentation Copyrights:_

Copyright � 2015 [www.opensips-solutions.com](http://www.opensips-solutions.com/)

Copyright � 2013 Secusmart GmbH

Copyright � 2006 enum.at

Copyright � 2005 Cesc Santasusana

Copyright � 2005 Voice Sistem SRL