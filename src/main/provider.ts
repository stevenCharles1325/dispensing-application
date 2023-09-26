import ICache from 'App/interfaces/provider/provider.cache.interface';
import IContainer from 'App/interfaces/provider/provider.container.interface';
import IPOSProvider from 'App/interfaces/provider/provider.pos.interface';
import ioc from 'App/modules/provider/provider.ioc.module';
import singleton from 'App/modules/provider/provider.singleton.module';
import bind from 'App/modules/provider/provider.bind.module';

class Provider implements Partial<IPOSProvider> {
  constructor(
    public readonly cache: ICache = {},
    public readonly container: IContainer = {}
  ) {}
}

Object.assign(Provider.prototype, { ioc, bind, singleton });

export default new Provider() as IPOSProvider;
