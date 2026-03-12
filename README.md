# Update dulu
sudo apt update && sudo apt upgrade -y

# Install curl kalau belum ada
sudo apt install -y curl

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v && npm -v   
# pastikan v20.x.x

# Git Clone
git clone https://github.com/Joodev65/Botnet.git
cd Botnet

# Install
npm install
node index.js

# JooModdss - Calestial Phoenix