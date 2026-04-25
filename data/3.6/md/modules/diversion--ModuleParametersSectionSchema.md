## 1.3.�Exported Parameters

### 1.3.1.�`suffix` (string)

The suffix to be appended to the end of the header field. You can use the parameter to specify additional parameters to be added to the header field, see the example.

Default value is “” (empty string).

**Example�1.1.�`suffix` usage**

modparam("diversion", "suffix", ";privacy=full")