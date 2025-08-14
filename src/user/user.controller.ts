import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { ServicesService } from 'src/services/services.service';
import * as Password from 'node-php-password'
import * as nodemailer from 'nodemailer'
import { verifyUserDto } from './dto/verifyUser.dto';
import { fcmUserDto } from './dto/fcm.dto';
import { updateUserDto } from './dto/updateUser.dto';
import { forgetPassUserDto } from './dto/forgetPass.dto';
import { newPassUserDto } from './dto/newPass.dto';
import axios from 'axios';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService, private readonly serviceService: ServicesService) {}

    @Post('verify')
    async verifyUser(@Body() req: verifyUserDto) {
        const verifyUser = await this.userService.verifyUser(req.cpfcnpj)
        return verifyUser
    }

    @Post('update')
    updateUSer(@Body() req: updateUserDto) {
        var hash = Password.hash(req.pass, "PASSWORD_DEFAULT");
        return this.userService.updateUser(req.name, hash, req.email, req.cpfcnpj)
    }

    @Post('forget_pass')
    async forgetPass(@Body() req: forgetPassUserDto) {
        const user = await this.userService.getUser(req.cpfcnpj)
        const phone = await this.userService.getNumbers(req.cpfcnpj)

        if (phone.length > 0) {
            for (let i = 0; i < phone.length; i++) {
                await axios.post('https://totaltrac.digisac.co/api/v1/messages', {
                    number: "55" + Number(phone[i].numeroCelular),
                    serviceId: "a224518e-ed6c-4831-ab60-036dcb3a3a85",
                    text: `Olá, ${phone[i].nome}
O *seu código* de recuperação de senha é: *${req.code}*
Este código irá *expirar em 15 minutos* ⏳.`
                }, {
                    headers: {
                        'Authorization': 'Bearer 46f1183d4d7ad06c60338bfc1038c5d06f4d9c77',
                        'Content-Type': 'application/json'
                    }
                })
                .catch((err) => console.log('err:',err))
            }
        }

        if (user.length > 0) {
            let transport = await nodemailer.createTransport({
                host: 'smtplw.com.br',
                port: 587,
                secure: false,
                auth: {
                  user: "totaltrac2389",
                  pass: "OHzBKreQ7578"
                },
                tls: { rejectUnauthorized: true }
            })
        
            let mailOptions = {
                from: 'naoresponda@totaltrac.com.br',
                to: `${user[0].email}`,
                subject: 'Email de recuperação de senha',
                text: `Olá, 
                O seu código de recuperação de senha é: ${req.code}
                Este código irá expirar em 15 minutos.
                `,
            }
        
            //testa o servidor
            transport.verify(function (error) {
                if (error) {
                  // console.log(error);
                }
            })
        
            //envia o email
            transport.sendMail(mailOptions, (error, info) => {
                if (error) {
                    // console.log(error);
                } else {
                  return user
                }
            })

            return {...user[0], cod: req.code}
        } else {
            return false
        }
    }

    @Post('new_pass')
    async updatePass(@Body() req: newPassUserDto) {
        var newPass = await Password.hash(req.newPass, "PASSWORD_DEFAULT")
        return this.userService.updatePass(req.cpfcnpj, newPass)
    }
}
