## 1.10.�Exported Pseudo-Variables

### 1.10.1.�`$siprec`

Used to modify/describe different siprec sessions parameters that should be taken into account by the [siprec\_start\_recording()](#func_siprec_start_recording "1.9.1.� siprec_start_recording(srs[, instance])") function.

The variable can be indexed with the _instance_ the user wants to tune the variable for. If missing, the the _default_ instance is being altered.

The context of this variable is only limited to the current message processed - it is not available at the transaction or dialog level.

Any of this setting is optional.

Settings that can be provisioned:

*   _group_ - an opaque value that will be inserted in the SIPREC body and represents the name of the group that can be used to classify calls in certain profiles. If missing, no group is added.
    
*   _caller_ - an XML block containing information about the caller. If absent, the _From_ header of the initial dialog is used to build the value.
    
*   _callee_ - an XML block containing information about the callee. If absent, the _To_ header of the initial dialog is used to build the value.
    
*   _media_ - the IP that RTPProxy will be streaming media from. If absent _127.0.0.1_ will be used. _NOTE:__media\_ip_ has been dropped.
    
*   _headers_ - extra headers that are to be added in the initial request towards the SRS. _NOTE:_ headers must be separated by _\\r\\n_ and must end with _\\r\\n_.
    
*   _socket_ - listening socket that the outgoing request towards SRS should be used.
    
*   _from\_uri_ - the URI to appear in the _From_ header of the dialog. Default value is the request URI. Note that this does not influence the _caller_ information in the XML block, which is taken from the initial dialog.
    
*   _to\_uri_ - the URI to appear in the _To_ header of the dialog. Default value is the request URI. Note that this does not influence the _callee_ information in the XML block, which is taken from the initial dialog.
    
*   _group\_custom\_extension_ - an optional XML block containing custom information to be added under the _group_ tag. _NOTE:_ if the _group_ is absent this value will be ignored and not used anywhere.
    
*   _session\_custom\_extension_ - an optional XML block containing custom information to be added under the _session_ tag.