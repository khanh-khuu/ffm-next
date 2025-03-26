export default function removeHashTag(str: string) {
    return str.replace(/#\w+/g, '')
}