import ICache from './provider.cache.interface';
import IProviderCallback from './provider.callback.interface';
import IContainer from './provider.container.interface';

export default interface IPOSProvider {
  readonly container: IContainer;
  readonly cache: ICache;
  singleton: (this: any, name: string, provider: IProviderCallback) => void;
  bind: (this: any, name: string, provider: IProviderCallback) => void;
  ioc: <T>(this: any, name: string) => T;
}
