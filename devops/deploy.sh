#!/usr/bin/env bash
echo "API deployment started."
cd /var/www/litekart/api
npm install
pm2 reload litekart-api
echo "Site Litekart API-1 is Live."