import { HTMLNodeType } from "./node-types";
import { IMarkupNodeVisitor } from "./visitor";
import { SyntheticDocument } from "../document";
import { SyntheticMarkupContainer } from "./container";

export class SyntheticDocumentFragment extends SyntheticMarkupContainer {
  readonly nodeType: number = HTMLNodeType.DOCUMENT_FRAGMENT;
  constructor(ownerDocument: SyntheticDocument) {
    super("#document-fragment", ownerDocument);
  }
  accept(visitor: IMarkupNodeVisitor) {
    return visitor.visitDocumentFragment(this);
  }
  cloneNode() {
    const fragment = new SyntheticDocumentFragment(this.ownerDocument);
    for (const child of this.childNodes) {
      this.appendChild(child.cloneNode());
    }
    return fragment;
  }
}