#!/bin/bash

echo "🚀 Đang khởi động Backend..."
cd backend
node app.js & # <--- SỬA THÀNH NODE APP.JS Ở ĐÂY VÀ GIỮ LẠI DẤU &

echo "🎨 Đang khởi động Frontend..."
cd ../frontend
npm run dev