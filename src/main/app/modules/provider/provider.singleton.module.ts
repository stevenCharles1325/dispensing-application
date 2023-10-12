import {
  IAsyncProviderCallback,
  IProviderCallback,
} from 'App/interfaces/provider/provider.callback.interface';
import { isAsyncFunction } from 'util/types';

export default async function singleton(
  this: any,
  name: string,
  provider: IProviderCallback | IAsyncProviderCallback
) {
  if (this.cache[name]) return;

  if (isAsyncFunction(provider)) {
    console.log('RUNNING ASYNC SINGLETON FUNCTION');
    this.cache[name] = await provider();
  } else {
    console.log('RUNNING REGULAR SINGLETON FUNCTION');
    this.cache[name] = provider();
  }

  this.container[name] = {
    type: 'singleton',
    data: this.cache[name],
  };
}
