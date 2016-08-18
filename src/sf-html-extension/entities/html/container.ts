import { disposeEntity } from "./utils";
import { IHTMLEntity, IHTMLDocument } from "./base";
import { IHTMLContainerExpression, HTMLExpression } from "sf-html-extension/parsers/html/expressions";
import { IEntity, IElementEntity, IEntityEngine, findEntitiesBySource } from "sf-core/entities";
import { IMarkupSection, ContainerNode, INode, NodeSection, GroupNodeSection } from "sf-core/markup";

export abstract class HTMLContainerEntity extends ContainerNode implements IHTMLEntity, IElementEntity {

  readonly type: string = null;
  readonly nodeName: string;
  readonly section: IMarkupSection;

  public engine: IEntityEngine;

  private _document: IHTMLDocument;

  constructor(readonly source: IHTMLContainerExpression) {
    super();
    this.nodeName = source.nodeName.toUpperCase();
    this.section = this.createSection();
  }

  get document(): IHTMLDocument {
    return this._document;
  }

  set document(value: IHTMLDocument) {
    this.willChangeDocument(value);
    const oldDocument = this._document;
    this._document = value;
    for (const child of this.childNodes) {
      (<IHTMLEntity>child).document = value;
    }
  }

  protected willChangeDocument(newDocument) {
    // OVERRIDE ME
  }

  insertDOMChildBefore(newChild: INode, beforeChild: INode) {
    this.section.targetNode.insertBefore(newChild, beforeChild);
  }

  appendDOMChild(newChild: INode) {
    this.section.appendChild(newChild);
  }

  updateSource() {
    for (const child of this.childNodes) {
      (<any>child).updateSource();
    }
  }

  static mapSourceChildren(source: IHTMLContainerExpression) {
    return source.childNodes;
  }

  protected createSection(): IMarkupSection {
    const element = document.createElement(this.nodeName) as any;
    return new NodeSection(element);
  }

  async appendSourceChildNode(childNode: HTMLExpression): Promise<Array<IEntity>> {
    this.source.appendChildNodes(childNode);

    // since the child node is dependant on the other entities that
    // are loaded in, we'll need to update the entire entity tree in order
    // to return the proper entity
    // TODO - it may be more appropriate to leave this up to whatever is calling
    // appendSourceChildNode since there may be cases where the callee executes a batch of these. For now though,
    // it's better to leave this here to make things more DRY.
    await this.engine.update();

    // since we don't know the entity, or where it lives in this entity, we'll need to scan for it. It could
    // even be a collection of entities.
    return findEntitiesBySource(this, childNode);
  }

  _unlink(child: IHTMLEntity) {
    super._unlink(child);
    child.document = undefined;
  }

  _link(child: IHTMLEntity) {
    super._link(child);
    child.document = this.document;
    if (child.section) {
      let nextHTMLEntitySibling: IHTMLEntity;
      do {
        nextHTMLEntitySibling = <IHTMLEntity>child.nextSibling;
      } while (nextHTMLEntitySibling && !nextHTMLEntitySibling.section);

      if (nextHTMLEntitySibling) {
        // TODO - this assumes that the next sibling has a section property - it
        // might not. Need to traverse the next sibling for a node that actually has a section
        const ppSection = (<IHTMLEntity>child.nextSibling).section;

        if (nextHTMLEntitySibling.section instanceof NodeSection) {
          this.insertDOMChildBefore(child.section.toFragment(), (<NodeSection>ppSection).targetNode);
        } else {
          this.insertDOMChildBefore(child.section.toFragment(), (<GroupNodeSection>ppSection).startNode);
        }
      } else {
        this.appendDOMChild(child.section.toFragment());
      }
    }
  }

  abstract cloneNode();

  dispose() {
    disposeEntity(this);
  }
}