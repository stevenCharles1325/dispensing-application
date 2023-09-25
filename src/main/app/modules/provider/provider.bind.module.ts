import IService from 'Main/app/interfaces/service/service.interface';

type ProviderCallback = () => IService;
export default function bind(
  this: any,
  name: string,
  provider: ProviderCallback
) {
  this.container[name] = {
    type: 'bind',
    data: provider,
  };
}
