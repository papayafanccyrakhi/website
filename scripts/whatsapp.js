// whatsapp.js

function setupWhatsapp(product) {
	const whatsappBtn = document.getElementById("whatsappBtn");
	if (!whatsappBtn || !product) return;

	const message = encodeURIComponent(
		`Hi, I want to buy this Rakhi:\n` +
			`Title: ${product.title}\n` +
			`ID: ${product.id}\n\n` +
			`Please confirm availability and details. Thank you!\n` +
			`Image: ${product.image}`,
	);

	whatsappBtn.onclick = () => {
		window.open(`https://wa.me/917601938547?text=${message}`, "_blank");
	};
}
