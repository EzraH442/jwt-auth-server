import Response from "./response";

class VerifyResponse extends Response {
  valid: boolean

  constructor(status: string, valid: boolean, errors: string[]) {
    super(status, errors);
    this.valid = valid;
  }

  buildBody() {
    return JSON.stringify({valid: this.valid, errors: this.errors})
  }
  
} 

export default VerifyResponse