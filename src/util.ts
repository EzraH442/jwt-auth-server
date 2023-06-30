import axios from 'axios';
import { HttpRequest, HttpResponse } from 'uWebSockets.js';

const readFormencodedData = (
  res: HttpResponse,
  cb: (data: URLSearchParams) => void,
  onAborted: VoidFunction,
) => {
  let buf: Buffer;
  res.onData((data, isLast) => {
    const chunk = Buffer.from(data);
    if (isLast) {
      if (chunk) {
        if (buf) Buffer.concat([buf, chunk]);
        else {
          buf = Buffer.concat([chunk]);
        }
      }
      const querystring = new URLSearchParams(buf.toString());
      cb(querystring);
    }

    if (buf) Buffer.concat([buf, chunk]);
    else {
      buf = Buffer.concat([chunk]);
    }
  });

  res.onAborted(onAborted);
};

const verifyCaptcha = (token: string) => {
  const params = new URLSearchParams({
    response: token,
    secret: process.env.HC_SECRET!,
    sitekey: process.env.HC_SITEKEY!,
  });
  
  return axios
    .post('https://hcaptcha.com/siteverify', params)
    .then((res) => res.data);
}

function setCorsHeaders(request: HttpRequest, response: HttpResponse) {
  const origin = request.getHeader('origin');

  console.log(`got request from origin ${origin}`);

  if (origin.endsWith('ezrahuang.com')) {
    response.writeHeader('Access-Control-Allow-Origin', `http://${origin}`);
    response.writeHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS',
    );
    response.writeHeader(
      'Access-Control-Allow-Headers',
      'origin, content-type, accept, x-requested-with',
    );
    response.writeHeader('Access-Control-Max-Age', '3600');
  }
  response.onAborted(() => {});
}

export { readFormencodedData, verifyCaptcha, setCorsHeaders };
