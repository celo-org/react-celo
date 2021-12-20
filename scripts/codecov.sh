#!/bin/sh
set -x;

cd packages;

for package in *; do
    if [ -d "$package/coverage" ];  then
        cd $package;
        codecov -F $package --disable=gcov;
        cd ..;
    else
        echo "Skip! '$package' doesn't contain a coverage folder";
    fi

done