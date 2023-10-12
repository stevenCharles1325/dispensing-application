/* eslint-disable no-param-reassign */
import {
  IAsyncProviderCallback,
  IProviderCallback,
} from 'App/interfaces/provider/provider.callback.interface';
import IService from 'App/interfaces/service/service.interface';
import { isAsyncFunction } from 'util/types';

export default async function bind(
  this: any,
  name: string,
  provider: IProviderCallback | IAsyncProviderCallback
) {
  let data: IService;

  if (isAsyncFunction(provider)) {
    data = await provider();
    provider = () => data;
  }

  this.container[name] = {
    type: 'bind',
    data: provider as IProviderCallback,
  };
}
