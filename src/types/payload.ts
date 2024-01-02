import { Role } from "src/auth/enum/role.enum";

export interface Payload {
    id: number;
    first_name: string;
    email: string;
    roles: Role;
}