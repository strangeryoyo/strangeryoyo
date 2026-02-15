export function display_message(message: string): void {
    const root = document.getElementById("root");
    if (root === null) throw new Error('Cannot find an element with id root');
    const textContainer = document.createElement("p");
    textContainer.textContent = message;
    root.appendChild(textContainer);
}

export function display_html(message: string): void {
    const root = document.getElementById("root");
    if (root === null) throw new Error('Cannot find an element with id root');
    root.innerHTML = message;
}
