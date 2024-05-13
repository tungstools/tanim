
function createElement(tag: string, props: Record<string, any>, ...children: any[]) {
    const el = document.createElement(tag);
    for (const key in props) {
        if (key.startsWith("on")) {
            el.addEventListener(key.slice(2).toLowerCase(), props[key]);
        } else {
            el.setAttribute(key, props[key]);
        }
    }
    children.forEach(child => {
        if (typeof child === "string") {
            el.appendChild(document.createTextNode(child));
        } else {
            el.appendChild(child);
        }
    });
    return el;
}

export { createElement }