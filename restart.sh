#!/bin/bash
set -e
cd /hackroot/code
git pull origin master
killall node nodejs | true
node ./index.js