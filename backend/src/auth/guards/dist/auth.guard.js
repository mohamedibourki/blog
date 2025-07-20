"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.AuthGuard = void 0;
var common_1 = require("@nestjs/common");
var jwt = require("jsonwebtoken"); // Ensure installed: npm install jsonwebtoken
var AuthGuard = /** @class */ (function () {
    function AuthGuard() {
    }
    AuthGuard.prototype.canActivate = function (context) {
        var _a;
        // Access the HTTP request object
        var request = context.switchToHttp().getRequest();
        // Step 1: Get the access token from cookies
        var token = (_a = request.cookies) === null || _a === void 0 ? void 0 : _a.accessToken;
        // Step 2: If no token, reject request
        if (!token)
            throw new common_1.UnauthorizedException('Access token not found in cookies');
        try {
            // Step 3: Verify token (replace 'your-secret-key' with your .env JWT secret)
            var decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'your-secret-key');
            // Step 4: Attach decoded user to request object
            request['user'] = decoded;
            // Step 5: Allow request
            return true;
        }
        catch (error) {
            // If token invalid, reject request
            throw new common_1.UnauthorizedException('Invalid access token');
        }
    };
    AuthGuard = __decorate([
        common_1.Injectable()
    ], AuthGuard);
    return AuthGuard;
}());
exports.AuthGuard = AuthGuard;
