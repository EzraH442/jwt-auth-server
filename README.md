to use: add 2 files

`./users.json`: json file with format:
```json
{
  "users": [
    {"email": "an email", "password": "a password"},
    {"email": "an email", "password": "a password"}
  ]
}
```

`.env`: env file with following keys:

`SECRET_KEY`: 32 random bytes (`openssl rand -hex 32`)

`HC_SECRET`: hcaptcha secret key

`HC_SITEKEY`: hcaptcha site key
