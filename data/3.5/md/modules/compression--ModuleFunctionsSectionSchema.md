## 1.7.�Exported Functions

### 1.7.1.� `mc_compress([algo], flags, [whitelist])`

This function will compress the current message as specified in the parameters. Keep in mind that the compression is done just before the message is sent, so that all your lumps can be applied.

Meaning of the parameters is as follows:

*   _algo_ (int, optional) - The algorithm used for compression. Currently implemented are deflate ('0') and gzip ('1').
    
*   _flags_ (string) - Specifies on what to apply the compression and where to put the result of the compression.
    
    The _flags_ parameter can have the following values:
    
    *   “b” - specifies that the body of the message shall be compressed. Notice that if the message has no body, the flag will have no effect.
        
    *   “h” - specifies that all the headers, except the mandatory ones (which will be specified in "whitelist" parameter section) and the ones in the whitelist shall be compressed.
        
    *   “s” - the headers and the body shall be compressed Separately, meaning that a new header named "Comp-Hdrs" will be created, and this header will keep the content of the compressed headers. Also, "Headers-Encoding" header will be created in order to keep the algorithm used to compress the headers. If this flag is not specified, the headers and the body (if 'b' and 'h' flags are specified) will be compressed alltogether in the new body of the message.
        
    *   “e” - specify that you want base64 Encoding. If you do not specify this flag, by default the module will send the raw compressed message in deflate/gzip format.
        
    
*   _whitelist_ (string, optional) - header names list, separated by '|' which will specify which headers shall not be compressed, along with the mandatory ones, which can never be compressed. The mandatory headers are the following: VIA, FROM, TO, CSEQ, ROUTE, RECORD\_ROUTE, CALLID. Also, CONTENT\_TYPE is mandatory only if CONTENT-LENGTH > 0. Also, in case you do not want to use body compression, the Content-Length header will become a mandatory header, which can not be compressed. In case you do want body compression, the old Content-Length Header will be compressed, and a new content length will be calculated. When you will want to do decompression, the compressed length will be removed, and the content length header will be the same as the one before the compression.
    

This function can be used from REQUEST\_ROUTE, LOCAL\_ROUTE, FAILURE\_ROUTE.

**Example�1.2.�`mc_compress` usage**

...
if (!mc\_compress(0, "bhs", "Max-Forwards|Subject|P-Asserted-Identity"))
	xlog("compression failed\\n");
...
	

  

**Example�1.3.�`mc_compress` usage**

...
$avp(algo) = 1;
$var(flags) = "bs";
$var(list) = "Max-Forwards | Contact";
mc\_compres($avp(algo), $var(flags), $var(list);
xlog("compression registered\\n");
...
	

  

### 1.7.2.� `mc_compact([whitelist], flags)`

This function will realise four different things: headers which are not mandatory and are not in the whitelist will be removed, headers of same type will be merged together, separated by ',', header names which have a short form will be reduced to that short form (unless the _n_ flag has been set) and SDP rtpmap attribute headers which contain a value lower than 96 will be removed, because they are not mandatory. Lumps are not affected by this function, because it is applied after all messages changes are processed. done. The _mc\_compact_ supported short forms are:

*   “c” - Content-Type (RFC 3261)
    
*   “f” - From (RFC 3261)
    
*   “i” - Call-ID (RFC 3261)
    
*   “k” - Supported (RFC 3261)
    
*   “l” - Content-Length (RFC 3261)
    
*   “m” - Contact (RFC 3261)
    
*   “s” - Subject (RFC 3261)
    
*   “t” - To (RFC 3261)
    
*   “v” - Via (RFC 3261)
    
*   “x” - Session-Expires (RFC 4028)
    

Meaning of the parameters is as follows:

*   _whitelist_ (string, optional) - Whitelist of headers not to be removed, except from the mandatory ones. The whitelist header names must pe separated by '|'.
    
*   _flags_ (string) - Controls the behavior of the function. Possible flags are:
    
    *   “n” - Do not use short form of headers.
        
    

This function can be used from REQUEST\_ROUTE, LOCAL\_ROUTE, FAILURE\_ROUTE.

**Example�1.4.�`mc_compress` usage**

...
if (!mc\_compact("Max-Forwards|P-Asserted-Identity"))
	xlog("compaction failed\\n");
...
	

  

### 1.7.3.� `mc_decompress()`

This function does the reverse of mc\_compress, meaning that it does base64 decoding and gzip/deflate decompression. Keep in mind that gzip decompression is a little bit more efficient because it is being known the size of the compressed buffer as against deflate which does not hold the size of the buffer, so the decompression will be made in a static buffer.

This function requests no parameters.

WARNING: This function replaces the original buffer of the message with the decompressed buffer, so any processing you do to the message will not be taken into consideration. Try applying the decompression function, before you do any other processing to the message.

This function can be used from REQUEST\_ROUTE, LOCAL\_ROUTE, FAILURE\_ROUTE.

**Example�1.5.�`mc_decompress` usage**

...
if (!mc\_decompress())
	xlog("decompression failed\\n");
...