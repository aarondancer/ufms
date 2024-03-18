import { StringField } from "../../../decorators";

export class PostCommentDto {
  @StringField({ nullable: false, required: true })
  private text!: string;

  getText(): string {
    return this.text;
  }

  setText(text: string): void {
    this.text = text;
  }
}
