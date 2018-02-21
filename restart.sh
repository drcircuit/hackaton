#!/bin/bash
set -e
cd /hackroot/code
git pull origin master
sudo killall node nodejs nohup | true
npm install
sudo nohup node ./index.js &>> /hackroot/server.log&