#!/bin/sh
uvicorn Backend.main:app --host 0.0.0.0 --port 8000 &
node Frontend/server.js
