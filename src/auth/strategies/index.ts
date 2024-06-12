import { GoogleStrategy } from '@auth/strategies/google.strategy';
import { JwtStrategy } from '@auth/strategies/jwt.startegy';

export const STRATEGIES = [JwtStrategy, GoogleStrategy];
