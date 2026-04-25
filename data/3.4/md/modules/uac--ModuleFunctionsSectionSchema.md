## 1.4.�Exported Functions

### 1.4.1.� `uac_replace_from([display],uri)` `uac_replace_to([display],uri)`

Replace in FROM/TO header the _display_ name or/and the _URI_ part.

Both parameters are string. The _display_ is optional. If missing, only the URI will be changed in the message.

IMPORTANT: calling the function more than once per branch will lead to inconsistent changes over the request.Be sure you do the change only ONCE per branch. Note that calling the function from REQUEST ROUTE affects all the branches!, so no other change will be possible in the future. For per branch changes use BRANCH and FAILURE route.

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE and FAILURE\_ROUTE.

**Example�1.6.�`uac_replace_from`/`uac_replace_to` usage**

...
# replace both display and uri
uac\_replace\_from($avp(display),$avp(uri));
# replace only display and do not touch uri
uac\_replace\_from("batman","");
# remove display and replace uri
uac\_replace\_from("","sip:robin@gotham.org");
# remove display and do not touch uri
uac\_replace\_from("","");
# replace the URI without touching the display
uac\_replace\_from( , "sip:batman@gotham.org");
...
				

  

### 1.4.2.� `uac_restore_from()` `uac_restore_to()`

This function will check if the FROM/TO URI was modified and will use the information stored in header parameter to restore the original FROM/TO URI value.

NOTE - this function should be used only if you configured MANUAL restoring of the headers (see restore\_mode param). For AUTO and NONE, there is no need to use this function.

This function can be used from REQUEST\_ROUTE.

**Example�1.7.�`uac_restore_from`/`uac_restore_to` usage**

...
uac\_restore\_from();
...
				

  

### 1.4.3.� `uac_auth()`

This function can be called only from failure route and will build the authentication response header and insert it into the request without sending anything. Credentials for buiding the authentication response will be taken from the list of credentials provided by the uac\_auth module (static or via AVPs).

As optional parameter, the function may receive a list of auth algorithms to be considered / supported during authentication:

*   MD5, MD5-sess
    
*   SHA-256, SHA-256-sess (may be missing, depends on lib support)
    
*   SHA-512-256, SHA-512-256-sess (may be missing, depends on lib support)
    

Note that the CSeq is automatically increased during authentication.

This function can be used from FAILURE\_ROUTE.

_NOTE:_ when used without dialog support, the _uac\_auth()_ function cannot be used for authenticating in-dialog requests, as there is no mechanism to store the CSeq changes that are required for ensuring the correctness of the dialog. The only exception are _BYE_ messages, which are the last messages within a call, hence no further adjustments are needed. The function can still be used for authenticating the initial INVITE though.

**Example�1.8.�`uac_auth` usage**

...
uac\_auth();
...
failure\_route\[check\_auth\] {
    ...
    if ($T\_reply\_code==407) {
        if (uac\_auth("MD5,MD5-sess")) {
            # auth is succesful, just relay
            t\_relay();
            exit;
        }
        # auth failed (no credentials maybe)
        # so continue handling the 407 reply
    }
    ...
}
...