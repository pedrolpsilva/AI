import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { loginUserDto } from './dto/login.dto';
import * as Password from 'node-php-password'

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Get('test')
    async test(@Req() req: any) {
        const res = await this.authService.test()
        return res
    }

    @Post('login')
    async handleLogin(@Body() req: loginUserDto) {
        const userStatus = await this.authService.getUser(req.cpfcnpj)
        if (userStatus.length > 0) {
            if (userStatus[0].ativo == 1) {
                let res = null, hash = ''
                let newPass = String(req.pass);

                if (req.pass.indexOf('REPLACEHASHTAG')) {
                    newPass = newPass.replace('REPLACEHASHTAG','#')
                }

                let tempUser = {
                    cpfcnpj: req.cpfcnpj,
                    pass: req.pass,
                    name: userStatus[0].nome,
                    idUser: userStatus[0].idUsuario[0],
                    clients: {},
                    hash: userStatus[0].senha[0],
                    email: userStatus[0].email,
                    type: userStatus[0].perfil_usuario_vizualizacao,
                }

                await tempUser.hash.indexOf('$2b$1') != -1 ? hash = '$2y' + tempUser.hash.substring(3,tempUser.hash.length) : hash = tempUser.hash
                if (await Password.verify(newPass, hash)) {
                    res = tempUser;
                }

                if (res) {
                    const clientsName = await this.authService.getUserClients(tempUser.idUser)
                    tempUser.clients = clientsName

                    return tempUser
                } else {
                    return 'erro'
                }
            } else {
                return 'inativo'
            }
        } else {
            return 'inexistente'
        }
    } 
}
