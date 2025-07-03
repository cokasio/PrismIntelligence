@echo off
echo "Installing root dependencies..."
npm install

echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "All dependencies installed!"
