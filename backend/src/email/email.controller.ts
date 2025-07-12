import { Controller, Post, Body } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send-email')
  async sendEmail(
    @Body('username') username: string,
    @Body('email') email: string,
    @Body('subject') subject: string,
    @Body('message') message: string,
  ) {
    return this.emailService.sendEmail(username, email, subject, message);
  }
}
