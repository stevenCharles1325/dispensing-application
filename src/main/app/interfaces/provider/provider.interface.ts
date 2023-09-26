import Provider from '@IOC:Provider';

export default interface IProvider {
  provider: typeof Provider;
  run(): void;
}
