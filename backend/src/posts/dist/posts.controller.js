"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
exports.__esModule = true;
exports.PostsController = void 0;
var common_1 = require("@nestjs/common");
var auth_guard_1 = require("src/auth/guards/auth.guard");
var role_decorator_1 = require("src/auth/decorators/role.decorator");
var roles_guard_1 = require("src/auth/guards/roles.guard");
var PostsController = /** @class */ (function () {
    function PostsController(postsService) {
        this.postsService = postsService;
    }
    PostsController.prototype.create = function (createPostDto) {
        return this.postsService.create(createPostDto);
    };
    PostsController.prototype.findAll = function () {
        return this.postsService.findAll();
    };
    PostsController.prototype.findOne = function (id) {
        return this.postsService.findOne(id);
    };
    PostsController.prototype.update = function (id, updatePostDto) {
        return this.postsService.update(id, updatePostDto);
    };
    PostsController.prototype.remove = function (id) {
        return this.postsService.remove(id);
    };
    __decorate([
        role_decorator_1.Roles('admin', 'author'),
        common_1.Post(),
        common_1.HttpCode(201),
        __param(0, common_1.Body())
    ], PostsController.prototype, "create");
    __decorate([
        common_1.Get()
    ], PostsController.prototype, "findAll");
    __decorate([
        common_1.Get(':id'),
        __param(0, common_1.Param('id'))
    ], PostsController.prototype, "findOne");
    __decorate([
        role_decorator_1.Roles('admin', 'author'),
        common_1.Patch(':id'),
        __param(0, common_1.Param('id')),
        __param(1, common_1.Body())
    ], PostsController.prototype, "update");
    __decorate([
        role_decorator_1.Roles('admin', 'author'),
        common_1.Delete(':id'),
        __param(0, common_1.Param('id'))
    ], PostsController.prototype, "remove");
    PostsController = __decorate([
        common_1.UseGuards(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
        common_1.Controller('posts')
    ], PostsController);
    return PostsController;
}());
exports.PostsController = PostsController;
