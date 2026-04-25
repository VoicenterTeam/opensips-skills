## 1.3.�Parameters

### 1.3.1.�`default_expires` (int)

The default expires value used when missing from SUBSCRIBE message (in seconds).

_Default value is “3600”._

**Example�1.1.�Set `default_expires` parameter**

        ...
        modparam("presence\_reginfo", "default\_expires", 3600)
        ...
        

  

### 1.3.2.�`aggregate_presentities` (int)

Whether to aggregate in a single notify body all registration presentities. Useful to have all registrations on first NOTIFY following initial SUBSCRIBE.

_Default value is “0” (disabled)._

**Example�1.2.�Set `aggregate_presentities` parameter**

					...
					modparam("presence\_reginfo", "aggregate\_presentities", 1)
					...