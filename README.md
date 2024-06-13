# NestJS Authentication

How to set up authentication in the NestJS.

Created based on the video [https://www.youtube.com/watch?v=TAYW3t1ajAY&ab_channel=WebMogilevtsev]()


## Steps

### Install new NestJS project
```npm
$ nest new auth
```
In the `main.ts` file define global prefix (`'api'`) and set server port (`5000`)  

Remove `AppController` and `AppService` (remove imports in the `AppModule` and delete files)  

Configure `.eslintrs.js` and `.prettierrc`  

Format project code
```npm
$ npm run format
```

### Prepare DataBase
Create `docker-compose.yml` file  

Start docker
```npm
$ docker-compose up -d
```
Define `DATABASE_URL` in the `.env` file according to data in the `docker-compose.yml` file  

### Initialize Prisma
[Nest Prisma doc](https://docs.nestjs.com/recipes/prisma)

```npm
$ npx prisma init
```

Create copy of `.env` file as `.env.example`  

Create schema in the `prisma/schema.prisma` file  

Migrate model to the database
```npm
$ npx prisma migrate dev --name init
```

Install `Prisma` and `PrismaClient` **if necessary**.  
*Usually they are installed automatically with the command `npx prisma init`*  

Create Prisma module and service
```npm
$ nest g mo prisma 
$ nest g s prisma
```

Implement `PrismaService` according to Nest Prisma documentation  

Export `PrismaService` in the `PrismaModule`  

Set `PrismaModule` as global with `@Global()` decorator to prevent import `PrismaModule` in each project module.  

Add Prisma aliases into `tsconfig.json` file  

### Create Users API with CRUD
Generate resource
```npm
$ nest g res
```

Add Users aliases into `tsconfig.json` file  

Define Users DTO  

Inject `PrismaService` into `UsersService`  

Implement methods in the `UsersService` using `PrismaService`

### Hashing Passwords
install `bcrypt` and his types
```npm
$ npm install bcrypt
$ npm install -D @types/bcrypt
```
In the `UsersService` create private method that will returns hashed passwords  

Define hash password method in the `create()` and `update()` methods

### Check Users endpoints in the `UsersController`

### Create Auth API
Generate resource
```npm
$ nest g res
```
*`? Would you like to generate CRUD entry points? (Y/n)` - enter "n"*  

Create aliases for `Auth` in the `tsconfig.json` file.  

In the `AuthModule` import `UsersModule`.  

In the `UsersModule` export `UserService` to use it in the import.  

### Add Nest Configuration Module globally in project
install Nest `ConfigModule`
```npm
$ npm i --save @nestjs/config
```

Import `ConfigModule` globally in the `AppModule`  

*Now you can get the value of an environment variable anywhere in the application by injecting
`ConfigService` and using its `get()` method*  

### Apply Passport
[Nest Passport (authentication) doc](https://docs.nestjs.com/recipes/passport)  
[Nest Passport JWT doc](https://docs.nestjs.com/recipes/passport#jwt-functionality)

Install dependencies
```npm
$ npm install --save @nestjs/passport passport @nestjs/jwt passport-jwt
$ npm install --save-dev @types/passport-jwt
```

In the `.env` file add `JWT_SECRET` and `JWT_EXPIRES_IN` environment variables  

Prepare options for registering the `JwtModule` module:
- Create `src/auth/config` folder
- Create a file `src/config/jwt-module-async-options.ts`
- Define in it options for registering the `JwtModule` module
- Create `src/auth/config/index.ts` file and export the `jwt-module-async-options.ts` file in it

In the `AuthModule` import `PassportModule` and `JwtModule` and then register
`JwtModule` using `registerAsync()` method  and options from config.  

### Setup DTO validation
[Nest Validation doc](https://docs.nestjs.com/techniques/validation)

Install dependencies
```npm
$ npm i --save class-validator class-transformer
```

Bind `ValidationPipe` at the application level in the `main.ts` file.

Now we can add a few validation rules in our DTOs.  


### Create DTO for register

### Create Custom Validator for passwords compare
create `common` lib 
```npm
$ nest g lib common
```
*Set prefix `@common`*  

In the `tsconfig.json` file correct aliases for `common` lib.  

Remove all files in the `libs/common/src` folder.  

Create `libs/common/src/decorators` folder and `is-password-match-constraint.decorator.ts` file in it.  

Create class `IsPasswordsMatch` that implements `ValidatorConstraintInterface`
and define `validate` and `defaultMessage` methods.  

Create `libs/common/src/decorators/index.ts` file and export 
`is-password-match-constraint.decorator.ts` in it.  

Apply `IsPasswordsMatch` for validate `passwordConfirm` property in the `RegisterDto` class.  

### Create DTO for login

### Create interface for tokens in `src/auth/intrfasec.ts` file

### Install `uuid` and `date-fns`  libraries
```npm
$ npm install uuid
$  npm install -D @types/uuid
$  npm install date-fns
```

### Set up Cookies
[Nest Cookies doc](https://docs.nestjs.com/techniques/cookies)  

Install `cookie-parser`
```npm
$ npm i cookie-parser
$ npm i -D @types/cookie-parser
```

Apply the `cookie-parser` middleware as global in the `main.ts` file

### Create Decorators
Create Cookies Decorator:
- create `libs/common/src/decorators/cookie.decorators.ts` file
- Define Cookie Decorator
- export Cookie Decorator in the `libs/common/src/decorators/index.ts` file  

Create UserAgent Decorator:
- create `libs/common/src/decorators/user-agent.decorators.ts` file
- Define UserAgent Decorator
- export UserAgent Decorator in the `libs/common/src/decorators/index.ts` file  

### Add `user-agent` field to the `tokens` table of database
Change Prisma Schema  

Generate migration
```npm
$ npx prisma migrate dev --name user_agent
```

### Implement `AuthService`
Define `register`, `login` and `refreshTokens()` methods.

### Implement `AuthController`
Define `POST/register`, `POST/login` and `GET/refresh-tokens` API endpoints    

### Implement protected route
[Nest Passport Implementing Passport JWT doc](https://docs.nestjs.com/recipes/passport#jwt-functionality)  

Create file `src/auth/strategies/jwt.startegy.ts` and define `JwtStrategy` class  

Define `JwtStrategy` as provider in the `AuthModule`  

Create file `src/auth/jwt-auth.guard.ts` and define the `JwtAuthGuard` class which extends the built-in `AuthGuard`

Define `JwtAuthGuard` as provider globally in the `AppModule`  

Provide a mechanism for declaring routes as public:
- create file `libs/common/src/decorators/public.decorators.ts`
- define Public Decorator
- export Public Decorator in the `libs/common/src/decorators/index.ts` file 
- In the `AuthGuard` class, override the `canActivate` method to implement public endpoints.
- decorate public endpoints by Public Decorator

### Remove `password` field from Users response
[Next Serialization doc](https://docs.nestjs.com/techniques/serialization#exclude-properties)

In the `UserEntity` class (file `src/users/entities/user.entity.ts`), define a constructor 
that assigns input to the properties of the class. These inputs can be limited by the `@Exclude` decorator.

In the `UserEntity` class decorate `password` field with the `@Exclude` decorator.

For endpoints in the `UserController` except `delete` and for `register` endpoint in the `AuthController`:
- decorate endpoint with `@UseInterceptors(ClassSerializerInterceptor)` decorator
- define endpoint methods as `async` and use `await` for get data from Prisma
- change `unput` variables with `new UserEntity(user)` expression  

### Endpoints limitation
Create `@CurrentUser` decorator:
- create file `libs/common/src/decorators/current-user.decorator.ts`
- define `CurrentUser` decorator
- export `CurrentUser` decorator in the `libs/common/src/decorators/index.ts`  

Update the `remove()` method in `UsersService`:
- add the `currentUser` parameter to the method signature
- set conditions for the delete action

At the `remove` endpoint in the `UserController`, get the current user data and pass it to the `remove()` service method.

### Logout

In the `AuthService` create method to remove `refreshToken` in the database.  

In the `AuthController` create `GET/logout` endpoint.  

### Roles Decorator
[Nest Authorisation RBAC implementation](https://docs.nestjs.com/security/authorization#basic-rbac-implementation)

Create file `libs/common/src/decorators/roles.decorators.ts`  

Define Role Decorator  

Export Role Decorator in the `libs/common/src/decorators/index.ts` file  

Create Roles Guard in the `src/auth/guards/roles.guard.ts` file  

Decorate endpoint that must be accessible for some role with two decorators:
- `@UseGuards(RolesGuard)`
- `@Roles(Role.ADMIN)`  

### Caching
[Nest Caching doc](https://docs.nestjs.com/techniques/caching)

Install required packages
```npm
$ npm install @nestjs/cache-manager cache-manager
```

Import `CacheModule` in the `UsersModule  

*If you get ERROR [ExceptionHandler] lru_cache_1.LRUCache is not a constructor then install 
early version of `lru-cache`. For example `$ npm i lru-cache@7.5.0`* 

Inject cache manager to `UsersService` using the `CACHE_MANAGER` token  
*Do not forget import `Cache` from `cache-manager`*  

Implement cache in the `findOne()` method of `UserService`

Reset cache in the `login()` method in the `AuthService`

Delete cache when user delete in the `remove()` method of `UserService`  

### Authentication via Google

Install dependency
```npm
$ npm install passport-google-oauth20
```
Create `src/auth/strategies/google.strategy.ts` file and implement `GoogleStrategy` class

Get Client ID and Client Secret:
- goto [Google Console Developer](https://console.cloud.google.com/apis/dashboard)
- select a project or create a new one (selector in the upper left near the Google Cloud logo)
- goto Credentials (left menu)
- click "CREATE CREDENTIALS" button and select "OAuth client ID"
- select application type "Web application"
- enter name (for example, :nest-auth")
- add Authorized JavaScript origin: `http://localhost:5000`
- add two Authorized redirect URIs: `http://localhost:5000/api/auth/google` and `http://localhost:5000/api/auth/google/callback`
- click "SAVE" button
- copy Client ID and Client secret into `.env` file

Add `GoogleStrategy` into `STRATEGIES` array in the `src/auth/strategies/index.ts` file  
*import `Strategy` from `passport-google-oauth20`*

Create `src/auth/guards/google.guard.ts` file and implement `GoogleGuard` class extends `AuthGuard`  

Add `GoogleGuard` into `GUARDS` array in the `src/auth/guards/index.ts` file  

In the `AuthController` implement two endpoints: `GET/google` and `GET/google/callback` 

Add Axios HTTP Module
- install dependencies
```npm install @nest
$ npm install @nestjs/axios axios
```
- in the `AuthModule` import `HttpModule`
- in the `AuthController` inject `HttpService` 

Correct Prisma schema:
- in the `User` model make the `password` field optional and add optional `provider` field
- migrate schema 
```npm
$ npx prisma migrate dev --name update_user
```
- in the `CreateUserDto` class make the `password` field optional and add optional `provider` field
- in the `UserEntity` add property `provider` decorated by `@Exclude` decorator

In the `AuthService` create `googleAuth` method

Create helper `handleTimeoutsAndErrors` for catch error in the `libs/common/src/helpers/timeout-error.helper.ts` file  

In the `AuthController` implement `GET/google/success` endpoint with request to Google API


## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```
