import { words } from "popular-english-words";

export default defineEventHandler((event) => {
	return [...words.getMostPopular(500), "alcohol"];
});
