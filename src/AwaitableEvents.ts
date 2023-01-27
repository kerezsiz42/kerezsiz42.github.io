export class AwaitableEvents<T> {
  eventTarget: EventTarget;

  constructor() {
    this.eventTarget = new EventTarget();
  }

  public waitEvent(eventName: string, timeout: number): Promise<T | undefined> {
    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => resolve(undefined), timeout);
      const listener = (e: CustomEventInit<T>) => {
        clearTimeout(timeoutId);
        this.eventTarget.removeEventListener(eventName, listener);
        resolve(e.detail);
      };
      this.eventTarget.addEventListener(eventName, listener);
    });
  }

  public dispatch(eventName: string, detail: T) {
    const customEvent = new CustomEvent(eventName, { detail });
    this.eventTarget.dispatchEvent(customEvent);
  }
}
