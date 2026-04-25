## 1.9.�Exported Pseudo-Variables

### 1.9.1.�`$siprec`

Used to modify/describe different siprec sessions parameters that should be taken into account by the [siprec\_start\_recording()](#func_siprec_start_recording "1.8.1.� siprec_start_recording(srs)") function.

The context of this variable is only limited to the current message processed - it is not available at the transaction or dialog level.

Any of this setting is optional.

Settings that can be provisioned:

*   _group_ - an apaque value that will be inserted in the SIPREC body and represents the name of the group that can be used to clasify calls in certain profiles. If missing, no group is added.
    
*   _caller_ - an XML block containing information about the caller. If absent, the _From_ header is used to build the value.
    
*   _callee_ - an XML block containing information about the callee. If absent, the _To_ header is used to build the value.
    
*   _media_ - the IP that RTPProxy will be streaming media from. If absent _127.0.0.1_ will be used. _NOTE:_ deprecated _media\_ip_ is an alias for this param.
    
*   _headers_ - extra headers that are to be added in the initial request towards the SRS. _NOTE:_ headers must be separated by _\\r\\n_ and must end with _\\r\\n_.
    
*   _socket_ - listening socket that the outgoing request towards SRS should be used.