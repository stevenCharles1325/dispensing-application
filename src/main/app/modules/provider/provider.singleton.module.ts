import IService from 'Main/app/interfaces/service/service.interface';

type ProviderCallback = () => IService;
export default function singleton(
  this: any,
  name: string,
  provider: ProviderCallback
) {
  if (this.cache[name]) return;

  this.cache[name] = provider();
  this.container[name] = {
    type: 'singleton',
    data: this.cache[name],
  };
}
