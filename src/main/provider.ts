/* eslint-disable max-classes-per-file */

type ProviderCB<T> = () => T;

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

  public singleton<T>(name: string, provider: ProviderCB<T>) {
    if (this.cache[name]) return;

    this.cache[name] = provider();
    this.container[name] = {
      type: 'singleton',
      data: this.cache[name],
    };
  }

  public bind<T>(name: string, provider: ProviderCB<T>) {
    this.container[name] = {
      type: 'bind',
      data: provider,
    };
  }

  public ioc<T>(name: string): T {
    const container = this.container[name];

    if (container.type === 'singleton') {
      return container.data;
    }

    return container.data();
  }
}

export default new Provider();
