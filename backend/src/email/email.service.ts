import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as Handlebars from 'handlebars';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendEmail(
    username: string,
    email: string,
    subject: string,
    message: string,
  ): Promise<void> {
    // Define the path to the Handlebars template
    const templatePath = path.join(__dirname, 'views', 'email.hbs');
    const source = await fs.readFile(templatePath, 'utf-8');

    // Compile the Handlebars template with explicit typing
    const template = Handlebars.compile(source);

    // Define the context type
    interface TemplateContext {
      name: string;
      message: string;
    }

    const context: TemplateContext = {
      name: username,
      message,
    };

    // Explicitly type the rendered HTML
    const html: string = template(context);

    // Create Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: this.configService.get<string>('GMAIL_USER'),
        pass: this.configService.get<string>('GMAIL_APP_PASSWORD'),
      },
    });

    // Define mail options
    const mailOptions = {
      from: this.configService.get<string>('GMAIL_USER'),
      to: email,
      subject,
      html,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    this.logger.log(`Email sent successfully to ${email}`);
  }
}
