## 1.6.�Exported MI Functions

### 1.6.1.� `stir_shaken_ca_reload`

Reload the file containing trusted CA certificates for the verifier and the directory containing trusted CA certificates for the verifier.

Name: _stir\_shaken\_ca\_reload_

Parameters: _none_

MI FIFO Command Format:

...
opensips-cli -x mi stir\_shaken\_ca\_reload
"OK"
...

### 1.6.2.� `stir_shaken_crl_reload`

Reload the file containing certificate revocation lists (CRLs) for the verifier and the directory containing certificate revocation lists for the verifier.

Name: _stir\_shaken\_crl\_reload_

Parameters: _none_

MI FIFO Command Format:

...
opensips-cli -x mi stir\_shaken\_crl\_reload
"OK"
...