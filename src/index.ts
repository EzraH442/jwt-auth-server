import uws from 'uWebSockets.js';
import 'dotenv/config';
import authHandler from './routes/auth';
import verifyHandler from './routes/verify';

const port = 3001;

const app = uws.App({});

if (!process.env.SECRET_KEY) {
  console.warn('missing jwt secret key');
}
if (!process.env.HC_SECRET) {
  console.warn('missing hcaptcha secret');
}
if (!process.env.HC_SITEKEY) {
  console.warn('missing hcaptcha sitekey');
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
