## 1.3.�Exported Parameters

### 1.3.1.�`periodical_query`(int)

A flag to disable periodical query as an update method for the documents the module is responsible for. It could be disabled when the xcap server is capable to send the exported MI command when a change occurs or when another module in OpenSIPS handles updates.

To disable it set this parameter to 0.

_Default value is “1”._

**Example�1.1.�Set `periodical_query` parameter**

...
modparam("xcap\_client", "periodical\_query", 0)
...

  

### 1.3.2.�`query_period`(int)

Should be set if periodical query is not disabled. Represents the time interval the xcap servers should be queried for an update

To disable it set this parameter to 0.

_Default value is “100”._

**Example�1.2.�Set `query_period` parameter**

...
modparam("xcap\_client", "query\_period", 50)
...