import { GoogleGuard } from '@auth/guards/google.guard';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { RolesGuard } from '@auth/guards/roles.guard';

export const GUARDS = [JwtAuthGuard, RolesGuard, GoogleGuard];
