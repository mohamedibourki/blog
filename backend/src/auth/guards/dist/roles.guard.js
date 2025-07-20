"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.RolesGuard = void 0;
var common_1 = require("@nestjs/common");
var RolesGuard = /** @class */ (function () {
    function RolesGuard(reflector) {
        this.reflector = reflector;
    }
    RolesGuard.prototype.canActivate = function (context) {
        var requiredRoles = this.reflector.get('roles', context.getHandler());
        if (!requiredRoles)
            return true; // No roles required
        var request = context.switchToHttp().getRequest();
        var user = request['user']; // From AuthGuard
        if (!user || !requiredRoles.includes(user.role)) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return true;
    };
    RolesGuard = __decorate([
        common_1.Injectable()
    ], RolesGuard);
    return RolesGuard;
}());
exports.RolesGuard = RolesGuard;
