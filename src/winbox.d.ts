declare module "winbox/src/js/winbox.js" {
  type Params = {
    title: string;
    id: string;
    width: number;
    height: number;
    x: number;
    y: number;
    top: number;
    bottom: number;
    minwidth: number;
    minheight: number;
    header: number;
    class: string[];
    onclose(this: WinBox): boolean;
    onminimize(this: WinBox): void;
    onmove(this: WinBox): void;
    onresize(this: WinBox): void;
    onfocus?(this: WinBox): void;
    onblur?(this: WinBox): void;
  };
  export default class WinBox {
    constructor(options: Params);
    dom: HTMLElement;
    body: HTMLElement;
    max: boolean;
    min: boolean;
    hidden: boolean;
    focused: boolean;
    x: number;
    y: number;
    width: number;
    height: number;
    minwidth: number;
    minheight: number;
    top: number;
    bottom: number;
    show(): this | undefined;
    hide(): this | undefined;
    focus(): this;
    restore(): this;
    resize(width: number, height: number): this;
    move(x: number, y: number): this;
    addClass(name: string): this;
    removeClass(name: string): this;
  }
}
