#!/bin/bash
set -e
cd /hackroot/code
git pull origin master
killall node nodejs
node ./index.js