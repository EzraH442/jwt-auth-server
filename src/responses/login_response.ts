import Response from "./response";

class LoginResponse extends Response {
  token: string | undefined

  success: boolean

  constructor(status: string, success: boolean, errors: string[], token: string | undefined =undefined) {
    super(status, errors);
    this.success = success;
    this.token = token;
  }

  buildBody() {
    const data = {success: this.success, errors: this.errors};
    return this.token ? JSON.stringify({...data, token: this.token}) : JSON.stringify(data);
  }
  
} 

export default LoginResponse