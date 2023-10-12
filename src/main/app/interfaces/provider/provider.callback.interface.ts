import IService from '../service/service.interface';

type IProviderCallback = () => IService;
type IAsyncProviderCallback = () => Promise<IService>;

export type { IProviderCallback, IAsyncProviderCallback };
