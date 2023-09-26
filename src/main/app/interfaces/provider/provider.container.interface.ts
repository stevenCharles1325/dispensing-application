export default interface IContainer
  extends Record<
    string,
    {
      type: 'singleton' | 'bind';
      data: any;
    }
  > {}
