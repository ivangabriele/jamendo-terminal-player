#!/bin/bash

cvlc --loop "${PWD}/../data/playlist.m3u" >> "${PWD}/../data/start.log" 2>&1
