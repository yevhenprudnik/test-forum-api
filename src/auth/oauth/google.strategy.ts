import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { OauthService } from './oauth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
      private oauthService: OauthService
    ) {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${process.env.API_URL}/auth/callback/google`,
            scope: ['email', 'profile'],
        });
    }
    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
        try {
          const user = await this.oauthService.oauthHandler(profile, accessToken);
          done(null, user);
        } catch (error) {
          done(error);
        }
    }
}