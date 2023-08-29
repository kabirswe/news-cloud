#!/usr/bin/env bash
set -ex
if [ -d "/node/build" ]
then 
   echo "Deleting existing build..."
   rm -rf /node/build
fi
echo "Production Build  Start ..."
npm run build:production
