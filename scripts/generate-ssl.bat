@echo off

REM Create SSL directory
if not exist ssl mkdir ssl

REM Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ssl/key.pem -out ssl/cert.pem -subj "/C=US/ST=State/L=City/O=BioTraverse/OU=Development/CN=localhost"

echo SSL certificates generated in ssl/ directory
echo Certificate: ssl/cert.pem
echo Private Key: ssl/key.pem 