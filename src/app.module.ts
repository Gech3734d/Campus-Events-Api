import { 
   Module,
   NestModule,
  MiddlewareConsumer,
        
 } from '@nestjs/common';
 import { APP_GUARD } from '@nestjs/core';
 import { JwtAuthGuard } from './auth/jwt-auth.guard.js';
 
 import { ConfigModule } from '@nestjs/config';
 import { AuthModule } from './auth/auth.module.js';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { EventsModule } from './events/events.module.js';
import { LoggerMiddleware } from './common/middleware/logger.middleware.js';
import { UsersModule } from './users/users.module.js';




@Module({
      imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventsModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService,
               {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');
  }
}
