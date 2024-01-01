export default interface ICronJob {
  label: string;
  schedule: string;
  callback: () => Promise<any>;
}
