#!/bin/bash
set -e
cd /hackaton
git pull origin master
killall node nodejs
node ./index.js