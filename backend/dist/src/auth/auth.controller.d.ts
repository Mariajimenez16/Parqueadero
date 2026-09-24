import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            nombre: string;
            apellidos: string;
            documento: string;
            correo: string;
            telefono: string;
            userType: string;
            role: string;
            status: string;
        };
    }>;
    getProfile(userId: string): Promise<{
        id: string;
        nombre: string;
        apellidos: string;
        documento: string;
        correo: string;
        telefono: string;
        userType: string;
        role: string;
        status: string;
        createdAt: Date;
    }>;
}
