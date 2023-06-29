import uws from 'uWebSockets.js';
import {authHandler, verifyHandler} from './auth';
import 'dotenv/config'

const port = 3001;

const app = uws.App({});

if (!process.env.SECRET_KEY) {
  console.warn("missing secret key");
}

app.listen(port, (token) => {
  if (token) {
    console.log(`Listening on port ${port}`);
  } else {
    console.log(`failed to start`);
  }
});

app.post('/auth', (res, req) => authHandler(res, req));
app.post('/verify', (res, req) => verifyHandler(res, req));