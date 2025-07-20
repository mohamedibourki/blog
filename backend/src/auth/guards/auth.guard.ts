import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken'; // Ensure installed: npm install jsonwebtoken
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Access the HTTP request object
    const request = context.switchToHttp().getRequest<Request>();

    // Step 1: Get the access token from cookies
    const token = request.cookies?.accessToken as string;

    // Step 2: If no token, reject request
    if (!token)
      throw new UnauthorizedException('Access token not found in cookies');

    try {
      // Step 3: Verify token (replace 'your-secret-key' with your .env JWT secret)
      const decoded = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET || 'your-secret-key',
      );

      // Step 4: Attach decoded user to request object
      request['user'] = decoded;

      // Step 5: Allow request
      return true;
    } catch (error) {
      // If token invalid, reject request
      throw new UnauthorizedException('Invalid access token');
    }
  }
}
