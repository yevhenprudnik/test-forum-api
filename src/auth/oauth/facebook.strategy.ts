import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-facebook";
import { OauthService } from './oauth.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
    constructor(
      private oauthService: OauthService
    ) {
        super({
            clientID: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
            callbackURL: `${process.env.API_URL}/auth/callback/facebook`,
            scope: "email",
            profileFields: ['id', 'displayName', 'photos', 'emails']
        });
    }
    async validate(
      accessToken: string, refreshToken: string, 
      profile: Profile, 
      done: (err: any, user: any, info?: any) => void): Promise<any> {
        try {
          const user = await this.oauthService.oauthHandler(profile, accessToken);
          done(null, user);
        } catch (error) {
          done(error, null);
        }
    }
}
