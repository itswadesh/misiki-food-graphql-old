import { User } from "../models";
import { facebookRouter, setupFacebook } from './facebook'
import { googleRouter, setupGoogle } from './google'
import { Router } from "express";
setupFacebook(User);
setupGoogle(User);

export default function (app: Router) {
    app.use('/auth/facebook', facebookRouter);
    app.use('/auth/google', googleRouter);
}