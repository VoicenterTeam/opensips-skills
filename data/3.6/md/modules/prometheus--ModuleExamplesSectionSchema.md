## 1.5.�Examples

In order to have Prometheus query OpenSIPS for statistics, you need to tell him where to get statistics from. To do that, you should define a scarpe job in Prometheus's _scrape\_configs_ config, indicating the IP and port you've configured the _httpd_ module to listen on (default: _0.0.0.0:8888_).

**Example�1.12.�Prometheus Scrape Config**

scrape\_configs:
  - job\_name: opensips

    static\_configs:
    - targets: \['localhost:8888'\]