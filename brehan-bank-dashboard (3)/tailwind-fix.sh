#!/bin/bash

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm

# Use the correct Node.js version
nvm use v18.20.8

# Clean the project
rm -rf .next
rm -rf node_modules
rm package-lock.json

# Install dependencies
npm install

# Install tailwind and required packages
npm install -D tailwindcss@latest postcss autoprefixer
npm install -D tailwindcss-animate

# Initialize tailwind
npx tailwindcss init -p

# Start the dev server
echo "Tailwind fixed. Starting the dev server..."
npm run dev 