import { HttpRequest, HttpResponse } from "uWebSockets.js"
import { setCorsHeaders } from "../util"

abstract class Response {
  status: string;

  protected errors: string[]

  constructor(status: string, errors: string[]) {
    this.status = status;
    this.errors = errors
  }

  abstract buildBody(): string 

  process(req: HttpRequest, res: HttpResponse): void {
    res.writeStatus(this.status);
    setCorsHeaders(req, res);
    res.end(this.buildBody())
  }
}

export default Response