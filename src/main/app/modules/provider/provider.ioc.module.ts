export default function ioc(this: any, name: string) {
  const container = this.container[name];

  if (container.type === 'singleton') {
    return container.data;
  }

  return container.data();
}
