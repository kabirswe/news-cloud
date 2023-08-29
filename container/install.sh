#!/usr/bin/env bash
set -ex
npm install --silent --production
npm install react-scripts@3.0.1 -g --slient
npm install node-sass --unsafe-perm
npm run genMods
npm run config
