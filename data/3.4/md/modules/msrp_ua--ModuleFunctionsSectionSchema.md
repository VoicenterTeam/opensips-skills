## 1.5.�Exported Functions

### 1.5.1.� `msrp_ua_answer(content_types)`

This functions answers an initial INVITE offering a new MSRP messaging session. After this function is used to initialize the session, the call will be completely handled by the B2B engine.

Parameters:

*   _content\_types_ (string) - content types adevertised in the _accept-types_ SDP attribute. At least one of the content types in this list must match the types offered by the peer in its SDP offer.
    

This function can be used only from a request route.

**Example�1.7.�`msrp_ua_answer()` usage**

...
if (!has\_totag() && is\_method("INVITE")) {
	msrp\_ua\_answer("text/plain");
	exit;
}
...