import IService from '../service/service.interface';

type IProviderCallback = () => IService;
export default IProviderCallback;
