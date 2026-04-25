## 1.7.�Exported Functions

### 1.7.1.� `is_peer_verified`

Returns 1 if the message is received via TLS and the peer was verified during TLS connection handshake, otherwise it returns -1

This function can be used from REQUEST\_ROUTE.

**Example�1.1.�`is_peer_verified` usage**

...
if (is\_peer\_verified()) {
        xlog("L\_INFO","request from verified TLS peer\\n");
} else {
        xlog("L\_INFO","request not verified\\n");
}
...