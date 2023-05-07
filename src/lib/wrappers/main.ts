import {IModule} from "angular";
import * as React from "react";
import {angularizeDirective, WrapperOptions} from "./angularizeDirective";

export * from "./angularizeComponent";

export function angularize(reactElement: React.ElementType, {name, module, ...options}: WrapperOptions & { name: string, module: IModule }) {
    angularizeDirective(reactElement, name, module, options);
    return module;
}
