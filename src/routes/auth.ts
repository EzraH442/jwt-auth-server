import { HttpRequest, HttpResponse } from 'uWebSockets.js';
import { readFileSync } from 'node:fs';
import { readFormencodedData, verifyCaptcha } from '../util';
import getToken from '../auth_handler';
import LoginResponse from '../responses/login_response';

interface User {
  email: string;
  password: string;
}

interface FileData {
  users: User[];
}

const authHandler = (res: HttpResponse, req: HttpRequest) => {
  res.aborted = false;
  if (req.getHeader('Content-Type') !== 'x-ww-urlformencoded') {
    const response = new LoginResponse('400 Bad Request', false, []);
    response.process(req, res);
  }

  res.onAborted(() => {
    res.aborted = true;
  });
  if (res.aborted) return;

  readFormencodedData(
    res,
    async (data) => {
      const email = data.get('email');
      const password = data.get('password');
      const captcha = data.get('captcha');

      console.log(
        `got request email: ${email} password: ${password} token: ${captcha}`,
      );

      if (!email || !password || !captcha) {
        const response = new LoginResponse('400 Bad Request', false, []);
        response.process(req, res);
        return;
      }

      let captchaSucess = false;

      await verifyCaptcha(captcha).then((captchaResponse) => {
        console.log(JSON.stringify(captchaResponse, null, 2));
        if (!(captchaResponse as any).success) {
          return;
        }
        captchaSucess = true;
      });

      if (!captchaSucess) {
        const response = new LoginResponse('200 OK', false, ['Captcha error']);
        response.process(req, res);
        return;
      }

      const fileData = JSON.parse(
        readFileSync('./users.json', 'utf-8'),
      ) as FileData;

      let validUser = false;

      for (let i = 0; i < fileData.users.length; i++) {
        const user = fileData.users[i];
        console.log(`checking email ${user.email}`);
        if (user.email === email && user.password === password) {
          console.log(`found match`);
          validUser = true;
          break;
        }
      }

      if (!validUser) {
        const response = new LoginResponse('200 OK', false, [
          'Invalid username or password',
        ]);
        response.process(req, res);
      } else {
        try {
          const token = getToken(email);
          const response = new LoginResponse('200 OK', true, [], token);
          response.process(req, res);
        } catch (err) {
          console.error(err);
          const response = new LoginResponse(
            '500 Internal Server Error',
            false,
            [],
          );
          response.process(req, res);
        }
      }
    },
    () => {
      res.aborted = true;
    },
  );
};

export default authHandler;
