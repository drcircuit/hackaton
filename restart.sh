#!/bin/bash
set -e
cd /hackroot/code
git pull origin master
./stage2.sh