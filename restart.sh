#!/bin/bash
set -e
cd /hackroot
git pull origin master
killall node nodejs
node ./index.js