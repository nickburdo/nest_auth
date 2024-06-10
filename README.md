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

### Create CRUD for Users
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

Implement hash password method in the `create()` and `update()` methods

### Check Users endpoints in the `UsersController`

*************************
## Prisma Next steps:
1. Set the DATABASE_URL in the .env file to point to your existing database. If your database has no tables yet, read https://pris.ly/d/getting-started
2. Set the provider of the datasource block in schema.prisma to match your database: postgresql, mysql, sqlite, sqlserver, mongodb or cockroachdb.
3. Run npx prisma db pull to turn your database schema into a Prisma schema.
4. Run npx prisma generate to generate the Prisma Client. You can then start querying your database.
**************************






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

## License

Nest is [MIT licensed](LICENSE).
