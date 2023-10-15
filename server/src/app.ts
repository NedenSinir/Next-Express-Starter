/// <reference path="types/global.d.ts" />


import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import passport from "passport";
import dotenv from "dotenv"
import "module-alias/register"
import morgan from "morgan";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });


import authRoute from "./routes/auth.route";
import adminRoute from "./routes/admin.route";
import publicRoute from "./routes/public.route";
import './strategies/discordStrategy.strategy';
//middleware import
import isAuthorized from './middleware/isAuthorized.middleware';
import isAdmin from './middleware/isAdmin.middleware';
import isActive from '@middleware/isActive.middleware';
import isValid from '@middleware/isValid.middleware';
import http from "http"
import helmet from 'helmet';
import eventEmitter from './eventEmitter';
import sendSol from './utils/sendSol';



//naber

const main = () => {
  const app = express();
  const PORT = process.env.PORT || 5002;
  const server = http.createServer(app);

  Error.stackTraceLimit = Infinity
  app.use(morgan('dev'));
  app.use(helmet());
  app.use(cors({
    origin: process.env.DOMAIN.split(","),
    credentials: true
  }))
  app.use(cookieParser());



  //Boilerplate?
  app.set("trust proxy", 1);
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json());



  app.use(session({

    secret: process.env.SEED,
    cookie: {
      maxAge: 60000 * 60 ,
      domain: process.env.COOKIE_DOMAIN,
      httpOnly: true
    },
    saveUninitialized: true,
    resave: false,
    name: "discord.oauth2",
  }));


  // Passport
  app.use(passport.initialize());
  app.use(passport.session());


  const connect = async () => {
    const mongoose = require("mongoose");
    await mongoose.connect(process.env.MONGODB);
    console.log("online");
  };
  connect();


  // Middleware Routes
  app.use('/auth', authRoute);
  app.use('/public',publicRoute);
  app.use('/admin', isAuthorized, isValid, isActive, isAdmin, adminRoute);
  
  server.listen(PORT, () => {
    console.log(`Now listening to requests on port ${PORT}`)
    console.log(`The environment is ${process.env.NODE_ENV}`);

  });

  // https://discordapp.com/developers/docs/topics/permissions


}

main()