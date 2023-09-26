export default function ioc<T>(this: any, name: string): T {
  const container = this.container[name];

  if (container.type === 'singleton') {
    return container.data;
  }

  return container.data() as T;
}
