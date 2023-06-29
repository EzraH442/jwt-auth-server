import { HttpRequest, HttpResponse } from 'uWebSockets.js';
import { readFileSync } from 'node:fs';
import jwt, { JsonWebTokenError, JwtPayload } from 'jsonwebtoken';
import readFormencodedData from './util';
import getToken from './auth_handler';

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
  res.aborted = false;
  if (req.getHeader('Content-Type') !== 'x-ww-urlformencoded') {
    res.writeStatus('400 Bad Request');
  }

  res.onAborted(() => {
    res.aborted = true;
  });
  if (res.aborted) return;

  readFormencodedData(
    res,
    (data) => {
      const email = data.get('email');
      const password = data.get('password');

      // if email/password combo is invalid
      console.log(`got request email: ${email} password: ${password}`);

      if (!email || !password) {
        res.end(JSON.stringify({ success: false, err: 'Invalid' }));
        return;
      }

      const fileData = JSON.parse(
        readFileSync('./users.json', 'utf-8'),
      ) as FileData;

      let isValid = false;
      for (let i = 0; i < fileData.users.length; i++) {
        const user = fileData.users[i];
        if (user.email === email && user.password === password) {
          isValid = true;
          break;
        }
      }

      if (!isValid) {
        res.end(JSON.stringify({ success: false, err: 'Invalid' }));
      } else {
        try {
          const token = getToken(email);
          res.end(JSON.stringify({ success: true, token }));
        } catch (err) {
          console.error(err);
          res.end(JSON.stringify({ success: false, err: 'Unknown error' }));
        }
      }
    },
    () => {
      res.aborted = true;
    },
  );
};

const verifyHandler = (res: HttpResponse, req: HttpRequest) => {
  res.aborted = false;
  if (req.getHeader('Content-Type') !== 'x-ww-urlformencoded') {
    res.writeStatus('400 Bad Request');
  }

  res.onAborted(() => {
    res.aborted = true;
  });
  if (res.aborted) return;

  readFormencodedData(
    res,
    (data) => {
      const token = data.get('token');

      if (!token) {
        res.end(JSON.stringify({ valid: false, errors: ['missing token'] }));
        return;
      }

      jwt.verify(token, process.env.SECRET_KEY!, (err, decoded) => {
        if (err as JsonWebTokenError) {
          if (err!.name === 'TokenExpiredError') {
            res.end(
              JSON.stringify({ valid: false, error: ['Session expired'] }),
            );
          } else if (err!.name === 'JsonWebTokenError') {
            res.end(
              JSON.stringify({ valid: false, error: ['Session expired'] }),
            );
          } else {
            res.end(JSON.stringify({ valid: false, error: ['Unknown error'] }));
            console.error(err);
          }
        } else {
          console.log(`verified token for ${(decoded as Jwt).email}`);
          res.end(JSON.stringify({ valid: true }));
        }
      });
    },
    () => {
      res.aborted = true;
    },
  );
};

export { authHandler, verifyHandler };
