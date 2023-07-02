import { HttpRequest, HttpResponse } from 'uWebSockets.js';
import jwt, { JsonWebTokenError, JwtPayload } from 'jsonwebtoken';
import { readFormencodedData } from '../util';
import VerifyResponse from '../responses/verify_response';

interface Jwt extends JwtPayload {
  email: string;
}

const verifyHandler = async (res: HttpResponse, req: HttpRequest) => {
  res.onAborted(() => {
    res.aborted = true;
  });

  if (req.getHeader('content-type') !== 'application/x-www-form-urlencoded') {
    const response = new VerifyResponse('400 Bad Request', false, []);
    response.process(req, res);
    return;
  }

  const data = await readFormencodedData(res);
  console.log(`data is ${data}`);
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
};

export default verifyHandler;
