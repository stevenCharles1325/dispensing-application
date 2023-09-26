import ICache from './app/interfaces/provider/provider.cache.interface';
import IContainer from './app/interfaces/provider/provider.container.interface';
import IPOSProvider from './app/interfaces/provider/provider.pos.interface';

import bind from './app/modules/provider/provider.bind.module';
import ioc from './app/modules/provider/provider.ioc.module';
import singleton from './app/modules/provider/provider.singleton.module';

class Provider implements Partial<IPOSProvider> {
  constructor(
    public readonly cache: ICache = {},
    public readonly container: IContainer = {}
  ) {}
}

Object.assign(Provider.prototype, singleton);
Object.assign(Provider.prototype, bind);
Object.assign(Provider.prototype, ioc);

export default new Provider() as IPOSProvider;
