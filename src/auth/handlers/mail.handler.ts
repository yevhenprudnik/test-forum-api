import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailHandler {
  constructor(private readonly mailerService: MailerService) {}
  /**
   * @param  {string} to
   * email of the user
   * @param  {string} link
   * email activation link randomly generated during registration
   */
  async sendActivationEmail(to: string, link: string){
    const fullLink = process.env.API_URL+'/auth/activateEmail/'+link;
    await this.mailerService
      .sendMail({
        to,
        from: 'Social Network',
        subject: 'Email confirmation for social network ✔', 
        text: 'welcome', 
        html:
        `
          <div>
            <h1>To confirm your email follow the link below</h1>
            <a href="${fullLink}">${fullLink}</a>
          </div>
        `
      })
  }
}