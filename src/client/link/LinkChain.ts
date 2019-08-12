import * as Observable from "zen-observable";

export type LinkForward = (data: any) => Observable<any>;
export type Link = (data?: any, obs?: LinkForward) => Observable<any>;

export const buildLinkChain = (links: Link[]) =>
  ([...links] as any[])
    .reverse()
    .reduce((prev, acc) => data => acc(data, prev || null), null);

class LinkChain {
  private callable: LinkForward;
  constructor(links: Link[]) {
    if (links.length === 0) {
      throw new Error("You must provide at least one link inside your link chain.")
    }

    this.callable = buildLinkChain(links);
  }

  emit(payload: any) {
    const observer = this.callable(payload);
    return new Promise((accept, reject) => {
      observer.subscribe({
        next: accept,
        error: reject
      });
    });
  }
}

export default LinkChain;
