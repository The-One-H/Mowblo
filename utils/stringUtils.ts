

function toTitleCase(val: string): string {
    return val
        .split(' ')
        .map((word) => {
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');
}

export { toTitleCase }