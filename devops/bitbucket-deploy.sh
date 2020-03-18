#!/usr/bin/env bash
echo "API deployment started."
cd /var/www/litekart/api
sudo tar xf arialshop.tar.gz -C /var/www/litekart/api
sudo tar xf arialshop.tar.gz -C /var/www/litekart/api2
sudo rm arialshop.tar.gz
sudo npm install --production
sudo pm2 reload lapi
echo "Site Litekart API-1 is Live."

echo "API2 deployment started."
cd /var/www/litekart/api2
sudo npm install --production
sudo pm2 reload lapi2
echo "Site Litekart API-2 is Live."
