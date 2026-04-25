## 1.7.�Exported Parameters

### 1.7.1.�`skip_failover_codes` (string)

A regular expression used to specify the codes that should prevent the module from failing over to a new SRS server.

_By default any negative reply generates a failover._

**Example�1.1.�Set `skip_failover_codes` parameter**

...
# do not failover on 408 reply codes
modparam("siprec", "skip\_failover\_codes", "408")

# do not failover on 408 or 487 reply codes
modparam("siprec", "skip\_failover\_codes", "408|487")

# do not failover on any 3xx or 4xx reply code
modparam("siprec", "skip\_failover\_codes", "\[34\]\[0-9\]\[0-9\]")
...