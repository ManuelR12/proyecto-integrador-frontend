const SkipLink = () => {
	return (
		<a
			href="#main-content"
			className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-lg focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-purple-500"
		>
			Saltar al contenido principal
		</a>
	);
};

export default SkipLink;
