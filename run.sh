#!/bin/bash

echo "🚀 Đang khởi động Backend..."
cd backend
node server.js &

echo "🎨 Đang khởi động Frontend..."
cd ../frontend
npm run dev