import axios from 'axios';
import { HttpResponse } from 'uWebSockets.js';

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

const verifyCaptcha = (token: string) =>
  axios
    .post('https://hcaptcha.com/siteverify', {
      secret: process.env.HC_SECRET,
      response: token,
      sitekey: process.env.HC_SITEKEY!,
    })
    .then((res) => JSON.parse(res.data));

export { readFormencodedData, verifyCaptcha };
