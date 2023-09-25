/* eslint-disable max-classes-per-file */

import bind from './app/modules/provider/provider.bind.module';
import ioc from './app/modules/provider/provider.ioc.module';
import singleton from './app/modules/provider/provider.singleton.module';

interface Container {
  [name: string]: {
    type: 'singleton' | 'bind';
    data: any;
  };
}

interface Cache {
  [name: string]: any;
}

class Provider {
  constructor(private cache: Cache = {}, private container: Container = {}) {}
}

Object.assign(Provider.prototype, singleton);
Object.assign(Provider.prototype, bind);
Object.assign(Provider.prototype, ioc);

export default new Provider();
