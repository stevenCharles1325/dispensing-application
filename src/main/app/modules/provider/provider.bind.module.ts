import IProviderCallback from 'Interfaces/provider/provider.callback.interface';

export default function bind(
  this: any,
  name: string,
  provider: IProviderCallback
) {
  this.container[name] = {
    type: 'bind',
    data: provider,
  };
}
