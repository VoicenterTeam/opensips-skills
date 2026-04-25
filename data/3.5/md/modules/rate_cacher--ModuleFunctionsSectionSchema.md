## 1.4.�Exported Functions

### 1.4.1.� `get_client_price(client_id,is_wholesale,dialled_no,prefix_pvar,destination_pvar,price_pvar,minimum_pvar,increment_pvar)`

For a call originating from the provided Client ID, on a wholesale or retail quality, going to dialled\_no, the function will matched the dialled number against the client's ratesheet and return the matched prefix, destination, price, minimum and increment.

The _client\_id_ pseudo-var will hold the client\_id originating this call

The _is\_wholesale_ pseudo-var will contain either a 1 or a 0, depending on whether the call is wholesale or retail ( see client ratesheet provisioning ).

The _dialled\_no_ pseudo-var contains the DNIS - the dialled number for the current call. It needs to be in E164 format, without the leading +

The _prefix_ pseudo-var will contain the matched prefix from the client's ratesheet

The _destination_ pseudo-var will contain the matched destination from the client's ratesheet

The _price_ pseudo-var will contain the matched price from the client's ratesheet

The _minimum_ pseudo-var will contain the matched minimum from the client's ratesheet

The _increment_ pseudo-var will contain the matched increment from the client's ratesheet

Possible parameter types

*   _ALL Parameters_ - String/Integer or pseudo-variables
    

This function can be used from any route.

**Example�1.9.�`get_client_price` usage**

...
if (get\_client\_price("my\_client",1,"4072794242",$var(prefix),$var(dest),$var(price),$var(min),$var(inc))) {
                        xlog("We matched $var(prefix) , $var(dest) , $var(price) , $var(min) , $var(inc) for the client's ratesheet\\n");
                }

...

  

### 1.4.2.� `get_vendor_price(vendor_id,dialled_no,prefix_pvar,destination_pvar,price_pvar,minimum_pvar,increment_pvar)`

For a call originating going to the provided vendor ID, going to dialled\_no, the function will matched the dialled number against the vendor's ratesheet and return the matched prefix, destination, price, minimum and increment.

The _vendor\_id_ pseudo-var will hold the vendor\_id

The _dialled\_no_ pseudo-var contains the DNIS - the dialled number for the current call. It needs to be in E164 format, without the leading +

The _prefix_ pseudo-var will contain the matched prefix from the vendor's ratesheet

The _destination_ pseudo-var will contain the matched destination from the vendor's ratesheet

The _price_ pseudo-var will contain the matched price from the vendor's ratesheet

The _minimum_ pseudo-var will contain the matched minimum from the vendor's ratesheet

The _increment_ pseudo-var will contain the matched increment from the vendor's ratesheet

Possible parameter types

*   _ALL Parameters_ - String/Integer or pseudo-variables
    

This function can be used from any route.

**Example�1.10.�`get_vendor_price` usage**

...
if (get\_vendor\_price("my\_vendor","4072794242",$var(prefix),$var(dest),$var(price),$var(min),$var(inc))) {
                        xlog("We matched $var(prefix) , $var(dest) , $var(price) , $var(min) , $var(inc) for the vendor's ratesheet\\n");
                }

...

  

### 1.4.3.� `cost_based_filtering(client_id,is_wholesale,vendors_csv,dialled_no,desired_margin,out_vendor_csv)`

For a call originating from the provided Client ID, on a wholesale or retail quality, going to dialled\_no, the function removes the Vendors ( from the vendor\_csv list ) which do not pass the desired\_margin condition, and sets the out\_vendor\_csv variable to the list of Vendor that meet the margin condition, while maintaining the initial order provided in the vendor\_csv variable.

The _client\_id_ pseudo-var will hold the client\_id originating this call

The _is\_wholesale_ pseudo-var will contain either a 1 or a 0, depending on whether the call is wholesale or retail ( see client ratesheet provisioning ).

The _vendors\_csv_ pseudo-var contains a list of Vendors that need to be filtered based on the desired margin ( keep just those that match your desired percentage margin for this call )

The _dialled\_no_ pseudo-var contains the DNIS - the dialled number for the current call. It needs to be in E164 format, without the leading +

The _desired\_margin_ pseudo-var contains the minimum Integer margin that the script writer wants to achieve, based on the Client sell and Vendor buy prices. The formula used is : vendor\_margin=(client\_price - results\[i\])\*100/client\_price) . If the vendor\_margin is higher than the desired\_margin, then the Vendor is ok to use. The desired margin can be positive ( call will be profitable ) or negative ( the call will cause a loss ).

The _out\_vendors\_csv_ pseudo-var is an output parameter, and the pvar will get populated with the CSV list of Vendors that meet the desired margin condition

Possible parameter types

*   _ALL Parameters_ - String/Integer or pseudo-variables
    

This function can be used from a REQUEST or FAILURE route.

**Example�1.11.�`cost_based_filtering` usage**

...


# If we get a call from testClient on it's wholesale quality,
# going to number 40720018124, and we have to pick from the list 
# of vendors 'testVendor,testVendor2' based on a a profit margin 
# of 0 ( we do not want to lose money on this call ),
# then $avp(out\_vendor\_csv) will have the vendors that we need 
# to use based on the above call characteristics, the order of the
# vendors that was provided in $avp(carrierlist) and the desired margin
$avp(client\_id)="testClient";
$avp(is\_ws)=1;  
$avp(carrierlist)="testVendor,testVendor2";
$avp(dnis)="40720018124";
$avp(profit\_margin)=0;

if (cost\_based\_filtering("$avp(client\_id)","$avp(is\_ws)","$avp(carrierlist)","$avp(dnis)","$avp(profit\_margin)","$avp(out\_vendor\_result)")) {
	xlog("XXX - Out of the $avp(carrierlist) carriers, we should only use $avp(out\_vendor\_result) \\n");
...

  

### 1.4.4.� `cost_based_ordering(client_id,is_wholesale,vendors_csv,dialled_no,desired_margin,out_vendor_csv)`

For a call originating from the provided Client ID, on a wholesale or retail quality, going to dialled\_no, the function removes the Vendors ( from the vendor\_csv list ) which do not pass the desired\_margin condition, and sets th out\_vendor\_csv variable to the list of Vendor that meet the margin condition, in descending order of their margin ( from most profitable Vendor to least profitable Vendor that still meets the margin condition )

The _client\_id_ pseudo-var will hold the client\_id originating this call

The _is\_wholesale_ pseudo-var will contain either a 1 or a 0, depending on whether the call is wholesale or retail ( see client ratesheet provisioning ).

The _vendors\_csv_ pseudo-var contains a list of Vendors that need to be filtered based on the desired margin ( keep just those that match your desired percentage margin for this call )

The _dialled\_no_ pseudo-var contains the DNIS - the dialled number for the current call. It needs to be in E164 format, without the leading +

The _desired\_margin_ pseudo-var contains the minimum Integer margin that the script writer wants to achieve, based on the Client sell and Vendor buy prices. The formula used is : vendor\_margin=(client\_price - results\[i\])\*100/client\_price) . If the vendor\_margin is higher than the desired\_margin, then the Vendor is ok to use. The desired margin can be positive ( call will be profitable ) or negative ( the call will cause a loss ).

The _out\_vendors\_csv_ pseudo-var is an output parameter, and the pvar will get populated with the CSV list of Vendors that meet the desired margin condition

Possible parameter types

*   _ALL Parameters_ - String/Integer or pseudo-variables
    

This function can be used from any route.

**Example�1.12.�`cost_based_ordering` usage**

...
# If we get a call from testClient on it's wholesale quality,
# going to number 40720018124, and we have to pick from the list 
# of vendors 'testVendor,testVendor2' based on a a profit margin 
# of 0 ( we do not want to lose money on this call ),
# then $avp(out\_vendor\_csv) will have the vendors that we need 
# to use based on the above call characteristics, and the desired margin
# The order in $avp(carrierlist) does not matter, the vendors will be
# ordered from most profitable to least profitable
$avp(client\_id)="testClient";
$avp(is\_ws)=1;  
$avp(carrierlist)="testVendor,testVendor2";
$avp(dnis)="40720018124";
$avp(profit\_margin)=0;

if (cost\_based\_ordering("$avp(client\_id)","$avp(is\_ws)","$avp(carrierlist)","$avp(dnis)","$avp(profit\_margin)","$avp(out\_vendor\_result)")) {
	xlog("XXX - Out of the $avp(carrierlist) carriers, we should only use $avp(out\_vendor\_result) , in the provided order\\n");

...