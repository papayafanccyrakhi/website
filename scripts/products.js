// product.js

const hash = location.hash;
const productId = hash ? hash.split("=")[1] : null;

const loader = document.getElementById("loader");
const titleEl = document.getElementById("productTitle");
const descEl = document.getElementById("productDescription");
const showMoreBtn = document.getElementById("showMoreBtn");
const priceEl = document.getElementById("productPrice");
const oldPriceEl = document.getElementById("oldPrice");
const badgeEl = document.getElementById("discountBadge");
const tagsEl = document.getElementById("productTags");
const galleryEl = document.getElementById("gallery");
const carouselInner = document.getElementById("carouselInner");

if (!productId) {
	loader.textContent = "Product ID missing";
	throw new Error("No product id");
}

// Try to load from cache
let catalogue = JSON.parse(localStorage.getItem("catalogueProducts") || "[]");
let product = catalogue.find((p) => p.id === productId);

// Supabase fetch
async function fetchProduct(id) {
	supabase = window.supabase.createClient(SUPA_URL, SUPA_PUBLIC_KEY);
	const { data } = await supabase
		.from("products")
		.select("*")
		.eq("id", id)
		.single();
	return data || null;
}

// Render product info
function renderProduct(p) {
	loader.style.display = "none";

	document.title = p.title; // ensures the browser tab also updates
	titleEl.textContent = p.title;
	descEl.textContent = p.description || "";

	// Description toggle
	if ((p.description || "").length > 150) {
		showMoreBtn.hidden = false;
		showMoreBtn.onclick = () => {
			descEl.classList.toggle("expanded");
			showMoreBtn.textContent = descEl.classList.contains("expanded")
				? "Show less"
				: "Show more";
		};
	}

	priceEl.textContent = `${p.price} / ${p.unit || "pc"}`;

	const discount = Math.min(p.discount || 0, 100);
	if (discount > 0)
		badgeEl.textContent = discount === 100 ? "FREE" : discount + "% OFF";

	if (discount > 0 && discount < 100)
		oldPriceEl.textContent = "Rs " + Math.round(p.price / (1 - discount / 100));

	tagsEl.textContent = (p.tags || []).join(", ");

	// Gallery + Carousel
	carouselInner.innerHTML = "";
	galleryEl.innerHTML = "";
	const images = [p.image].concat(p.gallery || []);

	images.forEach((src, i) => {
		// Carousel items
		const item = document.createElement("div");
		item.className = "carousel-item" + (i === 0 ? " active" : "");
		item.innerHTML = `<img src="${src}" class="d-block w-100 product-image">`;
		carouselInner.appendChild(item);

		// Thumbnails
		const thumb = document.createElement("img");
		thumb.src = src;
		if (i === 0) thumb.classList.add("active");
		thumb.onclick = () => {
			const carousel =
				bootstrap.Carousel.getInstance(
					document.getElementById("carouselMain"),
				) || new bootstrap.Carousel(document.getElementById("carouselMain"));
			carousel.to(i);
			galleryEl
				.querySelectorAll("img")
				.forEach((el) => el.classList.remove("active"));
			thumb.classList.add("active");
		};
		galleryEl.appendChild(thumb);
	});
}

// Load product
async function load() {
	if (!product) product = await fetchProduct(productId);
	if (!product) {
		loader.textContent = "Product not found";
		return;
	}
	renderProduct(product);
	setupWhatsapp(product);
}

load();
