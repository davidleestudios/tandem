import { GroupNodeSection } from "sf-core/markup";
import { HTMLContainerEntity } from "./container";
import { EntityFactoryDependency } from "sf-core/dependencies";

export class HTMLDocumentFragmentEntity extends HTMLContainerEntity {

  createSection() {
    return new GroupNodeSection();
  }
  cloneNode(deep?: boolean) {
    const entity = new HTMLDocumentFragmentEntity(this.source);
    if (deep)
    for (const child of this.childNodes) {
      entity.appendChild(child.cloneNode(deep));
    }
    return entity;
  }
}

export const htmlDocumentFragmentDependency = new EntityFactoryDependency("#document-fragment", HTMLDocumentFragmentEntity);