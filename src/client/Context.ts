class Context {
  private data : Record<string, any>;
  get(name: string) {
    return this.data[name] || null;
  }
  set(name: string, value: any) {
    this.data[name] = value;
  }
}

export default Context;
