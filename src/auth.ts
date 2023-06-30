import jwt, {JsonWebTokenError, JwtPayload} from 'jsonwebtoken';
import {readFileSync} from 'node:fs';
import {HttpRequest, HttpResponse} from 'uWebSockets.js';

import getToken from './auth_handler';
import {readFormencodedData, setCorsHeaders, verifyCaptcha} from './util';

interface User {
  email: string;
  password: string;
}

interface FileData {
  users: User[];
}

interface Jwt extends JwtPayload {
  email: string;
}

const authHandler = (res: HttpResponse, req: HttpRequest) => {
  // setCorsHeaders(req, res);

  res.aborted = false;
  if (req.getHeader('Content-Type') !== 'x-ww-urlformencoded') {
    res.writeStatus('400 Bad Request');
  }

  res.onAborted(() => { res.aborted = true; });
  if (res.aborted)
    return;

  readFormencodedData(
      res,
      async (data) => {
        const email = data.get('email');
        const password = data.get('password');
        const captcha = data.get('captcha');

        // if email/password combo is invalid
        console.log(`got request email: ${email} password: ${password} token: ${
            captcha}`);

        if (!email || !password || !captcha) {
          res.end(JSON.stringify({success : false, err : 'Invalid'}));
          return;
        }

        let captchaSucess = false;

        await verifyCaptcha(captcha).then((captchaResponse) => {
          console.log(JSON.stringify(captchaResponse, null, 2))
          if (!(captchaResponse as any).success) {
            return;
          }
          captchaSucess = true;
        });

        if (!captchaSucess) {
          res.writeStatus('200 OK')
          res.end(JSON.stringify({success : false, err : 'Captcha error'}));
          return;
        }

        const fileData = JSON.parse(
                             readFileSync('./users.json', 'utf-8'),
                             ) as FileData;

        let validUser = false;

        for (let i = 0; i < fileData.users.length; i++) {
          const user = fileData.users[i];
          console.log(`checking email ${user.email}`)
          if (user.email === email && user.password === password) {
            console.log(`found match`)
            validUser = true;
            break;
          }
        }

        if (!validUser) {
          res.writeStatus('200 OK')
          res.end(JSON.stringify({success : false, err : 'Invalid'}));
        } else {
          try {
            const token = getToken(email);
            res.writeStatus('200 OK')
            res.end(JSON.stringify({success : true, token}));
          } catch (err) {
            console.error(err);
            res.writeStatus('500 Internal Server Error')
            res.end(JSON.stringify({success : false, err : 'Unknown error'}));
          }
        }
      },
      () => { res.aborted = true; },
  );
};

const verifyHandler = (res: HttpResponse, req: HttpRequest) => {
  // setCorsHeaders(req, res);

  res.aborted = false;
  if (req.getHeader('Content-Type') !== 'x-ww-urlformencoded') {
    res.writeStatus('400 Bad Request').end({valid : false, error : ''})
  }

  res.onAborted(() => { res.aborted = true; });
  if (res.aborted)
    return;

  readFormencodedData(
      res,
      (data) => {
        const token = data.get('token');

        if (!token) {
          res.writeStatus('400 Bad Request')
          res.end(JSON.stringify({valid : false, error : 'missing token'}));
          return;
        }

        jwt.verify(token, process.env.SECRET_KEY!, (err, decoded) => {
          if (err as JsonWebTokenError) {
            if (err!.name === 'TokenExpiredError') {
              res.writeStatus('200 OK')
              res.end(
                  JSON.stringify({valid : false, error : 'Session expired'}),
              );
            } else if (err!.name === 'JsonWebTokenError') {
              res.writeStatus('200 OK')
              res.end(
                  JSON.stringify({valid : false, error : 'Session expired'}),
              );
            } else {
              res.writeStatus('500 Internal Server Error')
              res.end(JSON.stringify({valid : false, error : 'Unknown error'}));
              console.error(err);
            }
          } else {
            console.log(`verified token for ${(decoded as Jwt).email}`);
            res.writeStatus('200 OK');
            res.end(JSON.stringify({valid : true}));
          }
        });
      },
      () => { res.aborted = true; },
  );
};

export {authHandler, verifyHandler};
