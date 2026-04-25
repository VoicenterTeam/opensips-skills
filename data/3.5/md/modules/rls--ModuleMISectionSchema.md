## 1.5.�Exported MI Functions

### 1.5.1.� `rls_update_subscriptions`

Triggers updating backend subscriptions after a resources-list or rls-services document has been updated.

Name: _rls\_update\_subscriptions_

Parameters:

*   presentity\_uri : the uri of the user who made the change and whose subscriptions should be updated
    

MI FIFO Command Format:

opensips-cli -x mi rls\_update\_subscriptions sip:alice@atlanta.com