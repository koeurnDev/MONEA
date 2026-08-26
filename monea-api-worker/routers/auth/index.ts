import { Hono } from 'hono';
import _2faDisableRouter from './2fa_disable';
import _2faSetupRouter from './2fa_setup';
import _2faVerifyRouter from './2fa_verify';
import changePasswordRouter from './change-password';
import csrfRouter from './csrf';
import forgotPasswordRouter from './forgot-password';
import inspectRouter from './inspect';
import logoutRouter from './logout';
import meRouter from './me';
import resetPasswordRouter from './reset-password';
import signinRouter from './signin';
import signupRouter from './signup';
import ssoCallbackRouter from './sso_callback';
import ssoGoogleRouter from './sso_google';
import ssoTelegramRouter from './sso_telegram';
import sessionRouter from './session';

const authRouter = new Hono();

// Mount all authentication and security sub-routers
authRouter.route('/2fa/disable', _2faDisableRouter);
authRouter.route('/2fa/setup', _2faSetupRouter);
authRouter.route('/2fa/verify', _2faVerifyRouter);
authRouter.route('/change-password', changePasswordRouter);
authRouter.route('/csrf', csrfRouter);
authRouter.route('/forgot-password', forgotPasswordRouter);
authRouter.route('/inspect', inspectRouter);
authRouter.route('/logout', logoutRouter);
authRouter.route('/me', meRouter);
authRouter.route('/reset-password', resetPasswordRouter);
authRouter.route('/signin', signinRouter);
authRouter.route('/signup', signupRouter);
authRouter.route('/sso/callback', ssoCallbackRouter);
authRouter.route('/sso/google', ssoGoogleRouter);
authRouter.route('/sso/telegram', ssoTelegramRouter);
authRouter.route('/session', sessionRouter);

export default authRouter;