# Endpoints

Listing of the different endpoint available on the Xiaomi Router
Example of response json can be found under end_point_reference/

- `/api/xqsystem/reboot`                <!-- requires {"client":"web"} in body param ? -->
- `/api/xqsystem/shutdown`
- `/api/xqsystem/reset`
- `/api/xqsystem/get_languages`         get_languages.json
- `/api/misystem/router_name`           router_name.json
- `/api/misystem/r_ip_conflict`         r_ip_conflict.json
- `/api/xqnetdetect/nettb`              nettb.json
- `/api/misystem/devicelist`            devicelist.json
- `/api/xqnetwork/wifi_detail_all`      wifi_detail_all.json
- `/api/misystem/status`                status.json
- `/api/xqnetwork/pppoe_status`         pppoe_status.json
- `/api/misystem/active`                active.json <- I suppose this serve as keep_alive


This 2 endpoints trigger a speedtest and need several second to respond, timeout
should be set in consequence (about 15 seconds according to my test, could
be much longer if the connection is slow)
/api/misystem/bandwidth_test bandwidth_test.json
/api/xqnetdetect/netupspeed     netupspeed.json


Endpoint for which required parameter are unknown:
- `/api/xqsystem/set_languages`
- `/api/misystem/set_router_name`
- `/api/misystem/set_band`
- `/api/xqsystem/set_mac_filter` <- you might lock yourself out if you call this


Endpoint with unknown function:
- `/api/misystem/messages`               messages.json
- `/api/misystem/vas_switch`
- `/api/misystem/vas_info`

Web interface endpoint:
- `/web/home`
- `/web/store`
- `/web/setting/wifi`
- `/web/prosetting/qos`
- `/web/setting/upgrade`
- `/web/setting/wan#netmode`

This endpoint only deliver an "Internal Server Error":
/api/xqdatacenter/request