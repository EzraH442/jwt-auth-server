import jwt from 'jsonwebtoken';

const getToken = (email: string) =>
  jwt.sign({ email }, process.env.SECRET_KEY!, {
    algorithm: 'HS256',
    expiresIn: '1h',
  });

export default getToken;
