import { HttpRequest, HttpResponse } from 'uWebSockets.js';
import jwt, { JsonWebTokenError, JwtPayload } from 'jsonwebtoken';
import { readFormencodedData } from '../util';
import VerifyResponse from '../responses/verify_response';

interface Jwt extends JwtPayload {
  email: string;
}

const verifyHandler = (res: HttpResponse, req: HttpRequest) => {
  res.aborted = false;
  if (req.getHeader('Content-Type') !== 'x-ww-urlformencoded') {
    const response = new VerifyResponse('400 Bad Request', false, []);
    response.process(req, res);
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
        const response = new VerifyResponse('400 Bad Request', false, []);
        response.process(req, res);
        return;
      }

      jwt.verify(token, process.env.SECRET_KEY!, (err, decoded) => {
        if (err as JsonWebTokenError) {
          if (err!.name === 'TokenExpiredError') {
            const response = new VerifyResponse('200 OK', false, [
              'Session expired',
            ]);
            response.process(req, res);
          } else if (err!.name === 'JsonWebTokenError') {
            const response = new VerifyResponse('200 OK', false, [
              'Session expired',
            ]);
            response.process(req, res);
          } else {
            const response = new VerifyResponse(
              '500 Internal Server Error',
              false,
              [],
            );
            response.process(req, res);
            console.error(err);
          }
        } else {
          const response = new VerifyResponse('200 OK', false, []);
          response.process(req, res);
          console.log(`verified token for ${(decoded as Jwt).email}`);
        }
      });
    },
    () => {
      res.aborted = true;
    },
  );
};

export default verifyHandler;
