import Provider from '@IOC:Provider';

export default interface ProviderContract {
  provider: typeof Provider;
  run(): void;
}
