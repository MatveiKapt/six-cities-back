import { DocumentType, types } from '@typegoose/typegoose';
import { CreateUserDto, UserEntity, UserService } from './index.js';
import { inject, injectable } from 'inversify';
import { Component } from '../../types/component.enum.js';
import { Logger } from '../../libs/logger/index.js';

@injectable()
export class DefaultUserService implements UserService {
  constructor (
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.UserModel) private readonly userModel: types.ModelType<UserEntity>,
  ) {}

  public async create(dto: CreateUserDto, salt: string): Promise<DocumentType<UserEntity>> {
    const user = new UserEntity(dto);
    user.setPassword(dto.password, salt);

    const result = await this.userModel.create(user);
    this.logger.info(`New user created: ${user.mail}`);

    return result;
  }

  public async findByMail(mail: string): Promise<DocumentType<UserEntity> | null> {
    return this.userModel.findOne({mail});
  }

  public async findOrCreate(dto: CreateUserDto, salt: string): Promise<DocumentType<UserEntity>> {
    const existedUser = await this.findByMail(dto.mail);

    if (existedUser) {
      return existedUser;
    }

    return this.create(dto, salt);
  }
}
