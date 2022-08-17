export class Message {
  public body: string;
  public sender: string;

  constructor({ body, sender }: { body: string; sender: string; }) {
    this.body = body;
    this.sender = sender;
  }

  public toString(): string {
    return `${this.sender}: ${this.body} __eol__`;
  }
}