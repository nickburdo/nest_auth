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

Create file `src/auth/jwt.startegy.ts` and define `JwtStrategy` class  

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

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)
