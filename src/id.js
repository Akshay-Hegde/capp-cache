export const id = url => {
	const { href } = new URL(url, window.location.href);
	return href;
};
