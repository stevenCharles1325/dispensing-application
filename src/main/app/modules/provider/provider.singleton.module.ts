import IProviderCallback from 'Interfaces/provider/provider.callback.interface';

export default function singleton(
  this: any,
  name: string,
  provider: IProviderCallback
) {
  if (this.cache[name]) return;

  this.cache[name] = provider();
  this.container[name] = {
    type: 'singleton',
    data: this.cache[name],
  };
}
